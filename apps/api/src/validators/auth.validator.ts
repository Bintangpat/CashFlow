import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter').optional(),
  role: z.enum(['OWNER', 'CASHIER']).optional().default('OWNER'),
});

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password harus diisi').optional(),
});

export const verifyOtpSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  code: z.string().length(6, 'Kode OTP harus 6 digit'),
  type: z.enum(['SIGNUP', 'LOGIN']),
});

export const resendOtpSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  type: z.enum(['SIGNUP', 'LOGIN']),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
