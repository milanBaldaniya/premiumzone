import { Router } from 'express';
import * as ctrl from '../controllers/payment.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// Razorpay calls this server-to-server — no auth, verified via HMAC signature instead.
router.post('/razorpay/webhook', ctrl.handleWebhook);

router.post('/razorpay/order', authenticate, ctrl.createOrder);
router.post('/razorpay/verify', authenticate, ctrl.verifyPayment);

export default router;
