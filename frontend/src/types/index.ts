// ==================== Course Management Module Types ====================
// These types map directly to the PostgreSQL database entities.

export type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';

export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'UNPUBLISHED';
export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type EnrollmentRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type SubmissionStatus = 'NOT_SUBMITTED' | 'SUBMITTED' | 'GRADED' | 'LATE';
export type QuizAttemptStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
export type MeetingStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
export type CertificateStatus = 'NOT_ELIGIBLE' | 'ELIGIBLE' | 'ISSUED';
export type MaterialType =
  | 'VIDEO'
  | 'PDF'
  | 'PPT'
  | 'NOTES'
  | 'EXTERNAL_LINK'
  | 'SOURCE_CODE'
  | 'DOWNLOADABLE_RESOURCE';
export type QuestionType = 'MCQ' | 'MULTIPLE_CORRECT' | 'TRUE_FALSE' | 'FILL_IN_THE_BLANK';
export type NotificationType =
  | 'ENROLLMENT_APPROVED'
  | 'ENROLLMENT_REJECTED'
  | 'ASSIGNMENT_DEADLINE'
  | 'ASSIGNMENT_GRADED'
  | 'QUIZ_RESULT'
  | 'MEETING_UPCOMING'
  | 'COURSE_ANNOUNCEMENT';

// ---- Core User (from existing auth system) ----
export interface User {
  id: string;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  created_at: string;
}

export interface InstructorProfile {
  id: string;
  user_id: string;
  bio: string | null;
  expertise: string | null;
  avatar_url: string | null;
  verified: boolean;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  avatar_url: string | null;
}

// ---- Course Management Entities ----
export interface CourseCategory {
  id: string;
  name: string; // Maps to category_name in database
  category_name?: string; // Database field name
  description: string | null;
  created_at: string;
}

export interface Course {
  id: string;
  instructor_id: string; // FK -> instructor_profiles.id
  category_id: string; // FK -> course_categories.id
  title: string;
  subtitle: string | null;
  description: string | null;
  difficulty: DifficultyLevel;
  language: string;
  price: number; // 0 = free
  thumbnail_url: string | null;
  promotional_video_url: string | null;
  duration_minutes: number | null;
  learning_outcomes: string[]; // stored as text[] in PG
  prerequisites: string[]; // stored as text[] in PG
  status: CourseStatus;
  created_at: string;
  updated_at: string;
  // joined/aggregated fields (not columns)
  instructor_name?: string;
  category_name?: string;
  enrollment_count?: number;
  average_rating?: number;
  review_count?: number;
  tags?: CourseTag[];
}

export interface CourseModule {
  id: string;
  course_id: string; // FK -> courses.id
  name: string;
  description: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  module_id: string; // FK -> course_modules.id
  title: string;
  description: string | null;
  display_order: number;
  duration_minutes: number | null;
  is_preview: boolean;
  created_at: string;
  updated_at: string;
}

export interface LearningMaterial {
  id: string;
  lesson_id: string; // FK -> lessons.id
  type: MaterialType;
  title: string;
  description: string | null;
  s3_url: string | null; // S3 URL for files
  external_url: string | null; // for external links
  file_size_bytes: number | null;
  file_type: string | null;
  display_order: number;
  created_at: string;
}

export interface CourseTag {
  id: string;
  name: string;
  created_at: string;
}

export interface EnrollmentRequest {
  id: string;
  course_id: string; // FK -> courses.id
  student_id: string; // FK -> users.id (student)
  status: EnrollmentRequestStatus;
  rejection_reason: string | null;
  requested_at: string;
  reviewed_at: string | null;
  // joined
  student_name?: string;
  student_email?: string;
  course_title?: string;
}

export interface Enrollment {
  id: string;
  course_id: string; // FK -> courses.id
  student_id: string; // FK -> users.id
  enrolled_at: string;
  // joined/aggregated
  student_name?: string;
  student_email?: string;
  course_title?: string;
  progress_percentage?: number;
  assignment_status?: SubmissionStatus;
  quiz_score?: number | null;
  certificate_status?: CertificateStatus;
}

export interface Assignment {
  id: string;
  course_id: string; // FK -> courses.id
  title: string;
  description: string | null;
  instructions: string | null;
  due_date: string;
  max_marks: number;
  created_at: string;
  // joined
  reference_materials?: LearningMaterial[];
  course_title?: string;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string; // FK -> assignments.id
  student_id: string; // FK -> users.id
  submitted_file_url: string | null; // S3 URL
  submitted_at: string;
  marks: number | null;
  feedback: string | null;
  status: SubmissionStatus;
  // joined
  student_name?: string;
  student_email?: string;
  assignment_title?: string;
}

export interface Quiz {
  id: string;
  course_id: string; // FK -> courses.id
  title: string;
  description: string | null;
  passing_percentage: number;
  time_limit_minutes: number | null;
  attempt_limit: number;
  created_at: string;
  // joined
  course_title?: string;
  question_count?: number;
}

export interface Question {
  id: string;
  quiz_id: string; // FK -> quizzes.id
  question_text: string;
  question_type: QuestionType;
  question_order: number;
  created_at: string;
}

export interface QuestionOption {
  id: string;
  question_id: string; // FK -> questions.id
  option_text: string;
  is_correct: boolean;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string; // FK -> quizzes.id
  student_id: string; // FK -> users.id
  attempt_number: number;
  started_at: string;
  completed_at: string | null;
  status: QuizAttemptStatus;
  score_percentage: number | null;
  passed: boolean | null;
}

export interface QuizAnswer {
  id: string;
  quiz_attempt_id: string; // FK -> quiz_attempts.id
  question_id: string; // FK -> questions.id
  selected_option_id: string | null; // FK -> question_options.id
  is_correct: boolean | null;
}

export interface QuizResult {
  id: string;
  quiz_id: string; // FK -> quizzes.id
  student_id: string; // FK -> users.id
  best_score_percentage: number;
  best_attempt_id: string | null; // FK -> quiz_attempts.id
  passed: boolean;
  attempts_used: number;
  last_attempted_at: string | null;
}

export interface Meeting {
  id: string;
  course_id: string; // FK -> courses.id
  title: string;
  description: string | null;
  meeting_date: string;
  start_time: string;
  end_time: string;
  google_meet_link: string;
  recording_url: string | null; // S3 URL
  notes: string | null;
  status: MeetingStatus;
  created_at: string;
  // joined
  course_title?: string;
}

export interface MeetingAttendance {
  id: string;
  meeting_id: string; // FK -> meetings.id
  student_id: string; // FK -> users.id
  joined_at: string | null;
  left_at: string | null;
  duration_minutes: number | null;
  // joined
  student_name?: string;
  student_email?: string;
}

export interface LessonProgress {
  id: string;
  lesson_id: string; // FK -> lessons.id
  student_id: string; // FK -> users.id
  completed: boolean;
  completed_at: string | null;
  time_spent_minutes: number;
  last_accessed_at: string | null;
}

export interface CourseProgress {
  id: string;
  course_id: string; // FK -> courses.id
  student_id: string; // FK -> users.id
  completed_lessons: number;
  total_lessons: number;
  progress_percentage: number;
  total_learning_time_minutes: number;
  last_accessed_at: string | null;
  completed_at: string | null;
}

export interface CourseReview {
  id: string;
  course_id: string; // FK -> courses.id
  student_id: string; // FK -> users.id
  rating: number; // 1-5
  comment: string | null;
  created_at: string;
  updated_at: string;
  // joined
  student_name?: string;
}

export interface Certificate {
  id: string;
  course_id: string; // FK -> courses.id
  student_id: string; // FK -> users.id
  certificate_number: string;
  issued_at: string;
  // joined
  student_name?: string;
  course_title?: string;
  instructor_name?: string;
}

export interface Notification {
  id: string;
  user_id: string; // FK -> users.id
  type: NotificationType;
  title: string;
  message: string;
  related_entity_id: string | null;
  read: boolean;
  created_at: string;
}
