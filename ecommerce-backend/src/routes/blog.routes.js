import { Router } from 'express';
import * as ctrl from '../controllers/blog.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/index.js';

const router = Router();
const adminOnly = [authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)];

router.get('/', ctrl.listPublishedBlogs);
router.get('/slug/:slug', ctrl.getBlogBySlug);

router.get('/admin/all', ...adminOnly, ctrl.adminListBlogs);
router.post('/', ...adminOnly, ctrl.createBlog);
router.patch('/:id', ...adminOnly, ctrl.updateBlog);
router.delete('/:id', ...adminOnly, ctrl.deleteBlog);

export default router;
