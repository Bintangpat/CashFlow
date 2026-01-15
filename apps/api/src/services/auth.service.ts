import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/user.repository.js';
import { otpRepository } from '../repositories/otp.repository.js';
import { emailService } from './email.service.js';
import { generateToken } from '../utils/jwt.js';
import { AppError } from '../middlewares/error.middleware.js';
import type { 
  RegisterInput, 
  LoginInput, 
  VerifyEmailInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ResendOtpInput 
} from '../validators/auth.validator.js';

const SALT_ROUNDS = 10;

export const authService = {
  /**
   * REGISTRATION FLOW
   * Step 1: Create user account with email + password, send OTP for email verification
   */
  async register(input: RegisterInput) {
    // Check if user already exists
    const existingUser = await userRepository.findByEmail(input.email);
    
    if (existingUser) {
      if (existingUser.emailVerified) {
        throw new AppError('Email sudah terdaftar', 400);
      }
      // User exists but not verified, resend OTP
      const otp = await otpRepository.create(existingUser.id, 'SIGNUP');
      await emailService.sendOTP(input.email, otp.code, 'SIGNUP');
      
      return {
        message: 'Akun sudah ada tapi belum terverifikasi. Kode OTP telah dikirim ulang.',
        email: input.email,
        requiresVerification: true,
      };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    // Create new user (unverified)
    const user = await userRepository.create({
      email: input.email,
      passwordHash,
      role: input.role,
      emailVerified: false,
    });

    // Create and send OTP for email verification
    const otp = await otpRepository.create(user.id, 'SIGNUP');
    await emailService.sendOTP(input.email, otp.code, 'SIGNUP');

    return {
      message: 'Registrasi berhasil! Kode OTP telah dikirim ke email Anda untuk verifikasi.',
      email: input.email,
      requiresVerification: true,
    };
  },

  /**
   * Step 2: Verify email with OTP and complete registration
   */
  async verifyEmail(input: VerifyEmailInput) {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new AppError('User tidak ditemukan', 404);
    }

    // Verify OTP
    const validOtp = await otpRepository.verify(user.id, input.code, 'SIGNUP');
    if (!validOtp) {
      throw new AppError('Kode OTP tidak valid atau sudah kadaluarsa', 400);
    }

    // Mark email as verified
    await userRepository.updateEmailVerified(user.id, true);

    // Generate JWT token
    const token = generateToken({ userId: user.id, email: user.email, role: user.role });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        emailVerified: true,
      },
      token,
    };
  },

  /**
   * LOGIN FLOW
   * Traditional email + password login (no OTP required)
   */
  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new AppError('Email atau password salah', 401);
    }

    // Check if user has password (legacy data protection)
    if (!user.passwordHash) {
      throw new AppError('Akun ini belum memiliki password. Silakan reset password Anda.', 400);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Email atau password salah', 401);
    }

    // Check if email is verified
    if (!user.emailVerified) {
      // Resend verification OTP
      const otp = await otpRepository.create(user.id, 'SIGNUP');
      await emailService.sendOTP(input.email, otp.code, 'SIGNUP');
      
      throw new AppError('Email belum diverifikasi. Kode OTP telah dikirim ulang ke email Anda.', 403);
    }

    // Generate JWT token
    const token = generateToken({ userId: user.id, email: user.email, role: user.role });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      token,
    };
  },

  /**
   * FORGOT PASSWORD FLOW
   * Step 1: Request password reset OTP
   */
  async forgotPassword(input: ForgotPasswordInput) {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      // Don't reveal if email exists or not (security best practice)
      return {
        message: 'Jika email terdaftar, kode OTP telah dikirim.',
        email: input.email,
      };
    }

    // Create and send OTP for password reset
    const otp = await otpRepository.create(user.id, 'RESET_PASSWORD');
    await emailService.sendOTP(input.email, otp.code, 'RESET_PASSWORD');

    return {
      message: 'Kode OTP untuk reset password telah dikirim ke email Anda',
      email: input.email,
    };
  },

  /**
   * Step 2: Reset password with OTP verification
   */
  async resetPassword(input: ResetPasswordInput) {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new AppError('User tidak ditemukan', 404);
    }

    // Verify OTP
    const validOtp = await otpRepository.verify(user.id, input.code, 'RESET_PASSWORD');
    if (!validOtp) {
      throw new AppError('Kode OTP tidak valid atau sudah kadaluarsa', 400);
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);

    // Update password
    await userRepository.updatePassword(user.id, passwordHash);

    // Invalidate all OTPs for this user
    await otpRepository.invalidateAll(user.id);

    return {
      message: 'Password berhasil direset. Silakan login dengan password baru Anda.',
    };
  },

  /**
   * Resend OTP for email verification or password reset
   */
  async resendOtp(input: ResendOtpInput) {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new AppError('Email tidak terdaftar', 404);
    }

    const otp = await otpRepository.create(user.id, input.type);
    await emailService.sendOTP(input.email, otp.code, input.type);

    return {
      message: 'Kode OTP telah dikirim ulang',
      email: input.email,
    };
  },

  /**
   * Get authenticated user profile
   */
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User tidak ditemukan', 404);
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },
};
