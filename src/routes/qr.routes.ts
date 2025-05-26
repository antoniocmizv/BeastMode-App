import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validateRequest';
import { generateQRValidator, validateQRValidator } from '../validators/qr.validator';
import {
  generateGymQR,
  validateGymQR,
  getAccessHistory,
  getGymAccessStats,
} from '../controllers/qr.controller';

const router = Router();

// Generar QR para acceso al gym (usuarios autenticados)
router.post('/generate', authenticate, generateQRValidator, validateRequest, generateGymQR);

// Validar QR en la entrada del gym (personal del gym - ADMIN/TRAINER)
router.post('/validate', authenticate, authorize('ADMIN', 'TRAINER'), validateQRValidator, validateRequest, validateGymQR);

// Obtener historial de accesos del usuario autenticado
router.get('/history', authenticate, getAccessHistory);

// Obtener estadísticas de acceso del gym (ADMIN/TRAINER)
router.get('/stats/:gymId', authenticate, authorize('ADMIN', 'TRAINER'), getGymAccessStats);

export default router;
