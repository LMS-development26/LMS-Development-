WITH new_admins AS (
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
        'admin1@lms.com',
        '$2b$10$8QTT0VQxyOBJG/T.b..RdOAPw5AVcx6/GxLYO82dSuppVA52gNLz.',
        'ADMIN',
        'ACTIVE',
        TRUE
    ),
    (
        'admin2@lms.com',
        '$2b$10$8QTT0VQxyOBJG/T.b..RdOAPw5AVcx6/GxLYO82dSuppVA52gNLz.',
        'ADMIN',
        'ACTIVE',
        TRUE
    )
    ON CONFLICT (email) DO NOTHING
    RETURNING id, email
)
INSERT INTO admin_profiles
(
    user_id,
    full_name,
    phone_number
)
SELECT
    id,
    CASE
        WHEN email = 'admin1@lms.com'
            THEN 'Platform Admin One'
        WHEN email = 'admin2@lms.com'
            THEN 'Platform Admin Two'
    END,
    CASE
        WHEN email = 'admin1@lms.com'
            THEN '9876543210'
        WHEN email = 'admin2@lms.com'
            THEN '9876543211'
    END
FROM new_admins;