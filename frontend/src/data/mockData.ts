// ==================== Mock Data ====================
// Realistic mock data structured to mirror the PostgreSQL schema.
// The API service layer (src/services/api.ts) returns these so the UI
// can later swap to real fetch() calls without component changes.

import type {
  User, InstructorProfile, StudentProfile, CourseCategory, Course, CourseModule,
  Lesson, LearningMaterial, CourseTag, EnrollmentRequest, Enrollment, Assignment,
  AssignmentSubmission, Quiz, Question, QuestionOption, QuizAttempt, QuizResult,
  Meeting, MeetingAttendance, CourseReview, Certificate, Notification, CourseProgress,
  LessonProgress,
} from '@/types';

export const mockUsers: User[] = [
  { id: 'u-admin-1', email: 'admin@lms.com', role: 'ADMIN', first_name: 'Sarah', last_name: 'Mitchell', created_at: '2024-01-15T10:00:00Z' },
  { id: 'u-instr-1', email: 'john.doe@lms.com', role: 'INSTRUCTOR', first_name: 'John', last_name: 'Doe', created_at: '2024-02-01T10:00:00Z' },
  { id: 'u-instr-2', email: 'emily.chen@lms.com', role: 'INSTRUCTOR', first_name: 'Emily', last_name: 'Chen', created_at: '2024-02-10T10:00:00Z' },
  { id: 'u-stu-1', email: 'alex@student.com', role: 'STUDENT', first_name: 'Alex', last_name: 'Johnson', created_at: '2024-03-01T10:00:00Z' },
  { id: 'u-stu-2', email: 'maria@student.com', role: 'STUDENT', first_name: 'Maria', last_name: 'Garcia', created_at: '2024-03-05T10:00:00Z' },
  { id: 'u-stu-3', email: 'james@student.com', role: 'STUDENT', first_name: 'James', last_name: 'Wilson', created_at: '2024-03-10T10:00:00Z' },
  { id: 'u-stu-4', email: 'lisa@student.com', role: 'STUDENT', first_name: 'Lisa', last_name: 'Anderson', created_at: '2024-03-15T10:00:00Z' },
  { id: 'u-stu-5', email: 'robert@student.com', role: 'STUDENT', first_name: 'Robert', last_name: 'Brown', created_at: '2024-03-20T10:00:00Z' },
];

export const mockInstructorProfiles: InstructorProfile[] = [
  { id: 'instr-1', user_id: 'u-instr-1', bio: 'Senior Software Engineer with 15 years of experience. Passionate about teaching modern web development.', expertise: 'Web Development, JavaScript, React', avatar_url: 'https://images.pexels.com/photos/220817/pexels-photo-220817.jpeg?auto=compress&cs=tinysrgb&w=200', verified: true },
  { id: 'instr-2', user_id: 'u-instr-2', bio: 'Data Scientist and ML researcher. PhD in Computer Science from Stanford.', expertise: 'Machine Learning, Python, Data Science', avatar_url: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200', verified: true },
];

export const mockStudentProfiles: StudentProfile[] = [
  { id: 'sp-1', user_id: 'u-stu-1', avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: 'sp-2', user_id: 'u-stu-2', avatar_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: 'sp-3', user_id: 'u-stu-3', avatar_url: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: 'sp-4', user_id: 'u-stu-4', avatar_url: 'https://images.pexels.com/photos/1213338/pexels-photo-1213338.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: 'sp-5', user_id: 'u-stu-5', avatar_url: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200' },
];

export const mockCategories: CourseCategory[] = [
  { id: 'cat-1', name: 'Web Development', description: 'Frontend, backend, and full-stack web development courses', created_at: '2024-01-20T10:00:00Z' },
  { id: 'cat-2', name: 'Data Science', description: 'Data analysis, machine learning, and AI courses', created_at: '2024-01-20T10:00:00Z' },
  { id: 'cat-3', name: 'Mobile Development', description: 'iOS, Android, and cross-platform mobile development', created_at: '2024-01-20T10:00:00Z' },
  { id: 'cat-4', name: 'DevOps & Cloud', description: 'Cloud computing, CI/CD, and infrastructure courses', created_at: '2024-01-20T10:00:00Z' },
  { id: 'cat-5', name: 'Design', description: 'UI/UX design, graphic design, and design systems', created_at: '2024-01-20T10:00:00Z' },
];

export const mockTags: CourseTag[] = [
  { id: 'tag-1', name: 'React', created_at: '2024-01-20T10:00:00Z' },
  { id: 'tag-2', name: 'JavaScript', created_at: '2024-01-20T10:00:00Z' },
  { id: 'tag-3', name: 'TypeScript', created_at: '2024-01-20T10:00:00Z' },
  { id: 'tag-4', name: 'Python', created_at: '2024-01-20T10:00:00Z' },
  { id: 'tag-5', name: 'Machine Learning', created_at: '2024-01-20T10:00:00Z' },
  { id: 'tag-6', name: 'Node.js', created_at: '2024-01-20T10:00:00Z' },
  { id: 'tag-7', name: 'PostgreSQL', created_at: '2024-01-20T10:00:00Z' },
  { id: 'tag-8', name: 'AWS', created_at: '2024-01-20T10:00:00Z' },
  { id: 'tag-9', name: 'Docker', created_at: '2024-01-20T10:00:00Z' },
  { id: 'tag-10', name: 'CSS', created_at: '2024-01-20T10:00:00Z' },
  { id: 'tag-11', name: 'Tailwind', created_at: '2024-01-20T10:00:00Z' },
  { id: 'tag-12', name: 'Next.js', created_at: '2024-01-20T10:00:00Z' },
];

export const mockCourses: Course[] = [
  {
    id: 'course-1', instructor_id: 'instr-1', category_id: 'cat-1',
    title: 'Complete React Developer Course 2025', subtitle: 'Master React from fundamentals to advanced patterns',
    description: 'A comprehensive guide to building modern web applications with React. Learn hooks, context, state management, testing, and deployment.',
    difficulty: 'INTERMEDIATE', language: 'English', price: 49.99,
    thumbnail_url: 'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=600',
    promotional_video_url: null, duration_minutes: 1200,
    learning_outcomes: ['Build production React applications', 'Master React Hooks and Context API', 'Implement state management', 'Write unit tests for components', 'Deploy apps to production'],
    prerequisites: ['Basic HTML, CSS, and JavaScript', 'Familiarity with the command line'],
    status: 'PUBLISHED', created_at: '2024-06-01T10:00:00Z', updated_at: '2024-06-15T10:00:00Z',
    instructor_name: 'John Doe', category_name: 'Web Development',
    enrollment_count: 142, average_rating: 4.7, review_count: 38,
    tags: [mockTags[0], mockTags[1], mockTags[2], mockTags[10]],
  },
  {
    id: 'course-2', instructor_id: 'instr-1', category_id: 'cat-1',
    title: 'Node.js & Express REST API Masterclass', subtitle: 'Build scalable backend services with Node.js',
    description: 'Learn to build production-grade REST APIs with Node.js, Express, and PostgreSQL. Includes authentication, file uploads, and deployment.',
    difficulty: 'ADVANCED', language: 'English', price: 59.99,
    thumbnail_url: 'https://images.pexels.com/photos/270404/pexels-photo-270404.jpeg?auto=compress&cs=tinysrgb&w=600',
    promotional_video_url: null, duration_minutes: 900,
    learning_outcomes: ['Build REST APIs with Express', 'Implement JWT authentication', 'Work with PostgreSQL and Prisma', 'Handle file uploads to S3', 'Deploy Node.js applications'],
    prerequisites: ['Intermediate JavaScript', 'Basic understanding of HTTP'],
    status: 'PUBLISHED', created_at: '2024-07-01T10:00:00Z', updated_at: '2024-07-20T10:00:00Z',
    instructor_name: 'John Doe', category_name: 'Web Development',
    enrollment_count: 87, average_rating: 4.5, review_count: 22,
    tags: [mockTags[5], mockTags[6], mockTags[1]],
  },
  {
    id: 'course-3', instructor_id: 'instr-1', category_id: 'cat-1',
    title: 'TypeScript Deep Dive', subtitle: 'From zero to expert in TypeScript',
    description: 'Master TypeScript with advanced types, generics, decorators, and real-world patterns used in enterprise applications.',
    difficulty: 'INTERMEDIATE', language: 'English', price: 0,
    thumbnail_url: 'https://images.pexels.com/photos/1089438/pexels-photo-1089438.jpeg?auto=compress&cs=tinysrgb&w=600',
    promotional_video_url: null, duration_minutes: 600,
    learning_outcomes: ['Understand TypeScript type system', 'Use generics and advanced types', 'Configure tsconfig for projects', 'Migrate JavaScript to TypeScript'],
    prerequisites: ['Intermediate JavaScript'],
    status: 'DRAFT', created_at: '2024-08-01T10:00:00Z', updated_at: '2024-08-05T10:00:00Z',
    instructor_name: 'John Doe', category_name: 'Web Development',
    enrollment_count: 0, average_rating: 0, review_count: 0,
    tags: [mockTags[2]],
  },
  {
    id: 'course-4', instructor_id: 'instr-1', category_id: 'cat-4',
    title: 'Docker & Kubernetes for Developers', subtitle: 'Containerize and orchestrate your applications',
    description: 'Learn Docker from basics to advanced, then master Kubernetes for container orchestration in production environments.',
    difficulty: 'ADVANCED', language: 'English', price: 69.99,
    thumbnail_url: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=600',
    promotional_video_url: null, duration_minutes: 750,
    learning_outcomes: ['Build and optimize Docker images', 'Create Docker Compose stacks', 'Deploy to Kubernetes clusters', 'Implement CI/CD pipelines'],
    prerequisites: ['Basic Linux command line', 'Understanding of web applications'],
    status: 'ARCHIVED', created_at: '2024-05-01T10:00:00Z', updated_at: '2024-05-15T10:00:00Z',
    instructor_name: 'John Doe', category_name: 'DevOps & Cloud',
    enrollment_count: 54, average_rating: 4.3, review_count: 15,
    tags: [mockTags[8], mockTags[7]],
  },
  {
    id: 'course-5', instructor_id: 'instr-2', category_id: 'cat-2',
    title: 'Machine Learning with Python', subtitle: 'From theory to practice with scikit-learn and TensorFlow',
    description: 'A complete machine learning course covering supervised and unsupervised learning, neural networks, and model deployment.',
    difficulty: 'INTERMEDIATE', language: 'English', price: 79.99,
    thumbnail_url: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=600',
    promotional_video_url: null, duration_minutes: 1500,
    learning_outcomes: ['Understand ML algorithms', 'Build models with scikit-learn', 'Create neural networks with TensorFlow', 'Deploy ML models to production'],
    prerequisites: ['Intermediate Python', 'Basic statistics and linear algebra'],
    status: 'PUBLISHED', created_at: '2024-06-10T10:00:00Z', updated_at: '2024-06-25T10:00:00Z',
    instructor_name: 'Emily Chen', category_name: 'Data Science',
    enrollment_count: 203, average_rating: 4.8, review_count: 51,
    tags: [mockTags[3], mockTags[4]],
  },
  {
    id: 'course-6', instructor_id: 'instr-2', category_id: 'cat-2',
    title: 'Python for Data Analysis', subtitle: 'Pandas, NumPy, and data visualization',
    description: 'Master data analysis with Python using Pandas, NumPy, Matplotlib, and Seaborn. Real-world datasets and projects.',
    difficulty: 'BEGINNER', language: 'English', price: 39.99,
    thumbnail_url: 'https://images.pexels.com/photos/5900574/pexels-photo-5900574.jpeg?auto=compress&cs=tinysrgb&w=600',
    promotional_video_url: null, duration_minutes: 800,
    learning_outcomes: ['Manipulate data with Pandas', 'Perform numerical computing with NumPy', 'Create data visualizations', 'Work with real-world datasets'],
    prerequisites: ['Basic Python programming'],
    status: 'PUBLISHED', created_at: '2024-07-15T10:00:00Z', updated_at: '2024-07-30T10:00:00Z',
    instructor_name: 'Emily Chen', category_name: 'Data Science',
    enrollment_count: 168, average_rating: 4.6, review_count: 34,
    tags: [mockTags[3]],
  },
  {
    id: 'course-7', instructor_id: 'instr-2', category_id: 'cat-2',
    title: 'Deep Learning Specialization', subtitle: 'Neural networks, CNNs, RNNs, and transformers',
    description: 'Dive deep into neural network architectures. Build and train CNNs, RNNs, and transformer models from scratch.',
    difficulty: 'ADVANCED', language: 'English', price: 99.99,
    thumbnail_url: 'https://images.pexels.com/photos/1036641/pexels-photo-1036641.jpeg?auto=compress&cs=tinysrgb&w=600',
    promotional_video_url: null, duration_minutes: 1800,
    learning_outcomes: ['Build neural networks from scratch', 'Implement CNNs for image recognition', 'Work with RNNs and LSTMs', 'Understand transformer architecture'],
    prerequisites: ['Machine Learning fundamentals', 'Intermediate Python', 'Linear algebra'],
    status: 'UNPUBLISHED', created_at: '2024-08-10T10:00:00Z', updated_at: '2024-08-12T10:00:00Z',
    instructor_name: 'Emily Chen', category_name: 'Data Science',
    enrollment_count: 12, average_rating: 0, review_count: 0,
    tags: [mockTags[3], mockTags[4]],
  },
];

export const mockModules: CourseModule[] = [
  { id: 'mod-1', course_id: 'course-1', name: 'React Fundamentals', description: 'Getting started with React', display_order: 1, created_at: '2024-06-01T10:00:00Z' },
  { id: 'mod-2', course_id: 'course-1', name: 'Hooks and State Management', description: 'Deep dive into React hooks', display_order: 2, created_at: '2024-06-01T10:00:00Z' },
  { id: 'mod-3', course_id: 'course-1', name: 'Advanced Patterns', description: 'Performance and architecture', display_order: 3, created_at: '2024-06-01T10:00:00Z' },
  { id: 'mod-4', course_id: 'course-2', name: 'Express Basics', description: 'Setting up Express servers', display_order: 1, created_at: '2024-07-01T10:00:00Z' },
  { id: 'mod-5', course_id: 'course-2', name: 'Database Integration', description: 'PostgreSQL with Node.js', display_order: 2, created_at: '2024-07-01T10:00:00Z' },
  { id: 'mod-6', course_id: 'course-5', name: 'Supervised Learning', description: 'Regression and classification', display_order: 1, created_at: '2024-06-10T10:00:00Z' },
  { id: 'mod-7', course_id: 'course-5', name: 'Unsupervised Learning', description: 'Clustering and dimensionality reduction', display_order: 2, created_at: '2024-06-10T10:00:00Z' },
];

export const mockLessons: Lesson[] = [
  { id: 'lesson-1', module_id: 'mod-1', title: 'Introduction to React', description: 'What is React and why use it?', display_order: 1, duration_minutes: 15, created_at: '2024-06-01T10:00:00Z' },
  { id: 'lesson-2', module_id: 'mod-1', title: 'JSX and Components', description: 'Understanding JSX syntax', display_order: 2, duration_minutes: 25, created_at: '2024-06-01T10:00:00Z' },
  { id: 'lesson-3', module_id: 'mod-1', title: 'Props and State', description: 'Component data flow', display_order: 3, duration_minutes: 30, created_at: '2024-06-01T10:00:00Z' },
  { id: 'lesson-4', module_id: 'mod-2', title: 'useState Hook', description: 'Managing local state', display_order: 1, duration_minutes: 20, created_at: '2024-06-01T10:00:00Z' },
  { id: 'lesson-5', module_id: 'mod-2', title: 'useEffect Hook', description: 'Side effects in React', display_order: 2, duration_minutes: 35, created_at: '2024-06-01T10:00:00Z' },
  { id: 'lesson-6', module_id: 'mod-2', title: 'useContext and useReducer', description: 'Advanced state management', display_order: 3, duration_minutes: 40, created_at: '2024-06-01T10:00:00Z' },
  { id: 'lesson-7', module_id: 'mod-3', title: 'Performance Optimization', description: 'Memoization and lazy loading', display_order: 1, duration_minutes: 45, created_at: '2024-06-01T10:00:00Z' },
  { id: 'lesson-8', module_id: 'mod-4', title: 'Setting Up Express', description: 'Creating your first server', display_order: 1, duration_minutes: 20, created_at: '2024-07-01T10:00:00Z' },
  { id: 'lesson-9', module_id: 'mod-4', title: 'Routing in Express', description: 'RESTful routing patterns', display_order: 2, duration_minutes: 30, created_at: '2024-07-01T10:00:00Z' },
  { id: 'lesson-10', module_id: 'mod-6', title: 'Linear Regression', description: 'Predicting continuous values', display_order: 1, duration_minutes: 40, created_at: '2024-06-10T10:00:00Z' },
  { id: 'lesson-11', module_id: 'mod-6', title: 'Logistic Regression', description: 'Binary classification', display_order: 2, duration_minutes: 35, created_at: '2024-06-10T10:00:00Z' },
];

export const mockMaterials: LearningMaterial[] = [
  { id: 'mat-1', lesson_id: 'lesson-1', type: 'VIDEO', title: 'Intro Video', description: 'Course overview', s3_url: 'https://example-s3.s3.amazonaws.com/videos/react-intro.mp4', external_url: null, file_size_bytes: 150000000, file_type: 'video/mp4', display_order: 1, created_at: '2024-06-01T10:00:00Z' },
  { id: 'mat-2', lesson_id: 'lesson-1', type: 'NOTES', title: 'Lesson Notes', description: 'Written summary of the lesson', s3_url: 'https://example-s3.s3.amazonaws.com/notes/lesson1-notes.pdf', external_url: null, file_size_bytes: 250000, file_type: 'application/pdf', display_order: 2, created_at: '2024-06-01T10:00:00Z' },
  { id: 'mat-3', lesson_id: 'lesson-2', type: 'VIDEO', title: 'JSX Deep Dive', description: null, s3_url: 'https://example-s3.s3.amazonaws.com/videos/jsx.mp4', external_url: null, file_size_bytes: 180000000, file_type: 'video/mp4', display_order: 1, created_at: '2024-06-01T10:00:00Z' },
  { id: 'mat-4', lesson_id: 'lesson-2', type: 'DOWNLOADABLE_RESOURCE', title: 'JSX Cheat Sheet', description: 'Quick reference for JSX syntax', s3_url: 'https://example-s3.s3.amazonaws.com/resources/jsx-cheatsheet.pdf', external_url: null, file_size_bytes: 500000, file_type: 'application/pdf', display_order: 2, created_at: '2024-06-01T10:00:00Z' },
  { id: 'mat-5', lesson_id: 'lesson-4', type: 'VIDEO', title: 'useState Tutorial', description: null, s3_url: 'https://example-s3.s3.amazonaws.com/videos/usestate.mp4', external_url: null, file_size_bytes: 120000000, file_type: 'video/mp4', display_order: 1, created_at: '2024-06-01T10:00:00Z' },
  { id: 'mat-6', lesson_id: 'lesson-4', type: 'SOURCE_CODE', title: 'useState Examples', description: 'Code examples from the video', s3_url: 'https://example-s3.s3.amazonaws.com/code/usestate-examples.zip', external_url: null, file_size_bytes: 50000, file_type: 'application/zip', display_order: 2, created_at: '2024-06-01T10:00:00Z' },
  { id: 'mat-7', lesson_id: 'lesson-5', type: 'EXTERNAL_LINK', title: 'React Docs - useEffect', description: 'Official documentation', s3_url: null, external_url: 'https://react.dev/reference/react/useEffect', file_size_bytes: null, file_type: null, display_order: 1, created_at: '2024-06-01T10:00:00Z' },
  { id: 'mat-8', lesson_id: 'lesson-3', type: 'VIDEO', title: 'Props and State Video', description: null, s3_url: 'https://example-s3.s3.amazonaws.com/videos/props-state.mp4', external_url: null, file_size_bytes: 200000000, file_type: 'video/mp4', display_order: 1, created_at: '2024-06-01T10:00:00Z' },
];

export const mockEnrollmentRequests: EnrollmentRequest[] = [
  { id: 'er-1', course_id: 'course-1', student_id: 'u-stu-1', status: 'PENDING', rejection_reason: null, requested_at: '2024-09-01T10:00:00Z', reviewed_at: null, student_name: 'Alex Johnson', student_email: 'alex@student.com', course_title: 'Complete React Developer Course 2025' },
  { id: 'er-2', course_id: 'course-1', student_id: 'u-stu-2', status: 'PENDING', rejection_reason: null, requested_at: '2024-09-02T10:00:00Z', reviewed_at: null, student_name: 'Maria Garcia', student_email: 'maria@student.com', course_title: 'Complete React Developer Course 2025' },
  { id: 'er-3', course_id: 'course-2', student_id: 'u-stu-3', status: 'PENDING', rejection_reason: null, requested_at: '2024-09-03T10:00:00Z', reviewed_at: null, student_name: 'James Wilson', student_email: 'james@student.com', course_title: 'Node.js & Express REST API Masterclass' },
  { id: 'er-4', course_id: 'course-1', student_id: 'u-stu-4', status: 'APPROVED', rejection_reason: null, requested_at: '2024-08-15T10:00:00Z', reviewed_at: '2024-08-16T10:00:00Z', student_name: 'Lisa Anderson', student_email: 'lisa@student.com', course_title: 'Complete React Developer Course 2025' },
  { id: 'er-5', course_id: 'course-2', student_id: 'u-stu-5', status: 'REJECTED', rejection_reason: 'Prerequisites not met', requested_at: '2024-08-20T10:00:00Z', reviewed_at: '2024-08-21T10:00:00Z', student_name: 'Robert Brown', student_email: 'robert@student.com', course_title: 'Node.js & Express REST API Masterclass' },
];

export const mockEnrollments: Enrollment[] = [
  { id: 'enr-1', course_id: 'course-1', student_id: 'u-stu-4', enrolled_at: '2024-08-16T10:00:00Z', student_name: 'Lisa Anderson', student_email: 'lisa@student.com', course_title: 'Complete React Developer Course 2025', progress_percentage: 65, assignment_status: 'GRADED', quiz_score: 85, certificate_status: 'NOT_ELIGIBLE' },
  { id: 'enr-2', course_id: 'course-1', student_id: 'u-stu-1', enrolled_at: '2024-07-20T10:00:00Z', student_name: 'Alex Johnson', student_email: 'alex@student.com', course_title: 'Complete React Developer Course 2025', progress_percentage: 100, assignment_status: 'GRADED', quiz_score: 92, certificate_status: 'ISSUED' },
  { id: 'enr-3', course_id: 'course-1', student_id: 'u-stu-2', enrolled_at: '2024-07-25T10:00:00Z', student_name: 'Maria Garcia', student_email: 'maria@student.com', course_title: 'Complete React Developer Course 2025', progress_percentage: 40, assignment_status: 'SUBMITTED', quiz_score: null, certificate_status: 'NOT_ELIGIBLE' },
  { id: 'enr-4', course_id: 'course-2', student_id: 'u-stu-4', enrolled_at: '2024-08-01T10:00:00Z', student_name: 'Lisa Anderson', student_email: 'lisa@student.com', course_title: 'Node.js & Express REST API Masterclass', progress_percentage: 25, assignment_status: 'NOT_SUBMITTED', quiz_score: null, certificate_status: 'NOT_ELIGIBLE' },
  { id: 'enr-5', course_id: 'course-5', student_id: 'u-stu-1', enrolled_at: '2024-06-20T10:00:00Z', student_name: 'Alex Johnson', student_email: 'alex@student.com', course_title: 'Machine Learning with Python', progress_percentage: 80, assignment_status: 'GRADED', quiz_score: 78, certificate_status: 'NOT_ELIGIBLE' },
];

export const mockAssignments: Assignment[] = [
  { id: 'asg-1', course_id: 'course-1', title: 'Build a Todo App', description: 'Create a todo application using React hooks', instructions: 'Build a todo app with add, edit, delete, and filter functionality. Use useState and useEffect. Submit your source code as a zip file.', due_date: '2024-09-30T23:59:59Z', max_marks: 100, created_at: '2024-06-05T10:00:00Z', course_title: 'Complete React Developer Course 2025' },
  { id: 'asg-2', course_id: 'course-1', title: 'Implement Custom Hook', description: 'Create a reusable custom hook', instructions: 'Build a custom hook called useFetch that handles data fetching with loading and error states. Include tests.', due_date: '2024-10-15T23:59:59Z', max_marks: 50, created_at: '2024-06-10T10:00:00Z', course_title: 'Complete React Developer Course 2025' },
  { id: 'asg-3', course_id: 'course-2', title: 'Build a REST API', description: 'Create a complete REST API with authentication', instructions: 'Build a REST API for a blog with CRUD operations, JWT auth, and PostgreSQL. Deploy to a hosting provider.', due_date: '2024-10-01T23:59:59Z', max_marks: 100, created_at: '2024-07-05T10:00:00Z', course_title: 'Node.js & Express REST API Masterclass' },
];

export const mockSubmissions: AssignmentSubmission[] = [
  { id: 'sub-1', assignment_id: 'asg-1', student_id: 'u-stu-1', submitted_file_url: 'https://example-s3.s3.amazonaws.com/submissions/todo-app-alex.zip', submitted_at: '2024-09-25T14:30:00Z', marks: 92, feedback: 'Excellent work! Clean code and great use of hooks. Could improve error handling.', status: 'GRADED', student_name: 'Alex Johnson', student_email: 'alex@student.com', assignment_title: 'Build a Todo App' },
  { id: 'sub-2', assignment_id: 'asg-1', student_id: 'u-stu-4', submitted_file_url: 'https://example-s3.s3.amazonaws.com/submissions/todo-app-lisa.zip', submitted_at: '2024-09-28T18:00:00Z', marks: 85, feedback: 'Good implementation. Missing filter functionality. Code structure is clean.', status: 'GRADED', student_name: 'Lisa Anderson', student_email: 'lisa@student.com', assignment_title: 'Build a Todo App' },
  { id: 'sub-3', assignment_id: 'asg-1', student_id: 'u-stu-2', submitted_file_url: 'https://example-s3.s3.amazonaws.com/submissions/todo-app-maria.zip', submitted_at: '2024-09-29T20:00:00Z', marks: null, feedback: null, status: 'SUBMITTED', student_name: 'Maria Garcia', student_email: 'maria@student.com', assignment_title: 'Build a Todo App' },
  { id: 'sub-4', assignment_id: 'asg-2', student_id: 'u-stu-1', submitted_file_url: 'https://example-s3.s3.amazonaws.com/submissions/custom-hook-alex.zip', submitted_at: '2024-10-10T15:00:00Z', marks: 48, feedback: 'Great implementation of useFetch. Tests are comprehensive.', status: 'GRADED', student_name: 'Alex Johnson', student_email: 'alex@student.com', assignment_title: 'Implement Custom Hook' },
];

export const mockQuizzes: Quiz[] = [
  { id: 'quiz-1', course_id: 'course-1', title: 'React Fundamentals Quiz', description: 'Test your knowledge of React basics', passing_percentage: 70, time_limit_minutes: 30, attempt_limit: 3, created_at: '2024-06-05T10:00:00Z', course_title: 'Complete React Developer Course 2025', question_count: 5 },
  { id: 'quiz-2', course_id: 'course-1', title: 'Hooks Mastery Quiz', description: 'Advanced hooks questions', passing_percentage: 75, time_limit_minutes: 45, attempt_limit: 2, created_at: '2024-06-10T10:00:00Z', course_title: 'Complete React Developer Course 2025', question_count: 3 },
  { id: 'quiz-3', course_id: 'course-2', title: 'Express & REST API Quiz', description: 'Test your API knowledge', passing_percentage: 65, time_limit_minutes: 30, attempt_limit: 3, created_at: '2024-07-05T10:00:00Z', course_title: 'Node.js & Express REST API Masterclass', question_count: 4 },
];

export const mockQuestions: Question[] = [
  { id: 'q-1', quiz_id: 'quiz-1', question_text: 'What is JSX?', question_type: 'MCQ', question_order: 1, created_at: '2024-06-05T10:00:00Z' },
  { id: 'q-2', quiz_id: 'quiz-1', question_text: 'Which hook is used for side effects?', question_type: 'MCQ', question_order: 2, created_at: '2024-06-05T10:00:00Z' },
  { id: 'q-3', quiz_id: 'quiz-1', question_text: 'Which of the following are React hooks?', question_type: 'MULTIPLE_CORRECT', question_order: 3, created_at: '2024-06-05T10:00:00Z' },
  { id: 'q-4', quiz_id: 'quiz-1', question_text: 'What does useState return?', question_type: 'MCQ', question_order: 4, created_at: '2024-06-05T10:00:00Z' },
  { id: 'q-5', quiz_id: 'quiz-1', question_text: 'How do you pass data from parent to child?', question_type: 'MCQ', question_order: 5, created_at: '2024-06-05T10:00:00Z' },
  { id: 'q-6', quiz_id: 'quiz-2', question_text: 'When does useEffect run by default?', question_type: 'MCQ', question_order: 1, created_at: '2024-06-10T10:00:00Z' },
  { id: 'q-7', quiz_id: 'quiz-2', question_text: 'Which hooks are used for performance optimization?', question_type: 'MULTIPLE_CORRECT', question_order: 2, created_at: '2024-06-10T10:00:00Z' },
  { id: 'q-8', quiz_id: 'quiz-2', question_text: 'What is the purpose of useReducer?', question_type: 'MCQ', question_order: 3, created_at: '2024-06-10T10:00:00Z' },
];

export const mockQuestionOptions: QuestionOption[] = [
  { id: 'opt-1', question_id: 'q-1', option_text: 'A JavaScript syntax extension', is_correct: true },
  { id: 'opt-2', question_id: 'q-1', option_text: 'A new programming language', is_correct: false },
  { id: 'opt-3', question_id: 'q-1', option_text: 'A CSS framework', is_correct: false },
  { id: 'opt-4', question_id: 'q-1', option_text: 'A database query language', is_correct: false },
  { id: 'opt-5', question_id: 'q-2', option_text: 'useState', is_correct: false },
  { id: 'opt-6', question_id: 'q-2', option_text: 'useEffect', is_correct: true },
  { id: 'opt-7', question_id: 'q-2', option_text: 'useContext', is_correct: false },
  { id: 'opt-8', question_id: 'q-3', option_text: 'useState', is_correct: true },
  { id: 'opt-9', question_id: 'q-3', option_text: 'useEffect', is_correct: true },
  { id: 'opt-10', question_id: 'q-3', option_text: 'useRouter', is_correct: false },
  { id: 'opt-11', question_id: 'q-3', option_text: 'useFetch', is_correct: false },
  { id: 'opt-12', question_id: 'q-4', option_text: 'A state value and a setter function', is_correct: true },
  { id: 'opt-13', question_id: 'q-4', option_text: 'Only a state value', is_correct: false },
  { id: 'opt-14', question_id: 'q-4', option_text: 'Only a setter function', is_correct: false },
  { id: 'opt-15', question_id: 'q-5', option_text: 'Using props', is_correct: true },
  { id: 'opt-16', question_id: 'q-5', option_text: 'Using state', is_correct: false },
  { id: 'opt-17', question_id: 'q-5', option_text: 'Using context', is_correct: false },
  { id: 'opt-18', question_id: 'q-6', option_text: 'After every render', is_correct: true },
  { id: 'opt-19', question_id: 'q-6', option_text: 'Only on mount', is_correct: false },
  { id: 'opt-20', question_id: 'q-7', option_text: 'useMemo', is_correct: true },
  { id: 'opt-21', question_id: 'q-7', option_text: 'useCallback', is_correct: true },
  { id: 'opt-22', question_id: 'q-7', option_text: 'useState', is_correct: false },
  { id: 'opt-23', question_id: 'q-8', option_text: 'Manage complex state logic', is_correct: true },
  { id: 'opt-24', question_id: 'q-8', option_text: 'Fetch data from APIs', is_correct: false },
];

export const mockQuizAttempts: QuizAttempt[] = [
  { id: 'qa-1', quiz_id: 'quiz-1', student_id: 'u-stu-1', attempt_number: 1, started_at: '2024-09-10T10:00:00Z', completed_at: '2024-09-10T10:25:00Z', status: 'COMPLETED', score_percentage: 80, passed: true },
  { id: 'qa-2', quiz_id: 'quiz-1', student_id: 'u-stu-1', attempt_number: 2, started_at: '2024-09-12T10:00:00Z', completed_at: '2024-09-12T10:20:00Z', status: 'COMPLETED', score_percentage: 92, passed: true },
  { id: 'qa-3', quiz_id: 'quiz-1', student_id: 'u-stu-4', attempt_number: 1, started_at: '2024-09-11T10:00:00Z', completed_at: '2024-09-11T10:28:00Z', status: 'COMPLETED', score_percentage: 85, passed: true },
];

export const mockQuizResults: QuizResult[] = [
  { id: 'qr-1', quiz_id: 'quiz-1', student_id: 'u-stu-1', best_score_percentage: 92, best_attempt_id: 'qa-2', passed: true, attempts_used: 2, last_attempted_at: '2024-09-12T10:20:00Z' },
  { id: 'qr-2', quiz_id: 'quiz-1', student_id: 'u-stu-4', best_score_percentage: 85, best_attempt_id: 'qa-3', passed: true, attempts_used: 1, last_attempted_at: '2024-09-11T10:28:00Z' },
];

export const mockMeetings: Meeting[] = [
  { id: 'meet-1', course_id: 'course-1', title: 'React Q&A Session', description: 'Live Q&A about React fundamentals and hooks', meeting_date: '2024-09-25', start_time: '14:00', end_time: '15:30', google_meet_link: 'https://meet.google.com/abc-defg-hij', recording_url: null, notes: null, status: 'SCHEDULED', created_at: '2024-09-01T10:00:00Z', course_title: 'Complete React Developer Course 2025' },
  { id: 'meet-2', course_id: 'course-1', title: 'Hooks Workshop', description: 'Hands-on workshop building custom hooks', meeting_date: '2024-09-28', start_time: '16:00', end_time: '18:00', google_meet_link: 'https://meet.google.com/xyz-abcd-efg', recording_url: null, notes: null, status: 'SCHEDULED', created_at: '2024-09-01T10:00:00Z', course_title: 'Complete React Developer Course 2025' },
  { id: 'meet-3', course_id: 'course-1', title: 'Course Introduction', description: 'Welcome session and course overview', meeting_date: '2024-08-20', start_time: '10:00', end_time: '11:00', google_meet_link: 'https://meet.google.com/old-meeting-link', recording_url: 'https://example-s3.s3.amazonaws.com/recordings/intro-recording.mp4', notes: 'Key points: course structure, grading, expectations. See attached notes.', status: 'COMPLETED', created_at: '2024-08-01T10:00:00Z', course_title: 'Complete React Developer Course 2025' },
  { id: 'meet-4', course_id: 'course-2', title: 'API Design Discussion', description: 'Best practices for REST API design', meeting_date: '2024-10-02', start_time: '15:00', end_time: '16:30', google_meet_link: 'https://meet.google.com/api-design-001', recording_url: null, notes: null, status: 'SCHEDULED', created_at: '2024-09-05T10:00:00Z', course_title: 'Node.js & Express REST API Masterclass' },
];

export const mockMeetingAttendance: MeetingAttendance[] = [
  { id: 'att-1', meeting_id: 'meet-3', student_id: 'u-stu-1', joined_at: '2024-08-20T10:02:00Z', left_at: '2024-08-20T11:00:00Z', duration_minutes: 58, student_name: 'Alex Johnson', student_email: 'alex@student.com' },
  { id: 'att-2', meeting_id: 'meet-3', student_id: 'u-stu-2', joined_at: '2024-08-20T10:05:00Z', left_at: '2024-08-20T10:45:00Z', duration_minutes: 40, student_name: 'Maria Garcia', student_email: 'maria@student.com' },
  { id: 'att-3', meeting_id: 'meet-3', student_id: 'u-stu-4', joined_at: '2024-08-20T10:00:00Z', left_at: '2024-08-20T11:00:00Z', duration_minutes: 60, student_name: 'Lisa Anderson', student_email: 'lisa@student.com' },
];

export const mockCourseReviews: CourseReview[] = [
  { id: 'rev-1', course_id: 'course-1', student_id: 'u-stu-1', rating: 5, comment: 'Absolutely fantastic course! John explains everything clearly and the projects are real-world relevant.', created_at: '2024-09-01T10:00:00Z', updated_at: '2024-09-01T10:00:00Z', student_name: 'Alex Johnson' },
  { id: 'rev-2', course_id: 'course-1', student_id: 'u-stu-4', rating: 4, comment: 'Great content overall. Would love more advanced topics in the later modules.', created_at: '2024-08-25T10:00:00Z', updated_at: '2024-08-25T10:00:00Z', student_name: 'Lisa Anderson' },
  { id: 'rev-3', course_id: 'course-5', student_id: 'u-stu-1', rating: 5, comment: 'Emily is an amazing teacher. The ML concepts are explained beautifully with great examples.', created_at: '2024-08-10T10:00:00Z', updated_at: '2024-08-10T10:00:00Z', student_name: 'Alex Johnson' },
  { id: 'rev-4', course_id: 'course-5', student_id: 'u-stu-2', rating: 4, comment: 'Very comprehensive. Some parts are quite challenging but worth it.', created_at: '2024-08-15T10:00:00Z', updated_at: '2024-08-15T10:00:00Z', student_name: 'Maria Garcia' },
];

export const mockCertificates: Certificate[] = [
  { id: 'cert-1', course_id: 'course-1', student_id: 'u-stu-1', certificate_number: 'LMS-CERT-2024-0001', issued_at: '2024-09-15T10:00:00Z', student_name: 'Alex Johnson', course_title: 'Complete React Developer Course 2025', instructor_name: 'John Doe' },
];

export const mockCourseProgress: CourseProgress[] = [
  { id: 'cp-1', course_id: 'course-1', student_id: 'u-stu-1', completed_lessons: 7, total_lessons: 7, progress_percentage: 100, total_learning_time_minutes: 210, last_accessed_at: '2024-09-14T10:00:00Z', completed_at: '2024-09-14T10:00:00Z' },
  { id: 'cp-2', course_id: 'course-1', student_id: 'u-stu-4', completed_lessons: 4, total_lessons: 7, progress_percentage: 57, total_learning_time_minutes: 120, last_accessed_at: '2024-09-20T10:00:00Z', completed_at: null },
  { id: 'cp-3', course_id: 'course-1', student_id: 'u-stu-2', completed_lessons: 3, total_lessons: 7, progress_percentage: 43, total_learning_time_minutes: 85, last_accessed_at: '2024-09-18T10:00:00Z', completed_at: null },
  { id: 'cp-4', course_id: 'course-5', student_id: 'u-stu-1', completed_lessons: 2, total_lessons: 2, progress_percentage: 100, total_learning_time_minutes: 75, last_accessed_at: '2024-08-05T10:00:00Z', completed_at: null },
];

export const mockLessonProgress: LessonProgress[] = [
  { id: 'lp-1', lesson_id: 'lesson-1', student_id: 'u-stu-1', completed: true, completed_at: '2024-09-01T10:00:00Z', time_spent_minutes: 15, last_accessed_at: '2024-09-01T10:00:00Z' },
  { id: 'lp-2', lesson_id: 'lesson-2', student_id: 'u-stu-1', completed: true, completed_at: '2024-09-02T10:00:00Z', time_spent_minutes: 25, last_accessed_at: '2024-09-02T10:00:00Z' },
  { id: 'lp-3', lesson_id: 'lesson-3', student_id: 'u-stu-1', completed: true, completed_at: '2024-09-03T10:00:00Z', time_spent_minutes: 30, last_accessed_at: '2024-09-03T10:00:00Z' },
  { id: 'lp-4', lesson_id: 'lesson-4', student_id: 'u-stu-1', completed: true, completed_at: '2024-09-04T10:00:00Z', time_spent_minutes: 20, last_accessed_at: '2024-09-04T10:00:00Z' },
  { id: 'lp-5', lesson_id: 'lesson-1', student_id: 'u-stu-4', completed: true, completed_at: '2024-09-10T10:00:00Z', time_spent_minutes: 15, last_accessed_at: '2024-09-10T10:00:00Z' },
  { id: 'lp-6', lesson_id: 'lesson-2', student_id: 'u-stu-4', completed: true, completed_at: '2024-09-11T10:00:00Z', time_spent_minutes: 25, last_accessed_at: '2024-09-11T10:00:00Z' },
  { id: 'lp-7', lesson_id: 'lesson-3', student_id: 'u-stu-4', completed: true, completed_at: '2024-09-12T10:00:00Z', time_spent_minutes: 30, last_accessed_at: '2024-09-12T10:00:00Z' },
  { id: 'lp-8', lesson_id: 'lesson-4', student_id: 'u-stu-4', completed: true, completed_at: '2024-09-13T10:00:00Z', time_spent_minutes: 20, last_accessed_at: '2024-09-13T10:00:00Z' },
];

export const mockNotifications: Notification[] = [
  { id: 'n-1', user_id: 'u-stu-1', type: 'ENROLLMENT_APPROVED', title: 'Enrollment Approved', message: 'Your enrollment request for "Complete React Developer Course 2025" has been approved.', related_entity_id: 'course-1', read: false, created_at: '2024-08-16T10:00:00Z' },
  { id: 'n-2', user_id: 'u-stu-1', type: 'ASSIGNMENT_GRADED', title: 'Assignment Graded', message: 'Your submission for "Build a Todo App" has been graded. Score: 92/100', related_entity_id: 'asg-1', read: false, created_at: '2024-09-26T10:00:00Z' },
  { id: 'n-3', user_id: 'u-stu-1', type: 'QUIZ_RESULT', title: 'Quiz Result Published', message: 'You scored 92% on "React Fundamentals Quiz". You passed!', related_entity_id: 'quiz-1', read: true, created_at: '2024-09-12T10:20:00Z' },
  { id: 'n-4', user_id: 'u-stu-1', type: 'MEETING_UPCOMING', title: 'Upcoming Live Class', message: 'React Q&A Session is scheduled for September 25 at 2:00 PM.', related_entity_id: 'meet-1', read: false, created_at: '2024-09-20T10:00:00Z' },
  { id: 'n-5', user_id: 'u-instr-1', type: 'COURSE_ANNOUNCEMENT', title: 'New Enrollment Request', message: 'Alex Johnson has requested enrollment in "Complete React Developer Course 2025".', related_entity_id: 'er-1', read: false, created_at: '2024-09-01T10:00:00Z' },
  { id: 'n-6', user_id: 'u-instr-1', type: 'ASSIGNMENT_DEADLINE', title: 'New Submission', message: 'Maria Garcia has submitted "Build a Todo App".', related_entity_id: 'sub-3', read: false, created_at: '2024-09-29T20:00:00Z' },
];
