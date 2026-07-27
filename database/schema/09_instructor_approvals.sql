CREATE TABLE instructor_approvals
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    instructor_id UUID NOT NULL,

    admin_id UUID NOT NULL,

    action VARCHAR(20) NOT NULL,

    rejection_reason TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_instructor

    FOREIGN KEY(instructor_id)

    REFERENCES users(id)

    ON DELETE CASCADE,

    CONSTRAINT fk_admin

    FOREIGN KEY(admin_id)

    REFERENCES users(id)

    ON DELETE CASCADE
);