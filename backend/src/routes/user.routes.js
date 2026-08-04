import { Router } from 'express';
import * as ctrl from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { uploadSingle } from '../middlewares/upload.middleware.js';
import { ROLES } from '../constants/index.js';

const router = Router();
const adminOnly = [authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)];

// Self
router.patch('/me', authenticate, ctrl.updateProfile);
router.post('/me/avatar', authenticate, uploadSingle('avatar'), ctrl.updateAvatar);

// Admin
router.get('/', ...adminOnly, ctrl.listCustomers);
router.get('/:id', ...adminOnly, ctrl.getCustomer);
router.patch('/:id/status', ...adminOnly, ctrl.updateCustomerStatus);
router.patch('/:id/role', authenticate, authorize(ROLES.SUPER_ADMIN), ctrl.updateCustomerRole);

export default router;
