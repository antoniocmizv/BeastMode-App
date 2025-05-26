import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export interface JwtPayload {
  id: string;
  role: string;
  gymId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  console.log('[DEBUG] Middleware authenticate ejecutado'); // Agrega este log
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token no proporcionado' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    console.log('[DEBUG] Payload decodificado:', payload); // Agrega este log
    req.user = payload;
    next();
  } catch (err) {
    console.error('[DEBUG] Error al verificar el token:', err); // Agrega este log
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};