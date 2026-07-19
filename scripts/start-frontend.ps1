param(
  [string]$BindAddress = "127.0.0.1",
  [ValidateRange(1, 65535)]
  [int]$Port = 5173
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Frontend = Join-Path $Root "frontend"
Set-Location $Frontend

if (-not (Test-Path "node_modules")) {
  npm install
}

npm run dev -- --host $BindAddress --port $Port
