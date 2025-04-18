import { body } from 'express-validator';

export const createGymValidator = [
  body('name').isString().notEmpty(),
  body('address').isString().notEmpty(),
];
