-- ============================================
-- COURSE MANAGEMENT INDEXES
-- ============================================

-- Course Categories
CREATE INDEX idx_courses_category
ON courses(category_id);


-- Courses by Instructor
CREATE INDEX idx_courses_instructor
ON courses(instructor_id);


-- Course Status
CREATE INDEX idx_courses_status
ON courses(status);


-- Course Modules
CREATE INDEX idx_course_modules_course
ON course_modules(course_id);


-- Lessons
CREATE INDEX idx_lessons_module
ON lessons(module_id);


-- Learning Materials
CREATE INDEX idx_learning_materials_lesson
ON learning_materials(lesson_id);


-- Course Tags
CREATE INDEX idx_course_tags_name
ON course_tags(name);


-- Course Tag Mapping
CREATE INDEX idx_course_tag_mapping_course
ON course_tag_mapping(course_id);

CREATE INDEX idx_course_tag_mapping_tag
ON course_tag_mapping(tag_id);


-- Enrollment Requests
CREATE INDEX idx_enrollment_requests_student
ON enrollment_requests(student_id);

CREATE INDEX idx_enrollment_requests_course
ON enrollment_requests(course_id);

CREATE INDEX idx_enrollment_requests_status
ON enrollment_requests(status);


-- Enrollments
CREATE INDEX idx_enrollments_student
ON enrollments(student_id);

CREATE INDEX idx_enrollments_course
ON enrollments(course_id);


-- Assignments
CREATE INDEX idx_assignments_course
ON assignments(course_id);


-- Assignment Submissions
CREATE INDEX idx_assignment_submissions_assignment
ON assignment_submissions(assignment_id);

CREATE INDEX idx_assignment_submissions_student
ON assignment_submissions(student_id);


-- Quizzes
CREATE INDEX idx_quizzes_course
ON quizzes(course_id);


-- Questions
CREATE INDEX idx_questions_quiz
ON questions(quiz_id);


-- Question Options
CREATE INDEX idx_question_options_question
ON question_options(question_id);


-- Quiz Attempts
CREATE INDEX idx_quiz_attempts_quiz
ON quiz_attempts(quiz_id);

CREATE INDEX idx_quiz_attempts_student
ON quiz_attempts(student_id);


-- Quiz Answers
CREATE INDEX idx_quiz_answers_attempt
ON quiz_answers(attempt_id);

CREATE INDEX idx_quiz_answers_question
ON quiz_answers(question_id);


-- Quiz Results
CREATE INDEX idx_quiz_results_quiz
ON quiz_results(quiz_id);

CREATE INDEX idx_quiz_results_student
ON quiz_results(student_id);


-- Meetings
CREATE INDEX idx_meetings_course
ON meetings(course_id);


-- Meeting Attendance
CREATE INDEX idx_meeting_attendance_meeting
ON meeting_attendance(meeting_id);

CREATE INDEX idx_meeting_attendance_student
ON meeting_attendance(student_id);


-- Lesson Progress
CREATE INDEX idx_lesson_progress_student
ON lesson_progress(student_id);

CREATE INDEX idx_lesson_progress_lesson
ON lesson_progress(lesson_id);


-- Course Progress
CREATE INDEX idx_course_progress_student
ON course_progress(student_id);

CREATE INDEX idx_course_progress_course
ON course_progress(course_id);


-- Course Reviews
CREATE INDEX idx_course_reviews_course
ON course_reviews(course_id);

CREATE INDEX idx_course_reviews_student
ON course_reviews(student_id);


-- Certificates
CREATE INDEX idx_certificates_student
ON certificates(student_id);

CREATE INDEX idx_certificates_course
ON certificates(course_id);


-- Notifications
CREATE INDEX idx_notifications_user
ON notifications(user_id);