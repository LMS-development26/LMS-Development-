const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'lms_database',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '1234'
});

async function enrollStudent() {
  const client = await pool.connect();
  
  try {
    console.log('Enrolling student1@example.com in a course...');
    
    await client.query('BEGIN');
    
    // Get student ID
    const studentResult = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['student1@example.com']
    );
    
    if (studentResult.rows.length === 0) {
      console.log('Student student1@example.com not found. Please run addStudentUser.js first.');
      await client.query('ROLLBACK');
      return;
    }
    
    const studentId = studentResult.rows[0].id;
    
    // Get first available course
    const courseResult = await client.query(
      'SELECT id, title FROM courses WHERE status = $1 LIMIT 1',
      ['PUBLISHED']
    );
    
    if (courseResult.rows.length === 0) {
      console.log('No published courses found. Please seed the database first.');
      await client.query('ROLLBACK');
      return;
    }
    
    const courseId = courseResult.rows[0].id;
    const courseTitle = courseResult.rows[0].title;
    
    // Check if already enrolled
    const existingEnrollment = await client.query(
      'SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2',
      [studentId, courseId]
    );
    
    if (existingEnrollment.rows.length > 0) {
      console.log('Student is already enrolled in this course.');
      await client.query('ROLLBACK');
      return;
    }
    
    // Enroll student
    await client.query(
      `INSERT INTO enrollments (course_id, student_id, enrolled_at, completion_status)
       VALUES ($1, $2, CURRENT_TIMESTAMP, FALSE)`,
      [courseId, studentId]
    );
    
    await client.query('COMMIT');
    
    console.log('Student enrolled successfully!');
    console.log(`  Student: student1@example.com`);
    console.log(`  Course: ${courseTitle}`);
    
  } catch (error) {
    console.error('Error enrolling student:', error);
    await client.query('ROLLBACK');
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

enrollStudent();