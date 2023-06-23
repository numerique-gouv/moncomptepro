import { Pool } from 'pg';

let pool: Pool | null = null;

const { DATABASE_URL: connectionString } = process.env;
const obfuscatedConnectionString = (connectionString || '').replace(
  /\/\/(.*)@/,
  '//****:****@'
);

export const getDatabaseConnection = () => {
  if (pool) {
    return pool;
  }

  pool = new Pool({ connectionString });

  pool.on('connect', client => {
    console.log(`Connected to database : ${obfuscatedConnectionString}`);
  });

  pool.on('remove', client => {
    console.log(`Disconnected from database : ${obfuscatedConnectionString}`);
  });

  pool.on('error', (error, client) => {
    console.error(`Database error: ${error}`);
  });

  return pool;
};
