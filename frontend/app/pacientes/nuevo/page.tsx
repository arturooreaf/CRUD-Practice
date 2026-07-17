'use client';

import PacienteForm from '@/components/PacienteForm';
import { pacientesApi, type PacienteInput } from '@/lib/api';

export default function NuevoPacientePage() {
  async function crear(data: PacienteInput) {
    await pacientesApi.crear(data);
  }

  return <PacienteForm titulo="Nuevo paciente" onSubmit={crear} />;
}
