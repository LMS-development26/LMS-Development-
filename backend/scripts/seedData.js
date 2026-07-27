const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'lms_database',
  user: 'postgres',
  password: 'Nikki@3001'
});

async function seedData() {
  const client = await pool.connect();
  
  try {
    console.log('Starting to seed data...');
    
    await client.query('BEGIN');
    
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
    await client.query(
      'INSERT INTO instructor_profiles (user_id, full_name, bio, qualification, experience_years) VALUES ($1, $2, $3, $4, $5)',
      [instructorId, 'John Doe', 'Experienced software engineer', 'M.S. Computer Science', 5]
    );
    
    await client.query(
      'INSERT INTO student_profiles (user_id, full_name, college_name, current_year) VALUES ($1, $2, $3, $4)',
      [studentId, 'Jane Smith', 'State University', 3]
    );
    
    // Create categories
    const categoryResult = await client.query(
      `INSERT INTO course_categories (category_name, description)
       VALUES ($1, $2), ($3, $4)
       RETURNING id`,
      ['Programming', 'Learn programming languages and concepts', 'Design', 'UI/UX design courses']
    );
    
    const programmingCategoryId = categoryResult.rows[0].id;
    const designCategoryId = categoryResult.rows[1].id;
    
    // Create courses
    const courseResult = await client.query(
      `INSERT INTO courses (instructor_id, category_id, title, subtitle, description, difficulty, language, price, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [instructorId, programmingCategoryId, 'Introduction to React', 'Learn React from scratch', 
       'A comprehensive introduction to React.js', 'BEGINNER', 'English', 0, 'PUBLISHED']
    );
    
    const courseId = courseResult.rows[0].id;
    
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
    
    // Enroll student in course
    await client.query(
      `INSERT INTO enrollments (course_id, student_id, enrolled_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)`,
      [courseId, studentId]
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