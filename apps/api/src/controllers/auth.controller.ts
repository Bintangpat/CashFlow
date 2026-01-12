import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { config } from '../config/index.js';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const input = registerSchema.parse(req.body);
      const { user, token } = await authService.register(input);

      // Set HttpOnly cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        success: true,
        data: user,
        message: 'Registrasi berhasil',
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const input = loginSchema.parse(req.body);
      const { user, token } = await authService.login(input);

      // Set HttpOnly cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        success: true,
        data: user,
        message: 'Login berhasil',
      });
    } catch (error) {
      next(error);
    }
  },

  async logout(req: Request, res: Response) {
    res.clearCookie('token');
    res.json({
      success: true,
      message: 'Logout berhasil',
    });
  },

  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const user = await authService.getProfile(req.user.userId);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },
};
