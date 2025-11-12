import {Router} from 'express'
import UserController  from '../controllers/user.controller.js';
import { verifyToken } from '../middlewares/jwt.middlewares.js';

// 2. Importar el middleware de errores (creado abajo)
const router = Router();

router.post('/register',UserController.register)
router.post('/login', UserController.login)
router.get('/profile', verifyToken, UserController.profile)

export default router;


