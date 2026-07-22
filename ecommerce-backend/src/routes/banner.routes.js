import { Router } from 'express';
import * as ctrl from '../controllers/banner.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { uploadSingle } from '../middlewares/upload.middleware.js';
import { ROLES } from '../constants/index.js';

const router = Router();
const adminOnly = [authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)];

router.get('/active', ctrl.getActiveBanners);

router.get('/', ...adminOnly, ctrl.listBanners);
router.post('/', ...adminOnly, ctrl.createBanner);
router.post('/upload', ...adminOnly, uploadSingle('image'), ctrl.uploadBannerImage);
router.patch('/:id', ...adminOnly, ctrl.updateBanner);
router.delete('/:id', ...adminOnly, ctrl.deleteBanner);

export default router;
