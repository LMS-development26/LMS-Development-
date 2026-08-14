const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// Database connection for setup
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'lms_database',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD
});

async function setupDatabase() {
  const client = await setupPool.connect();
  
  try {
    console.log('Connected to PostgreSQL');
    
    // Create database if it doesn't exist
    console.log('Creating database...');
    await client.query(`DROP DATABASE IF EXISTS lms_database`);
    await client.query(`CREATE DATABASE lms_database`);
    console.log('Database created successfully');
    
    // Close connection to postgres database
    await client.release();
    await setupPool.end();
    
    // Connect to the new database
    const dbPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'lms_database',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'Nikki@3001'
    });
    
    const dbClient = await dbPool.connect();
    console.log('Connected to lms_database');
    
    // Read and execute schema files
    const schemaDir = path.join(__dirname, '../../database/schema');
    const indexesDir = path.join(__dirname, '../../database/indexes');
    
    const schemaFiles = [
      '01_extensions.sql',
      '02_enum_types.sql',
      '03_users.sql',
      '04_admin_profiles.sql',
      '05_instructor_profiles.sql',
      '06_student_profiles.sql',
      '07_email_verification_tokens.sql',
      '08_login_attempts.sql',
      '09_instructor_approvals.sql',
      '10_course_categories.sql',
      '11_courses.sql',
      '12_course_modules.sql',
      '13_lessons.sql',
      '14_learning_materials.sql',
      '15_course_tags.sql',
      '16_course_tag_mapping.sql',
      '17_enrollment_requests.sql',
      '18_enrollments.sql',
      '19_assignments.sql',
      '20_assignments_submissions.sql',
      '21_quizzes.sql',
      '22_questions.sql',
      '23_question_options.sql',
      '24_quiz_attempts.sql',
      '25_quiz_answers.sql',
      '26_quiz_results.sql',
      '27_meetings.sql',
      '28_meeting_attendance.sql',
      '29_lesson_progress.sql',
      '30_course_progress.sql',
      '31_course_reviews.sql',
      '32_certificates.sql',
      '33_notifications.sql'
    ];
    
    const indexFiles = [
      'authentication_indexes.sql',
      'course_management_indexes.sql'
    ];
    
    // Execute schema files
    for (const file of schemaFiles) {
      const filePath = path.join(schemaDir, file);
      console.log(`Executing ${file}...`);
      const sql = fs.readFileSync(filePath, 'utf8');
      await dbClient.query(sql);
    }
    
    // Execute index files
    for (const file of indexFiles) {
      const filePath = path.join(indexesDir, file);
      if (fs.existsSync(filePath)) {
        console.log(`Executing ${file}...`);
        const sql = fs.readFileSync(filePath, 'utf8');
        await dbClient.query(sql);
      }
    }
    
    console.log('Database setup completed successfully!');
    
    await dbClient.release();
    await dbPool.end();
    
  } catch (error) {
    console.error('Error setting up database:', error);
    await client.release();
    await setupPool.end();
    process.exit(1);
  }
}

setupDatabase();