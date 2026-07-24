-- =========================================================
-- Meeting Queries
-- =========================================================


-- 1. Get upcoming meetings for a course
SELECT *
FROM meetings
WHERE course_id = 'COURSE_UUID'
AND scheduled_at > CURRENT_TIMESTAMP
ORDER BY scheduled_at;


-- 2. Get all meetings for a course
SELECT *
FROM meetings
WHERE course_id = 'COURSE_UUID'
ORDER BY scheduled_at;


-- 3. Create a meeting
INSERT INTO meetings
(
    course_id,
    title,
    scheduled_at,
    meet_link
)
VALUES
(
    'COURSE_UUID',
    'Java Live Class',
    CURRENT_TIMESTAMP + INTERVAL '2 days',
    'GOOGLE_MEET_LINK'
);


-- 4. Get meeting attendance
SELECT
    u.email,
    sp.full_name,
    ma.join_time,
    ma.leave_time,
    ma.duration,
    ma.attendance_status
FROM meeting_attendance ma
JOIN users u
    ON ma.student_id = u.id
JOIN student_profiles sp
    ON u.id = sp.user_id
WHERE ma.meeting_id = 'MEETING_UUID';


-- 5. Get student's upcoming meetings
SELECT
    m.title,
    m.scheduled_at,
    m.meet_link
FROM meetings m
JOIN enrollments e
    ON m.course_id = e.course_id
WHERE e.student_id = 'STUDENT_UUID'
AND m.scheduled_at > CURRENT_TIMESTAMP
ORDER BY m.scheduled_at;