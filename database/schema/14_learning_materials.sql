CREATE TABLE learning_materials
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    lesson_id UUID NOT NULL,

    type material_type NOT NULL,

    title VARCHAR(255) NOT NULL,

    description TEXT,

    s3_url TEXT,

    external_url TEXT,

    file_size_bytes BIGINT,

    file_type VARCHAR(50),

    display_order INTEGER NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_material_lesson
        FOREIGN KEY (lesson_id)
        REFERENCES lessons(id)
        ON DELETE CASCADE
);