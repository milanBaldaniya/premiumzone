import { Router } from 'express';
import * as ctrl from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authLimiter } from '../middlewares/rateLimiter.middleware.js';
import {
  registerSchema,
  loginSchema,
  googleAuthSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyEmailSchema,
} from '../validators/auth.validator.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), ctrl.register);
router.post('/login', authLimiter, validate(loginSchema), ctrl.login);
router.post('/google', authLimiter, validate(googleAuthSchema), ctrl.googleAuth);
router.post('/refresh', ctrl.refresh);
router.post('/logout', ctrl.logout);

router.post('/verify-email', validate(verifyEmailSchema), ctrl.verifyEmail);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), ctrl.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), ctrl.resetPassword);

// Authenticated
router.get('/me', authenticate, ctrl.me);
router.post('/resend-verification', authenticate, ctrl.resendVerification);
router.post('/change-password', authenticate, validate(changePasswordSchema), ctrl.changePassword);

export default router;
