import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { sendMessage } from '../controllers/message.controller';

const router = Router();

router.use(authenticate);

router.post('/', sendMessage);

export default router;
