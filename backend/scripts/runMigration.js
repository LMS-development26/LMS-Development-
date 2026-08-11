const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'lms_database',
  user: 'postgres',
  password: 'Nikki@3001'
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
