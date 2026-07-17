'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { pacientesApi, type Paciente } from '@/lib/api';

export default function HomePage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      setPacientes(await pacientesApi.listar());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function eliminar(p: Paciente) {
    if (!confirm(`¿Eliminar a ${p.nombre} ${p.apellidos}?`)) return;
    try {
      await pacientesApi.eliminar(p.id);
      setPacientes((prev) => prev.filter((x) => x.id !== p.id));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al eliminar');
    }
  }

  return (
    <>
      <header className="topbar">
        <div>
          <div className="brand">
            Health<span>CRUD</span>
          </div>
          <div className="subtitle">Gestión de pacientes</div>
        </div>
        <Link href="/pacientes/nuevo" className="btn btn-primary">
          + Nuevo paciente
        </Link>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        {cargando ? (
          <div className="loading">Cargando pacientes…</div>
        ) : pacientes.length === 0 ? (
          <div className="empty">
            No hay pacientes todavía. Crea el primero con “Nuevo paciente”.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th className="hide-sm">Email</th>
                <th className="hide-sm">Teléfono</th>
                <th>Grupo</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>
                      {p.nombre} {p.apellidos}
                    </strong>
                  </td>
                  <td className="hide-sm">{p.email}</td>
                  <td className="hide-sm">{p.telefono}</td>
                  <td>
                    {p.grupoSanguineo ? (
                      <span className="tag">{p.grupoSanguineo}</span>
                    ) : (
                      <span style={{ color: 'var(--muted)' }}>—</span>
                    )}
                  </td>
                  <td>
                    <div className="actions">
                      <Link
                        href={`/pacientes/${p.id}/editar`}
                        className="btn btn-ghost"
                      >
                        Editar
                      </Link>
                      <button
                        className="btn btn-danger"
                        onClick={() => eliminar(p)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
