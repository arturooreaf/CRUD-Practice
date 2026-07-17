import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Datos de ejemplo para no arrancar con la BD vacía.
// `upsert` por email => se puede ejecutar varias veces sin duplicar.
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

  console.log(`✅ Seed completado: ${pacientes.length} pacientes.`);
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
