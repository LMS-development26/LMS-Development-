-- =========================================================
-- Assignment Queries
-- =========================================================


-- 1. Get assignments for a course
SELECT *
FROM assignments
WHERE course_id = 'COURSE_UUID';


-- 2. Create assignment
INSERT INTO assignments
(
    course_id,
    title,
    description,
    due_date
)
VALUES
(
    'COURSE_UUID',
    'Java Assignment 1',
    'Complete the given Java programming problems.',
    CURRENT_TIMESTAMP + INTERVAL '7 days'
);


-- 3. Get assignment submissions
SELECT
    a.title AS assignment,
    u.email AS student_email,
    s.submitted_at,
    s.marks,
    s.feedback
FROM assignment_submissions s
JOIN assignments a
    ON s.assignment_id = a.id
JOIN users u
    ON s.student_id = u.id
WHERE a.id = 'ASSIGNMENT_UUID';


-- 4. Get student's assignments
SELECT
    a.id,
    a.title,
    a.due_date,
    s.submitted_at,
    s.marks,
    s.feedback
FROM assignments a
LEFT JOIN assignment_submissions s
    ON a.id = s.assignment_id
    AND s.student_id = 'STUDENT_UUID'
WHERE a.course_id = 'COURSE_UUID';


-- 5. Submit assignment
INSERT INTO assignment_submissions
(
    assignment_id,
    student_id,
    submission_url
)
VALUES
(
    'ASSIGNMENT_UUID',
    'STUDENT_UUID',
    'S3_FILE_URL'
);


-- 6. Grade assignment
UPDATE assignment_submissions
SET
    marks = 85,
    feedback = 'Good work. Improve the explanation of the solution.'
WHERE id = 'SUBMISSION_UUID';