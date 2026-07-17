# ============================================================================
#  stop.ps1  ·  Para la base de datos del proyecto (Windows)
# ----------------------------------------------------------------------------
#  Apaga el contenedor de PostgreSQL. Tus datos NO se borran (quedan en el
#  volumen de Docker). Las ventanas de backend/frontend se cierran a mano.
#
#  Uso:   .\stop.ps1
# ============================================================================

Set-Location $PSScriptRoot

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  $dockerDefault = "C:\Program Files\Docker\Docker\resources\bin"
  if (Test-Path $dockerDefault) { $env:Path = "$dockerDefault;$env:Path" }
}

Write-Host "==> Deteniendo PostgreSQL (Docker)..." -ForegroundColor Cyan
docker compose down

Write-Host ""
Write-Host "Base de datos detenida. Los datos se conservan para la proxima vez." -ForegroundColor Green
Write-Host "Si las ventanas del backend y el frontend siguen abiertas, cierralas (o pulsa Ctrl+C en ellas)."
