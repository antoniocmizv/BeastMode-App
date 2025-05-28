import { body } from 'express-validator';

export const createUserValidator = [
  body('name').isString().notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('phone').isString().notEmpty(),
  body('role').optional().isIn(['USER', 'ADMIN', 'TRAINER']),
  body('gymId').optional().isString(),
];
