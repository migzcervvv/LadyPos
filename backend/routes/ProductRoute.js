import { Router } from 'express';
const router = Router();
import { createProduct, getProducts, getProductById, updateProduct, deleteProduct } from '../controllers/ProductController.js';

router.post('/', createProduct);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;