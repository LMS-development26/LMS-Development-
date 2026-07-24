CREATE TABLE assignments
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    course_id UUID NOT NULL,

    lesson_id UUID,

    title VARCHAR(255) NOT NULL,

    description TEXT,

    instructions TEXT,

    due_date TIMESTAMP,

    max_marks INTEGER,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_assignment_course
        FOREIGN KEY (course_id)
        REFERENCES courses(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_assignment_lesson
        FOREIGN KEY (lesson_id)
        REFERENCES lessons(id)
        ON DELETE SET NULL
);