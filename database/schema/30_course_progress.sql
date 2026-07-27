CREATE TABLE course_progress
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    student_id UUID NOT NULL,

    course_id UUID NOT NULL,

    progress_percentage DECIMAL(5,2) DEFAULT 0,

    total_learning_time INTEGER DEFAULT 0,

    completion_date TIMESTAMP,

    CONSTRAINT fk_course_progress_student
        FOREIGN KEY (student_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_course_progress_course
        FOREIGN KEY (course_id)
        REFERENCES courses(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_student_course_progress
        UNIQUE (student_id, course_id)
);