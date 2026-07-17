# Health CRUD · Pacientes

CRUD completo de **pacientes** para una health startup, con la stack pedida:

- **Backend:** Node.js + Express + TypeScript (API REST)
- **Frontend:** Next.js (App Router) + TypeScript
- **Base de datos:** PostgreSQL con **Prisma** (ORM)
- **Validación:** Zod

```
CRUD-Practice/
├── docker-compose.yml   → PostgreSQL local (opcional)
├── backend/             → API REST en http://localhost:3001
│   ├── prisma/
│   │   ├── schema.prisma            → modelo de datos (tabla pacientes)
│   │   └── seed.ts                  → datos de ejemplo
│   └── src/
│       ├── index.ts                 → arranque del servidor
│       ├── routes/                  → definición de rutas
│       ├── controllers/             → lógica de cada endpoint (async)
│       ├── data/
│       │   ├── prisma.ts            → cliente Prisma
│       │   └── store.ts             → consultas a la BD
│       ├── middleware/              → errores + validación
│       └── types/paciente.ts        → DTOs + esquemas Zod
└── frontend/            → UI en http://localhost:3000
    ├── app/                         → páginas (listar / crear / editar)
    ├── components/PacienteForm.tsx  → formulario reutilizable
    └── lib/api.ts                   → cliente HTTP + tipos
```

## Requisitos

- Node.js 18+
- Un **PostgreSQL** accesible. Tienes dos opciones:

### Opción A — Postgres con Docker (recomendado)

```bash
docker compose up -d        # levanta Postgres en localhost:5432
```

Las credenciales ya coinciden con `backend/.env.example`.

### Opción B — Postgres en la nube (Neon, Supabase, Railway…)

Crea una BD gratis y copia su cadena de conexión (`postgresql://…`).

## Puesta en marcha

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # y edita DATABASE_URL si usas la opción B
npm run db:migrate          # crea las tablas en Postgres
npm run db:seed             # (opcional) inserta 2 pacientes de ejemplo
npm run dev                 # API en http://localhost:3001
```

> En Windows PowerShell, en vez de `cp` usa `Copy-Item .env.example .env`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                 # app en http://localhost:3000
```

## Scripts útiles del backend

| Script               | Qué hace                                          |
| -------------------- | ------------------------------------------------- |
| `npm run dev`        | Arranca la API con recarga en caliente            |
| `npm run db:migrate` | Aplica migraciones (crea/actualiza tablas)        |
| `npm run db:seed`    | Inserta datos de ejemplo                          |
| `npm run db:studio`  | Abre Prisma Studio (explorador visual de la BD)   |
| `npm run build`      | `prisma generate` + compila TypeScript a `dist/`  |

## Endpoints de la API

| Método | Ruta                  | Descripción            |
| ------ | --------------------- | ---------------------- |
| GET    | `/api/pacientes`      | Listar todos           |
| GET    | `/api/pacientes/:id`  | Obtener uno            |
| POST   | `/api/pacientes`      | Crear                  |
| PUT    | `/api/pacientes/:id`  | Actualizar             |
| DELETE | `/api/pacientes/:id`  | Eliminar               |

### Ejemplo (crear paciente)

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

## Notas

- La validación (Zod) devuelve `400` con el detalle de los campos incorrectos; email duplicado devuelve `409`.
- El archivo `.env` **no se sube a git** (contiene credenciales). Usa `.env.example` como plantilla.
- ⚠️ Proyecto de práctica: no metas datos sanitarios reales (serían datos de salud sujetos a RGPD/normativa sanitaria).
