import { RequestHandler } from 'express';
import prisma from '../../lib/prisma';

export const markMessageAsRead: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'No autorizado.' });
      return;
    }
    // Busca el registro MessageRead para este mensaje y usuario
    const messageRead = await prisma.messageRead.findUnique({
      where: {
        messageId_userId: { messageId: id, userId }
      }
    });
    if (!messageRead) {
      // Si no existe, lo crea con readAt ahora
      await prisma.messageRead.create({
        data: { messageId: id, userId, readAt: new Date() }
      });
    } else if (!messageRead.readAt) {
      // Si existe pero no está leído, lo actualiza
      await prisma.messageRead.update({
        where: { id: messageRead.id },
        data: { readAt: new Date() }
      });
    }
    res.json({ message: 'Mensaje marcado como leído.' });
  } catch (err) {
    res.status(500).json({ message: 'Error al marcar como leído', error: err });
  }
};
