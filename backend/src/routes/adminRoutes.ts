import { Router } from 'express';
import {
  createStore,
  updateStore,
  deleteStore,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getAdminStats
} from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Apply auth and admin checks globally to this router
router.use(authenticate);
router.use(requireAdmin);

// Dashboard metrics
router.get('/stats', getAdminStats);

// Stores CRUD
router.post('/stores', createStore);
router.put('/stores/:id', updateStore);
router.delete('/stores/:id', deleteStore);

// Coupons CRUD
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

export default router;
