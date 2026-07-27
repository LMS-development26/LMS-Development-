-- =========================================================
-- Enrollment Queries
-- =========================================================


-- 1. Create enrollment request
INSERT INTO enrollment_requests
(
    student_id,
    course_id,
    status
)
VALUES
(
    'STUDENT_UUID',
    'COURSE_UUID',
    'PENDING'
);


-- 2. Get pending enrollment requests for instructor
SELECT
    er.id,
    u.email AS student_email,
    sp.full_name AS student_name,
    c.title AS course_name,
    er.requested_at,
    er.status
FROM enrollment_requests er
JOIN users u
    ON er.student_id = u.id
JOIN student_profiles sp
    ON u.id = sp.user_id
JOIN courses c
    ON er.course_id = c.id
WHERE c.instructor_id = 'INSTRUCTOR_UUID'
AND er.status = 'PENDING';


-- 3. Approve enrollment request
UPDATE enrollment_requests
SET
    status = 'APPROVED',
    approved_by = 'INSTRUCTOR_UUID',
    approval_date = CURRENT_TIMESTAMP
WHERE id = 'REQUEST_UUID';


-- 4. Reject enrollment request
UPDATE enrollment_requests
SET
    status = 'REJECTED',
    rejection_reason = 'Reason for rejection'
WHERE id = 'REQUEST_UUID';


-- 5. Create enrollment after approval
INSERT INTO enrollments
(
    student_id,
    course_id
)
VALUES
(
    'STUDENT_UUID',
    'COURSE_UUID'
);


-- 6. Get students enrolled in a course
SELECT
    u.email,
    sp.full_name,
    e.enrolled_at
FROM enrollments e
JOIN users u
    ON e.student_id = u.id
JOIN student_profiles sp
    ON u.id = sp.user_id
WHERE e.course_id = 'COURSE_UUID';


-- 7. Get student's enrolled courses
SELECT
    c.id,
    c.title,
    e.enrolled_at
FROM enrollments e
JOIN courses c
    ON e.course_id = c.id
WHERE e.student_id = 'STUDENT_UUID';