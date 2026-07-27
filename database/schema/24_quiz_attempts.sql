CREATE TABLE quiz_attempts
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    quiz_id UUID NOT NULL,

    student_id UUID NOT NULL,

    attempt_number INTEGER NOT NULL,

    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    submitted_at TIMESTAMP,

    score DECIMAL(5,2),

    CONSTRAINT fk_attempt_quiz
        FOREIGN KEY (quiz_id)
        REFERENCES quizzes(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_attempt_student
        FOREIGN KEY (student_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_quiz_attempt
        UNIQUE (quiz_id, student_id, attempt_number)
);