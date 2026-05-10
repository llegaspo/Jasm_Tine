import 'dotenv/config';

const DEFAULT_FRONTEND_ORIGIN = 'http://localhost:4200';
const DEFAULT_PORT = 3000;
const DEFAULT_USER_FIRST_NAME = 'Jasmine';
const DEFAULT_USER_LAST_NAME = 'Valentine';
const DEFAULT_USER_EMAIL = 'hello@jasminetine.co';
const DEFAULT_USER_TIMEZONE = 'Asia/Manila';

const parsePort = (value: string | undefined): number => {
  if (!value) {
    return DEFAULT_PORT;
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`Invalid PORT value: ${value}`);
  }

  return port;
};

export const appEnv = Object.freeze({
  DATABASE_URL: process.env.DATABASE_URL,
  FRONTEND_ORIGIN:
    process.env.FRONTEND_ORIGIN?.trim() || DEFAULT_FRONTEND_ORIGIN,
  PORT: parsePort(process.env.PORT),
});

export const defaultSeedUser = Object.freeze({
  firstName:
    process.env.DEFAULT_USER_FIRST_NAME?.trim() || DEFAULT_USER_FIRST_NAME,
  lastName:
    process.env.DEFAULT_USER_LAST_NAME?.trim() || DEFAULT_USER_LAST_NAME,
  email: process.env.DEFAULT_USER_EMAIL?.trim() || DEFAULT_USER_EMAIL,
  timezone: process.env.DEFAULT_USER_TIMEZONE?.trim() || DEFAULT_USER_TIMEZONE,
});

export const getDatabaseUrl = (): string => {
  const databaseUrl = appEnv.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to initialize Prisma.');
  }

  return databaseUrl;
};
