import { Router } from 'express';
import * as ctrl from '../controllers/setting.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/index.js';

const router = Router();

router.get('/public', ctrl.getPublicSettings);
router.get('/', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), ctrl.getSettings);
router.patch('/', authenticate, authorize(ROLES.SUPER_ADMIN), ctrl.updateSettings);

export default router;
