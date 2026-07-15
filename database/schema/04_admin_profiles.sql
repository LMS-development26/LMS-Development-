CREATE TABLE admin_profiles
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID UNIQUE NOT NULL,

    full_name VARCHAR(150) NOT NULL,

    phone_number VARCHAR(20),

    profile_image TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_admin_user

    FOREIGN KEY(user_id)

    REFERENCES users(id)

    ON DELETE CASCADE
);