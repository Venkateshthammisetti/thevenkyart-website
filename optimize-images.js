/**
 * Image optimization script for thevenkyart-website.
 *
 * SETUP (one-time):
 *   npm install sharp
 *
 * USAGE:
 *   node optimize-images.js          → compress JPEGs/PNGs in-place (no filenames change)
 *   node optimize-images.js --webp   → also generate .webp copies alongside originals
 *   node optimize-images.js --dry    → preview what would change without writing files
 *
 * WHAT IT DOES:
 *   - Re-compresses JPEGs to quality 80 (typically 50-70% size reduction)
 *   - Optimises PNGs losslessly
 *   - Optionally creates .webp versions for maximum savings (~30% more than JPEG)
 *   - Resizes anything wider than 1400px (sufficient for 3-column grid on 4K)
 *   - Backs up originals to assets/images/_originals/ before touching them
 */

const path = require("path");
const fs = require("fs");

let sharp;
try {
  sharp = require("sharp");
} catch {
  console.error(
    "\nERROR: sharp is not installed.\nRun: npm install sharp\n",
  );
  process.exit(1);
}

const IMAGES_DIR = path.join(__dirname, "assets", "images");
const BACKUP_DIR = path.join(IMAGES_DIR, "_originals");
const MAX_WIDTH = 1400;
const JPEG_QUALITY = 80;
const PNG_QUALITY = 80;
const WEBP_QUALITY = 80;

const SUPPORTED = new Set([".jpg", ".jpeg", ".png"]);
const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry");
const MAKE_WEBP = args.includes("--webp");

function formatBytes(bytes) {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${(bytes / 1024).toFixed(0)} KB`;
}

function getAllImages(dir, list = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "_originals") getAllImages(full, list);
    } else if (SUPPORTED.has(path.extname(entry.name).toLowerCase())) {
      list.push(full);
    }
  }
  return list;
}

async function processImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const originalSize = fs.statSync(filePath).size;

  // Back up original before first write
  const relPath = path.relative(IMAGES_DIR, filePath);
  const backupPath = path.join(BACKUP_DIR, relPath);

  if (!DRY_RUN && !fs.existsSync(backupPath)) {
    fs.mkdirSync(path.dirname(backupPath), { recursive: true });
    fs.copyFileSync(filePath, backupPath);
  }

  const img = sharp(filePath).resize({
    width: MAX_WIDTH,
    withoutEnlargement: true,
  });

  const results = [];

  // Compress in-place (same filename, same format)
  if (!DRY_RUN) {
    const tmp = filePath + ".tmp";
    if (ext === ".png") {
      await img.png({ quality: PNG_QUALITY, compressionLevel: 9 }).toFile(tmp);
    } else {
      await img.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toFile(tmp);
    }
    fs.renameSync(tmp, filePath);
  }

  const newSize = DRY_RUN ? null : fs.statSync(filePath).size;
  results.push({
    from: filePath,
    to: filePath,
    originalSize,
    newSize,
    type: "compress",
  });

  // Optionally generate .webp alongside
  if (MAKE_WEBP) {
    const webpPath = filePath.replace(/\.(jpe?g|png)$/i, ".webp");
    if (!DRY_RUN) {
      await sharp(filePath)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toFile(webpPath);
    }
    const webpSize = DRY_RUN ? null : fs.statSync(webpPath).size;
    results.push({
      from: filePath,
      to: webpPath,
      originalSize,
      newSize: webpSize,
      type: "webp",
    });
  }

  return results;
}

async function main() {
  console.log(`\nthevenkyart image optimiser`);
  console.log(`============================`);
  if (DRY_RUN) console.log("DRY RUN — no files will be written\n");
  if (MAKE_WEBP) console.log("WebP copies will also be generated\n");

  const files = getAllImages(IMAGES_DIR);
  console.log(`Found ${files.length} images in assets/images/\n`);

  let totalOriginal = 0;
  let totalNew = 0;
  let failures = 0;

  for (const file of files) {
    const rel = path.relative(__dirname, file);
    try {
      const results = await processImage(file);
      for (const r of results) {
        totalOriginal += r.originalSize;
        if (r.newSize !== null) totalNew += r.newSize;
        const saving = r.newSize
          ? `${((1 - r.newSize / r.originalSize) * 100).toFixed(0)}% smaller`
          : "(dry run)";
        const tag = r.type === "webp" ? " [webp]" : "";
        console.log(`  ✓ ${path.relative(__dirname, r.to)}${tag} — ${saving}`);
      }
    } catch (err) {
      console.error(`  ✗ ${rel} — ${err.message}`);
      failures++;
    }
  }

  console.log(`\n============================`);
  if (!DRY_RUN && totalNew > 0) {
    const saved = totalOriginal - totalNew;
    const pct = ((saved / totalOriginal) * 100).toFixed(0);
    console.log(
      `Saved ${formatBytes(saved)} (${pct}%)  ·  ${formatBytes(totalOriginal)} → ${formatBytes(totalNew)}`,
    );
    if (failures > 0) console.log(`${failures} file(s) failed — see errors above`);
    console.log(`\nOriginals backed up to: assets/images/_originals/`);
    if (MAKE_WEBP) {
      console.log(
        `\nWebP files created! To serve them, use <picture> elements in your HTML.`,
      );
    }
  } else if (DRY_RUN) {
    console.log(
      `Would process ${files.length} images  ·  current total: ${formatBytes(totalOriginal)}`,
    );
  }
  console.log();
}

main().catch(console.error);
