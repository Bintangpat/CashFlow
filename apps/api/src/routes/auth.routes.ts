import { Router, type Router as RouterType } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router: RouterType = Router();

// Public routes - OTP based auth
router.post('/register', authController.requestSignup);
router.post('/verify-signup', authController.verifySignup);
router.post('/login', authController.requestLogin);
router.post('/verify-login', authController.verifyLogin);
router.post('/resend-otp', authController.resendOtp);
router.post('/logout', authController.logout);

// Protected routes
router.get('/me', authMiddleware, authController.me);

export default router;
