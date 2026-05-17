const http = require("http");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const PORT = 8080;
const PUBLIC_DIR = path.join(__dirname);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".ico"]);
const COMPRESSIBLE_EXTS = new Set([".html", ".css", ".js", ".svg"]);

const server = http.createServer((req, res) => {
  const urlPath = req.url.split("?")[0];
  const filePath = path.join(PUBLIC_DIR, urlPath === "/" ? "index.html" : urlPath);

  // Prevent path traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  const ext = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[ext] || "application/octet-stream";

  fs.stat(filePath, (statErr, stat) => {
    if (statErr) {
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end("<h1>404 Not Found</h1>");
      return;
    }

    const etag = `"${stat.mtime.getTime().toString(16)}-${stat.size.toString(16)}"`;

    if (req.headers["if-none-match"] === etag) {
      res.writeHead(304);
      res.end();
      return;
    }

    const headers = { "Content-Type": contentType, ETag: etag };

    if (IMAGE_EXTS.has(ext)) {
      headers["Cache-Control"] = "public, max-age=31536000, immutable";
    } else if (ext === ".html") {
      headers["Cache-Control"] = "no-cache";
    } else {
      headers["Cache-Control"] = "public, max-age=86400";
    }

    const acceptGzip = (req.headers["accept-encoding"] || "").includes("gzip");

    if (COMPRESSIBLE_EXTS.has(ext) && acceptGzip) {
      fs.readFile(filePath, (err, content) => {
        if (err) { res.writeHead(500); res.end("Server Error"); return; }
        zlib.gzip(content, (gzErr, compressed) => {
          if (gzErr) {
            res.writeHead(200, headers);
            res.end(content);
          } else {
            headers["Content-Encoding"] = "gzip";
            headers["Vary"] = "Accept-Encoding";
            res.writeHead(200, headers);
            res.end(compressed);
          }
        });
      });
    } else {
      fs.readFile(filePath, (err, content) => {
        if (err) { res.writeHead(500); res.end("Server Error"); return; }
        res.writeHead(200, headers);
        res.end(content);
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
