SELECT *
FROM student_profiles;

SELECT
email,
status,
email_verified
FROM users
WHERE role='STUDENT';

SELECT
u.email,
u.status,
u.email_verified,
s.full_name,
s.phone_number,
s.qualification,
s.college_name,
s.current_year
FROM users u
JOIN student_profiles s
ON u.id=s.user_id
WHERE u.role='STUDENT';