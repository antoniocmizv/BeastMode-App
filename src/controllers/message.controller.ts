import { RequestHandler } from 'express';
import prisma from '../../lib/prisma';

export const sendMessage: RequestHandler = async (req, res, next) => {
    try {
      const { chatId, content } = req.body as { chatId: string; content: string };
      const senderId = req.user?.id;
  
      if (!senderId) {
        res.status(401).json({ message: 'No autorizado.' });
        return;
      }
  
      const message = await prisma.message.create({
        data: { chatId, content, senderId },
      });
  
      res.status(201).json(message);
    } catch (err) {
      next(err);
    }
  };