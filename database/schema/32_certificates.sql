CREATE TABLE certificates
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    student_id UUID NOT NULL,

    course_id UUID NOT NULL,

    certificate_number VARCHAR(100) UNIQUE NOT NULL,

    certificate_url TEXT,

    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_certificate_student
        FOREIGN KEY (student_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_certificate_course
        FOREIGN KEY (course_id)
        REFERENCES courses(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_student_course_certificate
        UNIQUE (student_id, course_id)
);