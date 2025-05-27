import { Request, Response, RequestHandler } from 'express';
import prisma from '../../lib/prisma';

export const getUserChats: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const chats = await prisma.chat.findMany({
      where: {
        users: { some: { id: userId } },
        // Filtrar chats no eliminados por el usuario
        chatDeletes: {
          none: { userId }
        }
      },
      include: {
        users: { select: { id: true, name: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: { select: { id: true, name: true } }
          }
        },
      },
    });    // Transformar la respuesta para incluir otherUserName y lastMessage correctamente
    const transformedChats = chats.map((chat: any) => {
      let otherUserName = '';
      let lastMessage = '';

      // Solo para chats privados (2 personas): nombre del otro usuario
      if (chat.type === 'PRIVATE' && chat.users.length === 2 && userId) {
        const otherUser = chat.users.find((user: { id: string; name: string }) => user.id !== userId);
        otherUserName = otherUser?.name || '';
      } else if (chat.type === 'GYM') {
        otherUserName = chat.name || '';
      } // Para otros tipos, puede quedar vacío o poner nombre de grupo si aplica

      // Obtener el último mensaje
      if (chat.messages.length > 0) {
        lastMessage = chat.messages[0].content;
      }

      return {
        id: chat.id,
        otherUserName,
        lastMessage
      };
    });

    res.json(transformedChats);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener los chats', error: err });
  }
};

export const getChatById: RequestHandler = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user?.id;
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        users: { select: { id: true, name: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!chat) {
      res.status(404).json({ message: 'Chat no encontrado' });
      return;
    }
    let title = `Chat:${chatId}`;
    if (chat.type === 'PRIVATE' && chat.users.length === 2 && userId) {
      const other = (chat.users as { id: string; name: string }[]).find((u) => u.id !== userId);
      if (other) title = other.name;
    } else if (chat.type === 'GYM' && chat.name) {
      title = chat.name;
    }
    res.json({ ...chat, title });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el chat', error: err });
  }
};

export const createChat: RequestHandler = async (req, res) => {
  try {
    const { userIds = [], type, gymId } = req.body;
    const creatorId = req.user!.id;
    const connectIds = userIds.includes(creatorId) 
      ? userIds 
      : [...userIds, creatorId];
    const newChat = await prisma.chat.create({
      data: {
        type,
        gymId,
        users: {
          connect: connectIds.map((id: string) => ({ id })),
        },
      },
      include: {
        users: true,
      },
    });
    res.status(201).json(newChat);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear el chat', error: err });
  }
};

export const getMessagesFromChat: RequestHandler = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, name: true } },
      },
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener los mensajes', error: err });
  }
};

export const sendMessageToChat: RequestHandler = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;
    const senderId = req.user?.id;
    if (!senderId) {
      res.status(401).json({ message: 'No autorizado.' });
      return;
    }
    const message = await prisma.message.create({
      data: { chatId, senderId, content },
      include: { sender: { select: { id: true, name: true } } },
    });
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { users: { select: { id: true } } },
    });
    if (!chat) {
      res.status(404).json({ message: 'Chat no encontrado' });
      return;
    }
    await prisma.$transaction(
      (chat.users as { id: string }[]).map((u) =>
        prisma.messageRead.create({
          data: {
            messageId: message.id,
            userId: u.id,
            readAt: u.id === senderId ? new Date() : null,
          },
        })
      )
    );
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Error al enviar mensaje', error: err });
  }
};

export const markMessagesAsRead: RequestHandler = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { messageIds } = req.body as { messageIds: string[] };
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'No autorizado.' });
      return;
    }
    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      res.status(400).json({ message: 'messageIds requerido' });
      return;
    }
    const updated = await prisma.messageRead.updateMany({
      where: {
        messageId: { in: messageIds },
        userId,
        message: { chatId },
        readAt: null,
      },
      data: { readAt: new Date() },
    });
    res.json({ updated: updated.count });
  } catch (err) {
    res.status(500).json({ message: 'Error al marcar como leídos', error: err });
  }
};

export const deleteChatForUser: RequestHandler = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'No autorizado.' });
      return;
    }
    // Verificar que el usuario pertenece al chat
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        users: { some: { id: userId } }
      }
    });
    if (!chat) {
      res.status(404).json({ message: 'Chat no encontrado o no tienes acceso.' });
      return;
    }
    // Marcar como eliminado para el usuario (upsert para evitar duplicados)
    await prisma.chatDelete.upsert({
      where: {
        chatId_userId: { chatId, userId }
      },
      update: {
        deletedAt: new Date()
      },
      create: {
        chatId,
        userId
      }
    });
    // Eliminar primero los MessageRead de los mensajes enviados por el usuario en este chat
    const mensajesUsuario = await prisma.message.findMany({
      where: {
        chatId,
        senderId: userId
      },
      select: { id: true }
    });
    const mensajesIds = mensajesUsuario.map((m: { id: string }) => m.id);
    if (mensajesIds.length > 0) {
      await prisma.messageRead.deleteMany({
        where: {
          messageId: { in: mensajesIds }
        }
      });
      await prisma.message.deleteMany({
        where: {
          id: { in: mensajesIds }
        }
      });
    }
    res.json({ message: 'Chat eliminado de tu lista y mensajes enviados por ti eliminados.' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar el chat', error: err });
  }
};
