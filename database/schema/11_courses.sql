CREATE TABLE courses
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    instructor_id UUID NOT NULL,

    category_id UUID NOT NULL,

    title VARCHAR(255) NOT NULL,

    subtitle VARCHAR(255),

    description TEXT,

    difficulty difficulty_level,

    language VARCHAR(50),

    thumbnail_url TEXT,

    promotional_video_url TEXT,

    price DECIMAL(10,2) DEFAULT 0,

    duration_hours INTEGER,

    learning_outcomes TEXT,

    prerequisites TEXT,

    status course_status NOT NULL DEFAULT 'DRAFT',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_course_instructor
        FOREIGN KEY (instructor_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_course_category
        FOREIGN KEY (category_id)
        REFERENCES course_categories(id)
        ON DELETE RESTRICT
);