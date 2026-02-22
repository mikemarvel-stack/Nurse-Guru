import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  message?: string
) => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(message && { message })
  };
  res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  error: string,
  statusCode: number = 400,
  message?: string
) => {
  const response: ApiResponse = {
    success: false,
    error,
    ...(message && { message })
  };
  res.status(statusCode).json(response);
};

export const sendValidationError = (res: Response, errors: any[]) => {
  res.status(400).json({
    success: false,
    error: 'Validation failed',
    errors
  });
};

export default {
  sendSuccess,
  sendError,
  sendValidationError
};
