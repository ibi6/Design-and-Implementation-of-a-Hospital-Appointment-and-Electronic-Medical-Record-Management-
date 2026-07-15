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
  Write-Host "Starting backend with MySQL profile..."
  java -jar $Jar --spring.profiles.active=mysql
} else {
  Write-Host "Starting backend with default H2 profile..."
  java -jar $Jar
}
