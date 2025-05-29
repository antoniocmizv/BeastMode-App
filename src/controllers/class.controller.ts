import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Guardar imágenes de clases en el servidor
const classStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/classes');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});
export const uploadClassImageMiddleware = multer({ storage: classStorage }).single('image');

export const getClasses = async (_req: Request, res: Response) => {
  const classes = await prisma.class.findMany({ include: { gym: true } });
  res.json(classes);
};

export const getClassById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const classData = await prisma.class.findUnique({
    where: { id },
    include: {
      gym: true,
      enrollments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });
  if (!classData) {
    res.status(404).json({ message: 'Clase no encontrada' });
    return;
  }

  res.json(classData);
};

export const createClass = async (req: Request, res: Response) => {
  const { name, description, startTime, endTime, maxUsers, gymId } = req.body;
  let imageUrl: string | undefined = undefined;
  if (req.file) {
    imageUrl = `/uploads/classes/${req.file.filename}`;
  }
  const newClass = await prisma.class.create({
    data: {
      name,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      maxUsers,
      gymId,
      imageUrl,
    },
    include: { gym: true },
  });
  res.status(201).json(newClass);
};

export const updateClass = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, startTime, endTime, maxUsers, gymId } = req.body;
  let imageUrl: string | undefined = undefined;
  if (req.file) {
    imageUrl = `/uploads/classes/${req.file.filename}`;
  }
  try {
    const updatedClass = await prisma.class.update({
      where: { id },
      data: {
        name,
        description,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        maxUsers,
        gymId,
        ...(imageUrl && { imageUrl }),
      },
      include: { gym: true },
    });
    res.json(updatedClass);
  } catch (error) {
    res.status(404).json({ message: 'Clase no encontrada' });
  }
};

export const deleteClass = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.class.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ message: 'Clase no encontrada' });
  }
};
