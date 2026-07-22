import { Router } from 'express';
import * as ctrl from '../controllers/wishlist.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(authenticate);

router.get('/', ctrl.getWishlist);
router.post('/toggle', ctrl.toggleWishlist);
router.delete('/:productId', ctrl.removeFromWishlist);

export default router;
