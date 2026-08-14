const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'lms_database',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD
});

async function seedData() {
  const client = await pool.connect();
  
  try {
    console.log('Starting to seed data...');
    
    await client.query('BEGIN');
    
    // Clear existing data first
    console.log('Clearing existing data...');
    await client.query('DELETE FROM enrollments');
    await client.query('DELETE FROM course_modules');
    await client.query('DELETE FROM courses');
    await client.query('DELETE FROM course_categories');
    await client.query('DELETE FROM student_profiles');
    await client.query('DELETE FROM instructor_profiles');
    await client.query('DELETE FROM users');
    
    // Create users
    const passwordHash = await bcrypt.hash('password123', 10);
    
    // Admin user
    const adminResult = await client.query(
      `INSERT INTO users (email, password_hash, role, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      ['admin@lms.com', passwordHash, 'ADMIN', 'ACTIVE']
    );
    const adminId = adminResult.rows[0].id;
    
    // Instructor user
    const instructorResult = await client.query(
      `INSERT INTO users (email, password_hash, role, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      ['instructor@lms.com', passwordHash, 'INSTRUCTOR', 'ACTIVE']
    );
    const instructorId = instructorResult.rows[0].id;
    
    // Student user
    const studentResult = await client.query(
      `INSERT INTO users (email, password_hash, role, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      ['student@lms.com', passwordHash, 'STUDENT', 'ACTIVE']
    );
    const studentId = studentResult.rows[0].id;
    
    // Create profiles
    const instructorProfileResult = await client.query(
      'INSERT INTO instructor_profiles (user_id, full_name, bio, qualification, experience_years) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [instructorId, 'John Doe', 'Experienced software engineer', 'M.S. Computer Science', 5]
    );
    const instructorProfileId = instructorProfileResult.rows[0].id;
    
    await client.query(
      'INSERT INTO student_profiles (user_id, full_name, college_name, current_year) VALUES ($1, $2, $3, $4)',
      [studentId, 'Jane Smith', 'State University', 3]
    );
    
    // Create categories
    const categoryResult = await client.query(
      `INSERT INTO course_categories (category_name, description)
       VALUES ($1, $2), ($3, $4), ($5, $6), ($7, $8), ($9, $10), ($11, $12), ($13, $14), ($15, $16)
       RETURNING id`,
      ['Programming', 'Programming languages and software development courses.',
       'Web Development', 'Frontend, backend, and full-stack web development courses.',
       'Data Science', 'Data analysis, statistics, and data science courses.',
       'Artificial Intelligence', 'Artificial intelligence and intelligent systems courses.',
       'Machine Learning', 'Machine learning and predictive modeling courses.',
       'Cloud Computing', 'Cloud platforms and cloud infrastructure courses.',
       'DevOps', 'DevOps, CI/CD, automation, and deployment courses.',
       'Database', 'SQL, NoSQL, database management, and database design courses.']
    );
    
    const programmingCategoryId = categoryResult.rows[0].id;
    const webDevCategoryId = categoryResult.rows[1].id;
    const dataScienceCategoryId = categoryResult.rows[2].id;
    const aiCategoryId = categoryResult.rows[3].id;
    const mlCategoryId = categoryResult.rows[4].id;
    const cloudCategoryId = categoryResult.rows[5].id;
    const devopsCategoryId = categoryResult.rows[6].id;
    const databaseCategoryId = categoryResult.rows[7].id;
    
    // Create courses
    const courseResult = await client.query(
      `INSERT INTO courses (instructor_id, category_id, title, subtitle, description, difficulty, language, price, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9), ($10, $11, $12, $13, $14, $15, $16, $17, $18), ($19, $20, $21, $22, $23, $24, $25, $26, $27), ($28, $29, $30, $31, $32, $33, $34, $35, $36)
       RETURNING id`,
      [instructorId, programmingCategoryId, 'Introduction to React', 'Learn React from scratch',
       'A comprehensive introduction to React.js', 'BEGINNER', 'English', 0, 'PUBLISHED',
       instructorId, webDevCategoryId, 'Advanced CSS & Animations', 'Master modern CSS',
       'Learn advanced CSS techniques and animations', 'INTERMEDIATE', 'English', 29.99, 'PUBLISHED',
       instructorId, dataScienceCategoryId, 'Python for Data Science', 'Data analysis with Python',
       'Learn Python libraries for data analysis', 'BEGINNER', 'English', 49.99, 'PUBLISHED',
       instructorId, aiCategoryId, 'Introduction to AI', 'Artificial Intelligence fundamentals',
       'Understand AI concepts and applications', 'BEGINNER', 'English', 39.99, 'DRAFT']
    );

    const courseId = courseResult.rows[0].id;
    const courseId2 = courseResult.rows[1].id;
    const courseId3 = courseResult.rows[2].id;
    const courseId4 = courseResult.rows[3].id;
    
    // Create a module
    const moduleResult = await client.query(
      `INSERT INTO course_modules (course_id, module_name, description, display_order)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [courseId, 'Getting Started', 'Introduction to React basics', 1]
    );
    
    const moduleId = moduleResult.rows[0].id;
    
    // Create a lesson
    const lessonResult = await client.query(
      `INSERT INTO lessons (module_id, lesson_title, description, lesson_order)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [moduleId, 'What is React?', 'Understanding React fundamentals', 1]
    );
    
    const lessonId = lessonResult.rows[0].id;
    
    // Enroll student in courses
    await client.query(
      `INSERT INTO enrollments (course_id, student_id, enrolled_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP), ($3, $4, CURRENT_TIMESTAMP), ($5, $6, CURRENT_TIMESTAMP)`,
      [courseId, studentId, courseId2, studentId, courseId3, studentId]
    );
    
    await client.query('COMMIT');
    
    console.log('Data seeded successfully!');
    console.log('Users created:');
    console.log('  Admin: admin@lms.com / password123');
    console.log('  Instructor: instructor@lms.com / password123');
    console.log('  Student: student@lms.com / password123');
    
  } catch (error) {
    console.error('Error seeding data:', error);
    await client.query('ROLLBACK');
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seedData();