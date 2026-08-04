import { Router } from 'express';
import * as ctrl from '../controllers/review.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/index.js';

const router = Router();
const adminOnly = [authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)];

// Admin moderation
router.get('/admin/all', ...adminOnly, ctrl.adminListReviews);
router.patch('/admin/:id/moderate', ...adminOnly, ctrl.adminModerateReview);

// Public + customer
router.get('/product/:productId', ctrl.getProductReviews);
router.post('/product/:productId', authenticate, ctrl.createReview);
router.patch('/:id', authenticate, ctrl.updateReview);
router.delete('/:id', authenticate, ctrl.deleteReview);

export default router;
