CREATE TABLE quiz_answers
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    attempt_id UUID NOT NULL,

    question_id UUID NOT NULL,

    selected_option_id UUID,

    answer_text TEXT,

    is_correct BOOLEAN,

    CONSTRAINT fk_answer_attempt
        FOREIGN KEY (attempt_id)
        REFERENCES quiz_attempts(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_answer_question
        FOREIGN KEY (question_id)
        REFERENCES questions(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_answer_option
        FOREIGN KEY (selected_option_id)
        REFERENCES question_options(id)
        ON DELETE SET NULL
);