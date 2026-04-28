# MatchMe — Spotify + Gemini Setup Script
# Run this in PowerShell from the matchme folder
# It opens the right pages, asks for your keys, and adds them to Vercel automatically.

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  MatchMe — Music DNA Setup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# ── Step 1: Spotify ─────────────────────────────────────────────────────────
Write-Host "STEP 1 of 2 — Spotify Developer App" -ForegroundColor Yellow
Write-Host ""
Write-Host "Opening Spotify Developer dashboard..." -ForegroundColor Gray
Start-Process "https://developer.spotify.com/dashboard"
Write-Host ""
Write-Host "In the browser:" -ForegroundColor White
Write-Host "  1. Click 'Create app'" -ForegroundColor Gray
Write-Host "  2. Name: MatchMe  |  Description: anything" -ForegroundColor Gray
Write-Host "  3. Redirect URI: https://matchme-ten.vercel.app/api/spotify-callback" -ForegroundColor Gray
Write-Host "  4. Check 'Web API'  then Save" -ForegroundColor Gray
Write-Host "  5. Go to Settings — copy Client ID and Client Secret" -ForegroundColor Gray
Write-Host ""

$spotifyClientId = Read-Host "Paste your Spotify CLIENT ID"
$spotifyClientSecret = Read-Host "Paste your Spotify CLIENT SECRET"

Write-Host ""
Write-Host "Adding Spotify keys to Vercel..." -ForegroundColor Gray
$spotifyClientId     | npx vercel env add SPOTIFY_CLIENT_ID production --force
$spotifyClientSecret | npx vercel env add SPOTIFY_CLIENT_SECRET production --force
Write-Host "Spotify keys added!" -ForegroundColor Green
Write-Host ""

# ── Step 2: Gemini ───────────────────────────────────────────────────────────
Write-Host "STEP 2 of 2 — Gemini API Key (free)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Opening Google AI Studio..." -ForegroundColor Gray
Start-Process "https://aistudio.google.com/app/apikey"
Write-Host ""
Write-Host "In the browser:" -ForegroundColor White
Write-Host "  1. Click 'Create API key'" -ForegroundColor Gray
Write-Host "  2. Choose any project (or create one)" -ForegroundColor Gray
Write-Host "  3. Copy the key" -ForegroundColor Gray
Write-Host ""

$geminiKey = Read-Host "Paste your Gemini API key"

Write-Host ""
Write-Host "Adding Gemini key to Vercel..." -ForegroundColor Gray
$geminiKey | npx vercel env add GEMINI_API_KEY production --force
Write-Host "Gemini key added!" -ForegroundColor Green
Write-Host ""

# ── Redeploy ─────────────────────────────────────────────────────────────────
Write-Host "Triggering Vercel redeploy to pick up new keys..." -ForegroundColor Gray
npx vercel --prod --yes 2>&1 | Select-String "Production"

Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "  All done! Music DNA is live." -ForegroundColor Green
Write-Host "  Visit matchme-ten.vercel.app" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
