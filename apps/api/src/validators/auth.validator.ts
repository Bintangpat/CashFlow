import { z } from 'zod';

// Password validation rules
const passwordSchema = z
  .string()
  .min(8, 'Password minimal 8 karakter')
  .regex(/[A-Z]/, 'Password harus mengandung minimal 1 huruf besar')
  .regex(/[a-z]/, 'Password harus mengandung minimal 1 huruf kecil')
  .regex(/[0-9]/, 'Password harus mengandung minimal 1 angka');

export const registerSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: passwordSchema,
  passwordConfirmation: passwordSchema,
  role: z.enum(['OWNER', 'CASHIER']).optional().default('OWNER'),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: 'Password tidak cocok',
  path: ['passwordConfirmation'],
});

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password harus diisi'),
});

export const verifyEmailSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  code: z.string().length(6, 'Kode OTP harus 6 digit'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Format email tidak valid'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  code: z.string().length(6, 'Kode OTP harus 6 digit'),
  newPassword: passwordSchema,
  newPasswordConfirmation: passwordSchema,
}).refine((data) => data.newPassword === data.newPasswordConfirmation, {
  message: 'Password tidak cocok',
  path: ['newPasswordConfirmation'],
});

export const resendOtpSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  type: z.enum(['SIGNUP', 'RESET_PASSWORD']),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
