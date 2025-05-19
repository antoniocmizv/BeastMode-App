// src/routes/ai.routes.ts
import { Router } from 'express';
import { consultarIA } from '../controllers/ai.controller';

const router = Router();

router.post('/consultar', consultarIA);

export default router;
