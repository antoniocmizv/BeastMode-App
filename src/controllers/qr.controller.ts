import { RequestHandler } from 'express';
import prisma from '../../lib/prisma';
import crypto from 'crypto';

// Generar QR para acceso al gym
export const generateGymQR: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { gymId } = req.body;

    if (!gymId) {
      res.status(400).json({ message: 'ID del gimnasio requerido' });
      return;
    }

    // Verificar suscripción activa
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        isActive: true,
        endDate: { gte: new Date() },
      },
    });

    if (!activeSubscription) {
      res.status(403).json({ message: 'No tienes una suscripción activa' });
      return;
    }

    // Verificar que el usuario pertenece al gym o tiene acceso
    const userGym = await prisma.user.findFirst({
      where: { 
        id: userId, 
        OR: [
          { gymId: gymId },
          { role: 'ADMIN' }
        ]
      },
    });

    if (!userGym) {
      res.status(403).json({ message: 'No tienes acceso a este gimnasio' });
      return;
    }

    // Generar token único para el QR
    const qrToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos

    // Desactivar QRs anteriores no usados del mismo usuario/gym
    await prisma.gymAccess.updateMany({
      where: {
        userId,
        gymId,
        isUsed: false,
      },
      data: { isUsed: true },
    });

    // Crear nuevo registro de acceso
    const gymAccess = await prisma.gymAccess.create({
      data: {
        userId,
        gymId,
        qrToken,
        expiresAt,
      },
      include: {
        user: { select: { id: true, name: true } },
        gym: { select: { id: true, name: true } },
      },
    });

    res.json({
      qrToken,
      expiresAt,
      gymAccess,
    });
  } catch (err) {
    next(err);
  }
};

// Validar QR en la entrada del gym
export const validateGymQR: RequestHandler = async (req, res, next) => {
  try {
    const { qrToken } = req.body;

    if (!qrToken) {
      res.status(400).json({ message: 'Token QR requerido' });
      return;
    }

    const gymAccess = await prisma.gymAccess.findUnique({
      where: { qrToken },
      include: {
        user: { select: { id: true, name: true, email: true } },
        gym: { select: { id: true, name: true, address: true } },
      },
    });

    if (!gymAccess) {
      res.status(404).json({ message: 'QR inválido' });
      return;
    }

    if (gymAccess.isUsed) {
      res.status(400).json({ 
        message: 'QR ya fue utilizado',
        usedAt: gymAccess.usedAt
      });
      return;
    }

    if (new Date() > gymAccess.expiresAt) {
      res.status(400).json({ 
        message: 'QR expirado',
        expiresAt: gymAccess.expiresAt
      });
      return;
    }

    // Marcar como usado
    await prisma.gymAccess.update({
      where: { id: gymAccess.id },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });

    res.json({
      message: '✅ Acceso autorizado',
      user: gymAccess.user,
      gym: gymAccess.gym,
      accessTime: new Date(),
    });
  } catch (err) {
    next(err);
  }
};

// Obtener historial de accesos del usuario autenticado
export const getAccessHistory: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user!.id;

    const history = await prisma.gymAccess.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        gym: { select: { name: true, address: true } },
      },
    });

    res.json(history);
  } catch (err) {
    next(err);
  }
};

// Obtener estadísticas de acceso para admins/trainers
export const getGymAccessStats: RequestHandler = async (req, res, next) => {
  try {
    const { gymId } = req.params;
    const userRole = req.user!.role;

    // Solo admins y trainers pueden ver estadísticas
    if (userRole !== 'ADMIN' && userRole !== 'TRAINER') {
      res.status(403).json({ message: 'No tienes permisos para ver estas estadísticas' });
      return;
    }

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Estadísticas del día actual
    const todayStats = await prisma.gymAccess.findMany({
      where: {
        gymId,
        isUsed: true,
        usedAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { usedAt: 'desc' },
    });

    // Total de accesos históricos
    const totalAccesses = await prisma.gymAccess.count({
      where: {
        gymId,
        isUsed: true,
      },
    });

    // Accesos únicos del día (usuarios únicos)
    const uniqueUsersToday = new Set(todayStats.map(access => access.userId)).size;

    res.json({
      todayAccesses: todayStats.length,
      uniqueUsersToday,
      totalHistoricalAccesses: totalAccesses,
      todayAccessDetails: todayStats,
    });
  } catch (err) {
    next(err);
  }
};
