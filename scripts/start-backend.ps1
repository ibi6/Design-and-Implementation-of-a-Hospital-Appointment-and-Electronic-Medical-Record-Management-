$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Backend = Join-Path $Root "backend"
$Mvn = Join-Path $Root ".tools\apache-maven-3.9.6\bin\mvn.cmd"
$Jar = Join-Path $Backend "target\hospital-backend-1.0.0.jar"
$Profile = $args[0]

Set-Location $Backend

if (-not (Test-Path $Jar)) {
  if (Test-Path $Mvn) {
    & $Mvn -DskipTests package
  } else {
    mvn -DskipTests package
  }
}

if ($Profile -eq "mysql") {
  $EnvFile = Join-Path $Root ".env"
  if (-not (Test-Path -LiteralPath $EnvFile)) {
    throw "Missing .env. Copy .env.example to .env and replace all placeholder credentials first."
  }

  foreach ($Line in Get-Content -LiteralPath $EnvFile) {
    $Trimmed = $Line.Trim()
    if (-not $Trimmed -or $Trimmed.StartsWith("#")) { continue }
    $Parts = $Trimmed.Split("=", 2)
    if ($Parts.Count -ne 2 -or $Parts[0] -notmatch '^[A-Za-z_][A-Za-z0-9_]*$') { continue }
    $Name = $Parts[0]
    if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($Name, "Process"))) {
      [Environment]::SetEnvironmentVariable($Name, $Parts[1], "Process")
    }
  }

  foreach ($RequiredName in @("SPRING_DATASOURCE_URL", "SPRING_DATASOURCE_USERNAME", "SPRING_DATASOURCE_PASSWORD", "APP_JWT_SECRET")) {
    $RequiredValue = [Environment]::GetEnvironmentVariable($RequiredName, "Process")
    if ([string]::IsNullOrWhiteSpace($RequiredValue) -or $RequiredValue.StartsWith("replace-with-")) {
      throw "Set $RequiredName to a non-placeholder value in .env before starting MySQL mode."
    }
  }

  Write-Host "Starting backend with MySQL profile..."
  java -jar $Jar --spring.profiles.active=mysql
} else {
  Write-Host "Starting backend with default H2 profile..."
  java -jar $Jar
}
