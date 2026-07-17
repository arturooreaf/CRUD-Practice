# Health CRUD — Patient Management

A patient management CRUD service built with Node.js, Express and TypeScript on
the backend, Next.js on the frontend, and PostgreSQL via Prisma for persistence.

## Stack

- **API:** Node.js, Express, TypeScript
- **Client:** Next.js (App Router), React, TypeScript
- **Database:** PostgreSQL 16, accessed through Prisma
- **Validation:** Zod
- **Local infrastructure:** Docker Compose

## Quick start

Requires Node.js 18+ and Docker Desktop (WSL2 on Windows). From the repository
root:

```powershell
.\start.ps1     # Windows
```

```bash
./start.sh      # macOS / Linux
```

The script provisions PostgreSQL, installs dependencies on first run, applies
migrations, seeds sample data, and starts both services. Then open
`http://localhost:3000`.

## Manual setup

```bash
# 1. Database
docker compose up -d

# 2. API — http://localhost:3001
cd backend
npm install
cp .env.example .env            # Copy-Item on PowerShell
npm run db:migrate
npm run db:seed                 # optional sample data
npm run dev

# 3. Client — http://localhost:3000
cd ../frontend
npm install
npm run dev
```

## Project structure

```
CRUD-Practice/
├── docker-compose.yml          Local PostgreSQL
├── start.ps1 / start.sh        One-command startup
├── backend/                    Express + TypeScript API
│   ├── prisma/                 Schema, migrations, seed
│   └── src/
│       ├── index.ts            App bootstrap
│       ├── routes/             Route definitions
│       ├── controllers/        Request handling
│       ├── data/               Prisma client + queries
│       ├── middleware/         Error handling
│       └── types/              Zod schemas + types
├── frontend/                   Next.js client
│   ├── app/                    Pages (list / create / edit)
│   ├── components/             Shared form
│   └── lib/api.ts              Typed API client
└── docs/                       Technical documentation
```

## API

Base path `/api/pacientes`:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List patients |
| GET | `/:id` | Get one |
| POST | `/` | Create |
| PUT | `/:id` | Update |
| DELETE | `/:id` | Delete |

## Documentation

Technical documentation lives in [`docs/`](docs/README.md): architecture,
backend, database, frontend, and development guides.

## Notes

- `.env` files hold credentials and are git-ignored; `backend/.env.example` is
  the committed template. To use a managed database (Neon, Supabase, RDS), point
  `DATABASE_URL` at it — no other change required.
- This is a practice project; do not store real patient data.
