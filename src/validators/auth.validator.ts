import { body } from 'express-validator';

export const registerValidator = [
  body('name').isString().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
];

export const loginValidator = [
  body('email').isEmail(),
  body('password').notEmpty(),
];
