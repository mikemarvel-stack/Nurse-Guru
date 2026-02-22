"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnv = exports.validateEnvironment = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
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
const validateEnvironment = () => {
    const missingVars = [];
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
exports.validateEnvironment = validateEnvironment;
const getEnv = (key, defaultValue) => {
    const value = process.env[key];
    if (!value && !defaultValue) {
        throw new Error(`Environment variable ${key} is not set`);
    }
    return value || defaultValue || '';
};
exports.getEnv = getEnv;
exports.default = {
    validateEnvironment: exports.validateEnvironment,
    getEnv: exports.getEnv
};
//# sourceMappingURL=env.js.map