CREATE TABLE quiz_results
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    attempt_id UUID UNIQUE NOT NULL,

    student_id UUID NOT NULL,

    quiz_id UUID NOT NULL,

    score DECIMAL(5,2) NOT NULL,

    passed BOOLEAN,

    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_result_attempt
        FOREIGN KEY (attempt_id)
        REFERENCES quiz_attempts(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_result_student
        FOREIGN KEY (student_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_result_quiz
        FOREIGN KEY (quiz_id)
        REFERENCES quizzes(id)
        ON DELETE CASCADE
);