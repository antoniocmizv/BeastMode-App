import { Router } from 'express';
import { getClasses, createClass } from '../controllers/class.controller';

const router = Router();

router.get('/', getClasses);
router.post('/', createClass);

export default router;
