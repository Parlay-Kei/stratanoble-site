#!/bin/bash
# Setup script for Strata Noble CI hooks

echo "🔧 Setting up Strata Noble CI hooks..."

# Make hooks executable
chmod +x .githooks/pre-commit

# Configure git to use custom hooks directory
git config core.hooksPath .githooks

echo "✅ CI hooks configured successfully!"
echo ""
echo "Hooks installed:"
echo "  • pre-commit: Type check, lint, test, and validation"
echo ""
echo "Note: Strata Noble already uses husky - this provides additional checks"
echo "To skip hooks temporarily: git commit --no-verify"
