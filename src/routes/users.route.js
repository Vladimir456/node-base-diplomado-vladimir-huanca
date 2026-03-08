import { Router } from 'express';
import userController from '../controllers/user.controller.js';
import authenticateToken from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', userController.getUsers);
router.post('/', userController.createUser);
router.get('/list/pagination', userController.getUsersPagination);

router.get('/:id', authenticateToken, userController.findUser);
router.put('/:id', authenticateToken, userController.updateUser);
router.patch('/:id', authenticateToken, userController.patchUserStatus);
router.delete('/:id', authenticateToken, userController.deleteUser);

export default router;