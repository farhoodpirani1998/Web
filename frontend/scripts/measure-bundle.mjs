import { readdir, readFile, stat } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const assetsDir = fileURLToPath(new URL("../dist/assets/", import.meta.url));

let files;
try {
  files = await readdir(assetsDir);
} catch {
  console.error("Build the frontend first with `npm run build`.");
  process.exitCode = 1;
}

if (files) {
  const assets = [];

  for (const file of files) {
    if (!/\.(?:js|css)$/.test(file)) continue;
    const path = join(assetsDir, file);
    const [content, fileStat] = await Promise.all([readFile(path), stat(path)]);
    assets.push({
      file,
      bytes: fileStat.size,
      gzipBytes: gzipSync(content).byteLength,
    });
  }

  assets.sort((left, right) => right.gzipBytes - left.gzipBytes);
  const totals = assets.reduce(
    (result, asset) => ({
      bytes: result.bytes + asset.bytes,
      gzipBytes: result.gzipBytes + asset.gzipBytes,
    }),
    { bytes: 0, gzipBytes: 0 },
  );

  console.log("Local production asset sizes (JS/CSS only; gzip estimate):");
  for (const asset of assets) {
    console.log(
      `${asset.file}: ${asset.bytes} bytes raw, ${asset.gzipBytes} bytes gzip`,
    );
  }
  console.log(
    `Total: ${totals.bytes} bytes raw, ${totals.gzipBytes} bytes gzip`,
  );
}
