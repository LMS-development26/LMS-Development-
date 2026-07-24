-- =========================================================
-- Course Tags Seed Data
-- =========================================================

INSERT INTO course_tags
(
    name,
    description
)
VALUES
(
    'Java',
    'Courses related to Java programming.'
),
(
    'C++',
    'Courses related to C++ programming.'
),
(
    'Python',
    'Courses related to Python programming.'
),
(
    'JavaScript',
    'Courses related to JavaScript development.'
),
(
    'React',
    'Courses related to React.js development.'
),
(
    'Node.js',
    'Courses related to Node.js backend development.'
),
(
    'Express.js',
    'Courses related to Express.js development.'
),
(
    'PostgreSQL',
    'Courses related to PostgreSQL databases.'
),
(
    'MongoDB',
    'Courses related to MongoDB and NoSQL databases.'
),
(
    'AWS',
    'Courses related to Amazon Web Services.'
),
(
    'Docker',
    'Courses related to Docker and containerization.'
),
(
    'Machine Learning',
    'Courses related to machine learning.'
),
(
    'Artificial Intelligence',
    'Courses related to artificial intelligence.'
),
(
    'Data Structures',
    'Courses related to data structures and algorithms.'
)
ON CONFLICT (name) DO NOTHING;