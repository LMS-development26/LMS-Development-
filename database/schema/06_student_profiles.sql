CREATE TABLE student_profiles
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID UNIQUE NOT NULL,

    full_name VARCHAR(100) NOT NULL,

    profile_image_url TEXT,

    profile_image TEXT,

    phone_number VARCHAR(20),

    bio TEXT,

    qualification VARCHAR(200),

    college_name VARCHAR(200),

    current_year INTEGER,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_student_user

    FOREIGN KEY(user_id)

    REFERENCES users(id)

    ON DELETE CASCADE
);