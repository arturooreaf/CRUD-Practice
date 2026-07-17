# Development

## Prerequisites

- Node.js 18+
- Docker Desktop (for local PostgreSQL; on Windows requires WSL2)
- Git

## Quick start

With Node and Docker running, from the repository root:

```powershell
.\start.ps1     # Windows
```

```bash
./start.sh      # macOS / Linux
```

The script starts PostgreSQL, installs dependencies on first run, applies
migrations, seeds sample data, and launches the API and client. Then open
`http://localhost:3000`.

## Manual setup

```bash
# 1. Database
docker compose up -d

# 2. API
cd backend
npm install
cp .env.example .env          # Copy-Item on PowerShell
npm run db:migrate
npm run db:seed               # optional
npm run dev                   # http://localhost:3001

# 3. Client
cd ../frontend
npm install
npm run dev                   # http://localhost:3000
```

## Ports

| Service | Port |
|---------|------|
| Client | 3000 |
| API | 3001 |
| PostgreSQL | 5432 |

## Stopping

- API and client: `Ctrl+C` in their terminals.
- Database: `docker compose down` (or `.\stop.ps1`). Data persists in the
  `pgdata` volume.

## Environment variables

| Variable | Location | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | `backend/.env` | PostgreSQL connection string |
| `PORT` | `backend/.env` | API port (default 3001) |
| `NEXT_PUBLIC_API_URL` | `frontend/.env.local` | API base URL for the client |

`.env` files are git-ignored; `backend/.env.example` is the committed template.

## Troubleshooting

**`npm` not found** — Node is installed but not on `PATH`. Prepend it for the
session (Windows): `$env:Path = "C:\Program Files\nodejs;" + $env:Path`, or add
it to the system `PATH` permanently.

**Docker won't start / "WSL not installed"** — Docker Desktop requires WSL2 on
Windows. In an elevated PowerShell run `wsl --install`, reboot, then start Docker
Desktop. If the engine hangs after installing WSL, run `wsl --shutdown` and
relaunch Docker Desktop.

**Port already in use (`EADDRINUSE`)** — another process holds the port. Free it
or start the client on another port: `npm run dev -- -p 3005`.

**Cannot connect to the database** — ensure the container is healthy
(`docker ps` shows `health_crud_db` as `Up (healthy)`) and that `DATABASE_URL`
matches the compose credentials.
