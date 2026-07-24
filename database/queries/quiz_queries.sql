-- =========================================================
-- Quiz Queries
-- =========================================================


-- 1. Get quizzes for a course
SELECT *
FROM quizzes
WHERE course_id = 'COURSE_UUID';


-- 2. Get questions for a quiz
SELECT *
FROM questions
WHERE quiz_id = 'QUIZ_UUID';


-- 3. Get options for a question
SELECT *
FROM question_options
WHERE question_id = 'QUESTION_UUID';


-- 4. Get complete quiz questions and options
SELECT
    q.id AS question_id,
    q.question_text,
    qo.id AS option_id,
    qo.option_text,
    qo.is_correct
FROM questions q
JOIN question_options qo
    ON q.id = qo.question_id
WHERE q.quiz_id = 'QUIZ_UUID';


-- 5. Get student's quiz attempts
SELECT *
FROM quiz_attempts
WHERE student_id = 'STUDENT_UUID'
AND quiz_id = 'QUIZ_UUID'
ORDER BY attempt_number;


-- 6. Get quiz results
SELECT *
FROM quiz_results
WHERE student_id = 'STUDENT_UUID'
AND quiz_id = 'QUIZ_UUID';


-- 7. Get student's quiz performance
SELECT
    q.title,
    qr.score,
    qr.passed
FROM quiz_results qr
JOIN quizzes q
    ON qr.quiz_id = q.id
WHERE qr.student_id = 'STUDENT_UUID';


-- 8. Get quiz answers for an attempt
SELECT
    qa.question_id,
    qa.selected_option_id,
    qa.is_correct
FROM quiz_answers qa
WHERE qa.attempt_id = 'ATTEMPT_UUID';