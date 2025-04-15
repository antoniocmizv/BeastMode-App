import { Request, Response } from 'express';
import prisma from '../../lib/prisma';

export const getSubscriptions = async (req: Request, res: Response) => {
  const user= req.user
  console.log("Usuario encontrado", user);
  const subs = await prisma.subscription.findMany({ include: { user: true } });
  res.json(subs);
};

export const getUserSubscriptions = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const subs = await prisma.subscription.findMany({ where: { userId } });
  res.json(subs);
};

export const createSubscription = async (req: Request, res: Response) => {
  const { userId, planName, price, startDate, endDate } = req.body;
  const sub = await prisma.subscription.create({
    data: {
      userId,
      planName,
      price,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive: true,
    },
  });
  res.status(201).json(sub);
};
