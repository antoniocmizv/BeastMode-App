import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getAll = () => {
  return prisma.subscription.findMany({
    include: { user: true },
  });
};

export const getByUserId = (userId: string) => {
  return prisma.subscription.findMany({
    where: { userId },
    orderBy: { startDate: 'desc' },
  });
};

export const create = (data: {
  userId: string;
  planName: string;
  price: number;
  startDate: Date;
  endDate: Date;
}) => {
  return prisma.subscription.create({
    data: {
      ...data,
      isActive: true,
    },
  });
};
