import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const rootDir = process.cwd();
const registryDir = join(rootDir, "registry", "default");
const packageJsonPath = join(rootDir, "package.json");

const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const declared = new Set(Object.keys(packageJson.dependencies ?? {}));

const sourceFiles = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      walk(fullPath);
      continue;
    }

    const ext = extname(fullPath);
    if (ext === ".ts" || ext === ".tsx" || ext === ".js" || ext === ".jsx") {
      sourceFiles.push(fullPath);
    }
  }
};

const toPackageName = (specifier) => {
  if (specifier.startsWith("@")) {
    const parts = specifier.split("/");
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : specifier;
  }
  return specifier.split("/")[0];
};

const isPackageImport = (specifier) =>
  !!specifier &&
  !specifier.startsWith(".") &&
  !specifier.startsWith("/") &&
  !specifier.startsWith("@/");

const readImports = (source) => {
  const matches = [];
  const fromRegex = /\bfrom\s+["']([^"']+)["']/g;
  const importRegex = /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g;
  let match;

  while ((match = fromRegex.exec(source)) !== null) {
    matches.push(match[1]);
  }
  while ((match = importRegex.exec(source)) !== null) {
    matches.push(match[1]);
  }
  return matches;
};

walk(registryDir);

const missing = new Map();
for (const file of sourceFiles) {
  const source = readFileSync(file, "utf8");
  for (const specifier of readImports(source)) {
    if (!isPackageImport(specifier)) continue;
    const packageName = toPackageName(specifier);
    if (declared.has(packageName)) continue;

    if (!missing.has(packageName)) missing.set(packageName, new Set());
    missing.get(packageName).add(specifier);
  }
}

if (missing.size > 0) {
  console.error("Registry dependency check failed. Missing dependencies:");
  for (const [pkg, specifiers] of missing.entries()) {
    const used = Array.from(specifiers).sort().join(", ");
    console.error(`- ${pkg} (imports: ${used})`);
  }
  process.exit(1);
}

console.log("Registry dependency check passed.");
