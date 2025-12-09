# ⚙️ Setup Script
# setup.ps1 - One-time setup for NebulaArb deployment

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host "`n$Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Yellow
}

try {
    Write-Host "⚙️  NebulaArb Setup Script" -ForegroundColor Magenta
    Write-Host "=========================" -ForegroundColor Magenta

    # Check Node.js version
    Write-Step "Checking Node.js version..."
    $nodeVersion = node --version
    $majorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    
    if ($majorVersion -lt 18) {
        throw "Node.js 18+ required. Current version: $nodeVersion. Download from https://nodejs.org"
    }
    Write-Success "Node.js $nodeVersion detected"

    # Check if Git is installed
    Write-Step "Checking Git installation..."
    try {
        $gitVersion = git --version
        Write-Success "$gitVersion detected"
    }
    catch {
        Write-Info "Git not found. Install from https://git-scm.com if you need version control"
    }

    # Install Netlify CLI
    Write-Step "Installing Netlify CLI..."
    npm install -g netlify-cli
    Write-Success "Netlify CLI installed"

    # Install project dependencies
    Write-Step "Installing project dependencies..."
    
    Write-Host "  📦 Root dependencies..." -ForegroundColor Gray
    npm install
    
    Write-Host "  📦 Frontend dependencies..." -ForegroundColor Gray
    Push-Location frontend
    npm install
    Pop-Location
    
    Write-Host "  📦 Netlify functions dependencies..." -ForegroundColor Gray
    Push-Location netlify
    npm install
    Pop-Location
    
    Write-Success "All dependencies installed"

    # Create .env file if it doesn't exist
    Write-Step "Setting up environment files..."
    if (-not (Test-Path .env)) {
        Copy-Item .env.example .env
        Write-Success "Created .env file from template"
        Write-Info "Edit .env file to add your API keys (optional)"
    }
    else {
        Write-Info ".env file already exists"
    }

    # Login to Netlify
    Write-Step "Logging into Netlify..."
    Write-Host "A browser window will open to authorize..." -ForegroundColor Yellow
    netlify login
    Write-Success "Logged into Netlify"

    # Initialize or link site
    Write-Host "`n" -NoNewline
    $choice = Read-Host "Do you want to (1) Create new site or (2) Link existing site? [1/2]"
    
    if ($choice -eq "1") {
        Write-Step "Creating new Netlify site..."
        netlify init
        Write-Success "Site created and linked"
    }
    elseif ($choice -eq "2") {
        Write-Step "Linking to existing Netlify site..."
        netlify link
        Write-Success "Site linked"
    }
    else {
        Write-Info "Skipping site initialization. Run 'netlify init' or 'netlify link' later."
    }

    # Ask about environment variables
    Write-Host "`n" -NoNewline
    $envChoice = Read-Host "Do you want to set environment variables now? [y/n]"
    
    if ($envChoice -eq "y" -or $envChoice -eq "Y") {
        Write-Step "Setting environment variables..."
        Write-Host "Enter your CoinGecko API key (or press Enter to skip):" -ForegroundColor Yellow
        $coinGeckoKey = Read-Host
        
        if ($coinGeckoKey) {
            netlify env:set COINGECKO_API_KEY "$coinGeckoKey"
            Write-Success "CoinGecko API key set"
        }
        
        Write-Host "Enter your Ethereum RPC URL (or press Enter to use default):" -ForegroundColor Yellow
        $ethRpc = Read-Host
        
        if ($ethRpc) {
            netlify env:set ETHEREUM_RPC_URL "$ethRpc"
            Write-Success "Ethereum RPC URL set"
        }
    }

    # Test local development
    Write-Host "`n" -NoNewline
    $testChoice = Read-Host "Do you want to test locally now? [y/n]"
    
    if ($testChoice -eq "y" -or $testChoice -eq "Y") {
        Write-Step "Starting local development server..."
        Write-Host "🌐 Opening http://localhost:8888" -ForegroundColor Yellow
        Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
        netlify dev
    }
    else {
        Write-Success "Setup complete!"
        Write-Host "`n📝 Next steps:" -ForegroundColor Yellow
        Write-Host "  1. Run '.\deploy.ps1 -Dev' to test locally" -ForegroundColor White
        Write-Host "  2. Run '.\deploy.ps1' to deploy to production" -ForegroundColor White
        Write-Host "  3. Run 'netlify open:site' to view your site" -ForegroundColor White
    }

}
catch {
    Write-Host "`n❌ Setup failed: $_" -ForegroundColor Red
    exit 1
}
