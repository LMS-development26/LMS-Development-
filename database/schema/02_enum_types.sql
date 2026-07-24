CREATE TYPE user_role AS ENUM
(
    'ADMIN',
    'INSTRUCTOR',
    'STUDENT'
);

CREATE TYPE user_status AS ENUM
(
    'PENDING_VERIFICATION',
    'PENDING_APPROVAL',
    'ACTIVE',
    'REJECTED',
    'SUSPENDED'
);

CREATE TYPE course_status AS ENUM
(
    'DRAFT',
    'PUBLISHED',
    'ARCHIVED',
    'UNPUBLISHED'
);

CREATE TYPE difficulty_level AS ENUM
(
    'BEGINNER',
    'INTERMEDIATE',
    'ADVANCED'
);

CREATE TYPE material_type AS ENUM
(
    'VIDEO',
    'PDF',
    'PPT',
    'DOCUMENT',
    'EXTERNAL_LINK',
    'SOURCE_CODE',
    'RESOURCE'
);

CREATE TYPE enrollment_request_status AS ENUM
(
    'PENDING',
    'APPROVED',
    'REJECTED'
);


CREATE TYPE question_type AS ENUM
(
    'MCQ',
    'MULTIPLE_CORRECT',
    'TRUE_FALSE',
    'FILL_IN_THE_BLANK'
);


CREATE TYPE notification_type AS ENUM
(
    'ASSIGNMENT',
    'QUIZ',
    'MEETING',
    'COURSE_ANNOUNCEMENT',
    'ENROLLMENT',
    'GENERAL'
);

