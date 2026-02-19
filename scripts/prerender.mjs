import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");

const templatePath = path.join(distDir, "index.html");
const serverEntryPath = path.join(distDir, "server", "entry-server.js");

const template = await readFile(templatePath, "utf8");
const { render } = await import(pathToFileURL(serverEntryPath).href);

const appHtml = render();
const output = template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

await writeFile(templatePath, output, "utf8");
console.log("Prerendered / to dist/index.html");
