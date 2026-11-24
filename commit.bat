@echo off
REM Git Commit Script for SentiaMind (CMD / Batch)
cd /d %~dp0

echo Updating git staging with clean project files...

git add .gitignore
git add README.md
git add HOW_IT_WORKS.md
git add docker-compose.yml

git add backend/alembic.ini
git add backend/alembic/
git add backend/requirements.txt
git add backend/app/
git add backend/scripts/
git add backend/tests/

git add frontend/package.json
git add frontend/tsconfig.json
git add frontend/tsconfig.app.json
git add frontend/tsconfig.node.json
git add frontend/vite.config.ts
git add frontend/index.html
git add frontend/src/

if exist ml_training git add ml_training/

echo.
echo Staged files:
git status -s

echo.
git commit -m "feat: complete SentiaMind full-stack setup with clean light UI and documentation"

echo.
echo Done! Run "git push origin main" to push to GitHub.
pause
