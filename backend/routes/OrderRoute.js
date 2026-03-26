import { Router } from 'express';
const router = Router();
import { createOrder, getOrders, getOrderById, updateOrder, deleteOrder } from '../controllers/OrderController.js';

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);

export default router;