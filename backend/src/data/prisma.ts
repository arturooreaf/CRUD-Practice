import { PrismaClient } from '@prisma/client';

// Cliente Prisma único para toda la app (evita abrir conexiones de más).
export const prisma = new PrismaClient();
