import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { markMessageAsRead } from '../controllers/messageRead.controller';

const router = Router();

router.use(authenticate);

router.post('/:id/read', markMessageAsRead);

export default router;
