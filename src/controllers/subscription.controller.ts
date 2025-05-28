import { Request, Response } from 'express';
import prisma from '../../lib/prisma';

export const getSubscriptions = async (req: Request, res: Response) => {
  const user = req.user;
  console.log("Usuario encontrado", user);
  const subs = await prisma.subscription.findMany({ include: { user: true } });
  res.json(subs);
};

export const getSubscriptionById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const subscription = await prisma.subscription.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!subscription) {
    res.status(404).json({ message: 'Suscripción no encontrada' });
    return;
  }

  res.json(subscription);
};

export const getUserSubscriptions = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const subs = await prisma.subscription.findMany({ 
    where: { userId },
    include: { user: true },
    orderBy: { startDate: 'desc' },
  });
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
    include: { user: true },
  });
  res.status(201).json(sub);
};

export const updateSubscription = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { planName, price, startDate, endDate, isActive } = req.body;
  
  try {
    const updatedSubscription = await prisma.subscription.update({
      where: { id },
      data: {
        planName,
        price,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isActive,
      },
      include: { user: true },
    });
    res.json(updatedSubscription);
  } catch (error) {
    res.status(404).json({ message: 'Suscripción no encontrada' });
  }
};

export const deleteSubscription = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    await prisma.subscription.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ message: 'Suscripción no encontrada' });
  }
};
