const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'lms_database',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '1234'
});

async function checkUser() {
  const client = await pool.connect();
  
  try {
    console.log('Checking student1@example.com user...');
    
    const result = await client.query(
      'SELECT id, email, role, status, email_verified FROM users WHERE email = $1',
      ['student1@example.com']
    );
    
    if (result.rows.length === 0) {
      console.log('User not found!');
    } else {
      console.log('User found:');
      console.log('  ID:', result.rows[0].id);
      console.log('  Email:', result.rows[0].email);
      console.log('  Role:', result.rows[0].role);
      console.log('  Status:', result.rows[0].status);
      console.log('  Email Verified:', result.rows[0].email_verified);
    }
    
  } catch (error) {
    console.error('Error checking user:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkUser();