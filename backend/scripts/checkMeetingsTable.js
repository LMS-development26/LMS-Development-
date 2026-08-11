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

async function checkMeetingsTable() {
  const client = await pool.connect();
  
  try {
    console.log('Connected to database:', process.env.DB_NAME);
    console.log('User:', process.env.DB_USER);
    console.log('Host:', process.env.DB_HOST);
    
    // Check if meetings table exists
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'meetings'
    `);
    
    if (tableCheck.rows.length === 0) {
      console.log('ERROR: meetings table does not exist!');
      return;
    }
    
    console.log('meetings table exists');
    
    // Get column information
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'meetings'
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('\nTable columns:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check specifically for meeting_date column
    const meetingDateCol = columns.rows.find(col => col.column_name === 'meeting_date');
    if (meetingDateCol) {
      console.log('\n✓ meeting_date column exists');
    } else {
      console.log('\n✗ meeting_date column DOES NOT exist');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkMeetingsTable();
