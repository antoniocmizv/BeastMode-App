import { Router } from 'express';
import {
  getUserChats,
  getChatById,
  createChat,
  getMessagesFromChat,
  sendMessageToChat,
  markMessagesAsRead,
  deleteChatForUser,
} from '../controllers/chat.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getUserChats);
router.post('/', createChat);
router.get('/:chatId', getChatById);
router.get('/:chatId/messages', getMessagesFromChat);
router.post('/:chatId/messages', sendMessageToChat);
router.patch('/:chatId/messages/read', markMessagesAsRead);
router.delete('/:chatId', deleteChatForUser);

export default router;
