import { Router } from 'express';
import * as controller from '../controllers/pacientes.controller.js';

const router = Router();

// CRUD de pacientes
router.get('/', controller.listar); //     Listar todos
router.get('/:id', controller.obtener); // Obtener uno
router.post('/', controller.crear); //     Crear
router.put('/:id', controller.actualizar); // Actualizar
router.delete('/:id', controller.eliminar); // Eliminar

export default router;
