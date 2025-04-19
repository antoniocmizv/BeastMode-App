import { Request, Response } from 'express';
import prisma from '../../lib/prisma';

export const getUserChats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const chats = await prisma.chat.findMany({
      where: {
        users: { some: { id: userId } },
      },
      include: {
        users: { select: { id: true, name: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener los chats', error: err });
  }
};

export const getChatById = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        users: true,
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el chat', error: err });
  }
};

export const createChat = async (req: Request, res: Response) => {
  try {
    const { userIds, type, gymId } = req.body;

    const newChat = await prisma.chat.create({
      data: {
        type,
        gymId,
        users: {
          connect: userIds.map((id: string) => ({ id })),
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

export const getMessagesFromChat = async (req: Request, res: Response) => {
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
