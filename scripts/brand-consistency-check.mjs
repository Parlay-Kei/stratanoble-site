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
  path.join(ROOT, "docs", "BRAND_FREEZE_2026-01-02.md"),
];

function isAllowed(filePath) {
  return ALLOW_PATHS.some((p) => filePath.startsWith(p));
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
