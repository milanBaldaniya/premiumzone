import { Router } from 'express';
import * as ctrl from '../controllers/upload.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { uploadSingle, uploadArray } from '../middlewares/upload.middleware.js';
import { ROLES } from '../constants/index.js';

const router = Router();
router.use(authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.post('/image', uploadSingle('image'), ctrl.uploadImage);
router.post('/images', uploadArray('images', 10), ctrl.uploadImages);
router.delete('/image', ctrl.removeImage);

export default router;
