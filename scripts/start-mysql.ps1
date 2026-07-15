$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

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
  $status = docker inspect --format='{{.State.Health.Status}}' hospital-mysql 2>$null
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

Write-Host "MySQL is healthy on localhost:3306 (root/root, database=hospital)"
Write-Host "Start backend with: powershell -File scripts/start-backend.ps1 mysql"
