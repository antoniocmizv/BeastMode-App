import { Router } from 'express';
import {
  getSubscriptions,
  getUserSubscriptions,
  createSubscription,
} from '../controllers/subscription.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { createSubscriptionValidator } from '../validators/subscription.validator';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();

router.get('/', authenticate, getSubscriptions);
router.get('/user/:userId', authenticate, getUserSubscriptions);
router.post('/', authenticate, createSubscriptionValidator, validateRequest, createSubscription);

export default router;
