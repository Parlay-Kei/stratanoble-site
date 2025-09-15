#!/bin/bash

# Netlify build script to isolate website from monorepo
echo "Starting isolated website build..."

# Navigate to website directory
cd apps/website

# Remove any workspace references
rm -f package-lock.json
rm -f .npmrc

# Create standalone npmrc
echo "legacy-peer-deps=true" > .npmrc

# Install dependencies without workspace resolution
npm install --legacy-peer-deps --no-workspaces

# Build the website
npm run build

echo "Build completed successfully!"