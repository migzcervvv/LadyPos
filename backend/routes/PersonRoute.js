import { Router } from 'express';
const router = Router();
import { createPerson, getPeople, getPersonById, updatePerson, deletePerson } from '../controllers/PersonController.js';

router.post('/', createPerson);
router.get('/', getPeople);
router.get('/:id', getPersonById);
router.put('/:id', updatePerson);
router.delete('/:id', deletePerson);

export default router;