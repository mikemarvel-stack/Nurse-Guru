import { Response } from 'express';
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export declare const sendSuccess: <T>(res: Response, data: T, statusCode?: number, message?: string) => void;
export declare const sendError: (res: Response, error: string, statusCode?: number, message?: string) => void;
export declare const sendValidationError: (res: Response, errors: any[]) => void;
declare const _default: {
    sendSuccess: <T>(res: Response, data: T, statusCode?: number, message?: string) => void;
    sendError: (res: Response, error: string, statusCode?: number, message?: string) => void;
    sendValidationError: (res: Response, errors: any[]) => void;
};
export default _default;
//# sourceMappingURL=response.d.ts.map