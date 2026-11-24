# Git Commit Script for SentiaMind
# Run this script in PowerShell from the project root (U:\SentiaMind)

Write-Host "Updating git staging with clean project files..." -ForegroundColor Cyan

# 1. Add documentation & git configuration
git add .gitignore
git add README.md
git add HOW_IT_WORKS.md
git add docker-compose.yml

# 2. Add backend source code & migrations
git add backend/alembic.ini
git add backend/alembic/
git add backend/requirements.txt
git add backend/app/
git add backend/scripts/
git add backend/tests/

# 3. Add frontend source code and configs (node_modules and dist are ignored)
git add frontend/package.json
git add frontend/tsconfig.json
git add frontend/tsconfig.app.json
git add frontend/tsconfig.node.json
git add frontend/vite.config.ts
git add frontend/index.html
git add frontend/src/

# 4. Add ML training scripts if present
if (Test-Path "ml_training") {
    git add ml_training/
}

Write-Host "`nStaged files ready to commit:" -ForegroundColor Green
git status -s

$commitMsg = "feat: complete SentiaMind full-stack setup with clean light UI and documentation"
Write-Host "`nCommitting with message: '$commitMsg'..." -ForegroundColor Cyan
git commit -m $commitMsg

Write-Host "`nDone! To push to your remote repository, run:" -ForegroundColor Yellow
Write-Host "git push origin main" -ForegroundColor White
