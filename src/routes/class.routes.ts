import { Router } from 'express';
import { getClasses, createClass } from '../controllers/class.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { createClassValidator } from '../validators/class.validator';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();

router.get('/', getClasses);
router.post('/', authenticate, authorize('TRAINER', 'ADMIN'), createClassValidator, validateRequest, createClass);

export default router;
