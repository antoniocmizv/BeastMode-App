
import prisma from '../../lib/prisma';
import { Request, Response, NextFunction } from 'express';



export const getGyms = async (_req: Request, res: Response) => {
  const gyms = await prisma.gym.findMany();
  res.json(gyms);
};

export const createGym = async (req: Request, res: Response) => {
  const { name, address } = req.body;
  const gym = await prisma.gym.create({ data: { name, address } });
  res.status(201).json(gym);
};


export const deleteGym = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    await prisma.gym.delete({ where: { id } });
    res.status(204).send();
  } catch (err: any) {
   
    next(err);
  }
};