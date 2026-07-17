$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

if (-not (Test-Path (Join-Path $Root ".env"))) {
  Write-Host "Missing .env. Copy .env.example to .env and replace all passwords first."
  exit 1
}

docker info 1>$null 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Docker Desktop is not running. Start it and retry."
  exit 1
}

docker compose up -d --build
if ($LASTEXITCODE -ne 0) {
  throw "Docker Compose failed. Inspect with: docker compose logs"
}

Write-Host "Hospital system is starting. Check status with: docker compose ps"
Write-Host "Open the WEB_PORT configured in .env (default: http://localhost:8088)."
