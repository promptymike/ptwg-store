// Extract base64 blob from MCP download_file_content response and save as raw file.
// Usage: node scripts/extract-drive-file.mjs <input-json> <output-path>

import { readFileSync, writeFileSync } from "node:fs";

const [, , inputPath, outputPath] = process.argv;

const data = JSON.parse(readFileSync(inputPath, "utf8"));
const blob = data.content[0].embeddedResource.contents.blob;
const buf = Buffer.from(blob, "base64");
writeFileSync(outputPath, buf);
console.log(
  `Wrote ${buf.length} bytes to ${outputPath}`,
);
