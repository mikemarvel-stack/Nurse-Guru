import { z } from 'zod';
declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "production", "test"]>>;
    JWT_SECRET: z.ZodString;
    DATABASE_URL: z.ZodString;
    STRIPE_SECRET_KEY: z.ZodOptional<z.ZodString>;
    STRIPE_WEBHOOK_SECRET: z.ZodOptional<z.ZodString>;
    PORT: z.ZodDefault<z.ZodEffects<z.ZodString, number, string>>;
    FRONTEND_URL: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "development" | "production" | "test";
    JWT_SECRET: string;
    DATABASE_URL: string;
    PORT: number;
    STRIPE_SECRET_KEY?: string | undefined;
    STRIPE_WEBHOOK_SECRET?: string | undefined;
    FRONTEND_URL?: string | undefined;
}, {
    JWT_SECRET: string;
    DATABASE_URL: string;
    NODE_ENV?: "development" | "production" | "test" | undefined;
    STRIPE_SECRET_KEY?: string | undefined;
    STRIPE_WEBHOOK_SECRET?: string | undefined;
    PORT?: string | undefined;
    FRONTEND_URL?: string | undefined;
}>;
export declare const validateEnv: () => {
    NODE_ENV: "development" | "production" | "test";
    JWT_SECRET: string;
    DATABASE_URL: string;
    PORT: number;
    STRIPE_SECRET_KEY?: string | undefined;
    STRIPE_WEBHOOK_SECRET?: string | undefined;
    FRONTEND_URL?: string | undefined;
};
export type Env = z.infer<typeof envSchema>;
export {};
//# sourceMappingURL=env.d.ts.map