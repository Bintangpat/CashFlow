import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { 
  registerSchema, 
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema
} from '../validators/auth.validator.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { config } from '../config/index.js';

// Cookie configuration for cross-domain authentication
// Production: Vercel (frontend) ↔ Railway (backend) requires sameSite='none' with secure
// Development: localhost requires sameSite='lax' without secure
const cookieOptions: {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'none' | 'lax';
  maxAge: number;
  path: string;
} = {
  httpOnly: true,
  secure: config.nodeEnv === 'production', // HTTPS only in production
  sameSite: config.nodeEnv === 'production' ? 'none' : 'lax', // 'none' for cross-domain
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/', // Cookie available for all paths
};

export const authController = {
  // Step 1: Request signup - sends OTP
  async requestSignup(req: Request, res: Response, next: NextFunction) {
    try {
      const input = registerSchema.parse(req.body);
      const result = await authService.requestSignup(input);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  // Step 2: Verify signup OTP
  async verifySignup(req: Request, res: Response, next: NextFunction) {
    try {
      const input = verifyOtpSchema.parse({ ...req.body, type: 'SIGNUP' });
      const result = await authService.verifySignup(input);

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

  // Request login OTP
  async requestLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const input = loginSchema.parse(req.body);
      const result = await authService.requestLogin(input);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  // Verify login OTP
  async verifyLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const input = verifyOtpSchema.parse({ ...req.body, type: 'LOGIN' });
      const result = await authService.verifyLogin(input);

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

  // Resend OTP
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

  // Logout
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

  // Get current user
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
