import { Router } from 'express';
import { StatsController } from '../controllers/stats.controller.js';
import { verifyToken } from '../middlewares/jwt.middlewares.js'; // ¡Importante!

const router = Router();

// GET /api/v1/stats
// Esta ruta está protegida por el token y llama al controlador de stats.
router.get('/stats', verifyToken, StatsController.getHistory);

export default router;