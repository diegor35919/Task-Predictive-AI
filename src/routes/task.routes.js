import {Router} from 'express'
import TaskController from '../controllers/task.controller.js';
import { verifyToken } from '../middlewares/jwt.middlewares.js';

const router = Router();

router.post('/', verifyToken, TaskController.create);
router.get('/', verifyToken, TaskController.getAllByUser);
router.get('/:id', verifyToken, TaskController.getOneById);
router.put('/:id', verifyToken, TaskController.updateTask);
router.delete('/:id', verifyToken, TaskController.removeTask);

export default router;