import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sample data so the database isn't empty on first run.
// Uses upsert keyed by email, so it can run repeatedly without duplicating rows.
async function main() {
  const pacientes = [
    {
      nombre: 'Ana',
      apellidos: 'García López',
      email: 'ana.garcia@example.com',
      telefono: '600111222',
      fechaNacimiento: '1990-05-14',
      genero: 'femenino' as const,
      grupoSanguineo: 'A+',
      alergias: ['Penicilina'],
    },
    {
      nombre: 'Luis',
      apellidos: 'Martín Ruiz',
      email: 'luis.martin@example.com',
      telefono: '600333444',
      fechaNacimiento: '1985-11-02',
      genero: 'masculino' as const,
      grupoSanguineo: 'O-',
      alergias: [],
    },
  ];

  for (const p of pacientes) {
    await prisma.paciente.upsert({
      where: { email: p.email },
      update: {},
      create: p,
    });
  }

  console.log(`Seed complete: ${pacientes.length} patients.`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
