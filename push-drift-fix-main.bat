@echo off
cd /d "C:\Dev\10_products\StrataNoble"
echo Current branch:
git branch --show-current
git checkout main
git cherry-pick 9b5973bfa8bef09dd8e797a84ca30aa072cbf54c
git push origin main
git checkout feature/achievery-rebuild
echo.
echo Done. Check above for errors. Press any key to close.
pause
