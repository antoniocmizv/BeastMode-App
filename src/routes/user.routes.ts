import { Router } from 'express';
import { 
  getUsers, 
  getUserById, 
  createUser, 
  getMe, 
  updateUser, 
  deleteUser, 
  getUserByEmail, 
  getUserByGymId 
} from '../controllers/user.controller';
import { createUserValidator } from '../validators/user.validator';
import { validateRequest } from '../middlewares/validateRequest';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';

const router = Router();

router.get('/', getUsers);
router.get('/me', authenticate, getMe);
router.get('/email/:email', getUserByEmail);
router.get('/gym/:gymId', getUserByGymId);
router.get('/:id', getUserById);
router.post('/', createUserValidator, validateRequest, createUser);
router.put('/:id', authenticate, authorize('ADMIN'), updateUser);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteUser);

export default router;
