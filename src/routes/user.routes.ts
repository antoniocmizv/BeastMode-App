import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { getUsers, getUserById, createUser, getMe } from '../controllers/user.controller';

const router = Router();

router.get('/', getUsers);
router.get('/me', authenticate, getMe);
router.get('/:id', getUserById);
router.post('/', createUser);


export default router;
