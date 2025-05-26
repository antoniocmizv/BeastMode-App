import { body } from 'express-validator';

export const generateQRValidator = [
  body('gymId').isString().notEmpty().withMessage('ID del gimnasio es requerido'),
];

export const validateQRValidator = [
  body('qrToken').isString().notEmpty().withMessage('Token QR es requerido'),
];
