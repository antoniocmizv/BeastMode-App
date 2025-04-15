import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, (req, res) => {
  res.json({
    message: 'Acceso concedido ✅',
    user: req.user,
  });
});

export default router;
