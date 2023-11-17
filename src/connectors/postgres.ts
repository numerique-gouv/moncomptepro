import { Pool } from 'pg';
import { DATABASE_URL } from '../config/env';

let pool: Pool | null = null;

const obfuscatedConnectionString = (DATABASE_URL || '').replace(
  /\/\/(.*)@/,
  '//****:****@'
);

export const getDatabaseConnection = () => {
  if (pool) {
    return pool;
  }

  pool = new Pool({ connectionString: DATABASE_URL });

  pool.on('connect', (client) => {
    console.log(`Connected to database : ${obfuscatedConnectionString}`);
  });

  pool.on('remove', (client) => {
    console.log(`Disconnected from database : ${obfuscatedConnectionString}`);
  });

  pool.on('error', (error, client) => {
    console.error(`Database error: ${error}`);
  });

  return pool;
};
