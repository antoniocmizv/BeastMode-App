import { body } from 'express-validator';

export const createClassValidator = [
  body('name').isString().notEmpty(),
  body('description').optional().isString(),
  body('startTime').isISO8601().withMessage('startTime debe ser una fecha válida'),
  body('endTime').isISO8601().withMessage('endTime debe ser una fecha válida'),
  body('maxUsers').isInt({ min: 1 }),
  body('gymId').isString().notEmpty(),
];
