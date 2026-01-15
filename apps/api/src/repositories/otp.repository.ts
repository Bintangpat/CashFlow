import { prisma } from '../config/database.js';
import { OtpType } from '@prisma/client';

function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const otpRepository = {
  async create(userId: string, type: OtpType) {
    // Invalidate existing OTPs of this type for this user
    await prisma.otpToken.updateMany({
      where: {
        userId,
        type,
        used: false,
        expiresAt: { gt: new Date() },
      },
      data: { used: true },
    });

    // Create new OTP (expires in 10 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    return prisma.otpToken.create({
      data: {
        userId,
        code: generateOtpCode(),
        type,
        expiresAt,
      },
    });
  },

  async verify(userId: string, code: string, type: OtpType) {
    const otp = await prisma.otpToken.findFirst({
      where: {
        userId,
        code,
        type,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otp) {
      return null;
    }

    // Mark as used
    await prisma.otpToken.update({
      where: { id: otp.id },
      data: { used: true },
    });

    return otp;
  },

  async cleanup() {
    // Clean up expired OTPs (older than 1 hour)
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    await prisma.otpToken.deleteMany({
      where: {
        expiresAt: { lt: oneHourAgo },
      },
    });
  },

  async invalidateAll(userId: string) {
    // Mark all OTPs for this user as used
    await prisma.otpToken.updateMany({
      where: { userId },
      data: { used: true },
    });
  },
};
