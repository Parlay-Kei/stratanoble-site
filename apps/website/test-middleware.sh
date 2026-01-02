#!/bin/bash

# Middleware Security Test Runner
# Usage: ./test-middleware.sh

echo "🧪 Running Middleware Security Tests..."
echo "========================================="
echo ""

cd "$(dirname "$0")"

# Run middleware tests specifically
npm test -- src/__tests__/middleware.test.ts --no-coverage --verbose

echo ""
echo "========================================="
echo "✅ Middleware Security Tests Complete"
