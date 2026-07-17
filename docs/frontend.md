# Frontend

Next.js (App Router) client written in TypeScript. It consumes the REST API and
provides list, create, edit, and delete views for patients.

## Structure

```
app/
  layout.tsx                    Root layout (shared shell, global styles)
  page.tsx                      Patient list + delete
  globals.css                   Styling
  pacientes/
    nuevo/page.tsx              Create view
    [id]/editar/page.tsx        Edit view (dynamic route)
components/
  PacienteForm.tsx              Shared create/edit form
lib/
  api.ts                        Typed API client + domain types
```

Routes are defined by folder structure. `[id]` is a dynamic segment resolved via
`useParams`.

## API client (`lib/api.ts`)

Centralizes all backend communication so components never call `fetch` directly.

- Exposes `pacientesApi` with `listar`, `obtener`, `crear`, `actualizar`,
  `eliminar` — one method per endpoint.
- A generic `request<T>` helper sets JSON headers, disables caching, and
  normalizes error responses (reading the API's `error` / `detalles` payload
  into a thrown `Error`). `204` responses resolve without a body.
- Declares the shared domain types (`Paciente`, `PacienteInput`, `Genero`,
  `GrupoSanguineo`) used across the UI.

## List view (`app/page.tsx`)

Client component that fetches patients on mount, holds them in state, renders the
table, and handles deletion (with confirmation) by calling the API and updating
local state optimistically.

## Shared form (`components/PacienteForm.tsx`)

A single controlled form reused for both create and edit. It is agnostic to the
operation: it receives an optional `inicial` value and an `onSubmit` callback,
collects the fields into state, and delegates the actual API call to the caller.
Allergies are edited as a comma-separated string and normalized to an array on
submit.

## Create and edit views

- **Create** (`pacientes/nuevo`) renders `PacienteForm` with an `onSubmit` that
  calls `pacientesApi.crear`.
- **Edit** (`pacientes/[id]/editar`) reads the `id` from the route, fetches the
  current record to prefill the form, and submits via `pacientesApi.actualizar`.

The shared form keeps the two views minimal and avoids duplicating field markup.

## Configuration

`NEXT_PUBLIC_API_URL` (in `frontend/.env.local`) points the client at the API;
it defaults to `http://localhost:3001`.
