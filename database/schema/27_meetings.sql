CREATE TABLE meetings
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    course_id UUID NOT NULL,

    instructor_id UUID NOT NULL,

    title VARCHAR(255) NOT NULL,

    description TEXT,

    meeting_date DATE NOT NULL,

    start_time TIME NOT NULL,

    end_time TIME NOT NULL,

    google_meet_link TEXT,

    recording_url TEXT,

    notes TEXT,

    status VARCHAR(20) DEFAULT 'SCHEDULED',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_meeting_course
        FOREIGN KEY (course_id)
        REFERENCES courses(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_meeting_instructor
        FOREIGN KEY (instructor_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);