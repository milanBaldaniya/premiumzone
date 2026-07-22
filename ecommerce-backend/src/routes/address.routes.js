import { Router } from 'express';
import * as ctrl from '../controllers/address.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(authenticate);

router.get('/', ctrl.listAddresses);
router.post('/', ctrl.createAddress);
router.patch('/:id', ctrl.updateAddress);
router.delete('/:id', ctrl.deleteAddress);

export default router;
