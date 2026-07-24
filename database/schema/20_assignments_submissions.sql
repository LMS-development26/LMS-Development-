CREATE TABLE assignment_submissions
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assignment_id UUID NOT NULL,

    student_id UUID NOT NULL,

    submission_url TEXT,

    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    marks_obtained INTEGER,

    feedback TEXT,

    graded_at TIMESTAMP,

    graded_by UUID,

    CONSTRAINT fk_submission_assignment
        FOREIGN KEY (assignment_id)
        REFERENCES assignments(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_submission_student
        FOREIGN KEY (student_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_submission_grader
        FOREIGN KEY (graded_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);