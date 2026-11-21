import { constants } from "node:fs";
import { access, copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.resolve(backendDir, "..", "index.html");
const target = path.resolve(backendDir, "public", "portfolio.html");

const exists = async (filePath) => {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

if (!(await exists(source))) {
  if (await exists(target)) {
    console.warn(
      `[sync-frontend] ${source} not found. Keeping the committed copy at public/portfolio.html.`
    );
    process.exit(0);
  }

  console.error(
    "[sync-frontend] Could not find ../index.html and there is no public/portfolio.html fallback."
  );
  process.exit(1);
}

await mkdir(path.dirname(target), { recursive: true });
await copyFile(source, target);
console.log("[sync-frontend] Copied ../index.html -> public/portfolio.html");
