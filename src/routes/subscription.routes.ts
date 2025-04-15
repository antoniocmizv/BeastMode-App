import { Router } from 'express';
import {
  getSubscriptions,
  getUserSubscriptions,
  createSubscription,
} from '../controllers/subscription.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, getSubscriptions); // 🔐 protegida
router.get('/user/:userId', authenticate, getUserSubscriptions);
router.post('/', authenticate, createSubscription);

export default router;
