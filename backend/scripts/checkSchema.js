const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'lms_database',
  user: 'postgres',
  password: 'Nikki@3001'
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
