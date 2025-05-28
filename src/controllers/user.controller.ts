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
        gymId: true, 
        gym: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    // Generar nuevo token JWT con el estado actual del usuario
    // Si no tiene gymId, no lo incluimos en el payload
    const { id, role, gymId } = user;
    const { generateToken } = await import('../utils/jwt');
    const tokenPayload: any = { id, role };
    if (gymId) tokenPayload.gymId = gymId;
    const token = generateToken(tokenPayload);

    res.json({ user, token });
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

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, password, role, gymId } = req.body;
  const user = await prisma.user.update({
    where: { id },
    data: { name, email, password, role, gymId },
  });
  res.json(user);
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.user.delete({ where: { id } });
  res.status(204).send();
};

export const getUserByEmail = async (req: Request, res: Response) => {
  const { email } = req.params;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }
  res.json(user);
};

export const getUserByGymId = async (req: Request, res: Response) => {
  const { gymId } = req.params;
  const users = await prisma.user.findMany({ where: { gymId } });
  if (users.length === 0) {
    return res.status(404).json({ message: 'No se encontraron usuarios para este gimnasio' });
  }
  res.json(users);
};

