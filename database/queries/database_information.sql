SELECT table_name
FROM information_schema.tables
WHERE table_schema='public';

SELECT column_name,data_type
FROM information_schema.columns
WHERE table_name='users';

SELECT column_name
FROM information_schema.columns
WHERE table_name='student_profiles';

SELECT column_name
FROM information_schema.columns
WHERE table_name='admin_profiles';

SELECT column_name
FROM information_schema.columns
WHERE table_name='instructor_profiles';