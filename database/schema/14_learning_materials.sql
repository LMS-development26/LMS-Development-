CREATE TABLE learning_materials
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    lesson_id UUID NOT NULL,

    material_type material_type NOT NULL,

    title VARCHAR(255) NOT NULL,

    file_url TEXT,

    file_size BIGINT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_material_lesson
        FOREIGN KEY (lesson_id)
        REFERENCES lessons(id)
        ON DELETE CASCADE
);