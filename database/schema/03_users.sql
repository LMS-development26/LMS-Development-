CREATE TABLE users
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    email VARCHAR(255) UNIQUE NOT NULL,

    password_hash TEXT NOT NULL,

    role user_role NOT NULL,

    status user_status NOT NULL
           DEFAULT 'PENDING_VERIFICATION',

    email_verified BOOLEAN DEFAULT FALSE,

    failed_login_attempts INTEGER DEFAULT 0,

    locked_until TIMESTAMP,

    last_login_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);