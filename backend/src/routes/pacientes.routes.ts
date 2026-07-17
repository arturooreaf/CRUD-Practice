import { Router } from 'express';
import * as controller from '../controllers/pacientes.controller.js';

const router = Router();

// Patient CRUD
router.get('/', controller.listar); //        List all
router.get('/:id', controller.obtener); //     Get one
router.post('/', controller.crear); //         Create
router.put('/:id', controller.actualizar); //  Update
router.delete('/:id', controller.eliminar); // Delete

export default router;
