import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/user.repository.js';
import { otpRepository } from '../repositories/otp.repository.js';
import { emailService } from './email.service.js';
import { generateToken } from '../utils/jwt.js';
import { AppError } from '../middlewares/error.middleware.js';
import type { RegisterInput, LoginInput, VerifyOtpInput, ResendOtpInput } from '../validators/auth.validator.js';

export const authService = {
  // Step 1: Request signup - creates user (unverified) and sends OTP
  async requestSignup(input: RegisterInput) {
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
        message: 'Kode OTP telah dikirim ke email Anda',
        email: input.email,
        requiresVerification: true,
      };
    }

    // Create new user (unverified)
    const user = await userRepository.create({
      email: input.email,
      role: input.role,
      emailVerified: false,
    });

    // Create and send OTP
    const otp = await otpRepository.create(user.id, 'SIGNUP');
    await emailService.sendOTP(input.email, otp.code, 'SIGNUP');

    return {
      message: 'Kode OTP telah dikirim ke email Anda',
      email: input.email,
      requiresVerification: true,
    };
  },

  // Step 2: Verify OTP and complete signup
  async verifySignup(input: VerifyOtpInput) {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new AppError('User tidak ditemukan. Silakan daftar ulang.', 404);
    }

    // Verify OTP
    const validOtp = await otpRepository.verify(user.id, input.code, 'SIGNUP');
    if (!validOtp) {
      throw new AppError('Kode OTP tidak valid atau sudah kadaluarsa. Silakan minta kode OTP baru.', 400);
    }

    // Mark email as verified
    await userRepository.updateEmailVerified(user.id, true);

    // Generate token
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

  // Request login OTP
  async requestLogin(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new AppError('Email tidak terdaftar', 401);
    }

    if (!user.emailVerified) {
      // Resend signup OTP
      const otp = await otpRepository.create(user.id, 'SIGNUP');
      await emailService.sendOTP(input.email, otp.code, 'SIGNUP');
      
      return {
        message: 'Akun belum terverifikasi. Kode OTP telah dikirim ulang.',
        email: input.email,
        requiresVerification: true,
        type: 'SIGNUP',
      };
    }

    // Create and send login OTP
    const otp = await otpRepository.create(user.id, 'LOGIN');
    await emailService.sendOTP(input.email, otp.code, 'LOGIN');

    return {
      message: 'Kode OTP telah dikirim ke email Anda',
      email: input.email,
      requiresVerification: true,
      type: 'LOGIN',
    };
  },

  // Verify login OTP
  async verifyLogin(input: VerifyOtpInput) {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new AppError('User tidak ditemukan', 404);
    }

    // Verify OTP
    const validOtp = await otpRepository.verify(user.id, input.code, 'LOGIN');
    if (!validOtp) {
      throw new AppError('Kode OTP tidak valid atau sudah kadaluarsa. Silakan minta kode OTP baru.', 400);
    }

    // Generate token
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

  // Resend OTP
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

  // Get user profile
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
