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

async function updatePassword() {
  const client = await pool.connect();

  try {
    console.log('Updating password for payaldhakre1312@gmail.com...');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const result = await client.query(
      `UPDATE users
       SET password_hash = $1,
           failed_login_attempts = 0,
           locked_until = NULL
       WHERE email = $2
       RETURNING id, email, role, status`,
      [hashedPassword, 'payaldhakre1312@gmail.com']
    );

    if (result.rows.length === 0) {
      console.log('User not found!');
    } else {
      console.log('Password updated successfully!');
      console.log('Email:', result.rows[0].email);
      console.log('Role:', result.rows[0].role);
      console.log('Status:', result.rows[0].status);
      console.log('Password: password123');
    }

  } catch (error) {
    console.error('Error updating password:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

updatePassword();