CREATE TABLE course_tags
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    tag_name VARCHAR(100) UNIQUE NOT NULL,

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);