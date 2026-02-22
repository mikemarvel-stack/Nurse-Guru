import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [
  'JWT_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY'
];

const optionalEnvVars = [
  'PORT',
  'NODE_ENV',
  'FRONTEND_URL'
];

export const validateEnvironment = () => {
  const missingVars: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(v => console.error(`   - ${v}`));
    process.exit(1);
  }

  // Log optional vars that are not set
  const unsetOptional = optionalEnvVars.filter(v => !process.env[v]);
  if (unsetOptional.length > 0) {
    console.warn('⚠️  Using default values for optional environment variables:');
    unsetOptional.forEach(v => console.warn(`   - ${v} (using default)`));
  }

  console.log('✅ Environment variables validated');
};

export const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value || defaultValue || '';
};

export default {
  validateEnvironment,
  getEnv
};
