import { Router } from 'express';
import { register, login, getProfile, saveCoupon, unsaveCoupon, getSavedCoupons } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public auth endpoints
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

// Protected profile & coupon endpoints
router.get('/profile', authenticate, getProfile);
router.get('/saved', authenticate, getSavedCoupons);
router.post('/save', authenticate, saveCoupon);
router.post('/unsave', authenticate, unsaveCoupon);

export default router;
