CREATE TABLE quizzes
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    course_id UUID NOT NULL,

    lesson_id UUID,

    title VARCHAR(255) NOT NULL,

    description TEXT,

    passing_percentage DECIMAL(5,2),

    time_limit_minutes INTEGER,

    attempt_limit INTEGER,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_quiz_course
        FOREIGN KEY (course_id)
        REFERENCES courses(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_quiz_lesson
        FOREIGN KEY (lesson_id)
        REFERENCES lessons(id)
        ON DELETE SET NULL
);