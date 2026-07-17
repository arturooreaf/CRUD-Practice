import { z } from 'zod';

// --- Esquemas de validación (Zod) ---
// Definimos las reglas de los datos una sola vez y de ahí derivamos los tipos.

export const generoSchema = z.enum(['masculino', 'femenino', 'otro']);

export const grupoSanguineoSchema = z.enum([
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-',
]);

// Campos que envía el cliente al crear un paciente.
export const crearPacienteSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio').max(100),
  apellidos: z.string().min(1, 'Los apellidos son obligatorios').max(150),
  email: z.string().email('Email no válido'),
  telefono: z.string().min(6, 'Teléfono no válido').max(20),
  fechaNacimiento: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), 'Fecha de nacimiento no válida'),
  genero: generoSchema,
  grupoSanguineo: grupoSanguineoSchema.optional(),
  alergias: z.array(z.string()).default([]),
});

// Al actualizar, todos los campos son opcionales (PATCH-like sobre PUT).
export const actualizarPacienteSchema = crearPacienteSchema.partial();

// --- Tipos derivados ---
export type CrearPacienteDTO = z.infer<typeof crearPacienteSchema>;
export type ActualizarPacienteDTO = z.infer<typeof actualizarPacienteSchema>;

// El tipo de la entidad lo genera Prisma a partir del schema (fuente de verdad).
// createdAt/updatedAt son Date; se serializan a string ISO al hacer res.json().
export type { Paciente } from '@prisma/client';
