import { Router } from 'express';
import * as ctrl from '../controllers/category.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { uploadSingle } from '../middlewares/upload.middleware.js';
import { ROLES } from '../constants/index.js';

const router = Router();
const adminOnly = [authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)];

router.get('/', ctrl.listCategories);
router.get('/tree', ctrl.getCategoryTree);
router.get('/slug/:slug', ctrl.getCategoryBySlug);

router.post('/', ...adminOnly, ctrl.createCategory);
router.patch('/:id', ...adminOnly, ctrl.updateCategory);
router.delete('/:id', ...adminOnly, ctrl.deleteCategory);
router.post('/:id/image', ...adminOnly, uploadSingle('image'), ctrl.uploadCategoryImage);

export default router;
