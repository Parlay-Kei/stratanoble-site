@echo off
cd /d "C:\Dev\10_products\StrataNoble"
echo === Git Status === > C:\Dev\push-drift-log.txt 2>&1
git status >> C:\Dev\push-drift-log.txt 2>&1
echo === Current Branch === >> C:\Dev\push-drift-log.txt 2>&1
git branch --show-current >> C:\Dev\push-drift-log.txt 2>&1
echo === Checkout Main === >> C:\Dev\push-drift-log.txt 2>&1
git checkout main >> C:\Dev\push-drift-log.txt 2>&1
echo === Cherry Pick === >> C:\Dev\push-drift-log.txt 2>&1
git cherry-pick 9b5973bfa8bef09dd8e797a84ca30aa072cbf54c >> C:\Dev\push-drift-log.txt 2>&1
echo === Push === >> C:\Dev\push-drift-log.txt 2>&1
git push origin main >> C:\Dev\push-drift-log.txt 2>&1
echo === Checkout Back === >> C:\Dev\push-drift-log.txt 2>&1
git checkout feature/achievery-rebuild >> C:\Dev\push-drift-log.txt 2>&1
echo === DONE === >> C:\Dev\push-drift-log.txt 2>&1
echo Log written to C:\Dev\push-drift-log.txt
