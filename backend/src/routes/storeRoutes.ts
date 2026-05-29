import { Router } from 'express';
import { getStores, searchStores, getStoreBySlug, revealRandomCoupon, getTrendingCoupons } from '../controllers/storeController';
import { revealLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public store and coupon endpoints
router.get('/', getStores);
router.get('/search', searchStores);
router.get('/trending', getTrendingCoupons);
router.get('/:slug', getStoreBySlug);
router.post('/:slug/reveal', revealLimiter, revealRandomCoupon);

export default router;
