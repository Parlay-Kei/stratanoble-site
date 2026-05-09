@echo off
cd /d "C:\Dev\10_products\StrataNoble"
git add .github/workflows/database-drift.yml
git commit -m "fix(ci): accept timestamp-format migration filenames, relax order check, narrow secret scan"
git push origin main
echo.
echo Done. Press any key to close.
pause
