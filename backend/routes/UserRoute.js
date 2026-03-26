import { Router } from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import {
    createUser,
    loginUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser
} from '../controllers/UserController.js';

const router = Router();

// Public
router.post('/register', createUser);
router.post('/login', loginUser);

// Admin only
router.get('/', protect, authorizeRoles('admin'), getUsers);

// Logged-in user OR admin
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);

// Admin only
router.delete('/:id', protect, authorizeRoles('admin'), deleteUser);

export default router;