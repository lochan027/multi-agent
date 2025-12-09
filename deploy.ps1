# 🚀 Quick Deploy Script
# deploy.ps1 - Deploy NebulaArb to Netlify via CLI

param(
    [switch]$Draft,  # Deploy to draft URL instead of production
    [switch]$Init,   # Initialize new Netlify site
    [switch]$Dev     # Start local dev server instead of deploying
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host "`n$Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Check if Netlify CLI is installed
function Test-NetlifyCLI {
    try {
        $null = Get-Command netlify -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

# Main script
try {
    Write-Host "🚀 NebulaArb Netlify Deployment Script" -ForegroundColor Magenta
    Write-Host "======================================" -ForegroundColor Magenta

    # Check for Netlify CLI
    if (-not (Test-NetlifyCLI)) {
        Write-Step "Netlify CLI not found. Installing..."
        npm install -g netlify-cli
        Write-Success "Netlify CLI installed"
    }

    # Initialize site if requested
    if ($Init) {
        Write-Step "Initializing new Netlify site..."
        netlify init
        Write-Success "Site initialized"
        exit 0
    }

    # Start dev server if requested
    if ($Dev) {
        Write-Step "Starting local development server..."
        Write-Host "🌐 Server will be available at http://localhost:8888" -ForegroundColor Yellow
        netlify dev
        exit 0
    }

    # Check if site is linked
    $siteInfo = netlify status 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Site not linked to Netlify"
        Write-Host "`nRun one of these commands first:" -ForegroundColor Yellow
        Write-Host "  .\deploy.ps1 -Init   # Create new site" -ForegroundColor White
        Write-Host "  netlify link         # Link to existing site" -ForegroundColor White
        exit 1
    }

    # Install dependencies
    Write-Step "Installing dependencies..."
    
    Write-Host "  📦 Root dependencies..." -ForegroundColor Gray
    npm install --silent
    
    Write-Host "  📦 Frontend dependencies..." -ForegroundColor Gray
    Push-Location frontend
    npm install --silent
    Pop-Location
    
    Write-Host "  📦 Netlify functions dependencies..." -ForegroundColor Gray
    Push-Location netlify
    npm install --silent
    Pop-Location
    
    Write-Success "Dependencies installed"

    # Build frontend
    Write-Step "Building frontend..."
    Push-Location frontend
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Frontend build failed"
    }
    Pop-Location
    Write-Success "Frontend built successfully"

    # Deploy
    if ($Draft) {
        Write-Step "Deploying to draft URL..."
        netlify deploy --dir=frontend/dist --functions=netlify/functions
    }
    else {
        Write-Step "Deploying to production..."
        netlify deploy --prod --dir=frontend/dist --functions=netlify/functions
    }

    if ($LASTEXITCODE -ne 0) {
        throw "Deployment failed"
    }

    Write-Success "Deployment complete!"
    
    # Open site
    Write-Step "Opening site in browser..."
    Start-Sleep -Seconds 2
    netlify open:site

    Write-Host "`n🎉 Deployment successful!" -ForegroundColor Green
    Write-Host "`nUseful commands:" -ForegroundColor Yellow
    Write-Host "  netlify open:site    # Open your site" -ForegroundColor White
    Write-Host "  netlify status       # Check status" -ForegroundColor White
    Write-Host "  netlify logs         # View logs" -ForegroundColor White
    Write-Host "  .\deploy.ps1 -Dev    # Run locally" -ForegroundColor White

}
catch {
    Write-Error-Custom "Deployment failed: $_"
    exit 1
}
