import { Router } from 'express';
import * as ctrl from '../controllers/brand.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { uploadSingle } from '../middlewares/upload.middleware.js';
import { ROLES } from '../constants/index.js';

const router = Router();
const adminOnly = [authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)];

router.get('/', ctrl.listBrands);
router.get('/slug/:slug', ctrl.getBrandBySlug);

router.post('/', ...adminOnly, ctrl.createBrand);
router.patch('/:id', ...adminOnly, ctrl.updateBrand);
router.delete('/:id', ...adminOnly, ctrl.deleteBrand);
router.post('/:id/logo', ...adminOnly, uploadSingle('image'), ctrl.uploadBrandLogo);

export default router;
