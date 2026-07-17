import { PrismaClient } from '@prisma/client';

// Single shared Prisma client for the whole app (avoids opening extra connections).
export const prisma = new PrismaClient();
