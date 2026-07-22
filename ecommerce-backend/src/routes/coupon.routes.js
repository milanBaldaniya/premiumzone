import { Router } from 'express';
import * as ctrl from '../controllers/coupon.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/index.js';

const router = Router();
const adminOnly = [authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)];

router.post('/validate', authenticate, ctrl.validateCoupon);

router.get('/', ...adminOnly, ctrl.listCoupons);
router.post('/', ...adminOnly, ctrl.createCoupon);
router.get('/:id', ...adminOnly, ctrl.getCoupon);
router.patch('/:id', ...adminOnly, ctrl.updateCoupon);
router.delete('/:id', ...adminOnly, ctrl.deleteCoupon);

export default router;
