import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../../lib/prisma';
import { generateToken } from '../utils/jwt';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, gymId } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });



    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: 'USER',
        gymId,
      },
    });

    const token = generateToken({ id: user.id, role: user.role, gymId: user.gymId });

    res.status(201).json({ user: { id: user.id, email: user.email }, token });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        gymId: true, 
      },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ message: 'Invalid password' });
      return;
    }

    const token = generateToken({ id: user.id, role: user.role, gymId: user.gymId });

    res.json({ user: { id: user.id, email: user.email }, token });
  } catch (error) {
    next(error);
  }
};