import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import productRoutes from './product.routes.js';
import categoryRoutes from './category.routes.js';
import brandRoutes from './brand.routes.js';
import cartRoutes from './cart.routes.js';
import wishlistRoutes from './wishlist.routes.js';
import orderRoutes from './order.routes.js';
import couponRoutes from './coupon.routes.js';
import reviewRoutes from './review.routes.js';
import addressRoutes from './address.routes.js';
import notificationRoutes from './notification.routes.js';
import bannerRoutes from './banner.routes.js';
import blogRoutes from './blog.routes.js';
import settingRoutes from './setting.routes.js';
import uploadRoutes from './upload.routes.js';
import analyticsRoutes from './analytics.routes.js';

const router = Router();

router.get('/', (_req, res) =>
  res.json({ success: true, message: 'Premium Zone API v1', docs: '/api/v1/docs' })
);

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/brands', brandRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/orders', orderRoutes);
router.use('/coupons', couponRoutes);
router.use('/reviews', reviewRoutes);
router.use('/addresses', addressRoutes);
router.use('/notifications', notificationRoutes);
router.use('/banners', bannerRoutes);
router.use('/blogs', blogRoutes);
router.use('/settings', settingRoutes);
router.use('/upload', uploadRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
