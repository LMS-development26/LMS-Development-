CREATE TABLE meeting_attendance
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    meeting_id UUID NOT NULL,

    student_id UUID NOT NULL,

    joined_at TIMESTAMP,

    left_at TIMESTAMP,

    duration_minutes INTEGER,

    attendance_status VARCHAR(20),

    CONSTRAINT fk_attendance_meeting
        FOREIGN KEY (meeting_id)
        REFERENCES meetings(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_attendance_student
        FOREIGN KEY (student_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_meeting_student
        UNIQUE (meeting_id, student_id)
);