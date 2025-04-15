import { Request, Response } from 'express';
import prisma from '../../lib/prisma';

export const getGyms = async (_req: Request, res: Response) => {
  const gyms = await prisma.gym.findMany();
  res.json(gyms);
};

export const createGym = async (req: Request, res: Response) => {
  const { name, address } = req.body;
  const gym = await prisma.gym.create({ data: { name, address } });
  res.status(201).json(gym);
};
