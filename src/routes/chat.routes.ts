import { Router } from 'express';
import {
  getUserChats,
  getChatById,
  createChat,
  getMessagesFromChat,
} from '../controllers/chat.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getUserChats);
router.post('/', createChat);
router.get('/:chatId', getChatById);
router.get('/:chatId/messages', getMessagesFromChat);

export default router;
