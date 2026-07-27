// ==================== API Service Layer ====================
// This layer abstracts data access. Currently returns mock data.
// To connect to the real Node.js/Express REST API, replace the
// implementations below with fetch() calls to the corresponding
// endpoints. Component code does NOT need to change.

import {
  mockUsers, mockInstructorProfiles, mockStudentProfiles, mockCategories,
  mockCourses, mockModules, mockLessons, mockMaterials, mockTags,
  mockEnrollmentRequests, mockEnrollments, mockAssignments, mockSubmissions,
  mockQuizzes, mockQuestions, mockQuestionOptions, mockQuizAttempts,
  mockQuizResults, mockMeetings, mockMeetingAttendance, mockCourseReviews,
  mockCertificates, mockNotifications, mockCourseProgress, mockLessonProgress,
} from '@/data/mockData';
import type {
  User, CourseCategory, Course, CourseModule, Lesson, LearningMaterial,
  CourseTag, EnrollmentRequest, Enrollment, Assignment, AssignmentSubmission,
  Quiz, Question, QuestionOption, QuizAttempt, QuizResult, Meeting,
  MeetingAttendance, CourseReview, Certificate, Notification, CourseProgress,
  LessonProgress, InstructorProfile,
} from '@/types';

// Simulate network latency
const delay = (ms = 100) => new Promise((r) => setTimeout(r, ms));

// ---- Auth ----
export const authApi = {
  async getCurrentUser(): Promise<User> {
    await delay();
    const stored = localStorage.getItem('lms_current_user_id');
    const userId = stored || 'u-instr-1';
    const user = mockUsers.find((u) => u.id === userId) || mockUsers[0];
    return user;
  },
  async switchUser(userId: string): Promise<User> {
    await delay();
    localStorage.setItem('lms_current_user_id', userId);
    const user = mockUsers.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');
    return user;
  },
  async getInstructorProfile(userId: string): Promise<InstructorProfile | null> {
    await delay();
    return mockInstructorProfiles.find((p) => p.user_id === userId) || null;
  },
  async getStudentProfile(userId: string): Promise<{ profile: typeof mockStudentProfiles[0] } | null> {
    await delay();
    const profile = mockStudentProfiles.find((p) => p.user_id === userId);
    return profile ? { profile } : null;
  },
};

// ---- Categories ----
export const categoryApi = {
  async list(): Promise<CourseCategory[]> {
    await delay();
    return mockCategories;
  },
  async create(data: { name: string; description?: string }): Promise<CourseCategory> {
    await delay();
    const cat: CourseCategory = { id: `cat-${Date.now()}`, name: data.name, description: data.description || null, created_at: new Date().toISOString() };
    mockCategories.push(cat);
    return cat;
  },
  async update(id: string, data: Partial<CourseCategory>): Promise<CourseCategory> {
    await delay();
    const cat = mockCategories.find((c) => c.id === id);
    if (!cat) throw new Error('Category not found');
    Object.assign(cat, data);
    return cat;
  },
  async delete(id: string): Promise<void> {
    await delay();
    const idx = mockCategories.findIndex((c) => c.id === id);
    if (idx >= 0) mockCategories.splice(idx, 1);
  },
};

// ---- Courses ----
export const courseApi = {
  async list(filters?: { instructorId?: string; status?: string; search?: string; categoryId?: string; language?: string; priceType?: 'free' | 'paid' | 'all'; tagIds?: string[]; sortBy?: 'popularity' | 'newest' | 'rating' | 'price_low' | 'price_high' }): Promise<Course[]> {
    await delay();
    let results = [...mockCourses];
    if (filters?.instructorId) results = results.filter((c) => c.instructor_id === filters.instructorId);
    if (filters?.status) results = results.filter((c) => c.status === filters.status);
    if (filters?.categoryId) results = results.filter((c) => c.category_id === filters.categoryId);
    if (filters?.language) results = results.filter((c) => c.language === filters.language);
    if (filters?.priceType === 'free') results = results.filter((c) => c.price === 0);
    if (filters?.priceType === 'paid') results = results.filter((c) => c.price > 0);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      results = results.filter((c) => c.title.toLowerCase().includes(q) || c.subtitle?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q));
    }
    if (filters?.tagIds && filters.tagIds.length > 0) {
      results = results.filter((c) => c.tags?.some((t) => filters.tagIds!.includes(t.id)));
    }
    if (filters?.sortBy === 'popularity') results.sort((a, b) => (b.enrollment_count || 0) - (a.enrollment_count || 0));
    if (filters?.sortBy === 'newest') results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    if (filters?.sortBy === 'rating') results.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
    if (filters?.sortBy === 'price_low') results.sort((a, b) => a.price - b.price);
    if (filters?.sortBy === 'price_high') results.sort((a, b) => b.price - a.price);
    return results;
  },
  async getById(id: string): Promise<Course | null> {
    await delay();
    return mockCourses.find((c) => c.id === id) || null;
  },
  async create(data: Partial<Course>): Promise<Course> {
    await delay();
    const course: Course = {
      id: `course-${Date.now()}`, instructor_id: data.instructor_id || 'instr-1', category_id: data.category_id || 'cat-1',
      title: data.title || '', subtitle: data.subtitle || null, description: data.description || null,
      difficulty: data.difficulty || 'BEGINNER', language: data.language || 'English', price: data.price ?? 0,
      thumbnail_url: data.thumbnail_url || null, promotional_video_url: data.promotional_video_url || null,
      duration_minutes: data.duration_minutes || null, learning_outcomes: data.learning_outcomes || [],
      prerequisites: data.prerequisites || [], status: data.status || 'DRAFT',
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      instructor_name: 'John Doe', category_name: mockCategories.find((c) => c.id === (data.category_id || 'cat-1'))?.name,
      enrollment_count: 0, average_rating: 0, review_count: 0, tags: data.tags || [],
    };
    mockCourses.push(course);
    return course;
  },
  async update(id: string, data: Partial<Course>): Promise<Course> {
    await delay();
    const course = mockCourses.find((c) => c.id === id);
    if (!course) throw new Error('Course not found');
    Object.assign(course, data, { updated_at: new Date().toISOString() });
    return course;
  },
  async updateStatus(id: string, status: Course['status']): Promise<Course> {
    await delay();
    return this.update(id, { status });
  },
  async delete(id: string): Promise<void> {
    await delay();
    const idx = mockCourses.findIndex((c) => c.id === id);
    if (idx >= 0) mockCourses.splice(idx, 1);
  },
  async duplicate(id: string): Promise<Course> {
    await delay();
    const original = mockCourses.find((c) => c.id === id);
    if (!original) throw new Error('Course not found');
    const copy: Course = { ...original, id: `course-${Date.now()}`, title: `${original.title} (Copy)`, status: 'DRAFT', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), enrollment_count: 0, average_rating: 0, review_count: 0 };
    mockCourses.push(copy);
    return copy;
  },
};

// ---- Modules ----
export const moduleApi = {
  async listByCourse(courseId: string): Promise<CourseModule[]> {
    await delay();
    return mockModules.filter((m) => m.course_id === courseId).sort((a, b) => a.display_order - b.display_order);
  },
  async create(data: Partial<CourseModule>): Promise<CourseModule> {
    await delay();
    const mods = mockModules.filter((m) => m.course_id === data.course_id);
    const module: CourseModule = { id: `mod-${Date.now()}`, course_id: data.course_id!, name: data.name || '', description: data.description || null, display_order: data.display_order ?? mods.length + 1, created_at: new Date().toISOString() };
    mockModules.push(module);
    return module;
  },
  async update(id: string, data: Partial<CourseModule>): Promise<CourseModule> {
    await delay();
    const mod = mockModules.find((m) => m.id === id);
    if (!mod) throw new Error('Module not found');
    Object.assign(mod, data);
    return mod;
  },
  async delete(id: string): Promise<void> {
    await delay();
    const idx = mockModules.findIndex((m) => m.id === id);
    if (idx >= 0) {
      // Also delete lessons in this module
      const lessonIds = mockLessons.filter((l) => l.module_id === id).map((l) => l.id);
      mockLessonProgress.filter((lp) => lessonIds.includes(lp.lesson_id)).forEach((lp) => {
        const li = mockLessonProgress.indexOf(lp);
        if (li >= 0) mockLessonProgress.splice(li, 1);
      });
      mockMaterials.filter((m) => lessonIds.includes(m.lesson_id)).forEach((m) => {
        const mi = mockMaterials.indexOf(m);
        if (mi >= 0) mockMaterials.splice(mi, 1);
      });
      mockLessons.filter((l) => l.module_id === id).forEach((l) => {
        const li = mockLessons.indexOf(l);
        if (li >= 0) mockLessons.splice(li, 1);
      });
      mockModules.splice(idx, 1);
    }
  },
  async reorder(moduleIds: string[]): Promise<void> {
    await delay();
    moduleIds.forEach((id, i) => {
      const mod = mockModules.find((m) => m.id === id);
      if (mod) mod.display_order = i + 1;
    });
  },
};

// ---- Lessons ----
export const lessonApi = {
  async listByModule(moduleId: string): Promise<Lesson[]> {
    await delay();
    return mockLessons.filter((l) => l.module_id === moduleId).sort((a, b) => a.display_order - b.display_order);
  },
  async listByCourse(courseId: string): Promise<Lesson[]> {
    await delay();
    const moduleIds = mockModules.filter((m) => m.course_id === courseId).map((m) => m.id);
    return mockLessons.filter((l) => moduleIds.includes(l.module_id)).sort((a, b) => a.display_order - b.display_order);
  },
  async create(data: Partial<Lesson>): Promise<Lesson> {
    await delay();
    const lessons = mockLessons.filter((l) => l.module_id === data.module_id);
    const lesson: Lesson = { id: `lesson-${Date.now()}`, module_id: data.module_id!, title: data.title || '', description: data.description || null, display_order: data.display_order ?? lessons.length + 1, duration_minutes: data.duration_minutes || null, created_at: new Date().toISOString() };
    mockLessons.push(lesson);
    return lesson;
  },
  async update(id: string, data: Partial<Lesson>): Promise<Lesson> {
    await delay();
    const lesson = mockLessons.find((l) => l.id === id);
    if (!lesson) throw new Error('Lesson not found');
    Object.assign(lesson, data);
    return lesson;
  },
  async delete(id: string): Promise<void> {
    await delay();
    const idx = mockLessons.findIndex((l) => l.id === id);
    if (idx >= 0) {
      mockMaterials.filter((m) => m.lesson_id === id).forEach((m) => {
        const mi = mockMaterials.indexOf(m);
        if (mi >= 0) mockMaterials.splice(mi, 1);
      });
      mockLessonProgress.filter((lp) => lp.lesson_id === id).forEach((lp) => {
        const li = mockLessonProgress.indexOf(lp);
        if (li >= 0) mockLessonProgress.splice(li, 1);
      });
      mockLessons.splice(idx, 1);
    }
  },
  async reorder(lessonIds: string[]): Promise<void> {
    await delay();
    lessonIds.forEach((id, i) => {
      const lesson = mockLessons.find((l) => l.id === id);
      if (lesson) lesson.display_order = i + 1;
    });
  },
};

// ---- Learning Materials ----
export const materialApi = {
  async listByLesson(lessonId: string): Promise<LearningMaterial[]> {
    await delay();
    return mockMaterials.filter((m) => m.lesson_id === lessonId).sort((a, b) => a.display_order - b.display_order);
  },
  async create(data: Partial<LearningMaterial>): Promise<LearningMaterial> {
    await delay();
    const mats = mockMaterials.filter((m) => m.lesson_id === data.lesson_id);
    const material: LearningMaterial = {
      id: `mat-${Date.now()}`, lesson_id: data.lesson_id!, type: data.type || 'VIDEO', title: data.title || '',
      description: data.description || null, s3_url: data.s3_url || null, external_url: data.external_url || null,
      file_size_bytes: data.file_size_bytes || null, file_type: data.file_type || null,
      display_order: data.display_order ?? mats.length + 1, created_at: new Date().toISOString(),
    };
    mockMaterials.push(material);
    return material;
  },
  async update(id: string, data: Partial<LearningMaterial>): Promise<LearningMaterial> {
    await delay();
    const mat = mockMaterials.find((m) => m.id === id);
    if (!mat) throw new Error('Material not found');
    Object.assign(mat, data);
    return mat;
  },
  async delete(id: string): Promise<void> {
    await delay();
    const idx = mockMaterials.findIndex((m) => m.id === id);
    if (idx >= 0) mockMaterials.splice(idx, 1);
  },
};

// ---- Tags ----
export const tagApi = {
  async list(): Promise<CourseTag[]> {
    await delay();
    return mockTags;
  },
  async search(query: string): Promise<CourseTag[]> {
    await delay();
    return mockTags.filter((t) => t.name.toLowerCase().includes(query.toLowerCase()));
  },
  async create(name: string): Promise<CourseTag> {
    await delay();
    const tag: CourseTag = { id: `tag-${Date.now()}`, name, created_at: new Date().toISOString() };
    mockTags.push(tag);
    return tag;
  },
};

// ---- Enrollment Requests ----
export const enrollmentRequestApi = {
  async list(filters?: { instructorId?: string; courseId?: string; status?: string }): Promise<EnrollmentRequest[]> {
    await delay();
    let results = [...mockEnrollmentRequests];
    if (filters?.courseId) results = results.filter((r) => r.course_id === filters.courseId);
    if (filters?.status) results = results.filter((r) => r.status === filters.status);
    if (filters?.instructorId) {
      const courseIds = mockCourses.filter((c) => c.instructor_id === filters.instructorId).map((c) => c.id);
      results = results.filter((r) => courseIds.includes(r.course_id));
    }
    return results.sort((a, b) => new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime());
  },
  async create(courseId: string, studentId: string): Promise<EnrollmentRequest> {
    await delay();
    const existing = mockEnrollmentRequests.find((r) => r.course_id === courseId && r.student_id === studentId && r.status === 'PENDING');
    if (existing) return existing;
    const student = mockUsers.find((u) => u.id === studentId);
    const course = mockCourses.find((c) => c.id === courseId);
    const req: EnrollmentRequest = {
      id: `er-${Date.now()}`, course_id: courseId, student_id: studentId, status: 'PENDING',
      rejection_reason: null, requested_at: new Date().toISOString(), reviewed_at: null,
      student_name: student ? `${student.first_name} ${student.last_name}` : '',
      student_email: student?.email || '', course_title: course?.title || '',
    };
    mockEnrollmentRequests.push(req);
    return req;
  },
  async approve(id: string): Promise<EnrollmentRequest> {
    await delay();
    const req = mockEnrollmentRequests.find((r) => r.id === id);
    if (!req) throw new Error('Request not found');
    req.status = 'APPROVED';
    req.reviewed_at = new Date().toISOString();
    // Create enrollment
    const student = mockUsers.find((u) => u.id === req.student_id);
    const course = mockCourses.find((c) => c.id === req.course_id);
    const enr: Enrollment = {
      id: `enr-${Date.now()}`, course_id: req.course_id, student_id: req.student_id,
      enrolled_at: new Date().toISOString(), student_name: req.student_name, student_email: req.student_email,
      course_title: req.course_title, progress_percentage: 0, assignment_status: 'NOT_SUBMITTED',
      quiz_score: null, certificate_status: 'NOT_ELIGIBLE',
    };
    mockEnrollments.push(enr);
    if (course) course.enrollment_count = (course.enrollment_count || 0) + 1;
    return req;
  },
  async reject(id: string, reason: string): Promise<EnrollmentRequest> {
    await delay();
    const req = mockEnrollmentRequests.find((r) => r.id === id);
    if (!req) throw new Error('Request not found');
    req.status = 'REJECTED';
    req.rejection_reason = reason;
    req.reviewed_at = new Date().toISOString();
    return req;
  },
};

// ---- Enrollments ----
export const enrollmentApi = {
  async list(filters?: { courseId?: string; studentId?: string }): Promise<Enrollment[]> {
    await delay();
    let results = [...mockEnrollments];
    if (filters?.courseId) results = results.filter((e) => e.course_id === filters.courseId);
    if (filters?.studentId) results = results.filter((e) => e.student_id === filters.studentId);
    return results;
  },
  async remove(id: string): Promise<void> {
    await delay();
    const idx = mockEnrollments.findIndex((e) => e.id === id);
    if (idx >= 0) mockEnrollments.splice(idx, 1);
  },
  async getStudentCourses(studentId: string): Promise<Course[]> {
    await delay();
    const courseIds = mockEnrollments.filter((e) => e.student_id === studentId).map((e) => e.course_id);
    return mockCourses.filter((c) => courseIds.includes(c.id));
  },
};

// ---- Assignments ----
export const assignmentApi = {
  async listByCourse(courseId: string): Promise<Assignment[]> {
    await delay();
    return mockAssignments.filter((a) => a.course_id === courseId);
  },
  async getById(id: string): Promise<Assignment | null> {
    await delay();
    return mockAssignments.find((a) => a.id === id) || null;
  },
  async create(data: Partial<Assignment>): Promise<Assignment> {
    await delay();
    const assignment: Assignment = {
      id: `asg-${Date.now()}`, course_id: data.course_id!, title: data.title || '',
      description: data.description || null, instructions: data.instructions || null,
      due_date: data.due_date || new Date().toISOString(), max_marks: data.max_marks || 100,
      created_at: new Date().toISOString(),
    };
    mockAssignments.push(assignment);
    return assignment;
  },
  async update(id: string, data: Partial<Assignment>): Promise<Assignment> {
    await delay();
    const a = mockAssignments.find((a) => a.id === id);
    if (!a) throw new Error('Assignment not found');
    Object.assign(a, data);
    return a;
  },
  async delete(id: string): Promise<void> {
    await delay();
    const idx = mockAssignments.findIndex((a) => a.id === id);
    if (idx >= 0) mockAssignments.splice(idx, 1);
  },
};

// ---- Assignment Submissions ----
export const submissionApi = {
  async listByAssignment(assignmentId: string): Promise<AssignmentSubmission[]> {
    await delay();
    return mockSubmissions.filter((s) => s.assignment_id === assignmentId);
  },
  async listByStudent(studentId: string): Promise<AssignmentSubmission[]> {
    await delay();
    return mockSubmissions.filter((s) => s.student_id === studentId);
  },
  async getByAssignmentAndStudent(assignmentId: string, studentId: string): Promise<AssignmentSubmission | null> {
    await delay();
    return mockSubmissions.find((s) => s.assignment_id === assignmentId && s.student_id === studentId) || null;
  },
  async submit(assignmentId: string, studentId: string, fileUrl: string): Promise<AssignmentSubmission> {
    await delay();
    const existing = mockSubmissions.find((s) => s.assignment_id === assignmentId && s.student_id === studentId);
    if (existing) {
      existing.submitted_file_url = fileUrl;
      existing.submitted_at = new Date().toISOString();
      existing.status = 'SUBMITTED';
      return existing;
    }
    const student = mockUsers.find((u) => u.id === studentId);
    const assignment = mockAssignments.find((a) => a.id === assignmentId);
    const sub: AssignmentSubmission = {
      id: `sub-${Date.now()}`, assignment_id: assignmentId, student_id: studentId,
      submitted_file_url: fileUrl, submitted_at: new Date().toISOString(),
      marks: null, feedback: null, status: 'SUBMITTED',
      student_name: student ? `${student.first_name} ${student.last_name}` : '',
      student_email: student?.email || '', assignment_title: assignment?.title || '',
    };
    mockSubmissions.push(sub);
    return sub;
  },
  async grade(id: string, marks: number, feedback: string): Promise<AssignmentSubmission> {
    await delay();
    const sub = mockSubmissions.find((s) => s.id === id);
    if (!sub) throw new Error('Submission not found');
    sub.marks = marks;
    sub.feedback = feedback;
    sub.status = 'GRADED';
    return sub;
  },
};

// ---- Quizzes ----
export const quizApi = {
  async listByCourse(courseId: string): Promise<Quiz[]> {
    await delay();
    return mockQuizzes.filter((q) => q.course_id === courseId);
  },
  async getById(id: string): Promise<Quiz | null> {
    await delay();
    return mockQuizzes.find((q) => q.id === id) || null;
  },
  async create(data: Partial<Quiz>): Promise<Quiz> {
    await delay();
    const quiz: Quiz = {
      id: `quiz-${Date.now()}`, course_id: data.course_id!, title: data.title || '',
      description: data.description || null, passing_percentage: data.passing_percentage || 70,
      timer_minutes: data.timer_minutes || null, attempt_limit: data.attempt_limit || 1,
      created_at: new Date().toISOString(), question_count: 0,
    };
    mockQuizzes.push(quiz);
    return quiz;
  },
  async update(id: string, data: Partial<Quiz>): Promise<Quiz> {
    await delay();
    const q = mockQuizzes.find((q) => q.id === id);
    if (!q) throw new Error('Quiz not found');
    Object.assign(q, data);
    return q;
  },
  async delete(id: string): Promise<void> {
    await delay();
    const idx = mockQuizzes.findIndex((q) => q.id === id);
    if (idx >= 0) mockQuizzes.splice(idx, 1);
  },
};

// ---- Questions ----
export const questionApi = {
  async listByQuiz(quizId: string): Promise<Question[]> {
    await delay();
    return mockQuestions.filter((q) => q.quiz_id === quizId).sort((a, b) => a.display_order - b.display_order);
  },
  async create(data: Partial<Question>): Promise<Question> {
    await delay();
    const qs = mockQuestions.filter((q) => q.quiz_id === data.quiz_id);
    const question: Question = {
      id: `q-${Date.now()}`, quiz_id: data.quiz_id!, question_text: data.question_text || '',
      question_type: data.question_type || 'MCQ', display_order: data.display_order ?? qs.length + 1,
      created_at: new Date().toISOString(),
    };
    mockQuestions.push(question);
    const quiz = mockQuizzes.find((q) => q.id === data.quiz_id);
    if (quiz) quiz.question_count = (quiz.question_count || 0) + 1;
    return question;
  },
  async update(id: string, data: Partial<Question>): Promise<Question> {
    await delay();
    const q = mockQuestions.find((q) => q.id === id);
    if (!q) throw new Error('Question not found');
    Object.assign(q, data);
    return q;
  },
  async delete(id: string): Promise<void> {
    await delay();
    const idx = mockQuestions.findIndex((q) => q.id === id);
    if (idx >= 0) {
      mockQuestionOptions.filter((o) => o.question_id === id).forEach((o) => {
        const oi = mockQuestionOptions.indexOf(o);
        if (oi >= 0) mockQuestionOptions.splice(oi, 1);
      });
      const quizId = mockQuestions[idx].quiz_id;
      mockQuestions.splice(idx, 1);
      const quiz = mockQuizzes.find((q) => q.id === quizId);
      if (quiz) quiz.question_count = Math.max(0, (quiz.question_count || 0) - 1);
    }
  },
  async reorder(questionIds: string[]): Promise<void> {
    await delay();
    questionIds.forEach((id, i) => {
      const q = mockQuestions.find((q) => q.id === id);
      if (q) q.display_order = i + 1;
    });
  },
};

// ---- Question Options ----
export const optionApi = {
  async listByQuestion(questionId: string): Promise<QuestionOption[]> {
    await delay();
    return mockQuestionOptions.filter((o) => o.question_id === questionId).sort((a, b) => a.display_order - b.display_order);
  },
  async create(data: Partial<QuestionOption>): Promise<QuestionOption> {
    await delay();
    const opts = mockQuestionOptions.filter((o) => o.question_id === data.question_id);
    const option: QuestionOption = {
      id: `opt-${Date.now()}`, question_id: data.question_id!, option_text: data.option_text || '',
      is_correct: data.is_correct || false, display_order: data.display_order ?? opts.length + 1,
    };
    mockQuestionOptions.push(option);
    return option;
  },
  async update(id: string, data: Partial<QuestionOption>): Promise<QuestionOption> {
    await delay();
    const o = mockQuestionOptions.find((o) => o.id === id);
    if (!o) throw new Error('Option not found');
    Object.assign(o, data);
    return o;
  },
  async delete(id: string): Promise<void> {
    await delay();
    const idx = mockQuestionOptions.findIndex((o) => o.id === id);
    if (idx >= 0) mockQuestionOptions.splice(idx, 1);
  },
};

// ---- Quiz Attempts & Results ----
export const quizAttemptApi = {
  async listByQuiz(quizId: string): Promise<QuizAttempt[]> {
    await delay();
    return mockQuizAttempts.filter((a) => a.quiz_id === quizId);
  },
  async listByStudent(studentId: string): Promise<QuizAttempt[]> {
    await delay();
    return mockQuizAttempts.filter((a) => a.student_id === studentId);
  },
  async start(quizId: string, studentId: string): Promise<QuizAttempt> {
    await delay();
    const attempts = mockQuizAttempts.filter((a) => a.quiz_id === quizId && a.student_id === studentId);
    const attempt: QuizAttempt = {
      id: `qa-${Date.now()}`, quiz_id: quizId, student_id: studentId,
      attempt_number: attempts.length + 1, started_at: new Date().toISOString(),
      completed_at: null, status: 'IN_PROGRESS', score_percentage: null, passed: null,
    };
    mockQuizAttempts.push(attempt);
    return attempt;
  },
  async complete(id: string, scorePercentage: number, passed: boolean): Promise<QuizAttempt> {
    await delay();
    const attempt = mockQuizAttempts.find((a) => a.id === id);
    if (!attempt) throw new Error('Attempt not found');
    attempt.completed_at = new Date().toISOString();
    attempt.status = 'COMPLETED';
    attempt.score_percentage = scorePercentage;
    attempt.passed = passed;
    return attempt;
  },
};

export const quizResultApi = {
  async getByQuizAndStudent(quizId: string, studentId: string): Promise<QuizResult | null> {
    await delay();
    return mockQuizResults.find((r) => r.quiz_id === quizId && r.student_id === studentId) || null;
  },
  async listByStudent(studentId: string): Promise<QuizResult[]> {
    await delay();
    return mockQuizResults.filter((r) => r.student_id === studentId);
  },
};

// ---- Meetings ----
export const meetingApi = {
  async listByCourse(courseId: string): Promise<Meeting[]> {
    await delay();
    return mockMeetings.filter((m) => m.course_id === courseId).sort((a, b) => new Date(b.meeting_date).getTime() - new Date(a.meeting_date).getTime());
  },
  async listUpcomingByStudent(studentId: string): Promise<Meeting[]> {
    await delay();
    const courseIds = mockEnrollments.filter((e) => e.student_id === studentId).map((e) => e.course_id);
    return mockMeetings.filter((m) => courseIds.includes(m.course_id) && m.status === 'SCHEDULED');
  },
  async listPreviousByStudent(studentId: string): Promise<Meeting[]> {
    await delay();
    const courseIds = mockEnrollments.filter((e) => e.student_id === studentId).map((e) => e.course_id);
    return mockMeetings.filter((m) => courseIds.includes(m.course_id) && m.status === 'COMPLETED');
  },
  async create(data: Partial<Meeting>): Promise<Meeting> {
    await delay();
    const meeting: Meeting = {
      id: `meet-${Date.now()}`, course_id: data.course_id!, title: data.title || '',
      description: data.description || null, meeting_date: data.meeting_date || new Date().toISOString().slice(0, 10),
      start_time: data.start_time || '10:00', end_time: data.end_time || '11:00',
      google_meet_link: data.google_meet_link || '', recording_url: null, notes: null,
      status: 'SCHEDULED', created_at: new Date().toISOString(),
    };
    mockMeetings.push(meeting);
    return meeting;
  },
  async update(id: string, data: Partial<Meeting>): Promise<Meeting> {
    await delay();
    const m = mockMeetings.find((m) => m.id === id);
    if (!m) throw new Error('Meeting not found');
    Object.assign(m, data);
    return m;
  },
  async cancel(id: string): Promise<void> {
    await delay();
    const m = mockMeetings.find((m) => m.id === id);
    if (m) m.status = 'CANCELLED';
  },
  async uploadRecording(id: string, url: string): Promise<Meeting> {
    await delay();
    const m = mockMeetings.find((m) => m.id === id);
    if (!m) throw new Error('Meeting not found');
    m.recording_url = url;
    m.status = 'COMPLETED';
    return m;
  },
  async uploadNotes(id: string, notes: string): Promise<Meeting> {
    await delay();
    const m = mockMeetings.find((m) => m.id === id);
    if (!m) throw new Error('Meeting not found');
    m.notes = notes;
    return m;
  },
};

// ---- Meeting Attendance ----
export const attendanceApi = {
  async listByMeeting(meetingId: string): Promise<MeetingAttendance[]> {
    await delay();
    return mockMeetingAttendance.filter((a) => a.meeting_id === meetingId);
  },
};

// ---- Course Progress ----
export const progressApi = {
  async getByCourseAndStudent(courseId: string, studentId: string): Promise<CourseProgress | null> {
    await delay();
    return mockCourseProgress.find((p) => p.course_id === courseId && p.student_id === studentId) || null;
  },
  async listByStudent(studentId: string): Promise<CourseProgress[]> {
    await delay();
    return mockCourseProgress.filter((p) => p.student_id === studentId);
  },
  async listByCourse(courseId: string): Promise<CourseProgress[]> {
    await delay();
    return mockCourseProgress.filter((p) => p.course_id === courseId);
  },
};

// ---- Lesson Progress ----
export const lessonProgressApi = {
  async listByStudent(studentId: string): Promise<LessonProgress[]> {
    await delay();
    return mockLessonProgress.filter((p) => p.student_id === studentId);
  },
  async listByCourseAndStudent(courseId: string, studentId: string): Promise<LessonProgress[]> {
    await delay();
    const moduleIds = mockModules.filter((m) => m.course_id === courseId).map((m) => m.id);
    const lessonIds = mockLessons.filter((l) => moduleIds.includes(l.module_id)).map((l) => l.id);
    return mockLessonProgress.filter((p) => p.student_id === studentId && lessonIds.includes(p.lesson_id));
  },
  async markComplete(lessonId: string, studentId: string): Promise<LessonProgress> {
    await delay();
    let lp = mockLessonProgress.find((p) => p.lesson_id === lessonId && p.student_id === studentId);
    if (!lp) {
      lp = { id: `lp-${Date.now()}`, lesson_id: lessonId, student_id: studentId, completed: true, completed_at: new Date().toISOString(), time_spent_minutes: 0, last_accessed_at: new Date().toISOString() };
      mockLessonProgress.push(lp);
    } else {
      lp.completed = true;
      lp.completed_at = new Date().toISOString();
    }
    return lp;
  },
};

// ---- Reviews ----
export const reviewApi = {
  async listByCourse(courseId: string): Promise<CourseReview[]> {
    await delay();
    return mockCourseReviews.filter((r) => r.course_id === courseId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
  async getByStudent(courseId: string, studentId: string): Promise<CourseReview | null> {
    await delay();
    return mockCourseReviews.find((r) => r.course_id === courseId && r.student_id === studentId) || null;
  },
  async create(courseId: string, studentId: string, rating: number, comment: string): Promise<CourseReview> {
    await delay();
    const existing = mockCourseReviews.find((r) => r.course_id === courseId && r.student_id === studentId);
    if (existing) {
      existing.rating = rating;
      existing.comment = comment;
      existing.updated_at = new Date().toISOString();
      return existing;
    }
    const student = mockUsers.find((u) => u.id === studentId);
    const review: CourseReview = {
      id: `rev-${Date.now()}`, course_id: courseId, student_id: studentId, rating, comment,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      student_name: student ? `${student.first_name} ${student.last_name}` : '',
    };
    mockCourseReviews.push(review);
    return review;
  },
  async update(id: string, rating: number, comment: string): Promise<CourseReview> {
    await delay();
    const r = mockCourseReviews.find((r) => r.id === id);
    if (!r) throw new Error('Review not found');
    r.rating = rating;
    r.comment = comment;
    r.updated_at = new Date().toISOString();
    return r;
  },
  async delete(id: string): Promise<void> {
    await delay();
    const idx = mockCourseReviews.findIndex((r) => r.id === id);
    if (idx >= 0) mockCourseReviews.splice(idx, 1);
  },
};

// ---- Certificates ----
export const certificateApi = {
  async getByStudent(studentId: string): Promise<Certificate[]> {
    await delay();
    return mockCertificates.filter((c) => c.student_id === studentId);
  },
  async getByCourseAndStudent(courseId: string, studentId: string): Promise<Certificate | null> {
    await delay();
    return mockCertificates.find((c) => c.course_id === courseId && c.student_id === studentId) || null;
  },
  async issue(courseId: string, studentId: string): Promise<Certificate> {
    await delay();
    const existing = mockCertificates.find((c) => c.course_id === courseId && c.student_id === studentId);
    if (existing) return existing;
    const student = mockUsers.find((u) => u.id === studentId);
    const course = mockCourses.find((c) => c.id === courseId);
    const instr = mockInstructorProfiles.find((p) => p.id === course?.instructor_id);
    const instrUser = mockUsers.find((u) => u.id === instr?.user_id);
    const cert: Certificate = {
      id: `cert-${Date.now()}`, course_id: courseId, student_id: studentId,
      certificate_number: `LMS-CERT-${new Date().getFullYear()}-${String(mockCertificates.length + 1).padStart(4, '0')}`,
      issued_at: new Date().toISOString(),
      student_name: student ? `${student.first_name} ${student.last_name}` : '',
      course_title: course?.title || '', instructor_name: instrUser ? `${instrUser.first_name} ${instrUser.last_name}` : '',
    };
    mockCertificates.push(cert);
    return cert;
  },
};

// ---- Notifications ----
export const notificationApi = {
  async listByUser(userId: string): Promise<Notification[]> {
    await delay();
    return mockNotifications.filter((n) => n.user_id === userId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
  async markRead(id: string): Promise<void> {
    await delay();
    const n = mockNotifications.find((n) => n.id === id);
    if (n) n.read = true;
  },
  async markAllRead(userId: string): Promise<void> {
    await delay();
    mockNotifications.filter((n) => n.user_id === userId).forEach((n) => (n.read = true));
  },
};

// ---- Admin ----
export const adminApi = {
  async listUsers(): Promise<User[]> {
    await delay();
    return mockUsers;
  },
  async listInstructors(): Promise<InstructorProfile[]> {
    await delay();
    return mockInstructorProfiles;
  },
  async updateUserRole(userId: string, role: User['role']): Promise<User> {
    await delay();
    const u = mockUsers.find((u) => u.id === userId);
    if (!u) throw new Error('User not found');
    u.role = role;
    return u;
  },
  async deleteUser(userId: string): Promise<void> {
    await delay();
    const idx = mockUsers.findIndex((u) => u.id === userId);
    if (idx >= 0) mockUsers.splice(idx, 1);
  },
  async getPlatformStats() {
    await delay();
    return {
      totalUsers: mockUsers.length,
      totalInstructors: mockInstructorProfiles.length,
      totalStudents: mockUsers.filter((u) => u.role === 'STUDENT').length,
      totalCourses: mockCourses.length,
      publishedCourses: mockCourses.filter((c) => c.status === 'PUBLISHED').length,
      totalEnrollments: mockEnrollments.length,
      totalCategories: mockCategories.length,
      totalRevenue: mockEnrollments.reduce((sum, e) => {
        const course = mockCourses.find((c) => c.id === e.course_id);
        return sum + (course?.price || 0);
      }, 0),
    };
  },
};
