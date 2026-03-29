import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  markAsPaid,
  markAsCompleted,
} from '../controllers/OrderController.js';

import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();

// 🔒 All routes require authentication
router.use(protect);

// Create order (any logged-in user)
router.post('/', createOrder);

// Get orders
router.get('/', getOrders);

// Get single order
router.get('/:id', getOrderById);

// Update order (owner or admin)
router.put('/:id', updateOrder);

router.patch('/:id/pay', protect, markAsPaid);
router.patch('/:id/complete', protect, markAsCompleted);

// Delete order (owner or admin)
router.delete('/:id', deleteOrder);

export default router;