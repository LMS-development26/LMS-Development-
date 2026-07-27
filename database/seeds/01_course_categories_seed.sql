-- =========================================================
-- Course Categories Seed Data
-- =========================================================

INSERT INTO course_categories
(
    name,
    description
)
VALUES
(
    'Programming',
    'Programming languages and software development courses.'
),
(
    'Web Development',
    'Frontend, backend, and full-stack web development courses.'
),
(
    'Data Science',
    'Data analysis, statistics, and data science courses.'
),
(
    'Artificial Intelligence',
    'Artificial intelligence and intelligent systems courses.'
),
(
    'Machine Learning',
    'Machine learning and predictive modeling courses.'
),
(
    'Cloud Computing',
    'Cloud platforms and cloud infrastructure courses.'
),
(
    'DevOps',
    'DevOps, CI/CD, automation, and deployment courses.'
),
(
    'Database',
    'SQL, NoSQL, database management, and database design courses.'
)
ON CONFLICT (name) DO NOTHING;