import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRE: string;
  MAX_FILE_SIZE: number;
  UPLOAD_PATH: string;
  FRONTEND_URL: string;
}

const getEnvVariable = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export const env: EnvConfig = {
  PORT: parseInt(getEnvVariable('PORT', '5000'), 10),
  NODE_ENV: getEnvVariable('NODE_ENV', 'development'),
  DATABASE_URL: getEnvVariable('DATABASE_URL'),
  JWT_SECRET: getEnvVariable('JWT_SECRET'),
  JWT_EXPIRE: getEnvVariable('JWT_EXPIRE', '7d'),
  MAX_FILE_SIZE: parseInt(getEnvVariable('MAX_FILE_SIZE', '104857600'), 10),
  UPLOAD_PATH: getEnvVariable('UPLOAD_PATH', './uploads'),
  FRONTEND_URL: getEnvVariable('FRONTEND_URL', 'http://localhost:5173'),
};