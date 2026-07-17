import { prisma } from './prisma.js';
import type {
  Paciente,
  CrearPacienteDTO,
  ActualizarPacienteDTO,
} from '../types/paciente.js';

// Data-access layer. Every operation runs against PostgreSQL through Prisma.

export function listar(): Promise<Paciente[]> {
  return prisma.paciente.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export function obtener(id: string): Promise<Paciente | null> {
  return prisma.paciente.findUnique({ where: { id } });
}

export async function existeEmail(
  email: string,
  ignorarId?: string,
): Promise<boolean> {
  const encontrado = await prisma.paciente.findUnique({ where: { email } });
  return Boolean(encontrado && encontrado.id !== ignorarId);
}

export function crear(data: CrearPacienteDTO): Promise<Paciente> {
  return prisma.paciente.create({ data });
}

export async function actualizar(
  id: string,
  data: ActualizarPacienteDTO,
): Promise<Paciente | null> {
  const existe = await prisma.paciente.findUnique({ where: { id } });
  if (!existe) return null;
  return prisma.paciente.update({ where: { id }, data });
}

export async function eliminar(id: string): Promise<boolean> {
  const existe = await prisma.paciente.findUnique({ where: { id } });
  if (!existe) return false;
  await prisma.paciente.delete({ where: { id } });
  return true;
}
