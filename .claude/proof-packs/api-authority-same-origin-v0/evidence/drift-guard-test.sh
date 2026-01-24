#!/bin/bash
# Drift Guard: Prevents hardcoded localhost endpoints in frontend

echo "🔍 Checking for hardcoded localhost endpoints..."

# Search for hardcoded 127.0.0.1:#### patterns in frontend source
HARDCODED=$(grep -r "127\.0\.0\.1:[0-9]\{4\}" .claude/tools/command-center/ui/src --include="*.js" --include="*.jsx" --exclude="*setupProxy.js" --exclude="*apiBase.js")

if [ -n "$HARDCODED" ]; then
  echo "❌ DRIFT DETECTED: Hardcoded localhost endpoints found:"
  echo "$HARDCODED"
  exit 1
else
  echo "✅ CLEAN: No hardcoded localhost endpoints in frontend source"
  exit 0
fi