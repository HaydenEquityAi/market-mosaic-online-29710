import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Check if database is properly configured
const isDatabaseConfigured = 
  process.env.DB_USER && 
  process.env.DB_PASSWORD && 
  typeof process.env.DB_PASSWORD === 'string' &&
  process.env.DB_PASSWORD.trim().length > 0;

let pool: Pool | null = null;

// Only create pool if database is configured
if (isDatabaseConfigured) {
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'financial_market_db',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });
} else {
  console.log('💡 Database not configured - using in-memory storage');
}

export const query = async (text: string, params?: any[]) => {
  if (!pool) {
    throw new Error('Database not configured');
  }

  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export const getClient = async () => {
  if (!pool) {
    throw new Error('Database not configured');
  }

  const client = await pool.connect();
  const query = client.query;
  const release = client.release;

  // Set a timeout of 5 seconds, after which we will log this client's last query
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!');
  }, 5000);

  // Monkey patch the query method to keep track of the last query executed
  client.query = (...args: any[]) => {
    return query.apply(client, args as any);
  };

  client.release = () => {
    clearTimeout(timeout);
    client.query = query;
    client.release = release;
    return release.apply(client);
  };

  return client;
};

export const isDatabaseAvailable = () => pool !== null;

export default pool;