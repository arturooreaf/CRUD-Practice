// Types shared with the backend.
export type Genero = 'masculino' | 'femenino' | 'otro';
export type GrupoSanguineo =
  | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface Paciente {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  genero: Genero;
  grupoSanguineo?: GrupoSanguineo;
  alergias: string[];
  createdAt: string;
  updatedAt: string;
}

// Form payload (what we send on create/update).
export type PacienteInput = Omit<
  Paciente,
  'id' | 'createdAt' | 'updatedAt'
>;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

// Generic request helper: performs the fetch and normalizes API errors.
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    ...options,
  });

  if (!res.ok) {
    let mensaje = `Error ${res.status}`;
    try {
      const body = await res.json();
      mensaje = body.error ?? mensaje;
      if (Array.isArray(body.detalles) && body.detalles.length > 0) {
        mensaje += ': ' + body.detalles
          .map((d: { campo: string; mensaje: string }) => `${d.campo} → ${d.mensaje}`)
          .join(', ');
      }
    } catch {
      /* response had no JSON body */
    }
    throw new Error(mensaje);
  }

  // 204 No Content (e.g. after a DELETE) has no body.
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// CRUD functions.
export const pacientesApi = {
  listar: () => request<Paciente[]>('/api/pacientes'),
  obtener: (id: string) => request<Paciente>(`/api/pacientes/${id}`),
  crear: (data: PacienteInput) =>
    request<Paciente>('/api/pacientes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  actualizar: (id: string, data: PacienteInput) =>
    request<Paciente>(`/api/pacientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  eliminar: (id: string) =>
    request<void>(`/api/pacientes/${id}`, { method: 'DELETE' }),
};
