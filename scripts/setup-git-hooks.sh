#!/bin/bash

echo "🔧 Setting up Git hooks..."

# Install husky if not already installed
if [ ! -d "node_modules/husky" ]; then
  echo "📦 Installing husky..."
  npm install --save-dev husky
fi

# Initialize husky
npx husky install

# Create pre-commit hook
echo "📝 Creating pre-commit hook..."
npx husky add .husky/pre-commit "npm run agents trigger pre-commit"
chmod +x .husky/pre-commit

# Create pre-push hook
echo "📝 Creating pre-push hook..."
npx husky add .husky/pre-push "npm run agents trigger pre-push"
chmod +x .husky/pre-push

# Create post-commit hook for logging
echo "📝 Creating post-commit hook..."
npx husky add .husky/post-commit "echo '✅ Commit completed at' && date"
chmod +x .husky/post-commit

echo ""
echo "✅ Git hooks installed!"
echo ""
echo "Hooks will now run automatically:"
echo "  - pre-commit: Lint & type check"
echo "  - pre-push: Full validation"
echo "  - post-commit: Update logs"
echo ""
