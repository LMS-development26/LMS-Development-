const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'lms_database',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD
});

async function runMigration(migrationFile) {
  const client = await pool.connect();
  
  try {
    console.log('Connected to PostgreSQL');
    
    const migrationPath = path.join(__dirname, '../../database/migrations', migrationFile);
    console.log(`Running migration: ${migrationFile}`);
    
    const sql = fs.readFileSync(migrationPath, 'utf8');
    await client.query(sql);
    
    console.log('Migration completed successfully!');
    
    await client.release();
    await pool.end();
    
  } catch (error) {
    console.error('Error running migration:', error);
    await client.release();
    await pool.end();
    process.exit(1);
  }
}

// Get migration file from command line argument
const migrationFile = process.argv[2] || 'update_meetings_table.sql';
runMigration(migrationFile);
