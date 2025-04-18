import { RequestHandler } from 'express';

export const authorize = (...allowedRoles: string[]): RequestHandler => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ message: 'No autorizado' });
      return;
    }

    next();
  };
};
