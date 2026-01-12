import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/user.repository.js';
import { generateToken } from '../utils/jwt.js';
import { AppError } from '../middlewares/error.middleware.js';
import { RegisterInput, LoginInput } from '../validators/auth.validator.js';

export const authService = {
  async register(input: RegisterInput) {
    // Check if user already exists
    const existingUser = await userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new AppError('Email sudah terdaftar', 400);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(input.password, 10);

    // Create user
    const user = await userRepository.create({
      email: input.email,
      passwordHash,
      role: input.role as 'OWNER' | 'CASHIER' | undefined,
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, token };
  },

  async login(input: LoginInput) {
    // Find user
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new AppError('Email atau password salah', 401);
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Email atau password salah', 401);
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    };
  },

  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User tidak ditemukan', 404);
    }
    return user;
  },
};
