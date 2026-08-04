import { Router } from 'express';
import * as ctrl from '../controllers/order.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/index.js';

const router = Router();
const adminOnly = [authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)];

// ── Admin (declared before dynamic customer routes) ──────
router.get('/admin/all', ...adminOnly, ctrl.adminListOrders);
router.get('/admin/:id', ...adminOnly, ctrl.adminGetOrder);
router.patch('/admin/:id/status', ...adminOnly, ctrl.adminUpdateOrderStatus);

// ── Customer ─────────────────────────────────────────────
router.use(authenticate);
router.post('/checkout-preview', ctrl.checkoutPreview);
router.post('/', ctrl.placeOrder);
router.get('/', ctrl.getMyOrders);
router.get('/:orderNumber', ctrl.getMyOrder);
router.patch('/:id/cancel', ctrl.cancelMyOrder);

export default router;
