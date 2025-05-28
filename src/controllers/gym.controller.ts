
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

export const updateGym = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, address } = req.body;
  const gym = await prisma.gym.update({
    where: { id },
    data: { name, address },
  });
  res.json(gym);
};

export const getGymIds = async (_req: Request, res: Response) => {
  const gyms = await prisma.gym.findMany({
    select: {
      id: true,
      name: true,
    },
  });
  res.json(gyms);
}

export const getGymById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const gym = await prisma.gym.findUnique({
    where: { id },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!gym) {
    res.status(404).json({ message: 'Gimnasio no encontrado' });
    return;
  }

  res.json(gym);
};
