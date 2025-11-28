# Backend-Frontend Integration Setup Script
Write-Host "=== CollegeMedia Integration Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists in frontend
if (-not (Test-Path ".env.local")) {
    Write-Host "Creating frontend .env.local file..." -ForegroundColor Yellow
    @"
# Backend API URL
VITE_API_URL=http://localhost:4000
"@ | Out-File -FilePath ".env.local" -Encoding utf8
    Write-Host "✓ Created .env.local" -ForegroundColor Green
} else {
    Write-Host "✓ .env.local already exists" -ForegroundColor Green
}

# Check backend .env
if (-not (Test-Path "backend\.env")) {
    Write-Host "✗ Backend .env file not found!" -ForegroundColor Red
    Write-Host "  The backend .env should have been created. Please check backend folder." -ForegroundColor Yellow
} else {
    Write-Host "✓ Backend .env exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Make sure MongoDB is running on port 27017"
Write-Host "2. Start backend: cd backend && npm run dev"
Write-Host "3. Start frontend: npm run dev (in root folder)"
Write-Host "4. Open http://localhost:8080 in your browser"
Write-Host ""
Write-Host "For detailed documentation, see INTEGRATION_SETUP.md" -ForegroundColor Cyan
