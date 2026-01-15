import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { 
  registerSchema, 
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendOtpSchema
} from '../validators/auth.validator.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { config } from '../config/index.js';

// Cookie configuration for authentication
// With Vercel API Proxy, all requests are same-origin (no cross-domain)
// So we can use sameSite='lax' even in production!

const isProduction = config.nodeEnv === 'production';

const cookieOptions: {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax' | 'strict';
  maxAge: number;
  path: string;
} = {
  httpOnly: true,
  secure: isProduction, // HTTPS only in production
  sameSite: 'lax', // Safe to use 'lax' with same-origin requests
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/', // Cookie available for all paths
};

// Debug logging in development
if (!isProduction) {
  console.log('🍪 Cookie Options:', cookieOptions);
}

export const authController = {
  /**
   * REGISTRATION FLOW
   * Step 1: Register - create user account and send OTP
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const input = registerSchema.parse(req.body);
      const result = await authService.register(input);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Step 2: Verify email with OTP
   */
  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const input = verifyEmailSchema.parse(req.body);
      const result = await authService.verifyEmail(input);

      // Set cookie with JWT token
      res.cookie('token', result.token, cookieOptions);

      res.status(200).json({
        success: true,
        data: result.user,
        message: 'Email berhasil diverifikasi',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * LOGIN FLOW
   * Traditional email + password login
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const input = loginSchema.parse(req.body);
      const result = await authService.login(input);

      // Set cookie with JWT token
      res.cookie('token', result.token, cookieOptions);

      res.status(200).json({
        success: true,
        data: result.user,
        message: 'Login berhasil',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * FORGOT PASSWORD FLOW
   * Step 1: Request password reset OTP
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const input = forgotPasswordSchema.parse(req.body);
      const result = await authService.forgotPassword(input);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Step 2: Reset password with OTP
   */
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const input = resetPasswordSchema.parse(req.body);
      const result = await authService.resetPassword(input);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Resend OTP for email verification or password reset
   */
  async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const input = resendOtpSchema.parse(req.body);
      const result = await authService.resendOtp(input);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * LOGOUT
   */
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie('token', cookieOptions);

      res.json({
        success: true,
        message: 'Logout berhasil',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get current authenticated user
   */
  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated',
        });
      }

      const profile = await authService.getProfile(req.user.userId);

      res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  },
};
