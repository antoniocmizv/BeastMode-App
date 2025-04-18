import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';

export const validateRequest: RequestHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      message: 'Validación fallida',
      errors: errors.array(),
    });
    return;             // corta la ejecución pero no devuelve Response
  }
  next();
};