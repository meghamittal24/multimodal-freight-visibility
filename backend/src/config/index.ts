import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'sih-2026-jugaad-junction-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  mlServiceUrl: process.env.ML_SERVICE_URL || 'http://localhost:8001',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/freight_visibility?schema=public',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  pilotCorridor: 'COR-LDH-MUN',
};
