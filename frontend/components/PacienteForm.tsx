'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type {
  PacienteInput,
  Genero,
  GrupoSanguineo,
} from '@/lib/api';

const GENEROS: Genero[] = ['masculino', 'femenino', 'otro'];
const GRUPOS: GrupoSanguineo[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const VACIO: PacienteInput = {
  nombre: '',
  apellidos: '',
  email: '',
  telefono: '',
  fechaNacimiento: '',
  genero: 'femenino',
  grupoSanguineo: undefined,
  alergias: [],
};

interface Props {
  titulo: string;
  inicial?: PacienteInput;
  onSubmit: (data: PacienteInput) => Promise<void>;
}

export default function PacienteForm({ titulo, inicial, onSubmit }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<PacienteInput>(inicial ?? VACIO);
  const [alergiasTexto, setAlergiasTexto] = useState(
    (inicial?.alergias ?? []).join(', '),
  );
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof PacienteInput>(campo: K, valor: PacienteInput[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      const alergias = alergiasTexto
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean);
      await onSubmit({
        ...form,
        alergias,
        grupoSanguineo: form.grupoSanguineo || undefined,
      });
      router.push('/');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar');
      setGuardando(false);
    }
  }

  return (
    <>
      <header className="topbar">
        <div>
          <div className="brand">{titulo}</div>
          <div className="subtitle">Rellena los datos del paciente</div>
        </div>
        <Link href="/" className="btn btn-ghost">
          ← Volver
        </Link>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      <form className="form" onSubmit={handleSubmit}>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="nombre">Nombre *</label>
            <input
              id="nombre"
              value={form.nombre}
              onChange={(e) => set('nombre', e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="apellidos">Apellidos *</label>
            <input
              id="apellidos"
              value={form.apellidos}
              onChange={(e) => set('apellidos', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid-2">
          <div className="field">
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="telefono">Teléfono *</label>
            <input
              id="telefono"
              value={form.telefono}
              onChange={(e) => set('telefono', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid-2">
          <div className="field">
            <label htmlFor="fechaNacimiento">Fecha de nacimiento *</label>
            <input
              id="fechaNacimiento"
              type="date"
              value={form.fechaNacimiento}
              onChange={(e) => set('fechaNacimiento', e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="genero">Género *</label>
            <select
              id="genero"
              value={form.genero}
              onChange={(e) => set('genero', e.target.value as Genero)}
            >
              {GENEROS.map((g) => (
                <option key={g} value={g}>
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid-2">
          <div className="field">
            <label htmlFor="grupoSanguineo">Grupo sanguíneo</label>
            <select
              id="grupoSanguineo"
              value={form.grupoSanguineo ?? ''}
              onChange={(e) =>
                set(
                  'grupoSanguineo',
                  (e.target.value || undefined) as GrupoSanguineo | undefined,
                )
              }
            >
              <option value="">— Sin especificar —</option>
              {GRUPOS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="alergias">Alergias (separadas por comas)</label>
            <input
              id="alergias"
              value={alergiasTexto}
              onChange={(e) => setAlergiasTexto(e.target.value)}
              placeholder="Penicilina, Polen…"
            />
          </div>
        </div>

        <div className="form-actions">
          <Link href="/" className="btn btn-ghost">
            Cancelar
          </Link>
          <button type="submit" className="btn btn-primary" disabled={guardando}>
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </>
  );
}
