import { Request, Response, NextFunction } from 'express';
export declare const createRateLimiter: (windowMs?: number, maxRequests?: number) => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export default createRateLimiter;
//# sourceMappingURL=rateLimit.d.ts.map