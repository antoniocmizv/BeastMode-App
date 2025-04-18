import { ErrorRequestHandler } from 'express';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error('[ERROR]', err);

  if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        res.status(409).json({ message: 'Valor duplicado', meta: err.meta });
        return;
      case 'P2025':
        res.status(404).json({ message: 'Recurso no encontrado', meta: err.meta });
        return;
      default:
        res.status(400).json({ message: 'Error de base de datos', meta: err.meta });
        return;
    }
  }

  if (err instanceof PrismaClientValidationError) {
    res.status(400).json({ message: 'Error de validación Prisma', details: err.message });
    return;
  }

  res.status(500).json({ message: err.message || 'Error interno del servidor' });
};
