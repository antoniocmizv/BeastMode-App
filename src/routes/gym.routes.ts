import { Router } from 'express';
import { getGyms, createGym } from '../controllers/gym.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';

const router = Router();

// Ruta pública
router.get('/', getGyms);

// Ruta protegida (solo ADMIN puede crear gimnasios)
router.post('/', authenticate, authorize('ADMIN'), createGym);

export default router;
