import { Router } from 'express';
import { 
  getGyms, 
  createGym, 
  deleteGym, 
  updateGym, 
  getGymById, 
  getGymIds 
} from '../controllers/gym.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { createGymValidator } from '../validators/gym.validator';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();

// Rutas públicas
router.get('/', getGyms);
router.get('/ids', getGymIds);
router.get('/:id', getGymById);

// Rutas protegidas (solo ADMIN)
router.post('/', authenticate, authorize('ADMIN'), createGymValidator, validateRequest, createGym);
router.put('/:id', authenticate, authorize('ADMIN'), createGymValidator, validateRequest, updateGym);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteGym);

export default router;
