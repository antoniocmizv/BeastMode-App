import { Router } from 'express';
import { getGyms, createGym } from '../controllers/gym.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { createGymValidator } from '../validators/gym.validator';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();

// Ruta pública
router.get('/', getGyms);

// Ruta protegida (solo ADMIN puede crear gimnasios)
router.post('/', authenticate, authorize('ADMIN'), createGymValidator, validateRequest, createGym);

export default router;
