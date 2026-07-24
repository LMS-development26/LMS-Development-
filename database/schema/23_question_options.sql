CREATE TABLE question_options
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    question_id UUID NOT NULL,

    option_text TEXT NOT NULL,

    is_correct BOOLEAN DEFAULT FALSE,

    CONSTRAINT fk_option_question
        FOREIGN KEY (question_id)
        REFERENCES questions(id)
        ON DELETE CASCADE
);