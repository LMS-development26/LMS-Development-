const { Pool } = require('pg');

// Load environment variables
require('dotenv').config();

// Create pool with same config as database.js
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function fixMeetingsTable() {
  const client = await pool.connect();
  
  try {
    console.log('Connected to database:', process.env.DB_NAME);
    
    await client.query('BEGIN');
    
    // Drop the existing meetings table and recreate it with correct structure
    console.log('Dropping existing meetings table...');
    await client.query('DROP TABLE IF EXISTS meeting_attendance CASCADE');
    await client.query('DROP TABLE IF EXISTS meetings CASCADE');
    
    console.log('Creating meetings table with correct structure...');
    await client.query(`
      CREATE TABLE meetings
      (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          course_id UUID NOT NULL,
          instructor_id UUID NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          meeting_date DATE NOT NULL,
          start_time TIME NOT NULL,
          end_time TIME NOT NULL,
          google_meet_link TEXT,
          recording_url TEXT,
          notes TEXT,
          status VARCHAR(20) DEFAULT 'SCHEDULED',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_meeting_course
              FOREIGN KEY (course_id)
              REFERENCES courses(id)
              ON DELETE CASCADE,
          CONSTRAINT fk_meeting_instructor
              FOREIGN KEY (instructor_id)
              REFERENCES users(id)
              ON DELETE CASCADE
      )
    `);
    
    console.log('Creating meeting_attendance table...');
    await client.query(`
      CREATE TABLE meeting_attendance
      (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          meeting_id UUID NOT NULL,
          student_id UUID NOT NULL,
          joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          left_at TIMESTAMP,
          duration_minutes INTEGER DEFAULT 0,
          CONSTRAINT fk_attendance_meeting
              FOREIGN KEY (meeting_id)
              REFERENCES meetings(id)
              ON DELETE CASCADE,
          CONSTRAINT fk_attendance_student
              FOREIGN KEY (student_id)
              REFERENCES users(id)
              ON DELETE CASCADE,
          CONSTRAINT unique_meeting_student
              UNIQUE (meeting_id, student_id)
      )
    `);
    
    await client.query('COMMIT');
    
    console.log('✓ Meetings table structure fixed successfully!');
    console.log('✓ Meeting attendance table recreated!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error fixing table:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

fixMeetingsTable();
