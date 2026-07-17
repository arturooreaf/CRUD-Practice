import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

// Custom error type so controllers can throw specific HTTP status codes.
export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// Central error-handling middleware. Express identifies it by its 4 arguments.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Datos no válidos',
      detalles: err.issues.map((i) => ({
        campo: i.path.join('.'),
        mensaje: i.message,
      })),
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }

  // Known Prisma errors (identified by their Pxxxx code).
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const code = (err as { code: string }).code;
    if (code === 'P2002') {
      return res
        .status(409)
        .json({ error: 'Ya existe un registro con ese valor único (email)' });
    }
    if (code === 'P2025') {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    if (code === 'P1001') {
      return res
        .status(503)
        .json({ error: 'No se puede conectar con la base de datos' });
    }
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({ error: 'Error interno del servidor' });
}

// Fallback handler for unknown routes.
export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: 'Ruta no encontrada' });
}
