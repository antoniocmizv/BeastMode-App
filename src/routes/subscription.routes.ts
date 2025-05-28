import { Router } from 'express';
import {
  getSubscriptions,
  getSubscriptionById,
  getUserSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} from '../controllers/subscription.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { createSubscriptionValidator } from '../validators/subscription.validator';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();

router.get('/', authenticate, getSubscriptions);
router.get('/user/:userId', authenticate, getUserSubscriptions);
router.get('/:id', authenticate, getSubscriptionById);
router.post('/', authenticate, authorize('ADMIN'), createSubscriptionValidator, validateRequest, createSubscription);
router.put('/:id', authenticate, authorize('ADMIN'), updateSubscription);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteSubscription);

export default router;
