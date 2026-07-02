import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { authenticate } from '../../../middleware/auth.middleware.js';
import { validate } from '../../../middleware/validate.middleware.js';
import { authRateLimiter } from '../../../middleware/rateLimit.middleware.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
  googleAuthSchema,
} from '../../../validators/auth.validator.js';
import * as authController from '../../../controllers/auth.controller.js';

const router = Router();

// Public auth endpoints
router.post('/register', authRateLimiter, validate(registerSchema), asyncHandler(authController.register));
router.post('/login', authRateLimiter, validate(loginSchema), asyncHandler(authController.login));
router.post('/google', authRateLimiter, validate(googleAuthSchema), asyncHandler(authController.googleLogin));
router.post('/refresh', authRateLimiter, validate(refreshTokenSchema), asyncHandler(authController.refresh));
router.post('/logout', validate(refreshTokenSchema), asyncHandler(authController.logout));
router.post('/forgot-password', authRateLimiter, validate(forgotPasswordSchema), asyncHandler(authController.forgotPassword));
router.post('/reset-password', authRateLimiter, validate(resetPasswordSchema), asyncHandler(authController.resetPassword));

// Protected auth endpoints
router.get('/me', authenticate, asyncHandler(authController.me));
router.patch('/me', authenticate, validate(updateProfileSchema), asyncHandler(authController.updateProfile));
router.post('/logout-all', authenticate, asyncHandler(authController.logoutAll));
router.post('/change-password', authenticate, validate(changePasswordSchema), asyncHandler(authController.changePassword));

export default router;
