// ==================== API Service Layer ====================
// This layer connects to the real backend API
// Updated to match backend routes

import type {
  User, CourseCategory, Course, CourseModule, Lesson, LearningMaterial,
  CourseTag, EnrollmentRequest, Enrollment, Assignment, AssignmentSubmission,
  Quiz, Question, QuestionOption, QuizAttempt, QuizResult, Meeting,
  MeetingAttendance, CourseReview, Certificate, Notification, CourseProgress,
  LessonProgress, InstructorProfile,
} from '@/types';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function for API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  if (!API_BASE_URL) {
    throw new Error('VITE_API_URL environment variable is not set');
  }

  const token = localStorage.getItem('lms_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = 'API call failed';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      // response body may not be JSON
    }

    if (response.status === 401) {
      localStorage.removeItem('lms_token');
      localStorage.removeItem('user');
      window.location.href = '/';
      throw new Error('Session expired. Please login again.');
    }
    if (response.status === 403) {
      throw new Error(errorMessage || 'You do not have permission to perform this action.');
    }
    if (response.status === 404) {
      throw new Error(errorMessage || 'The requested resource was not found.');
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'API call failed');
  }

  return data.data;
};

// File upload helper
export const uploadFile = async (file: File, type: 'image' | 'video'): Promise<{ url: string; filename: string }> => {
  const uploadBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const formData = new FormData();
  formData.append('file', file);

  const endpoint = type === 'image' ? '/upload/image' : '/upload/video';
  const response = await fetch(`${uploadBaseUrl}${endpoint}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 413) {
      throw new Error('File too large. Maximum size is 50MB.');
    }
    if (response.status === 415) {
      throw new Error('Invalid file type. Only images and videos are allowed.');
    }
    throw new Error('Upload failed. Please try again.');
  }

  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Upload failed');

  return {
    url: `${uploadBaseUrl.replace('/api', '')}${data.data.url}`,
    filename: data.data.filename
  };
};

// ---- Auth ----
export const authApi = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Login failed');
    // Store token
    localStorage.setItem('lms_token', data.data.token);
    return data.data;
  },

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
    expertise?: string;
    bio?: string;
  }): Promise<{ user: User; token: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Registration failed');
    // Store token
    localStorage.setItem('lms_token', data.data.token);
    return data.data;
  },

  async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem('lms_token');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to get user');
    return data.data.user;
  },

  async switchUser(targetUserId: string): Promise<{ user: User; token: string }> {
    const token = localStorage.getItem('lms_token');
    const response = await fetch(`${API_BASE_URL}/auth/switch-user`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ targetUserId }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to switch user');
    // Update token
    localStorage.setItem('lms_token', data.data.token);
    return data.data;
  },

  async getInstructorProfile(userId: string): Promise<InstructorProfile | null> {
    try {
      const token = localStorage.getItem('lms_token');
      const response = await fetch(`${API_BASE_URL}/instructors/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to get instructor profile');
      return data.data;
    } catch (error) {
      console.error('Error fetching instructor profile:', error);
      return null;
    }
  },

  async getStudentProfile(userId: string): Promise<{ profile: any } | null> {
    try {
      const token = localStorage.getItem('lms_token');
      const response = await fetch(`${API_BASE_URL}/students/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to get student profile');
      return data.data;
    } catch (error) {
      console.error('Error fetching student profile:', error);
      return null;
    }
  },
};

// ---- Categories ----
export const categoryApi = {
  async list(): Promise<CourseCategory[]> {
    return apiCall('/categories');
  },
  async create(data: { name: string; description?: string }): Promise<CourseCategory> {
    return apiCall('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async update(id: string, data: Partial<CourseCategory>): Promise<CourseCategory> {
    return apiCall(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async delete(id: string): Promise<void> {
    return apiCall(`/categories/${id}`, {
      method: 'DELETE',
    });
  },
};

// ---- Courses ----
export const courseApi = {
  async list(filters?: { instructorId?: string; status?: string; search?: string; categoryId?: string; language?: string; priceType?: 'free' | 'paid' | 'all'; sortBy?: string; tagIds?: string[] }): Promise<Course[]> {
    const queryParams = new URLSearchParams();
    if (filters?.instructorId) queryParams.append('instructorId', filters.instructorId);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.categoryId) queryParams.append('categoryId', filters.categoryId);
    if (filters?.language) queryParams.append('language', filters.language);
    if (filters?.priceType) queryParams.append('priceType', filters.priceType);
    if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters?.search) queryParams.append('search', filters.search);
    if (filters?.tagIds) filters.tagIds.forEach(tagId => queryParams.append('tagIds', tagId));

    const queryString = queryParams.toString();
    return apiCall(`/courses${queryString ? `?${queryString}` : ''}`);
  },
  async getById(id: string): Promise<Course | null> {
    return apiCall(`/courses/${id}`);
  },
  async create(data: Partial<Course>): Promise<Course> {
    return apiCall('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async update(id: string, data: Partial<Course>): Promise<Course> {
    return apiCall(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async updateStatus(id: string, status: Course['status']): Promise<Course> {
    return apiCall(`/courses/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
  async delete(id: string): Promise<void> {
    return apiCall(`/courses/${id}`, {
      method: 'DELETE',
    });
  },
  async duplicate(id: string): Promise<Course> {
    return apiCall(`/courses/${id}/duplicate`, {
      method: 'POST',
    });
  },
};

// ---- Modules ----
export const moduleApi = {
  async listByCourse(courseId: string): Promise<CourseModule[]> {
    return apiCall(`/modules/course/${courseId}`);
  },
  async getById(id: string): Promise<CourseModule> {
    return apiCall(`/modules/${id}`);
  },
  async create(data: Partial<CourseModule>): Promise<CourseModule> {
    return apiCall('/modules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async update(id: string, data: Partial<CourseModule>): Promise<CourseModule> {
    return apiCall(`/modules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async delete(id: string): Promise<void> {
    return apiCall(`/modules/${id}`, {
      method: 'DELETE',
    });
  },
  async reorder(moduleIds: string[]): Promise<void> {
    return apiCall('/modules/reorder', {
      method: 'POST',
      body: JSON.stringify({ moduleIds }),
    });
  },
};

// ---- Lessons ----
export const lessonApi = {
  async listByModule(moduleId: string): Promise<Lesson[]> {
    return apiCall(`/lessons/module/${moduleId}`);
  },
  async getById(id: string): Promise<Lesson> {
    return apiCall(`/lessons/${id}`);
  },
  async create(data: Partial<Lesson>): Promise<Lesson> {
    return apiCall('/lessons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async update(id: string, data: Partial<Lesson>): Promise<Lesson> {
    return apiCall(`/lessons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async delete(id: string): Promise<void> {
    return apiCall(`/lessons/${id}`, {
      method: 'DELETE',
    });
  },
  async reorder(lessonIds: string[]): Promise<void> {
    return apiCall('/lessons/reorder', {
      method: 'POST',
      body: JSON.stringify({ lessonIds }),
    });
  },
};

// ---- Materials ----
export const materialApi = {
  async listByLesson(lessonId: string): Promise<LearningMaterial[]> {
    return apiCall(`/materials/lesson/${lessonId}`);
  },
  async getById(id: string): Promise<LearningMaterial> {
    return apiCall(`/materials/${id}`);
  },
  async create(data: Partial<LearningMaterial>): Promise<LearningMaterial> {
    return apiCall('/materials', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async update(id: string, data: Partial<LearningMaterial>): Promise<LearningMaterial> {
    return apiCall(`/materials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async delete(id: string): Promise<void> {
    return apiCall(`/materials/${id}`, {
      method: 'DELETE',
    });
  },
};

// ---- Tags ----
export const tagApi = {
  async list(): Promise<CourseTag[]> {
    return apiCall('/tags');
  },
  async getById(id: string): Promise<CourseTag> {
    return apiCall(`/tags/${id}`);
  },
  async create(name: string): Promise<CourseTag> {
    return apiCall('/tags', {
      method: 'POST',
      body: JSON.stringify({ tag_name: name }),
    });
  },
  async update(id: string, name: string): Promise<CourseTag> {
    return apiCall(`/tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ tag_name: name }),
    });
  },
  async delete(id: string): Promise<void> {
    return apiCall(`/tags/${id}`, {
      method: 'DELETE',
    });
  },
};

// ---- Enrollments ----
export const enrollmentApi = {
  async listByStudent(studentId: string): Promise<Enrollment[]> {
    return apiCall(`/enrollments/student/${studentId}`);
  },
  async listMyEnrollments(): Promise<Enrollment[]> {
    return apiCall('/enrollments/my-courses');
  },
  async listMyCourses(): Promise<Enrollment[]> {
    return apiCall('/enrollments/my-courses');
  },
  async listByCourse(courseId: string): Promise<Enrollment[]> {
    return apiCall(`/enrollments/course/${courseId}`);
  },
  async listByInstructor(): Promise<Enrollment[]> {
    return apiCall('/enrollments/instructor');
  },
  async list(filters?: { courseId?: string; studentId?: string }): Promise<Enrollment[]> {
    if (filters?.courseId) {
      return apiCall(`/enrollments/course/${filters.courseId}`);
    }
    if (filters?.studentId) {
      return apiCall(`/enrollments/student/${filters.studentId}`);
    }
    return apiCall('/enrollments/my-courses');
  },
  async create(courseId: string): Promise<Enrollment> {
    return apiCall('/enrollments', {
      method: 'POST',
      body: JSON.stringify({ course_id: courseId }),
    });
  },
  async delete(id: string): Promise<void> {
    return apiCall(`/enrollments/${id}`, {
      method: 'DELETE',
    });
  },
};

// ---- Enrollment Requests ----
export const enrollmentRequestApi = {
  async listByCourse(courseId: string): Promise<EnrollmentRequest[]> {
    return apiCall(`/enrollments/requests/course/${courseId}`);
  },
  async listByInstructor(): Promise<EnrollmentRequest[]> {
    return apiCall('/enrollments/requests/instructor');
  },
  async listByStudent(studentId: string): Promise<EnrollmentRequest[]> {
    // Note: This endpoint returns enrollments, not pending requests
    // For pending requests, we'd need a dedicated endpoint
    return apiCall(`/enrollments/requests/student/${studentId}`);
  },
  async create(courseId: string): Promise<EnrollmentRequest> {
    return apiCall('/enrollments/requests', {
      method: 'POST',
      body: JSON.stringify({ course_id: courseId }),
    });
  },
  async approve(id: string): Promise<EnrollmentRequest> {
    return apiCall(`/enrollments/requests/${id}/approve`, {
      method: 'PUT',
    });
  },
  async reject(id: string, reason: string): Promise<EnrollmentRequest> {
    return apiCall(`/enrollments/requests/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ rejection_reason: reason }),
    });
  },
};

// ---- Assignments ----
export const assignmentApi = {
  async listByCourse(courseId: string): Promise<Assignment[]> {
    return apiCall(`/assignments/course/${courseId}`);
  },
  async getById(id: string): Promise<Assignment> {
    return apiCall(`/assignments/${id}`);
  },
  async create(data: Partial<Assignment>): Promise<Assignment> {
    return apiCall('/assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async update(id: string, data: Partial<Assignment>): Promise<Assignment> {
    return apiCall(`/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async delete(id: string): Promise<void> {
    return apiCall(`/assignments/${id}`, {
      method: 'DELETE',
    });
  },
};

// ---- Submissions ----
export const submissionApi = {
  async listByAssignment(assignmentId: string): Promise<AssignmentSubmission[]> {
    return apiCall(`/assignments/${assignmentId}/submissions`);
  },
  async listByStudent(studentId: string): Promise<AssignmentSubmission[]> {
    return apiCall(`/assignments/submissions/student/${studentId}`);
  },
  async listMySubmissions(): Promise<AssignmentSubmission[]> {
    return apiCall('/assignments/submissions/my-submissions');
  },
  async create(assignmentId: string, submittedFileUrl: string): Promise<AssignmentSubmission> {
    return apiCall('/assignments/submissions', {
      method: 'POST',
      body: JSON.stringify({
        assignment_id: assignmentId,
        submitted_file_url: submittedFileUrl,
      }),
    });
  },
  async grade(id: string, marks: number, feedback: string): Promise<AssignmentSubmission> {
    return apiCall(`/assignments/submissions/${id}/grade`, {
      method: 'PUT',
      body: JSON.stringify({ marks, feedback }),
    });
  },
  async delete(id: string): Promise<void> {
    return apiCall(`/assignments/submissions/${id}`, {
      method: 'DELETE',
    });
  },
};

// ---- Quizzes ----
export const quizApi = {
  async listByCourse(courseId: string): Promise<Quiz[]> {
    return apiCall(`/quizzes/course/${courseId}`);
  },
  async getById(id: string): Promise<Quiz> {
    return apiCall(`/quizzes/${id}`);
  },
  async create(data: Partial<Quiz>): Promise<Quiz> {
    return apiCall('/quizzes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async update(id: string, data: Partial<Quiz>): Promise<Quiz> {
    return apiCall(`/quizzes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async delete(id: string): Promise<void> {
    return apiCall(`/quizzes/${id}`, {
      method: 'DELETE',
    });
  },
};

// ---- Questions ----
export const questionApi = {
  async listByQuiz(quizId: string): Promise<Question[]> {
    // Questions are included in the quiz response from getQuiz
    const quiz = await apiCall(`/quizzes/${quizId}`);
    return quiz.questions || [];
  },
  async create(data: Partial<Question>): Promise<Question> {
    return apiCall('/quizzes/questions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async update(id: string, data: Partial<Question>): Promise<Question> {
    return apiCall(`/quizzes/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async delete(id: string): Promise<void> {
    return apiCall(`/quizzes/questions/${id}`, {
      method: 'DELETE',
    });
  },
};

// ---- Question Options ----
export const optionApi = {
  async listByQuestion(questionId: string): Promise<QuestionOption[]> {
    // Options are included in the question response from the quiz
    // Since there's no direct endpoint, we need to get options from quiz data
    throw new Error('Options are included in quiz response. Use quizApi.getById() to get questions with options.');
  },
  async create(data: Partial<QuestionOption>): Promise<QuestionOption> {
    return apiCall('/quizzes/options', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async update(id: string, data: Partial<QuestionOption>): Promise<QuestionOption> {
    return apiCall(`/quizzes/options/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async delete(id: string): Promise<void> {
    return apiCall(`/quizzes/options/${id}`, {
      method: 'DELETE',
    });
  },
};

// ---- Meetings ----
export const meetingApi = {
  async listByCourse(courseId: string): Promise<Meeting[]> {
    return apiCall(`/meetings/course/${courseId}`);
  },
  async getById(id: string): Promise<Meeting> {
    return apiCall(`/meetings/${id}`);
  },
  async create(data: Partial<Meeting>): Promise<Meeting> {
    return apiCall('/meetings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async update(id: string, data: Partial<Meeting>): Promise<Meeting> {
    return apiCall(`/meetings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async delete(id: string): Promise<void> {
    return apiCall(`/meetings/${id}`, {
      method: 'DELETE',
    });
  },
  async join(meetingId: string): Promise<void> {
    return apiCall(`/meetings/${meetingId}/join`, {
      method: 'POST',
    });
  },
  async leave(meetingId: string): Promise<void> {
    return apiCall(`/meetings/${meetingId}/leave`, {
      method: 'POST',
    });
  },
  async cancel(id: string): Promise<Meeting> {
    return apiCall(`/meetings/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'CANCELLED' }),
    });
  },
  async uploadRecording(id: string, recordingUrl: string): Promise<Meeting> {
    return apiCall(`/meetings/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ recording_url: recordingUrl }),
    });
  },
  async uploadNotes(id: string, notes: string): Promise<Meeting> {
    return apiCall(`/meetings/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ notes }),
    });
  },
};

// ---- Progress ----
export const progressApi = {
  async getByCourseAndStudent(courseId: string, studentId: string): Promise<CourseProgress | null> {
    return apiCall(`/progress/course/${courseId}`);
  },
  async listByStudent(studentId: string): Promise<CourseProgress[]> {
    return apiCall(`/progress/student/${studentId}`);
  },
  async getMyProgress(): Promise<CourseProgress[]> {
    return apiCall('/progress/my-progress');
  },
  async listByCourse(courseId: string): Promise<CourseProgress[]> {
    return apiCall(`/progress/course/${courseId}`);
  },
  async getCourseOverview(courseId: string): Promise<any> {
    return apiCall(`/progress/course/${courseId}/overview`);
  },
  async getCourseLessonProgress(courseId: string): Promise<any> {
    return apiCall(`/progress/course/${courseId}/lessons`);
  },
};

// ---- Lesson Progress ----
export const lessonProgressApi = {
  async update(lessonId: string, data: { completed?: boolean; time_spent_minutes?: number }): Promise<LessonProgress> {
    return apiCall('/progress/lesson', {
      method: 'POST',
      body: JSON.stringify({ lesson_id: lessonId, ...data }),
    });
  },
  async getByLesson(lessonId: string): Promise<LessonProgress | null> {
    return apiCall(`/progress/lesson/${lessonId}`);
  },
  async reset(lessonId: string): Promise<void> {
    return apiCall(`/progress/lesson/${lessonId}/reset`, {
      method: 'POST',
    });
  },
};

// ---- Reviews ----
export const reviewApi = {
  async listByCourse(courseId: string): Promise<CourseReview[]> {
    return apiCall(`/reviews/course/${courseId}`);
  },
  async getById(id: string): Promise<CourseReview> {
    return apiCall(`/reviews/${id}`);
  },
  async listByStudent(studentId: string): Promise<CourseReview[]> {
    return apiCall(`/reviews/student/${studentId}`);
  },
  async getByStudent(courseId: string, studentId: string): Promise<CourseReview | null> {
    return apiCall(`/reviews/course/${courseId}/student/${studentId}`);
  },
  async getMyReviews(): Promise<CourseReview[]> {
    return apiCall('/reviews/my-reviews');
  },
  async create(data: { course_id: string; rating: number; comment?: string }): Promise<CourseReview> {
    return apiCall('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async update(id: string, data: Partial<CourseReview>): Promise<CourseReview> {
    return apiCall(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async delete(id: string): Promise<void> {
    return apiCall(`/reviews/${id}`, {
      method: 'DELETE',
    });
  },
};

// ---- Certificates ----
export const certificateApi = {
  async getByStudent(studentId: string): Promise<Certificate[]> {
    return apiCall(`/certificates/student/${studentId}`);
  },
  async getMyCertificates(): Promise<Certificate[]> {
    return apiCall('/certificates/my');
  },
  async getByCourseAndStudent(courseId: string, _studentId: string): Promise<Certificate | null> {
    return apiCall(`/certificates/course/${courseId}/my`);
  },
  async getById(id: string): Promise<Certificate> {
    return apiCall(`/certificates/${id}`);
  },
  async getCourseCertificates(courseId: string): Promise<Certificate[]> {
    return apiCall(`/certificates/course/${courseId}/issued`);
  },
  async issue(courseId: string): Promise<Certificate> {
    return apiCall('/certificates/issue', {
      method: 'POST',
      body: JSON.stringify({ course_id: courseId }),
    });
  },
  async revoke(id: string): Promise<Certificate> {
    return apiCall(`/certificates/${id}/revoke`, {
      method: 'PUT',
    });
  },
  async verify(certificateNumber: string): Promise<Certificate> {
    return apiCall(`/certificates/verify/${certificateNumber}`);
  },
};

// ---- Quiz Attempts ----
export const quizAttemptApi = {
  async start(quizId: string): Promise<QuizAttempt> {
    return apiCall('/quizzes/attempts/start', {
      method: 'POST',
      body: JSON.stringify({ quiz_id: quizId }),
    });
  },
  async submit(attemptId: string, answers: Record<string, string>): Promise<QuizResult> {
    return apiCall('/quizzes/attempts/submit', {
      method: 'POST',
      body: JSON.stringify({ attempt_id: attemptId, answers }),
    });
  },
  async getByStudent(studentId: string): Promise<QuizResult[]> {
    return apiCall(`/quizzes/attempts/results/${studentId}`);
  },
  async getMyResults(): Promise<QuizResult[]> {
    return apiCall('/quizzes/attempts/my-results');
  },
  async getByQuiz(quizId: string): Promise<QuizAttempt[]> {
    return apiCall(`/quizzes/attempts/quiz/${quizId}`);
  },
};

// ---- Quiz Results ----
export const quizResultApi = {
  async getByStudent(studentId: string): Promise<QuizResult[]> {
    return apiCall(`/quizzes/attempts/results/${studentId}`);
  },
  async getMyResults(): Promise<QuizResult[]> {
    return apiCall('/quizzes/attempts/my-results');
  },
  async getByQuiz(quizId: string): Promise<QuizResult[]> {
    return apiCall(`/quizzes/attempts/quiz/${quizId}`);
  },
  async getById(resultId: string): Promise<QuizResult> {
    // Since there's no direct endpoint for single result, get all results and filter
    // This is a limitation of the current backend API
    const results = await apiCall('/quizzes/attempts/my-results');
    const result = results.find((r: QuizResult) => r.id === resultId);
    if (!result) {
      throw new Error('Quiz result not found');
    }
    return result;
  },
};

// ---- Meeting Attendance ----
export const attendanceApi = {
  async listByMeeting(meetingId: string): Promise<MeetingAttendance[]> {
    return apiCall(`/meetings/${meetingId}/attendance`);
  },
  async getByMeeting(meetingId: string): Promise<MeetingAttendance[]> {
    return apiCall(`/meetings/${meetingId}/attendance`);
  },
  async getByStudent(studentId: string): Promise<MeetingAttendance[]> {
    return apiCall(`/meetings/attendance/student/${studentId}`);
  },
  async getMyAttendance(): Promise<MeetingAttendance[]> {
    return apiCall('/meetings/attendance/my-attendance');
  },
};

// ---- Notifications ----
export const notificationApi = {
  async listByUser(userId: string): Promise<Notification[]> {
    return apiCall(`/notifications/user/${userId}`);
  },
  async getMyNotifications(): Promise<Notification[]> {
    return apiCall('/notifications/my-notifications');
  },
  async getById(id: string): Promise<Notification> {
    return apiCall(`/notifications/${id}`);
  },
  async getUnreadCount(userId: string): Promise<number> {
    return apiCall(`/notifications/unread-count/${userId}`);
  },
  async getMyUnreadCount(): Promise<number> {
    return apiCall('/notifications/my-unread-count');
  },
  async create(data: { user_id: string; type: string; title: string; message: string }): Promise<Notification> {
    return apiCall('/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async markRead(id: string): Promise<void> {
    return apiCall(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  },
  async markAllRead(userId: string): Promise<void> {
    return apiCall(`/notifications/user/${userId}/read-all`, {
      method: 'PUT',
    });
  },
  async delete(id: string): Promise<void> {
    return apiCall(`/notifications/${id}`, {
      method: 'DELETE',
    });
  },
};

// ---- Students ----
export const studentApi = {
  async getMyProfile(): Promise<any> {
    return apiCall('/students/profile');
  },
  async updateMyProfile(data: {
    full_name?: string;
    bio?: string;
    phone_number?: string;
    qualification?: string;
    college_name?: string;
    current_year?: number;
  }): Promise<any> {
    return apiCall('/students/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async getMyCourses(): Promise<any[]> {
    return apiCall('/enrollments/my-courses');
  },
  async getCourseDetails(courseId: string): Promise<any> {
    return apiCall(`/students/courses/${courseId}`);
  },
  async getProfile(userId: string): Promise<any> {
    return apiCall(`/students/profile/${userId}`);
  },
  async getDashboardData(): Promise<{
    totalEnrolledCourses: number;
    completedCourses: number;
    inProgressCourses: number;
    overallProgressPercentage: number;
    recentActivities: any[];
    upcomingDeadlines: any[];
  }> {
    return apiCall('/students/dashboard');
  },
  async getActivityHistory(limit?: number, offset?: number): Promise<{
    activities: any[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  }> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    return apiCall(`/students/activity${params.toString() ? `?${params.toString()}` : ''}`);
  },
};

// ---- Admin ----
// NOTE: Admin routes are not implemented in backend yet
// These functions are disabled to prevent API errors
export const adminApi = {
  async listUsers(): Promise<User[]> {
    throw new Error('Admin routes not implemented in backend');
  },
  async listInstructors(): Promise<InstructorProfile[]> {
    throw new Error('Admin routes not implemented in backend');
  },
  async updateUserRole(userId: string, role: User['role']): Promise<User> {
    throw new Error('Admin routes not implemented in backend');
  },
  async deleteUser(userId: string): Promise<void> {
    throw new Error('Admin routes not implemented in backend');
  },
  async getPlatformStats() {
    throw new Error('Admin routes not implemented in backend');
  },
  async createInstructorProfile(data: { user_id: string; full_name: string; expertise?: string; bio?: string }): Promise<InstructorProfile> {
    // Use the instructor API instead
    return apiCall('/instructors/profile', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateInstructorProfile(userId: string, data: Partial<InstructorProfile>): Promise<InstructorProfile> {
    // Use the instructor API instead
    return apiCall(`/instructors/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};