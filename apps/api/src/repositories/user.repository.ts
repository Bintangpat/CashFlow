import { prisma } from '../config/database.js';

export const userRepository = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  async create(data: {
    email: string;
    passwordHash?: string;
    role?: 'OWNER' | 'CASHIER';
    emailVerified?: boolean;
  }) {
    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role || 'OWNER',
        emailVerified: data.emailVerified || false,
      },
    });
  },

  async updateEmailVerified(id: string, verified: boolean) {
    return prisma.user.update({
      where: { id },
      data: { emailVerified: verified },
    });
  },

  async updatePassword(id: string, passwordHash: string) {
    return prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  },
};
