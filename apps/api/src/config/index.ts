import dotenv from 'dotenv';
dotenv.config();

/**
 * Parse comma-separated CORS origins from environment variable
 * Returns array of allowed origins
 */
const parseCorsOrigins = (): string[] => {
  const corsOrigins = process.env.CORS_ORIGINS;
  
  if (!corsOrigins) {
    // Default origins for development
    return [
      'http://localhost:3000',
      'http://localhost:3001',
    ];
  }

  // Parse comma-separated origins and trim whitespace
  return corsOrigins
    .split(',')
    .map(origin => origin.trim())
    .filter(origin => origin.length > 0);
};

export const config = {
  // Server Configuration
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Security & Authentication
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // CORS Configuration
  corsOrigins: parseCorsOrigins(),
  corsCredentials: process.env.CORS_CREDENTIALS !== 'false', // Default true
  
  // Email Configuration
  resendApiKey: process.env.RESEND_API_KEY || '',
  emailFrom: process.env.EMAIL_FROM || 'CashFlow <noreply@resend.dev>',
};

