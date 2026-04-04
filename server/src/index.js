import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';
import { dbPool, closeDb } from './config/db.js';
import { env } from './config/env.js';

const start = async () => {
  await dbPool.query('SELECT 1');

  const server = app.listen(env.port, () => {
    console.log(`URL shortener API listening on port ${env.port}`);
  });

  const shutdown = async (signal) => {
    console.log(`Received ${signal}. Shutting down...`);
    server.close(async () => {
      await closeDb();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

start().catch(async (error) => {
  console.error('Startup failed:', error);
  await closeDb();
  process.exit(1);
});
