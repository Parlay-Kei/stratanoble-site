import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const FORBIDDEN = [
  "StrataNova",
  "stratanova.com",
];

const ALLOW_PATHS = [
  path.join(ROOT, "docs", "archive"),
  path.join(ROOT, "brand", "strata-noble", "proofs"),
  path.join(ROOT, "marketing-restructure-export"),
];

const ALLOW_FILES = [
  path.join(ROOT, "docs", "BRAND_FREEZE_2026-01-02.md"),
];

function isAllowed(filePath) {
  // Check exact file matches first
  if (ALLOW_FILES.includes(filePath)) {
    return true;
  }

  // Check directory paths with proper boundary checking
  return ALLOW_PATHS.some((allowedPath) => {
    // For directory paths, ensure the match is at a path boundary
    // Either the path exactly matches, or the next character is a path separator
    if (filePath === allowedPath) {
      return true;
    }
    
    // Check if filePath starts with allowedPath followed by a path separator
    const normalizedAllowed = path.normalize(allowedPath);
    const normalizedFile = path.normalize(filePath);
    
    if (normalizedFile.startsWith(normalizedAllowed)) {
      const nextChar = normalizedFile[normalizedAllowed.length];
      // Path separator can be / or \ depending on OS
      return nextChar === path.sep || nextChar === '/' || nextChar === '\\';
    }
    
    return false;
  });
}

function walk(dir, files = []) {
  for (const item of fs.readdirSync(dir)) {
    const p = path.join(dir, item);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      if (item === "node_modules" || item === ".git" || item === "build" || item === "coverage" || item === ".netlify") continue;
      walk(p, files);
    } else {
      files.push(p);
    }
  }
  return files;
}

const textFiles = walk(ROOT).filter((p) =>
  /\.(md|txt|js|jsx|ts|tsx|json|yml|yaml|html|css|toml)$/.test(p)
);

let violations = [];

for (const file of textFiles) {
  if (isAllowed(file)) continue;
  const content = fs.readFileSync(file, "utf8");
  for (const term of FORBIDDEN) {
    if (content.includes(term)) violations.push({ file, term });
  }
}

if (violations.length) {
  console.error("Brand Consistency Check FAILED:");
  for (const v of violations) console.error(`- ${v.term} in ${v.file}`);
  process.exit(1);
}

console.log("Brand Consistency Check PASSED.");
