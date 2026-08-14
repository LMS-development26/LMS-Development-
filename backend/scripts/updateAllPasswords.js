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

async function updateAllPasswords() {
  const client = await pool.connect();
  
  try {
    console.log('Updating passwords for all users...');
    
    // Hash password using the same method as UserModel
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    const result = await client.query(
      'UPDATE users SET password_hash = $1 RETURNING id, email, role',
      [hashedPassword]
    );
    
    console.log('Passwords updated successfully!');
    console.log('Updated users:');
    result.rows.forEach(row => {
      console.log(`  ${row.email} (${row.role})`);
    });
    console.log('Password for all users: password123');
    
  } catch (error) {
    console.error('Error updating passwords:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

updateAllPasswords();