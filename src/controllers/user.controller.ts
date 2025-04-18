import { Request, RequestHandler, Response } from 'express';
import prisma from '../../lib/prisma';

export const getUsers = async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany();
  console.log('[DEBUG] users:', users);
  res.json(users);
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({ where: { id } });
  res.json(user);
};

export const getMe: RequestHandler = async (req, res) => {
  console.log('[DEBUG] Controlador getMe ejecutado'); // Agrega este log
  try {
    console.log('[DEBUG] req.user:', req.user); // Verifica si req.user tiene datos
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Error en /me', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const { name, email, password, role, gymId } = req.body;
  const user = await prisma.user.create({
    data: { name, email, password, role, gymId },
  });
  res.status(201).json(user);
};
