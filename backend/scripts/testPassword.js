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

async function testPassword() {
  const client = await pool.connect();
  
  try {
    console.log('Testing password verification for student1@example.com...');
    
    const result = await client.query(
      'SELECT id, email, password_hash, failed_login_attempts, locked_until FROM users WHERE email = $1',
      ['student1@example.com']
    );
    
    if (result.rows.length === 0) {
      console.log('User not found!');
      return;
    }
    
    const user = result.rows[0];
    console.log('User found:');
    console.log('  Email:', user.email);
    console.log('  Failed attempts:', user.failed_login_attempts);
    console.log('  Locked until:', user.locked_until);
    
    // Test password verification
    const isMatch = await bcrypt.compare('password123', user.password_hash);
    console.log('Password verification result:', isMatch);
    
    if (!isMatch) {
      console.log('Password does not match! Re-hashing...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      await client.query(
        'UPDATE users SET password_hash = $1, failed_login_attempts = 0, locked_until = NULL WHERE email = $2',
        [hashedPassword, 'student1@example.com']
      );
      console.log('Password reset successfully!');
    }
    
  } catch (error) {
    console.error('Error testing password:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

testPassword();