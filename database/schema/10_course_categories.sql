CREATE TABLE course_categories
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    category_name VARCHAR(100) UNIQUE NOT NULL,

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);