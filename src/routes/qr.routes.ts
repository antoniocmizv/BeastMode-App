import { Router } from 'express';
import { generateQR, validateQR, getQRServiceHealth } from '../controllers/qr.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';

const router = Router();

// Generar QR para acceso al gimnasio (usuarios autenticados)
router.post('/generate', authenticate, generateQR);

// Validar QR en la entrada (solo ADMIN/TRAINER)
router.post('/validate', authenticate, authorize('ADMIN', 'TRAINER'), validateQR);

// Verificar estado del servicio QR
router.get('/health', getQRServiceHealth);

export default router;