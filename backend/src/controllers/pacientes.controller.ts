import type { Request, Response, NextFunction } from 'express';
import * as store from '../data/store.js';
import { HttpError } from '../middleware/errorHandler.js';
import {
  crearPacienteSchema,
  actualizarPacienteSchema,
} from '../types/paciente.js';

// GET /api/pacientes
export async function listar(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await store.listar());
  } catch (err) {
    next(err);
  }
}

// GET /api/pacientes/:id
export async function obtener(req: Request, res: Response, next: NextFunction) {
  try {
    const paciente = await store.obtener(req.params.id);
    if (!paciente) throw new HttpError(404, 'Paciente no encontrado');
    res.json(paciente);
  } catch (err) {
    next(err);
  }
}

// POST /api/pacientes
export async function crear(req: Request, res: Response, next: NextFunction) {
  try {
    const data = crearPacienteSchema.parse(req.body);
    if (await store.existeEmail(data.email)) {
      throw new HttpError(409, 'Ya existe un paciente con ese email');
    }
    const nuevo = await store.crear(data);
    res.status(201).json(nuevo);
  } catch (err) {
    next(err);
  }
}

// PUT /api/pacientes/:id
export async function actualizar(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = actualizarPacienteSchema.parse(req.body);
    if (data.email && (await store.existeEmail(data.email, req.params.id))) {
      throw new HttpError(409, 'Ya existe otro paciente con ese email');
    }
    const actualizado = await store.actualizar(req.params.id, data);
    if (!actualizado) throw new HttpError(404, 'Paciente no encontrado');
    res.json(actualizado);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/pacientes/:id
export async function eliminar(req: Request, res: Response, next: NextFunction) {
  try {
    const ok = await store.eliminar(req.params.id);
    if (!ok) throw new HttpError(404, 'Paciente no encontrado');
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
