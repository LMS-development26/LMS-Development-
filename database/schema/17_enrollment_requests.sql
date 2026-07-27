CREATE TABLE enrollment_requests
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    student_id UUID NOT NULL,

    course_id UUID NOT NULL,

    status enrollment_request_status NOT NULL DEFAULT 'PENDING',

    rejection_reason TEXT,

    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    reviewed_at TIMESTAMP,

    reviewed_by UUID,

    CONSTRAINT fk_enrollment_request_student
        FOREIGN KEY (student_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_enrollment_request_course
        FOREIGN KEY (course_id)
        REFERENCES courses(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_enrollment_request_reviewer
        FOREIGN KEY (reviewed_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);