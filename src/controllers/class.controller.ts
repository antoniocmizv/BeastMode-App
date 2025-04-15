import { Request, Response } from 'express';
import prisma from '../../lib/prisma';

export const getClasses = async (_req: Request, res: Response) => {
  const classes = await prisma.class.findMany({ include: { gym: true } });
  res.json(classes);
};

export const createClass = async (req: Request, res: Response) => {
  const { name, description, startTime, endTime, maxUsers, gymId } = req.body;
  const newClass = await prisma.class.create({
    data: { name, description, startTime, endTime, maxUsers, gymId },
  });
  res.status(201).json(newClass);
};
