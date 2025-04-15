import { Router } from 'express';
import { getGyms, createGym } from '../controllers/gym.controller';

const router = Router();

router.get('/', getGyms);
router.post('/', createGym);

export default router;
