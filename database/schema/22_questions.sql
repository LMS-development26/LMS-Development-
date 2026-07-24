CREATE TABLE questions
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    quiz_id UUID NOT NULL,

    question_text TEXT NOT NULL,

    question_type question_type NOT NULL,

    marks INTEGER DEFAULT 1,

    question_order INTEGER,

    CONSTRAINT fk_question_quiz
        FOREIGN KEY (quiz_id)
        REFERENCES quizzes(id)
        ON DELETE CASCADE
);