import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const REGISTRY_ROOT = path.join(ROOT, "public", "r");
const REGISTRY_INDEX_PATH = path.join(REGISTRY_ROOT, "registry.json");

const readJson = async (filePath) => JSON.parse(await readFile(filePath, "utf8"));

const writeJson = async (filePath, data) => {
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
};

const copyRegistryFile = async (relativePath) => {
  const sourcePath = path.join(ROOT, relativePath);
  const destinationPath = path.join(REGISTRY_ROOT, relativePath);
  await mkdir(path.dirname(destinationPath), { recursive: true });
  await cp(sourcePath, destinationPath);
};

const sanitizeRegistryItem = (item) => {
  if (!Array.isArray(item.files)) return item;
  return {
    ...item,
    files: item.files.map(({ content, ...file }) => file),
  };
};

const main = async () => {
  const registry = await readJson(REGISTRY_INDEX_PATH);
  const itemNames = (registry.items || []).map((item) => item.name).filter(Boolean);

  for (const itemName of itemNames) {
    const itemJsonPath = path.join(REGISTRY_ROOT, `${itemName}.json`);
    const item = await readJson(itemJsonPath);
    const sanitizedItem = sanitizeRegistryItem(item);

    await writeJson(itemJsonPath, sanitizedItem);

    for (const file of sanitizedItem.files || []) {
      if (!file.path) continue;
      await copyRegistryFile(file.path);
    }
  }
};

await main();
