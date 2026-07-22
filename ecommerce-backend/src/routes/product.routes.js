import { Router } from 'express';
import * as ctrl from '../controllers/product.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { uploadArray } from '../middlewares/upload.middleware.js';
import { ROLES } from '../constants/index.js';
import { createProductSchema, updateProductSchema } from '../validators/product.validator.js';

const router = Router();
const adminOnly = [authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)];

// ── Public ───────────────────────────────────────────────
router.get('/', ctrl.listProducts);
router.get('/sections', ctrl.getStorefrontSections);
router.get('/slug/:slug', ctrl.getProductBySlug);
router.get('/:id/related', ctrl.getRelatedProducts);

// ── Admin ────────────────────────────────────────────────
router.get('/admin/all', ...adminOnly, ctrl.adminListProducts);
router.get('/admin/:id', ...adminOnly, ctrl.getProductById);
router.post('/', ...adminOnly, validate(createProductSchema), ctrl.createProduct);
router.post('/bulk-delete', ...adminOnly, ctrl.bulkDeleteProducts);
router.patch('/:id', ...adminOnly, validate(updateProductSchema), ctrl.updateProduct);
router.delete('/:id', ...adminOnly, ctrl.deleteProduct);

router.post('/:id/images', ...adminOnly, uploadArray('images', 10), ctrl.uploadProductImages);
router.delete('/:id/images', ...adminOnly, ctrl.deleteProductImage);

export default router;
