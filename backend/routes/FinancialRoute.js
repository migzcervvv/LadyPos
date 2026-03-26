import { Router } from 'express';
const router = Router();
import { createFinancial, getFinancials, getFinancialById, updateFinancial, deleteFinancial } from '../controllers/FinancialController.js';

router.post('/', createFinancial);
router.get('/', getFinancials);
router.get('/:id', getFinancialById);
router.put('/:id', updateFinancial);
router.delete('/:id', deleteFinancial);

export default router;