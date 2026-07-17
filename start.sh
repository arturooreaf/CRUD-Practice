#!/usr/bin/env bash
# ============================================================================
#  start.sh  ·  Arranca TODO el proyecto con un solo comando (Mac / Linux)
# ----------------------------------------------------------------------------
#  Levanta: 1) PostgreSQL en Docker  2) el backend  3) el frontend
#  La primera vez instala dependencias, crea la BD y mete datos de ejemplo.
#
#  Uso:   ./start.sh      (si da permisos: chmod +x start.sh)
# ============================================================================
set -e
cd "$(dirname "$0")"

info() { printf '\033[36m==> %s\033[0m\n' "$1"; }
ok()   { printf '\033[32m    %s\033[0m\n' "$1"; }
fail() { printf '\033[31mERROR: %s\033[0m\n' "$1"; exit 1; }

# --- 1. Comprobar Docker ---
info "Comprobando herramientas..."
command -v node  >/dev/null 2>&1 || fail "Node.js no esta instalado. Instalalo desde https://nodejs.org"
command -v docker >/dev/null 2>&1 || fail "Docker no esta instalado. Instala Docker Desktop."
docker info >/dev/null 2>&1 || fail "El motor de Docker no esta arrancado. Abre Docker Desktop y reintenta."
ok "Node y Docker listos."

# --- 2. Levantar PostgreSQL ---
info "Levantando PostgreSQL (Docker)..."
docker compose up -d

# --- 3. Esperar a que la BD este 'healthy' ---
info "Esperando a que la base de datos este lista..."
ready=""
for _ in $(seq 1 30); do
  status="$(docker inspect --format '{{.State.Health.Status}}' health_crud_db 2>/dev/null || echo '')"
  if [ "$status" = "healthy" ]; then ready="yes"; break; fi
  sleep 2
done
[ -n "$ready" ] || fail "La base de datos no llego a estar lista a tiempo."
ok "Base de datos lista."

# --- 4. Backend: dependencias + BD ---
info "Preparando el backend..."
cd backend
fresh=""
if [ ! -d node_modules ]; then
  info "Instalando dependencias del backend (primera vez)..."
  npm install
  fresh="yes"
fi
[ -f .env ] || cp .env.example .env
npx prisma generate >/dev/null
npx prisma migrate deploy
if [ -n "$fresh" ]; then
  info "Metiendo datos de ejemplo..."
  npm run db:seed
fi
npm run dev &
BACK_PID=$!
cd ..

# --- 5. Frontend: dependencias ---
info "Preparando el frontend..."
cd frontend
[ -d node_modules ] || { info "Instalando dependencias del frontend (primera vez)..."; npm install; }
npm run dev &
FRONT_PID=$!
cd ..

# --- 6. Info y limpieza al salir ---
echo ""
echo "==================================================="
echo " Todo arrancado:"
echo "   Frontend       ->  http://localhost:3000"
echo "   Backend (API)  ->  http://localhost:3001"
echo "   PostgreSQL     ->  localhost:5432 (Docker)"
echo ""
echo " Pulsa Ctrl+C para parar backend, frontend y la base de datos."
echo "==================================================="

# Al pulsar Ctrl+C: matar los servidores y apagar la BD
trap 'echo ""; echo "Parando..."; kill $BACK_PID $FRONT_PID 2>/dev/null || true; docker compose down' INT
wait
