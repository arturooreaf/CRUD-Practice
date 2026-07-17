-- CreateEnum
CREATE TYPE "Genero" AS ENUM ('masculino', 'femenino', 'otro');

-- CreateTable
CREATE TABLE "pacientes" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "fechaNacimiento" TEXT NOT NULL,
    "genero" "Genero" NOT NULL,
    "grupoSanguineo" TEXT,
    "alergias" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pacientes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pacientes_email_key" ON "pacientes"("email");
