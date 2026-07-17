'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PacienteForm from '@/components/PacienteForm';
import { pacientesApi, type PacienteInput } from '@/lib/api';

export default function EditarPacientePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [inicial, setInicial] = useState<PacienteInput | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    pacientesApi
      .obtener(id)
      .then((p) => {
        // Nos quedamos solo con los campos del formulario.
        const { id: _id, createdAt, updatedAt, ...resto } = p;
        setInicial(resto);
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : 'Error al cargar el paciente'),
      );
  }, [id]);

  async function actualizar(data: PacienteInput) {
    await pacientesApi.actualizar(id, data);
  }

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!inicial) return <div className="loading">Cargando…</div>;

  return (
    <PacienteForm
      titulo="Editar paciente"
      inicial={inicial}
      onSubmit={actualizar}
    />
  );
}
