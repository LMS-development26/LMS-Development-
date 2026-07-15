SELECT *
FROM admin_profiles;

SELECT
id,
email,
role,
status
FROM users
WHERE role='ADMIN';

SELECT
    u.email,
    u.role,
    ap.full_name,
    ap.phone_number
FROM users u
JOIN admin_profiles ap
ON u.id=ap.user_id;