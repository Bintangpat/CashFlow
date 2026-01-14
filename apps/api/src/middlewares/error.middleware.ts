import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  // Zod validation error
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.flatten().fieldErrors,
    });
  }

  // Custom AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Prisma database connection error
  if (err instanceof Prisma.PrismaClientInitializationError) {
    return res.status(503).json({
      success: false,
      message: 'Database tidak tersedia. Mohon coba lagi nanti.',
      code: 'DATABASE_UNAVAILABLE',
    });
  }

  // Prisma known request error
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada database',
      code: err.code,
    });
  }

  // Default error
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};

