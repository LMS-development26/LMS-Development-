CREATE TABLE course_tag_mapping
(
    course_id UUID NOT NULL,

    tag_id UUID NOT NULL,

    PRIMARY KEY (course_id, tag_id),

    CONSTRAINT fk_tag_mapping_course
        FOREIGN KEY (course_id)
        REFERENCES courses(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_tag_mapping_tag
        FOREIGN KEY (tag_id)
        REFERENCES course_tags(id)
        ON DELETE CASCADE
);