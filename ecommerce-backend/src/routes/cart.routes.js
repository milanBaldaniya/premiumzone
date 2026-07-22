import { Router } from 'express';
import * as ctrl from '../controllers/cart.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(authenticate); // all cart routes require a logged-in customer

router.get('/', ctrl.getCart);
router.post('/items', ctrl.addToCart);
router.patch('/items/:itemId', ctrl.updateCartItem);
router.delete('/items/:itemId', ctrl.removeCartItem);
router.delete('/', ctrl.clearCart);
router.post('/coupon', ctrl.applyCartCoupon);
router.delete('/coupon', ctrl.removeCartCoupon);

export default router;
