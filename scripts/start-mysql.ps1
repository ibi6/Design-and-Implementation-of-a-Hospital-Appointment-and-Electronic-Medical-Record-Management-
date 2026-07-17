$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

if (-not (Test-Path (Join-Path $Root ".env"))) {
  Write-Host "Missing .env. Copy .env.example to .env and replace all passwords first."
  exit 1
}

Write-Host "Checking Docker daemon..."
docker info 1>$null 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Docker Desktop is not running. Please start Docker Desktop and retry."
  exit 1
}

Write-Host "Starting MySQL via Docker Compose..."
$env:COMPOSE_PROJECT_NAME = "hospital-system"
docker compose up -d mysql

Write-Host "Waiting for MySQL health..."
$ok = $false
for ($i = 0; $i -lt 40; $i++) {
  $containerId = docker compose ps -q mysql
  $status = if ($containerId) { docker inspect --format='{{.State.Health.Status}}' $containerId 2>$null } else { "" }
  if ($status -eq "healthy") {
    $ok = $true
    break
  }
  Start-Sleep -Seconds 3
}

if (-not $ok) {
  Write-Host "MySQL not healthy yet. Check: docker compose logs mysql"
  exit 1
}

Write-Host "MySQL is healthy on the configured localhost MYSQL_PORT."
Write-Host "Start backend with: powershell -File scripts/start-backend.ps1 mysql"
