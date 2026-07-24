CREATE TABLE lesson_progress
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    student_id UUID NOT NULL,

    lesson_id UUID NOT NULL,

    completion_status BOOLEAN DEFAULT FALSE,

    last_video_position INTEGER DEFAULT 0,

    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    completed_at TIMESTAMP,

    CONSTRAINT fk_progress_student
        FOREIGN KEY (student_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_progress_lesson
        FOREIGN KEY (lesson_id)
        REFERENCES lessons(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_student_lesson
        UNIQUE (student_id, lesson_id)
);