import { body } from 'express-validator';

export const createSubscriptionValidator = [
  body('userId').isString().notEmpty(),
  body('planName').isString().notEmpty(),
  body('price').isFloat({ min: 0 }),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
];
