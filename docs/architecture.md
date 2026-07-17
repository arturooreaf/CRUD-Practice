# Architecture

## Overview

The system is split into three independently running processes:

```
Next.js client  ──HTTP/JSON──▶  Express API  ──Prisma/SQL──▶  PostgreSQL
 localhost:3000                 localhost:3001                localhost:5432
```

- **Client** — Next.js (App Router) SPA-style UI that consumes the REST API.
- **API** — Express + TypeScript service exposing a CRUD resource (`pacientes`).
- **Database** — PostgreSQL, accessed exclusively through Prisma.

Separating the client and API keeps concerns isolated, allows either side to
evolve independently, and leaves the door open to additional clients (e.g. a
mobile app) against the same API.

## Backend layering

The API follows a conventional layered structure; each module has a single
responsibility:

```
routes/        HTTP route definitions (URL + method → handler)
controllers/   Request handling: validation, orchestration, HTTP responses
data/          Persistence layer (Prisma client + query functions)
middleware/    Cross-cutting concerns (error handling)
types/         Domain schemas (Zod) and derived types
```

Request flow through the layers:

```
index.ts → routes → controller → data (Prisma) → PostgreSQL
                          │
                          └─ on failure → middleware/errorHandler → HTTP error
```

## Request lifecycle (create a patient)

1. The client submits the form; `lib/api.ts` issues `POST /api/pacientes` with a
   JSON body.
2. Express parses the body (`express.json`) and routes to `controller.crear`.
3. The controller validates the payload with Zod. Invalid input short-circuits
   to a `400` with per-field detail.
4. A uniqueness check on `email` returns `409` on conflict.
5. The record is persisted via Prisma; PostgreSQL assigns timestamps.
6. The API responds `201` with the created resource.
7. The client navigates back to the list, which reflects the new record.

The other operations follow the same pattern with different verbs and queries.

## Key design decisions

- **Prisma as the ORM** — type-safe queries and a schema-driven, versioned
  migration workflow. The generated `Paciente` type is the single source of
  truth for the entity shape.
- **Zod for validation** — one schema defines both runtime validation and the
  static `CrearPacienteDTO` / `ActualizarPacienteDTO` types, avoiding drift.
- **Centralized error handling** — a single middleware maps `ZodError`,
  application `HttpError`, and known Prisma error codes to consistent HTTP
  responses.
- **`fechaNacimiento` stored as text** — kept as `YYYY-MM-DD` to match the
  client's date-input contract and avoid timezone conversions. A production
  system would use a native `date` column.
- **Spanish domain language** — entity and field names (`paciente`, `nombre`,
  `apellidos`, …) intentionally use the business vocabulary.

## Technology stack

| Layer | Technology |
|-------|------------|
| Client | Next.js (App Router), React, TypeScript |
| API | Node.js, Express, TypeScript |
| Validation | Zod |
| ORM | Prisma |
| Database | PostgreSQL 16 |
| Local infra | Docker Compose |
