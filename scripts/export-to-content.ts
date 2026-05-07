import fs from "node:fs";
import path from "node:path";

import { buildExportFiles } from "../lib/articles-export";

function main() {
  const files = buildExportFiles();
  const root = process.cwd();
  for (const file of files) {
    const abs = path.join(root, file.path);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, file.content, "utf8");
    console.log(`wrote ${file.path}`);
  }
  console.log(`Exported ${files.length} files.`);
}

main();
