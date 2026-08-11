-- ==========================================
-- LMS (Learning Management System) Seed Data
-- Sample Data for Testing and Development
-- ==========================================

-- ==========================================
-- INSERT COURSE CATEGORIES
-- ==========================================

INSERT INTO course_categories (category_name, description) VALUES
('Web Development', 'Learn HTML, CSS, JavaScript, and modern web frameworks'),
('Data Science', 'Data analysis, machine learning, and AI courses'),
('Mobile Development', 'iOS and Android app development'),
('Cloud Computing', 'AWS, Azure, Google Cloud and DevOps'),
('Digital Marketing', 'SEO, social media, and online marketing'),
('Business', 'Entrepreneurship, management, and business skills'),
('Design', 'UI/UX, graphic design, and creative skills'),
('Programming', 'Various programming languages and software development');

-- ==========================================
-- INSERT COURSE TAGS
-- ==========================================

INSERT INTO course_tags (tag_name, description) VALUES
('Beginner Friendly', 'Courses suitable for beginners'),
('Advanced', 'Advanced level courses'),
('Practical', 'Hands-on practical learning'),
('Theory', 'Focus on theoretical concepts'),
('Project-Based', 'Learn through building projects'),
('Certification', 'Courses with certification'),
('Popular', 'Most popular courses'),
('New', 'Recently added courses');

-- ==========================================
-- INSERT SAMPLE USERS
-- ==========================================

-- Note: Passwords are hashed using bcryptjs (hash for 'password123')
-- For real applications, generate proper hashes

-- Admin User
INSERT INTO users (email, password_hash, role, status, email_verified) VALUES
('admin@lms.com', '$2a$10$rJZK5z7Z5Z5Z5Z5Z5Z5Z5e5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'ADMIN', 'ACTIVE', TRUE);

INSERT INTO admin_profiles (user_id, full_name, phone_number) VALUES
((SELECT id FROM users WHERE email = 'admin@lms.com'), 'System Administrator', '+1234567890');

-- Instructor Users
INSERT INTO users (email, password_hash, role, status, email_verified) VALUES
('instructor1@lms.com', '$2a$10$rJZK5z7Z5Z5Z5Z5Z5Z5Z5e5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'INSTRUCTOR', 'ACTIVE', TRUE),
('instructor2@lms.com', '$2a$10$rJZK5z7Z5Z5Z5Z5Z5Z5Z5e5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'INSTRUCTOR', 'ACTIVE', TRUE),
('instructor3@lms.com', '$2a$10$rJZK5z7Z5Z5Z5Z5Z5Z5Z5e5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'INSTRUCTOR', 'ACTIVE', TRUE);

INSERT INTO instructor_profiles (user_id, full_name, bio, qualification, experience_years) VALUES
((SELECT id FROM users WHERE email = 'instructor1@lms.com'), 'John Smith', 'Expert web developer with 10+ years of experience in full-stack development.', 'M.S. Computer Science', 10),
((SELECT id FROM users WHERE email = 'instructor2@lms.com'), 'Sarah Johnson', 'Data scientist specializing in machine learning and AI applications.', 'Ph.D. Data Science', 8),
((SELECT id FROM users WHERE email = 'instructor3@lms.com'), 'Michael Chen', 'Mobile app developer with expertise in React Native and Flutter.', 'B.S. Software Engineering', 6);

-- Student Users
INSERT INTO users (email, password_hash, role, status, email_verified) VALUES
('student1@lms.com', '$2a$10$rJZK5z7Z5Z5Z5Z5Z5Z5Z5e5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'STUDENT', 'ACTIVE', TRUE),
('student2@lms.com', '$2a$10$rJZK5z7Z5Z5Z5Z5Z5Z5Z5e5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'STUDENT', 'ACTIVE', TRUE),
('student3@lms.com', '$2a$10$rJZK5z7Z5Z5Z5Z5Z5Z5Z5e5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'STUDENT', 'ACTIVE', TRUE),
('student4@lms.com', '$2a$10$rJZK5z7Z5Z5Z5Z5Z5Z5Z5e5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'STUDENT', 'ACTIVE', TRUE),
('student5@lms.com', '$2a$10$rJZK5z7Z5Z5Z5Z5Z5Z5Z5e5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'STUDENT', 'ACTIVE', TRUE);

INSERT INTO student_profiles (user_id, full_name, college_name, current_year) VALUES
((SELECT id FROM users WHERE email = 'student1@lms.com'), 'Emma Wilson', 'MIT', 3),
((SELECT id FROM users WHERE email = 'student2@lms.com'), 'James Brown', 'Stanford University', 2),
((SELECT id FROM users WHERE email = 'student3@lms.com'), 'Sophia Davis', 'Harvard University', 4),
((SELECT id FROM users WHERE email = 'student4@lms.com'), 'William Miller', 'UC Berkeley', 1),
((SELECT id FROM users WHERE email = 'student5@lms.com'), 'Olivia Garcia', 'Carnegie Mellon', 3);

-- ==========================================
-- INSERT SAMPLE COURSES
-- ==========================================

INSERT INTO courses (instructor_id, category_id, title, subtitle, description, difficulty, language, price, duration_hours, learning_outcomes, prerequisites, status) VALUES
((SELECT id FROM users WHERE email = 'instructor1@lms.com'), 
 (SELECT id FROM course_categories WHERE category_name = 'Web Development'),
 'Complete Web Development Bootcamp',
 'From Zero to Hero in Web Development',
 'Learn HTML, CSS, JavaScript, React, Node.js and more. Build real-world projects and become a full-stack developer.',
 'BEGINNER', 'English', 99.99, 40,
 '["Master HTML5 and CSS3", "Build responsive websites", "Learn JavaScript fundamentals", "Create React applications", "Build Node.js backend"]',
 '["Basic computer skills", "No prior programming experience required"]',
 'PUBLISHED'),

((SELECT id FROM users WHERE email = 'instructor1@lms.com'),
 (SELECT id FROM course_categories WHERE category_name = 'Web Development'),
 'Advanced React and Redux',
 'Master Modern Web Development',
 'Deep dive into React patterns, Redux state management, performance optimization, and testing.',
 'ADVANCED', 'English', 149.99, 25,
 '["Advanced React patterns", "Redux architecture", "Performance optimization", "Testing strategies", "Deployment pipelines"]',
 '["Strong JavaScript knowledge", "React fundamentals", "HTML/CSS proficiency"]',
 'PUBLISHED'),

((SELECT id FROM users WHERE email = 'instructor2@lms.com'),
 (SELECT id FROM course_categories WHERE category_name = 'Data Science'),
 'Data Science with Python',
 'Complete Data Science Curriculum',
 'Learn Python, pandas, numpy, matplotlib, scikit-learn, and machine learning algorithms from scratch.',
 'INTERMEDIATE', 'English', 129.99, 35,
 '["Python programming", "Data manipulation with pandas", "Data visualization", "Machine learning basics", "Statistical analysis"]',
 '["Basic Python knowledge", "Understanding of basic statistics", "Mathematics fundamentals"]',
 'PUBLISHED'),

((SELECT id FROM users WHERE email = 'instructor2@lms.com'),
 (SELECT id FROM course_categories WHERE category_name = 'Data Science'),
 'Machine Learning A-Z',
 'Comprehensive ML Course',
 'Cover supervised and unsupervised learning, neural networks, deep learning, and real-world ML projects.',
 'ADVANCED', 'English', 199.99, 45,
 '["Supervised learning algorithms", "Unsupervised learning", "Neural networks", "Deep learning with TensorFlow", "Model deployment"]',
 '["Strong Python skills", "Statistics and probability", "Linear algebra basics", "Calculus fundamentals"]',
 'PUBLISHED'),

((SELECT id FROM users WHERE email = 'instructor3@lms.com'),
 (SELECT id FROM course_categories WHERE category_name = 'Mobile Development'),
 'React Native Mobile Development',
 'Build iOS and Android Apps',
 'Learn to build cross-platform mobile applications using React Native and Expo.',
 'INTERMEDIATE', 'English', 119.99, 30,
 '["React Native fundamentals", "Expo framework", "Mobile UI components", "API integration", "App deployment"]',
 '["JavaScript/React knowledge", "Basic mobile app concepts", "Node.js installed"]',
 'PUBLISHED'),

((SELECT id FROM users WHERE email = 'instructor1@lms.com'),
 (SELECT id FROM course_categories WHERE category_name = 'Cloud Computing'),
 'AWS Certified Solutions Architect',
 'Cloud Architecture Mastery',
 'Prepare for AWS certification and learn to design scalable, highly available systems.',
 'INTERMEDIATE', 'English', 179.99, 35,
 '["AWS core services", "Architecture best practices", "Security and compliance", "Cost optimization", "Monitoring and scaling"]',
 '["Basic IT knowledge", "Understanding of networking concepts", "Linux fundamentals"]',
 'PUBLISHED');

-- ==========================================
-- INSERT COURSE TAGS MAPPING
-- ==========================================

INSERT INTO course_tag_mapping (course_id, tag_id) VALUES
-- Web Development Bootcamp tags
((SELECT id FROM courses WHERE title = 'Complete Web Development Bootcamp'), 
 (SELECT id FROM course_tags WHERE tag_name = 'Beginner Friendly')),
((SELECT id FROM courses WHERE title = 'Complete Web Development Bootcamp'),
 (SELECT id FROM course_tags WHERE tag_name = 'Practical')),
((SELECT id FROM courses WHERE title = 'Complete Web Development Bootcamp'),
 (SELECT id FROM course_tags WHERE tag_name = 'Project-Based')),
((SELECT id FROM courses WHERE title = 'Complete Web Development Bootcamp'),
 (SELECT id FROM course_tags WHERE tag_name = 'Popular')),

-- Advanced React tags
((SELECT id FROM courses WHERE title = 'Advanced React and Redux'),
 (SELECT id FROM course_tags WHERE tag_name = 'Advanced')),
((SELECT id FROM courses WHERE title = 'Advanced React and Redux'),
 (SELECT id FROM course_tags WHERE tag_name = 'Practical')),

-- Data Science with Python tags
((SELECT id FROM courses WHERE title = 'Data Science with Python'),
 (SELECT id FROM course_tags WHERE tag_name = 'Beginner Friendly')),
((SELECT id FROM courses WHERE title = 'Data Science with Python'),
 (SELECT id FROM course_tags WHERE tag_name = 'Popular')),

-- Machine Learning tags
((SELECT id FROM courses WHERE title = 'Machine Learning A-Z'),
 (SELECT id FROM course_tags WHERE tag_name = 'Advanced')),
((SELECT id FROM courses WHERE title = 'Machine Learning A-Z'),
 (SELECT id FROM course_tags WHERE tag_name = 'Certification'));

-- ==========================================
-- INSERT SAMPLE COURSE MODULES AND LESSONS
-- ==========================================

-- Web Development Bootcamp Modules
INSERT INTO course_modules (course_id, module_name, description, display_order) VALUES
((SELECT id FROM courses WHERE title = 'Complete Web Development Bootcamp'), 'HTML & CSS Fundamentals', 'Learn the building blocks of web pages', 1),
((SELECT id FROM courses WHERE title = 'Complete Web Development Bootcamp'), 'JavaScript Essentials', 'Master JavaScript programming fundamentals', 2),
((SELECT id FROM courses WHERE title = 'Complete Web Development Bootcamp'), 'React Framework', 'Build modern user interfaces with React', 3),
((SELECT id FROM courses WHERE title = 'Complete Web Development Bootcamp'), 'Node.js & Express', 'Server-side JavaScript development', 4),
((SELECT id FROM courses WHERE title = 'Complete Web Development Bootcamp'), 'Database Integration', 'Work with PostgreSQL and MongoDB', 5);

-- Lessons for Web Development Bootcamp
INSERT INTO lessons (module_id, lesson_title, description, lesson_order, duration_minutes, is_preview) VALUES
-- HTML & CSS Fundamentals lessons
((SELECT id FROM course_modules WHERE module_name = 'HTML & CSS Fundamentals' AND course_id = (SELECT id FROM courses WHERE title = 'Complete Web Development Bootcamp')),
 'Introduction to HTML', 'Understanding HTML structure and elements', 1, 45, TRUE),
((SELECT id FROM course_modules WHERE module_name = 'HTML & CSS Fundamentals' AND course_id = (SELECT id FROM courses WHERE title = 'Complete Web Development Bootcamp')),
 'CSS Styling Basics', 'Colors, fonts, and layout with CSS', 2, 60, TRUE),
((SELECT id FROM course_modules WHERE module_name = 'HTML & CSS Fundamentals' AND course_id = (SELECT id FROM courses WHERE title = 'Complete Web Development Bootcamp')),
 'Responsive Design', 'Building websites that work on all devices', 3, 75, FALSE),

-- JavaScript Essentials lessons
((SELECT id FROM course_modules WHERE module_name = 'JavaScript Essentials' AND course_id = (SELECT id FROM courses WHERE title = 'Complete Web Development Bootcamp')),
 'JavaScript Fundamentals', 'Variables, functions, and control flow', 1, 60, TRUE),
((SELECT id FROM course_modules WHERE module_name = 'JavaScript Essentials' AND course_id = (SELECT id FROM courses WHERE title = 'Complete Web Development Bootcamp')),
 'DOM Manipulation', 'Interacting with web pages dynamically', 2, 50, FALSE),
((SELECT id FROM course_modules WHERE module_name = 'JavaScript Essentials' AND course_id = (SELECT id FROM courses WHERE title = 'Complete Web Development Bootcamp')),
 'ES6+ Features', 'Modern JavaScript syntax and features', 3, 45, FALSE),

-- React Framework lessons
((SELECT id FROM course_modules WHERE module_name = 'React Framework' AND course_id = (SELECT id FROM courses WHERE title = 'Complete Web Development Bootcamp')),
 'React Basics', 'Components, props, and state', 1, 60, TRUE),
((SELECT id FROM course_modules WHERE module_name = 'React Framework' AND course_id = (SELECT id FROM courses WHERE title = 'Complete Web Development Bootcamp')),
 'React Hooks', 'useState, useEffect, and custom hooks', 2, 75, FALSE),
((SELECT id FROM course_modules WHERE module_name = 'React Framework' AND course_id = (SELECT id FROM courses WHERE title = 'Complete Web Development Bootcamp')),
 'React Router', 'Navigation in React applications', 3, 40, FALSE);

-- ==========================================
-- INSERT SAMPLE ENROLLMENTS
-- ==========================================

INSERT INTO enrollments (student_id, course_id, completion_status) VALUES
-- Student 1 enrollments
((SELECT id FROM users WHERE email = 'student1@lms.com'), 
 (SELECT id FROM courses WHERE title = 'Complete Web Development Bootcamp'), FALSE),
((SELECT id FROM users WHERE email = 'student1@lms.com'),
 (SELECT id FROM courses WHERE title = 'Data Science with Python'), FALSE),

-- Student 2 enrollments
((SELECT id FROM users WHERE email = 'student2@lms.com'),
 (SELECT id FROM courses WHERE title = 'Complete Web Development Bootcamp'), FALSE),
((SELECT id FROM users WHERE email = 'student2@lms.com'),
 (SELECT id FROM courses WHERE title = 'Advanced React and Redux'), FALSE),

-- Student 3 enrollments
((SELECT id FROM users WHERE email = 'student3@lms.com'),
 (SELECT id FROM courses WHERE title = 'Data Science with Python'), FALSE),
((SELECT id FROM users WHERE email = 'student3@lms.com'),
 (SELECT id FROM courses WHERE title = 'Machine Learning A-Z'), FALSE),

-- Student 4 enrollments
((SELECT id FROM users WHERE email = 'student4@lms.com'),
 (SELECT id FROM courses WHERE title = 'React Native Mobile Development'), FALSE),

-- Student 5 enrollments
((SELECT id FROM users WHERE email = 'student5@lms.com'),
 (SELECT id FROM courses WHERE title = 'AWS Certified Solutions Architect'), FALSE),
((SELECT id FROM users WHERE email = 'student5@lms.com'),
 (SELECT id FROM courses WHERE title = 'Complete Web Development Bootcamp'), FALSE);

-- ==========================================
-- INSERT SAMPLE ASSIGNMENTS
-- ==========================================

INSERT INTO assignments (course_id, title, description, instructions, due_date, max_marks) VALUES
((SELECT id FROM courses WHERE title = 'Complete Web Development Bootcamp'),
 'HTML Portfolio Project',
 'Create a personal portfolio website using HTML and CSS',
 'Build a responsive portfolio website with at least 3 sections: About, Projects, and Contact. Use semantic HTML and modern CSS.',
 CURRENT_TIMESTAMP + INTERVAL '7 days', 100),

((SELECT id FROM courses WHERE title = 'Complete Web Development Bootcamp'),
 'JavaScript Quiz App',
 'Build an interactive quiz application',
 'Create a quiz application with multiple choice questions, scoring system, and results display using pure JavaScript.',
 CURRENT_TIMESTAMP + INTERVAL '14 days', 100),

((SELECT id FROM courses WHERE title = 'Data Science with Python'),
 'Data Analysis Project',
 'Analyze a real-world dataset using Python',
 'Use pandas and matplotlib to analyze a dataset of your choice. Include data cleaning, visualization, and insights.',
 CURRENT_TIMESTAMP + INTERVAL '10 days', 100);

-- ==========================================
-- INSERT SAMPLE QUIZZES
-- ==========================================

INSERT INTO quizzes (course_id, title, description, passing_percentage, time_limit_minutes, attempt_limit) VALUES
((SELECT id FROM courses WHERE title = 'Complete Web Development Bootcamp'),
 'HTML & CSS Fundamentals Quiz',
 'Test your knowledge of HTML and CSS basics',
 70.00, 15, 3),

((SELECT id FROM courses WHERE title = 'Complete Web Development Bootcamp'),
 'JavaScript Basics Quiz',
 'JavaScript fundamentals assessment',
 75.00, 20, 3),

((SELECT id FROM courses WHERE title = 'Data Science with Python'),
 'Python Programming Quiz',
 'Test your Python programming skills',
 70.00, 25, 3);

-- ==========================================
-- INSERT SAMPLE QUIZ QUESTIONS
-- ==========================================

-- HTML & CSS Quiz Questions
INSERT INTO questions (quiz_id, question_text, question_type, marks, question_order) VALUES
((SELECT id FROM quizzes WHERE title = 'HTML & CSS Fundamentals Quiz'),
 'What does HTML stand for?', 'MCQ', 1, 1),
((SELECT id FROM quizzes WHERE title = 'HTML & CSS Fundamentals Quiz'),
 'Which CSS property is used to change text color?', 'MCQ', 1, 2),
((SELECT id FROM quizzes WHERE title = 'HTML & CSS Fundamentals Quiz'),
 'What is the purpose of the <div> tag?', 'MCQ', 1, 3);

INSERT INTO question_options (question_id, option_text, is_correct) VALUES
-- Question 1 options
((SELECT id FROM questions WHERE question_text = 'What does HTML stand for?' AND quiz_id = (SELECT id FROM quizzes WHERE title = 'HTML & CSS Fundamentals Quiz')),
 'Hyper Text Markup Language', TRUE),
((SELECT id FROM questions WHERE question_text = 'What does HTML stand for?' AND quiz_id = (SELECT id FROM quizzes WHERE title = 'HTML & CSS Fundamentals Quiz')),
 'High Tech Modern Language', FALSE),
((SELECT id FROM questions WHERE question_text = 'What does HTML stand for?' AND quiz_id = (SELECT id FROM quizzes WHERE title = 'HTML & CSS Fundamentals Quiz')),
 'Home Tool Markup Language', FALSE),
((SELECT id FROM questions WHERE question_text = 'What does HTML stand for?' AND quiz_id = (SELECT id FROM quizzes WHERE title = 'HTML & CSS Fundamentals Quiz')),
 'Hyperlinks Text Mark Language', FALSE),

-- Question 2 options
((SELECT id FROM questions WHERE question_text = 'Which CSS property is used to change text color?' AND quiz_id = (SELECT id FROM quizzes WHERE title = 'HTML & CSS Fundamentals Quiz')),
 'text-color', FALSE),
((SELECT id FROM questions WHERE question_text = 'Which CSS property is used to change text color?' AND quiz_id = (SELECT id FROM quizzes WHERE title = 'HTML & CSS Fundamentals Quiz')),
 'color', TRUE),
((SELECT id FROM questions WHERE question_text = 'Which CSS property is used to change text color?' AND quiz_id = (SELECT id FROM quizzes WHERE title = 'HTML & CSS Fundamentals Quiz')),
 'font-color', FALSE),
((SELECT id FROM questions WHERE question_text = 'Which CSS property is used to change text color?' AND quiz_id = (SELECT id FROM quizzes WHERE title = 'HTML & CSS Fundamentals Quiz')),
 'background-color', FALSE),

-- Question 3 options
((SELECT id FROM questions WHERE question_text = 'What is the purpose of the <div> tag?' AND quiz_id = (SELECT id FROM quizzes WHERE title = 'HTML & CSS Fundamentals Quiz')),
 'To create divisions in a page', TRUE),
((SELECT id FROM questions WHERE question_text = 'What is the purpose of the <div> tag?' AND quiz_id = (SELECT id FROM quizzes WHERE title = 'HTML & CSS Fundamentals Quiz')),
 'To define division operation', FALSE),
((SELECT id FROM questions WHERE question_text = 'What is the purpose of the <div> tag?' AND quiz_id = (SELECT id FROM quizzes WHERE title = 'HTML & CSS Fundamentals Quiz')),
 'To create divisions in a table', FALSE),
((SELECT id FROM questions WHERE question_text = 'What is the purpose of the <div> tag?' AND quiz_id = (SELECT id FROM quizzes WHERE title = 'HTML & CSS Fundamentals Quiz')),
 'To define data values', FALSE);

-- ==========================================
-- INSERT SAMPLE MEETINGS
-- ==========================================

INSERT INTO meetings (course_id, instructor_id, title, description, meeting_link, scheduled_start, scheduled_end) VALUES
((SELECT id FROM courses WHERE title = 'Complete Web Development Bootcamp'),
 (SELECT id FROM users WHERE email = 'instructor1@lms.com'),
 'Live Q&A Session',
 'Weekly Q&A session for students to ask questions about course content',
 'https://meet.google.com/abc-def-ghi',
 CURRENT_TIMESTAMP + INTERVAL '2 days',
 CURRENT_TIMESTAMP + INTERVAL '2 days' + INTERVAL '1 hour'),

((SELECT id FROM courses WHERE title = 'Data Science with Python'),
 (SELECT id FROM users WHERE email = 'instructor2@lms.com'),
 'Project Review Session',
 'Live review of student data analysis projects',
 'https://meet.google.com/jkl-mno-pqr',
 CURRENT_TIMESTAMP + INTERVAL '5 days',
 CURRENT_TIMESTAMP + INTERVAL '5 days' + INTERVAL '2 hours'),

((SELECT id FROM courses WHERE title = 'React Native Mobile Development'),
 (SELECT id FROM users WHERE email = 'instructor3@lms.com'),
 'Office Hours',
 'Weekly office hours for one-on-one help',
 'https://meet.google.com/stu-vwx-yz',
 CURRENT_TIMESTAMP + INTERVAL '3 days',
 CURRENT_TIMESTAMP + INTERVAL '3 days' + INTERVAL '1 hour');

-- ==========================================
-- INSERT SAMPLE NOTIFICATIONS
-- ==========================================

INSERT INTO notifications (user_id, notification_type, title, message, is_read) VALUES
-- For student1
((SELECT id FROM users WHERE email = 'student1@lms.com'),
 'ASSIGNMENT',
 'New Assignment Available',
 'A new assignment "HTML Portfolio Project" has been posted for your course.',
 FALSE),

((SELECT id FROM users WHERE email = 'student1@lms.com'),
 'COURSE_ANNOUNCEMENT',
 'Course Update',
 'New lessons have been added to the JavaScript Essentials module.',
 FALSE),

-- For student2
((SELECT id FROM users WHERE email = 'student2@lms.com'),
 'QUIZ',
 'Quiz Reminder',
 'Don''t forget to complete the JavaScript Basics Quiz by the deadline.',
 FALSE),

-- For student3
((SELECT id FROM users WHERE email = 'student3@lms.com'),
 'MEETING',
 'Upcoming Live Session',
 'Join the Project Review Session on Friday at 3 PM.',
 FALSE),

-- For instructor1
((SELECT id FROM users WHERE email = 'instructor1@lms.com'),
 'ENROLLMENT',
 'New Student Enrollment',
 'Emma Wilson has enrolled in your Complete Web Development Bootcamp course.',
 FALSE),

-- For instructor2
((SELECT id FROM users WHERE email = 'instructor2@lms.com'),
 'GENERAL',
 'Course Performance Update',
 'Your Data Science with Python course has reached 50 enrollments!',
 FALSE);

-- ==========================================
-- INSERT SAMPLE COURSE REVIEWS
-- ==========================================

INSERT INTO course_reviews (course_id, student_id, rating, review_comment) VALUES
((SELECT id FROM courses WHERE title = 'Complete Web Development Bootcamp'),
 (SELECT id FROM users WHERE email = 'student1@lms.com'),
 5,
 'Excellent course! The instructor explains everything clearly and the projects are very helpful.'),

((SELECT id FROM courses WHERE title = 'Complete Web Development Bootcamp'),
 (SELECT id FROM users WHERE email = 'student2@lms.com'),
 4,
 'Great content but would like more advanced topics. Overall very satisfied.'),

((SELECT id FROM courses WHERE title = 'Data Science with Python'),
 (SELECT id FROM users WHERE email = 'student3@lms.com'),
 5,
 'Best data science course I''ve taken. The practical examples are amazing.'),

((SELECT id FROM courses WHERE title = 'Advanced React and Redux'),
 (SELECT id FROM users WHERE email = 'student2@lms.com'),
 4,
 'Challenging but rewarding. Really improved my React skills significantly.');

-- ==========================================
-- INSERT SAMPLE COURSE PROGRESS
-- ==========================================

INSERT INTO course_progress (student_id, course_id, progress_percentage, total_learning_time) VALUES
((SELECT id FROM users WHERE email = 'student1@lms.com'),
 (SELECT id FROM courses WHERE title = 'Complete Web Development Bootcamp'),
 25.5, 120),

((SELECT id FROM users WHERE email = 'student2@lms.com'),
 (SELECT id FROM courses WHERE title = 'Complete Web Development Bootcamp'),
 45.0, 180),

((SELECT id FROM users WHERE email = 'student3@lms.com'),
 (SELECT id FROM courses WHERE title = 'Data Science with Python'),
 60.0, 200);

-- ==========================================
-- INSERT SAMPLE LESSON PROGRESS
-- ==========================================

INSERT INTO lesson_progress (student_id, lesson_id, completion_status, last_video_position) VALUES
-- Student1 progress
((SELECT id FROM users WHERE email = 'student1@lms.com'),
 (SELECT id FROM lessons WHERE lesson_title = 'Introduction to HTML'),
 TRUE, 0),

((SELECT id FROM users WHERE email = 'student1@lms.com'),
 (SELECT id FROM lessons WHERE lesson_title = 'CSS Styling Basics'),
 TRUE, 0),

((SELECT id FROM users WHERE email = 'student1@lms.com'),
 (SELECT id FROM lessons WHERE lesson_title = 'Responsive Design'),
 FALSE, 30),

-- Student2 progress
((SELECT id FROM users WHERE email = 'student2@lms.com'),
 (SELECT id FROM lessons WHERE lesson_title = 'Introduction to HTML'),
 TRUE, 0),

((SELECT id FROM users WHERE email = 'student2@lms.com'),
 (SELECT id FROM lessons WHERE lesson_title = 'CSS Styling Basics'),
 TRUE, 0),

((SELECT id FROM users WHERE email = 'student2@lms.com'),
 (SELECT id FROM lessons WHERE lesson_title = 'Responsive Design'),
 TRUE, 0),

((SELECT id FROM users WHERE email = 'student2@lms.com'),
 (SELECT id FROM lessons WHERE lesson_title = 'JavaScript Fundamentals'),
 FALSE, 45);

-- ==========================================
-- END OF SEED DATA
-- ==========================================
