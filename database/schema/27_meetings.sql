CREATE TABLE meetings
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    course_id UUID NOT NULL,

    instructor_id UUID NOT NULL,

    title VARCHAR(255) NOT NULL,

    description TEXT,

    meeting_link TEXT,

    scheduled_start TIMESTAMP NOT NULL,

    scheduled_end TIMESTAMP,

    recording_url TEXT,

    notes_url TEXT,

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