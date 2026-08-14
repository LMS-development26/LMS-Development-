const { Pool } = require('pg');

// Load environment variables
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'lms_database',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});


pool.query(`
  SELECT
    current_database() AS database,
    current_schema() AS schema,
    current_setting('search_path') AS search_path;
`)
.then(res => {
  console.log("Database Info:", res.rows[0]);
})
.catch(err => {
  console.error("Connection Test Error:", err);
});

// Test database connection
pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Connected to PostgreSQL database');
  }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Helper function to execute queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'production') {
      console.log('Executed query', { text: text.substring(0, 50), duration, rows: result.rowCount });
    }
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Helper function to get a client from the pool for transactions
const getClient = async () => {
  const client = await pool.connect();
  const release = client.release;
  
  // Set a timeout of 5 seconds, after which we will log this client's last query
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!');
    console.error('The last executed query on this client was:', client.lastQuery);
  }, 5000);
  
  // Track last query for debugging
  const originalQuery = client.query;
  client.query = (...args) => {
    client.lastQuery = args;
    return originalQuery.apply(client, args);
  };
  
  // Monkey-patch the release method
  client.release = () => {
    clearTimeout(timeout);
    client.query('ROLLBACK').catch(() => {});
    return release.call(client);
  };
  
  return client;
};

module.exports = {
  pool,
  query,
  getClient
};