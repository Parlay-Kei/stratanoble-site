@echo off
cd /d "C:\Dev\10_products\StrataNoble"
echo === STEP 1: Commit shape-up work on feature/achievery-rebuild === >> C:\Dev\push-shape-up-log.txt 2>&1
git add -A >> C:\Dev\push-shape-up-log.txt 2>&1
git commit -m "feat(site): SN-SITE-SHAPE-UP-0001 — commercial alignment, canonical routes, stale pricing removed" >> C:\Dev\push-shape-up-log.txt 2>&1
echo === STEP 2: Push feature branch === >> C:\Dev\push-shape-up-log.txt 2>&1
git push origin feature/achievery-rebuild >> C:\Dev\push-shape-up-log.txt 2>&1
echo === STEP 3: Pull main to sync with remote === >> C:\Dev\push-shape-up-log.txt 2>&1
git fetch origin main >> C:\Dev\push-shape-up-log.txt 2>&1
git checkout main >> C:\Dev\push-shape-up-log.txt 2>&1
git pull --ff-only origin main >> C:\Dev\push-shape-up-log.txt 2>&1
echo === STEP 4: Cherry-pick CI fix onto main === >> C:\Dev\push-shape-up-log.txt 2>&1
git cherry-pick 9b5973bfa8bef09dd8e797a84ca30aa072cbf54c >> C:\Dev\push-shape-up-log.txt 2>&1
echo === STEP 5: Push main === >> C:\Dev\push-shape-up-log.txt 2>&1
git push origin main >> C:\Dev\push-shape-up-log.txt 2>&1
echo === STEP 6: Return to feature branch === >> C:\Dev\push-shape-up-log.txt 2>&1
git checkout feature/achievery-rebuild >> C:\Dev\push-shape-up-log.txt 2>&1
echo === FINAL STATUS === >> C:\Dev\push-shape-up-log.txt 2>&1
git log --oneline -5 >> C:\Dev\push-shape-up-log.txt 2>&1
echo === DONE === >> C:\Dev\push-shape-up-log.txt 2>&1
echo Log written to C:\Dev\push-shape-up-log.txt
