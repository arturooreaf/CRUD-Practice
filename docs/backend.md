# Backend

Express + TypeScript REST API for the `pacientes` resource. Source lives in
`backend/src`, organized by responsibility.

## Module map

| Path | Responsibility |
|------|----------------|
| `src/index.ts` | App bootstrap: middleware, route mounting, server start |
| `src/routes/pacientes.routes.ts` | Maps URLs + verbs to controller handlers |
| `src/controllers/pacientes.controller.ts` | Validation, orchestration, responses |
| `src/data/prisma.ts` | Shared Prisma client instance |
| `src/data/store.ts` | Query functions against PostgreSQL |
| `src/middleware/errorHandler.ts` | Central error mapping + 404 fallback |
| `src/types/paciente.ts` | Zod schemas and derived DTO types |

## Bootstrap (`index.ts`)

Registers global middleware (`cors`, `express.json`), a `/health` endpoint, the
patient router under `/api/pacientes`, and finally the 404 and error-handling
middleware (order matters — error handlers must be last). Listens on
`process.env.PORT` or `3001`.

## Routing

```ts
router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.post('/', controller.crear);
router.put('/:id', controller.actualizar);
router.delete('/:id', controller.eliminar);
```

The router only dispatches; business logic lives in the controller.

## Validation and types (`types/paciente.ts`)

Zod schemas define the input contract once and derive the TypeScript types:

- `crearPacienteSchema` — required fields with constraints (non-empty name,
  valid email, valid date, gender enum, optional blood group, allergy list).
- `actualizarPacienteSchema` — `crearPacienteSchema.partial()`; every field
  optional for updates.
- `CrearPacienteDTO` / `ActualizarPacienteDTO` — inferred from the schemas.
- `Paciente` — re-exported from the Prisma client (single source of truth).

## Controllers

Each handler is `async`, wraps its body in `try/catch`, and forwards errors via
`next(err)` so the central handler can format the response. Responsibilities:

- Parse and validate `req.body` with the relevant Zod schema.
- Enforce business rules (e.g. unique email → `409`).
- Delegate persistence to `store`.
- Return the appropriate status code (`200`, `201`, `204`, `404`, `409`).

## Persistence (`data/`)

`prisma.ts` exposes a single `PrismaClient`. `store.ts` contains the query
functions (`listar`, `obtener`, `existeEmail`, `crear`, `actualizar`,
`eliminar`). All are `async` and return Prisma-typed results; no raw SQL is
written by hand.

## Error handling (`middleware/errorHandler.ts`)

A single middleware maps errors to HTTP responses:

| Error | Response |
|-------|----------|
| `ZodError` | `400` with per-field details |
| `HttpError` | its own status + message |
| Prisma `P2002` (unique) | `409` |
| Prisma `P2025` (not found) | `404` |
| Prisma `P1001` (unreachable DB) | `503` |
| anything else | `500` |

`HttpError` is a small `Error` subclass carrying an HTTP status, letting
controllers throw semantically (`throw new HttpError(404, ...)`).

## Endpoint reference

Base path: `/api/pacientes`

| Method | Path | Body | Success | Errors |
|--------|------|------|---------|--------|
| GET | `/` | — | `200` array | — |
| GET | `/:id` | — | `200` object | `404` |
| POST | `/` | patient | `201` object | `400`, `409` |
| PUT | `/:id` | partial patient | `200` object | `400`, `404`, `409` |
| DELETE | `/:id` | — | `204` | `404` |

Health probe: `GET /health` → `{ "status": "ok" }`.

### Example

```bash
curl -X POST http://localhost:3001/api/pacientes \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "María",
    "apellidos": "Pérez Gil",
    "email": "maria.perez@example.com",
    "telefono": "600555666",
    "fechaNacimiento": "1992-03-21",
    "genero": "femenino",
    "grupoSanguineo": "B+",
    "alergias": ["Polen"]
  }'
```

## Scripts

| Script | Action |
|--------|--------|
| `npm run dev` | Start with hot reload (`tsx watch`) |
| `npm run build` | `prisma generate` + `tsc` to `dist/` |
| `npm start` | Run the compiled build |
| `npm run db:migrate` | Apply migrations in development |
| `npm run db:seed` | Insert sample data |
| `npm run db:studio` | Open Prisma Studio |
