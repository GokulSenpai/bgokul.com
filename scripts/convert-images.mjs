#!/usr/bin/env node
/**
 * Converts image(s) to WebP at a fast-loading quality/size tradeoff.
 *
 * Usage:
 *   npm run convert-images -- <file-or-folder> [...more] [--out <dir>] [--quality 70]
 *
 * - A folder argument converts every image file found inside it (recursively).
 * - Defaults to quality 70, matching "loads fast, still looks good."
 * - Output defaults to next to the source file, same name, .webp extension.
 *   Pass --out to write everything into one directory instead.
 *
 * Examples:
 *   npm run convert-images -- "game images/17ya/17ya_postimage.png"
 *   npm run convert-images -- "game images" --out src/content/projects/_incoming
 */
import { readdir, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif", ".tiff", ".avif", ".webp"]);

function parseArgs(argv) {
  const inputs = [];
  let outDir;
  let quality = 70;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--out") {
      outDir = argv[++i];
    } else if (arg === "--quality") {
      quality = Number(argv[++i]);
    } else {
      inputs.push(arg);
    }
  }

  return { inputs, outDir, quality };
}

async function collectImageFiles(inputPath) {
  const stats = await stat(inputPath);
  if (stats.isFile()) {
    return IMAGE_EXTENSIONS.has(path.extname(inputPath).toLowerCase()) ? [inputPath] : [];
  }

  const entries = await readdir(inputPath, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(inputPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectImageFiles(entryPath)));
    } else if (IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(entryPath);
    }
  }
  return files;
}

async function convertOne(filePath, outDir, quality) {
  const parsed = path.parse(filePath);
  const destDir = outDir ?? parsed.dir;
  await mkdir(destDir, { recursive: true });
  const destPath = path.join(destDir, `${parsed.name}.webp`);

  const before = (await stat(filePath)).size;
  // Flatten any alpha channel onto solid black first. A transparent/
  // semi-transparent PNG renders fine on a dark page but shows the page's
  // own background bleeding through on a light background — flattening
  // guarantees the same opaque result in both themes.
  // .rotate() with no args applies the EXIF orientation flag (phone photos are
  // often stored sideways + a "rotate me" tag that WebP output would drop).
  await sharp(filePath).rotate().flatten({ background: "#000000" }).webp({ quality }).toFile(destPath);
  const after = (await stat(destPath)).size;

  const savedPct = (((before - after) / before) * 100).toFixed(0);
  console.log(
    `${filePath} -> ${destPath}  (${(before / 1024).toFixed(0)}kb -> ${(after / 1024).toFixed(0)}kb, -${savedPct}%)`
  );
}

async function main() {
  const { inputs, outDir, quality } = parseArgs(process.argv.slice(2));

  if (inputs.length === 0) {
    console.error("Usage: npm run convert-images -- <file-or-folder> [...] [--out <dir>] [--quality 70]");
    process.exit(1);
  }

  const files = (await Promise.all(inputs.map(collectImageFiles))).flat();

  if (files.length === 0) {
    console.error("No image files found in the given input(s).");
    process.exit(1);
  }

  for (const file of files) {
    await convertOne(file, outDir, quality);
  }
}

main();
