import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

export const dbPool = new Pool({
  connectionString: env.databaseUrl,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

export const closeDb = async () => {
  await dbPool.end();
};
