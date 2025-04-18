import { Router } from 'express';
import { getUsers, getUserById, createUser, getMe } from '../controllers/user.controller';
import { createUserValidator } from '../validators/user.validator';
import { validateRequest } from '../middlewares/validateRequest';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getUsers);
router.get('/me', authenticate, getMe);
router.get('/:id', getUserById);
router.post('/', createUserValidator, validateRequest, createUser);

export default router;
