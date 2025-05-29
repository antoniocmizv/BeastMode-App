import { Request, RequestHandler, Response } from 'express';
import prisma from '../../lib/prisma';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

export const getUsers = async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany();
  console.log('[DEBUG] users:', users);
  res.json(users);
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      gymId: true,
      avatarUrl: true,
    },
  });
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
        phone: true,
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
  const { name, email, password, phone, role, gymId } = req.body;
  const user = await prisma.user.create({
    data: { name, email, password, phone, role, gymId },
  });
  res.status(201).json(user);
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, password, phone, role, gymId } = req.body;
  const user = await prisma.user.update({
    where: { id },
    data: { name, email, password, phone, role, gymId },
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
    res.status(404).json({ message: 'Usuario no encontrado' });
    return;
  }
  res.json(user);
};

export const getUserByGymId = async (req: Request, res: Response) => {
  const { gymId } = req.params;
  const users = await prisma.user.findMany({ where: { gymId } });
  if (users.length === 0) {
    res.status(404).json({ message: 'No se encontraron usuarios para este gimnasio' });
    return;
  }
  res.json(users);
};

// Configuración de Multer para guardar imágenes en /uploads/avatars
// Tipado explícito para los parámetros de Multer
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadPath = path.join(__dirname, '../../uploads/avatars');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.params.id}${ext}`);
  },
});
const upload = multer({ storage });

// Middleware para la ruta de avatar
export const uploadAvatarMiddleware = upload.single('avatar');

// Handler para subir avatar
export const uploadAvatar: RequestHandler = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    if (!req.file) {
      res.status(400).json({ message: 'No se subió ninguna imagen.' });
      return;
    }
    const { id } = req.params;
    // @ts-ignore
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const user = await prisma.user.update({
      where: { id },
      data: { avatarUrl },
    });
    res.json({ avatarUrl: user.avatarUrl });
  } catch (error) {
    res.status(500).json({ message: 'Error al subir el avatar', error });
  }
};

