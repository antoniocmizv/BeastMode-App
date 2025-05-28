import { Router } from 'express';
import { 
  getClasses, 
  getClassById, 
  createClass, 
  updateClass, 
  deleteClass 
} from '../controllers/class.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { createClassValidator } from '../validators/class.validator';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();

// Rutas públicas
router.get('/', getClasses);
router.get('/:id', getClassById);

// Rutas protegidas (TRAINER y ADMIN)
router.post('/', authenticate, authorize('TRAINER', 'ADMIN'), createClassValidator, validateRequest, createClass);
router.put('/:id', authenticate, authorize('TRAINER', 'ADMIN'), createClassValidator, validateRequest, updateClass);
router.delete('/:id', authenticate, authorize('TRAINER', 'ADMIN'), deleteClass);

export default router;
