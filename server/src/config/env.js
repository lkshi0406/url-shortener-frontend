import dotenv from 'dotenv';

dotenv.config();

const parseNumber = (value, fallback) => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseNumber(process.env.PORT, 5000),
  baseUrl: process.env.BASE_URL ?? 'http://localhost:5000',
  databaseUrl: process.env.DATABASE_URL ?? '',
  defaultRedirectStatusCode: parseNumber(process.env.REDIRECT_STATUS_CODE, 302),
};

if (!env.databaseUrl) {
  throw new Error('DATABASE_URL is required.');
}
