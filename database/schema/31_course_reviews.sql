CREATE TABLE course_reviews
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    course_id UUID NOT NULL,

    student_id UUID NOT NULL,

    rating INTEGER NOT NULL,

    review_comment TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_review_course
        FOREIGN KEY (course_id)
        REFERENCES courses(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_review_student
        FOREIGN KEY (student_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_student_course_review
        UNIQUE (student_id, course_id),

    CONSTRAINT valid_rating
        CHECK (rating >= 1 AND rating <= 5)
);