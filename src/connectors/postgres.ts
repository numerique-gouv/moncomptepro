import { Pool } from 'pg';

let pool: Pool | null = null;

const { DATABASE_URL: connectionString } = process.env;

export const getDatabaseConnection = () => {
  if (pool) {
    return pool;
  }

  pool = new Pool({ connectionString });

  pool.on('connect', client => {
    console.log(`Connected to database : ${connectionString}`);
  });

  pool.on('remove', client => {
    console.log(`Disconnected from database : ${connectionString}`);
  });

  pool.on('error', (error, client) => {
    console.error(`Database error: ${error}`);
  });

  return pool;
};
