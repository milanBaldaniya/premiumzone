import { Router } from 'express';
import * as ctrl from '../controllers/analytics.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/index.js';

const router = Router();
router.use(authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.get('/dashboard', ctrl.getDashboardStats);
router.get('/sales', ctrl.getSalesChart);
router.get('/top-products', ctrl.getTopProducts);
router.get('/order-status', ctrl.getOrderStatusBreakdown);
router.get('/revenue-split', ctrl.getCategoryBrandRevenue);
router.get('/customers', ctrl.getCustomerStats);

export default router;
