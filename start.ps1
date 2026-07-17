# ============================================================================
#  start.ps1  ·  Arranca TODO el proyecto con un solo comando (Windows)
# ----------------------------------------------------------------------------
#  Levanta: 1) PostgreSQL en Docker  2) el backend  3) el frontend
#  La primera vez instala dependencias, crea la BD y mete datos de ejemplo.
#
#  Uso:   .\start.ps1
# ============================================================================

Set-Location $PSScriptRoot

function Info($msg)  { Write-Host "==> $msg" -ForegroundColor Cyan }
function Ok($msg)    { Write-Host "    $msg" -ForegroundColor Green }
function Fail($msg)  { Write-Host "ERROR: $msg" -ForegroundColor Red; exit 1 }

# --- 1. Comprobar Node (con fallback a la ruta por defecto de Windows) ---
Info "Comprobando herramientas..."
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  $nodeDefault = "C:\Program Files\nodejs"
  if (Test-Path $nodeDefault) { $env:Path = "$nodeDefault;$env:Path" }
}
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Fail "Node.js no esta instalado o no esta en el PATH. Instalalo desde https://nodejs.org"
}

# --- 2. Comprobar Docker (con fallback a su ruta por defecto) ---
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  $dockerDefault = "C:\Program Files\Docker\Docker\resources\bin"
  if (Test-Path $dockerDefault) { $env:Path = "$dockerDefault;$env:Path" }
}
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Fail "Docker no esta instalado. Instala Docker Desktop: https://www.docker.com/products/docker-desktop/"
}

# --- 3. Comprobar que el motor de Docker esta encendido ---
docker info *> $null
if ($LASTEXITCODE -ne 0) {
  Fail "Docker esta instalado pero el motor no arranca. Abre Docker Desktop y espera a que diga 'running', luego reintenta."
}
Ok "Node y Docker listos."

# --- 4. Levantar PostgreSQL ---
Info "Levantando PostgreSQL (Docker)..."
docker compose up -d
if ($LASTEXITCODE -ne 0) { Fail "No se pudo levantar el contenedor de PostgreSQL." }

# --- 5. Esperar a que la BD este 'healthy' ---
Info "Esperando a que la base de datos este lista..."
$ready = $false
foreach ($i in 1..30) {
  $status = (docker inspect --format '{{.State.Health.Status}}' health_crud_db 2>$null)
  if ($status -eq 'healthy') { $ready = $true; break }
  Start-Sleep -Seconds 2
}
if (-not $ready) { Fail "La base de datos no llego a estar lista a tiempo." }
Ok "Base de datos lista."

# --- 6. Backend: dependencias + BD ---
Push-Location backend
$freshInstall = $false
if (-not (Test-Path node_modules)) {
  Info "Instalando dependencias del backend (primera vez, puede tardar)..."
  npm install
  if ($LASTEXITCODE -ne 0) { Pop-Location; Fail "Fallo 'npm install' en el backend." }
  $freshInstall = $true
}
if (-not (Test-Path .env)) {
  Copy-Item .env.example .env
  Ok "Creado backend/.env desde la plantilla."
}
Info "Preparando la base de datos (Prisma)..."
npx prisma generate | Out-Null
npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) { Pop-Location; Fail "Fallo aplicando las migraciones de Prisma." }
if ($freshInstall) {
  Info "Metiendo datos de ejemplo..."
  npm run db:seed
}
Pop-Location

# --- 7. Frontend: dependencias ---
Push-Location frontend
if (-not (Test-Path node_modules)) {
  Info "Instalando dependencias del frontend (primera vez, puede tardar)..."
  npm install
  if ($LASTEXITCODE -ne 0) { Pop-Location; Fail "Fallo 'npm install' en el frontend." }
}
Pop-Location

# --- 8. Arrancar backend y frontend en ventanas nuevas ---
Info "Arrancando backend y frontend en ventanas nuevas..."
$root = $PSScriptRoot
$nodeFix = "if (-not (Get-Command node -ErrorAction SilentlyContinue)) { `$env:Path = 'C:\Program Files\nodejs;' + `$env:Path }"

$backendCmd  = "$nodeFix; Set-Location '$root\backend'; npm run dev"
$frontendCmd = "$nodeFix; Set-Location '$root\frontend'; npm run dev"

Start-Process powershell -ArgumentList '-NoExit', '-Command', $backendCmd
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList '-NoExit', '-Command', $frontendCmd

Write-Host ""
Write-Host "===================================================" -ForegroundColor Green
Write-Host " Todo arrancado:" -ForegroundColor Green
Write-Host "   Frontend       ->  http://localhost:3000" -ForegroundColor Green
Write-Host "   Backend (API)  ->  http://localhost:3001" -ForegroundColor Green
Write-Host "   PostgreSQL     ->  localhost:5432 (Docker)" -ForegroundColor Green
Write-Host ""
Write-Host " Se han abierto 2 ventanas nuevas (backend y frontend)."
Write-Host " Espera unos segundos y abre http://localhost:3000 en el navegador."
Write-Host ""
Write-Host " Para PARAR todo: cierra esas 2 ventanas y ejecuta  .\stop.ps1"
Write-Host "===================================================" -ForegroundColor Green
