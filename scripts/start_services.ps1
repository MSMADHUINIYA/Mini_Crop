# PowerShell script to start backend Spring Boot and Flask ML service
# File: scripts/start_services.ps1

# Ensure script stops on errors
$ErrorActionPreference = "Stop"

Write-Host "Starting Spring Boot backend..."
# Start backend using Maven wrapper (mvnw.cmd) in the backend directory
Start-Process -FilePath "cmd.exe" -ArgumentList "/c","cd backend && mvnw.cmd spring-boot:run" -NoNewWindow -PassThru | Out-Null

# Give backend a moment to start
Start-Sleep -Seconds 5

Write-Host "Starting Flask ML service..."
# Start Flask service
Start-Process -FilePath "cmd.exe" -ArgumentList "/c","cd ml_service && python app.py" -NoNewWindow -PassThru | Out-Null

Write-Host "Both services launched."
