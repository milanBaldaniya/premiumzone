import { Router } from 'express';
import * as ctrl from '../controllers/notification.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/index.js';

const router = Router();
router.use(authenticate);

router.get('/', ctrl.getMyNotifications);
router.patch('/read-all', ctrl.markAllAsRead);
router.patch('/:id/read', ctrl.markAsRead);
router.post('/broadcast', authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), ctrl.broadcast);

export default router;
