const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'lms_database',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD
});

async function checkSchema() {
  const client = await pool.connect();
  
  try {
    console.log('Checking meetings table schema...');
    
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'meetings'
      ORDER BY ordinal_position;
    `);
    
    console.log('Current meetings table columns:');
    result.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    await client.release();
    await pool.end();
    
  } catch (error) {
    console.error('Error checking schema:', error);
    await client.release();
    await pool.end();
    process.exit(1);
  }
}

checkSchema();
