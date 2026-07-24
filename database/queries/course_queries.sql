-- =========================================================
-- Course Queries
-- =========================================================


-- 1. Get all courses
SELECT *
FROM courses;


-- 2. Get published courses
SELECT *
FROM courses
WHERE status = 'PUBLISHED';


-- 3. Get courses created by a specific instructor
SELECT *
FROM courses
WHERE instructor_id = 'INSTRUCTOR_UUID';


-- 4. Get courses by category
SELECT *
FROM courses
WHERE category_id = 'CATEGORY_UUID';


-- 5. Search courses by title
SELECT *
FROM courses
WHERE title ILIKE '%Java%';


-- 6. Get course details with category
SELECT
    c.id,
    c.title,
    c.subtitle,
    c.description,
    c.price,
    c.status,
    cc.name AS category
FROM courses c
JOIN course_categories cc
    ON c.category_id = cc.id;


-- 7. Get course with instructor information
SELECT
    c.id,
    c.title,
    u.email AS instructor_email,
    ip.full_name AS instructor_name
FROM courses c
JOIN users u
    ON c.instructor_id = u.id
JOIN instructor_profiles ip
    ON u.id = ip.user_id;


-- 8. Get modules of a course
SELECT *
FROM course_modules
WHERE course_id = 'COURSE_UUID'
ORDER BY display_order;


-- 9. Get lessons of a module
SELECT *
FROM lessons
WHERE module_id = 'MODULE_UUID'
ORDER BY display_order;


-- 10. Get learning materials of a lesson
SELECT *
FROM learning_materials
WHERE lesson_id = 'LESSON_UUID';


-- 11. Get tags of a course
SELECT
    t.id,
    t.name,
    t.description
FROM course_tags t
JOIN course_tag_mapping ctm
    ON t.id = ctm.tag_id
WHERE ctm.course_id = 'COURSE_UUID';


-- 12. Get complete course structure
SELECT
    c.title AS course_name,
    cm.name AS module_name,
    l.title AS lesson_name
FROM courses c
JOIN course_modules cm
    ON c.id = cm.course_id
JOIN lessons l
    ON cm.id = l.module_id
WHERE c.id = 'COURSE_UUID'
ORDER BY cm.display_order, l.display_order;