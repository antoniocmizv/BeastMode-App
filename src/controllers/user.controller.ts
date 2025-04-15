import { Request, Response } from 'express';
import prisma from '../../lib/prisma';

export const getUsers = async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany();
  res.json(users);
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({ where: { id } });
  res.json(user);
};

export const createUser = async (req: Request, res: Response) => {
  const { name, email, password, role, gymId } = req.body;
  const user = await prisma.user.create({
    data: { name, email, password, role, gymId },
  });
  res.status(201).json(user);
};
