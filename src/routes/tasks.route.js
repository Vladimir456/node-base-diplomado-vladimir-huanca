import { Router } from 'express';
import tasksController from '../controllers/tasks.controller.js';

const router = Router();

router.get('/', tasksController.getTasks);
router.post('/', tasksController.createTask);
router.get('/:id', tasksController.findTask);
router.put('/:id', tasksController.updateTask);
router.patch('/:id', tasksController.patchTaskDone);
router.delete('/:id', tasksController.deleteTask);

export default router;