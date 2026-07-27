CREATE TABLE instructor_profiles
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID UNIQUE NOT NULL,

    full_name VARCHAR(100) NOT NULL,

    profile_image_url TEXT,

    profile_image TEXT,

    phone_number VARCHAR(20),

    bio TEXT,

    qualification VARCHAR(200),

    experience_years INTEGER,

    linkedin_url TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_instructor_user

    FOREIGN KEY(user_id)

    REFERENCES users(id)

    ON DELETE CASCADE
);