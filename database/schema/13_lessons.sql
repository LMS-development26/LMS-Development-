CREATE TABLE lessons
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    module_id UUID NOT NULL,

    lesson_title VARCHAR(255) NOT NULL,

    description TEXT,

    lesson_order INTEGER NOT NULL,

    duration_minutes INTEGER,

    is_preview BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_lesson_module
        FOREIGN KEY (module_id)
        REFERENCES course_modules(id)
        ON DELETE CASCADE
);