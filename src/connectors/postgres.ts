import { Pool } from 'pg';

let pool: Pool | null = null;

const {
  PGUSER: user,
  PGPASSWORD: password,
  PGDATABASE: database,
  PGPORT: port,
} = process.env;

const connectionString = `postgres://${user}:${password}@127.0.0.1:${port}/${database}`;

export const getDatabaseConnection = () => {
  if (pool) {
    return pool;
  }

  pool = new Pool({ connectionString });

  pool.on('connect', client => {
    console.log(
      `Connected to database : postgres://${user}@127.0.0.1:${port}/${database}`
    );
  });

  pool.on('remove', client => {
    console.log(
      `Disconnected from database : postgres://${user}@127.0.0.1:${port}/${database}`
    );
  });

  pool.on('error', (error, client) => {
    console.error(`Database error: ${error}`);
  });

  return pool;
};
