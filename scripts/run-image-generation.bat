@echo off
echo Installing required dependencies...
cd /d "C:\Dev\StrataNoble"
npm install puppeteer sharp --save-dev

echo.
echo Running dashboard image generation...
node scripts/generate-dashboard-images.js

echo.
echo Dashboard images generated successfully!
pause