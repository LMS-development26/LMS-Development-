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

async function addStudentUser() {
  const client = await pool.connect();
  
  try {
    console.log('Adding student1@example.com user...');
    
    await client.query('BEGIN');
    
    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['student1@example.com']
    );
    
    if (existingUser.rows.length > 0) {
      console.log('User student1@example.com already exists. Skipping...');
      await client.query('ROLLBACK');
      return;
    }
    
    // Create user
    const passwordHash = await bcrypt.hash('password123', 10);
    
    const studentResult = await client.query(
      `INSERT INTO users (email, password_hash, role, status, email_verified)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      ['student1@example.com', passwordHash, 'STUDENT', 'ACTIVE', true]
    );
    const studentId = studentResult.rows[0].id;
    
    // Create profile
    await client.query(
      'INSERT INTO student_profiles (user_id, full_name, college_name, current_year) VALUES ($1, $2, $3, $4)',
      [studentId, 'Student One', 'Demo University', 2]
    );
    
    await client.query('COMMIT');
    
    console.log('User student1@example.com created successfully!');
    console.log('  Email: student1@example.com');
    console.log('  Password: password123');
    
  } catch (error) {
    console.error('Error adding student user:', error);
    await client.query('ROLLBACK');
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

addStudentUser();