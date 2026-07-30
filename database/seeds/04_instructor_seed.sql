WITH new_instructors AS (
    INSERT INTO users
    (
        email,
        password_hash,
        role,
        status,
        email_verified
    )
    VALUES
    (
        'instructor1@lms.com',
        '$2b$10$8QTT0VQxyOBJG/T.b..RdOAPw5AVcx6/GxLYO82dSuppVA52gNLz.',
        'INSTRUCTOR',
        'ACTIVE',
        TRUE
    )
    ON CONFLICT (email) DO NOTHING
    RETURNING id, email
)

INSERT INTO instructor_profiles
(
    user_id,
    full_name
)
SELECT
    id,
    'Payal Instructor'
FROM new_instructors;