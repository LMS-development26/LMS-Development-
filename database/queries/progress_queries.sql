-- =========================================================
-- Progress Queries
-- =========================================================


-- 1. Get student's lesson progress
SELECT
    l.title,
    lp.completion_status,
    lp.last_video_position,
    lp.last_accessed
FROM lesson_progress lp
JOIN lessons l
    ON lp.lesson_id = l.id
WHERE lp.student_id = 'STUDENT_UUID';


-- 2. Get student's course progress
SELECT
    c.title,
    cp.progress_percentage,
    cp.total_learning_time,
    cp.completion_date
FROM course_progress cp
JOIN courses c
    ON cp.course_id = c.id
WHERE cp.student_id = 'STUDENT_UUID';


-- 3. Get course progress for all students
SELECT
    u.email,
    sp.full_name,
    cp.progress_percentage
FROM course_progress cp
JOIN users u
    ON cp.student_id = u.id
JOIN student_profiles sp
    ON u.id = sp.user_id
WHERE cp.course_id = 'COURSE_UUID';


-- 4. Update lesson progress
UPDATE lesson_progress
SET
    completion_status = TRUE,
    last_video_position = 0,
    last_accessed = CURRENT_TIMESTAMP
WHERE student_id = 'STUDENT_UUID'
AND lesson_id = 'LESSON_UUID';


-- 5. Get incomplete lessons
SELECT
    l.id,
    l.title
FROM lessons l
JOIN course_modules cm
    ON l.module_id = cm.id
JOIN courses c
    ON cm.course_id = c.id
LEFT JOIN lesson_progress lp
    ON l.id = lp.lesson_id
    AND lp.student_id = 'STUDENT_UUID'
WHERE c.id = 'COURSE_UUID'
AND (lp.completion_status = FALSE OR lp.completion_status IS NULL);


-- 6. Get completed courses
SELECT
    c.title,
    cp.progress_percentage,
    cp.completion_date
FROM course_progress cp
JOIN courses c
    ON cp.course_id = c.id
WHERE cp.student_id = 'STUDENT_UUID'
AND cp.progress_percentage = 100;


-- 7. Get pending assignments for a student
SELECT
    a.title,
    a.due_date
FROM assignments a
JOIN enrollments e
    ON a.course_id = e.course_id
LEFT JOIN assignment_submissions s
    ON a.id = s.assignment_id
    AND s.student_id = e.student_id
WHERE e.student_id = 'STUDENT_UUID'
AND s.id IS NULL;


-- 8. Get student dashboard progress
SELECT
    c.title,
    cp.progress_percentage,
    cp.total_learning_time
FROM course_progress cp
JOIN courses c
    ON cp.course_id = c.id
WHERE cp.student_id = 'STUDENT_UUID'
ORDER BY cp.progress_percentage DESC;