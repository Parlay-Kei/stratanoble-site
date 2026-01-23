#!/usr/bin/env bun
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

// Read the original package.json
const packageJsonPath = 'package.json';
const originalPackageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

// Create a new package.json with only the necessary fields
// Only include optional fields if they exist in the source
const newPackageJson: Record<string, unknown> = {
  name: originalPackageJson.name,
  version: originalPackageJson.version,
  bin: {
    'magic-patterns-mcp': './magic-patterns-mcp',
  },
};

// Conditionally include optional fields only if they exist
if (originalPackageJson.description !== undefined) {
  newPackageJson.description = originalPackageJson.description;
}
if (originalPackageJson.engines !== undefined) {
  newPackageJson.engines = originalPackageJson.engines;
}
if (originalPackageJson.repository !== undefined) {
  newPackageJson.repository = originalPackageJson.repository;
}
if (originalPackageJson.author !== undefined) {
  newPackageJson.author = originalPackageJson.author;
}
if (originalPackageJson.license !== undefined) {
  newPackageJson.license = originalPackageJson.license;
}
if (originalPackageJson.bugs !== undefined) {
  newPackageJson.bugs = originalPackageJson.bugs;
}
if (originalPackageJson.homepage !== undefined) {
  newPackageJson.homepage = originalPackageJson.homepage;
}
if (originalPackageJson.tags !== undefined) {
  newPackageJson.tags = originalPackageJson.tags;
}
if (originalPackageJson.keywords !== undefined) {
  newPackageJson.keywords = originalPackageJson.keywords;
}

// Write the new package.json to the dist directory
const distPath = join('dist', 'package.json');
console.log(`copying package.json to ${distPath}...`);

// Create the dist directory if it doesn't exist
mkdirSync(dirname(distPath), { recursive: true });

writeFileSync(distPath, JSON.stringify(newPackageJson, null, 2));
