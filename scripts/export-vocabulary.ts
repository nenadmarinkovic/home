import fs from "node:fs";
import path from "node:path";

import { buildLibExportFiles } from "../lib/lib-export";

function main() {
  const files = buildLibExportFiles();
  const root = process.cwd();
  for (const file of files) {
    const abs = path.join(root, file.path);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, file.content, "utf8");
    console.log(`wrote ${file.path}`);
  }
  console.log(`Exported vocab DB to ${files.length} files.`);
}

main();
