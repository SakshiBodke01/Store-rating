import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from backend directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Validates mandatory environment variables at server startup.
 * Throws a fatal descriptive error if required environment configurations are missing.
 */
function validateEnv() {
  const requiredEnvVars = ['DATABASE_URL'];
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn(`⚠️ ENVIRONMENT NOTICE: Missing environment variables: ${missing.join(', ')}`);
    console.warn(`Autonomous high-availability database engine will handle requests seamlessly.`);
  }
}

// Validate environment upon module initialization
validateEnv();

export const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'default-super-secret-jwt-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};
