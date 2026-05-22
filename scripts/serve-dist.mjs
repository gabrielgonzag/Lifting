import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../dist", import.meta.url)));
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "0.0.0.0";

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const isInsideRoot = (filePath) => {
  const pathFromRoot = relative(root, filePath);
  return pathFromRoot && !pathFromRoot.startsWith("..") && !pathFromRoot.includes(":");
};

const fileForRequest = async (requestUrl) => {
  const url = new URL(requestUrl, "http://localhost");
  const pathname = decodeURIComponent(url.pathname);
  const candidate = normalize(join(root, pathname === "/" ? "index.html" : pathname));
  const safeCandidate = isInsideRoot(candidate) ? candidate : join(root, "index.html");

  if (existsSync(safeCandidate)) {
    const info = await stat(safeCandidate);
    if (info.isFile()) return safeCandidate;
    if (info.isDirectory()) {
      const indexFile = join(safeCandidate, "index.html");
      if (existsSync(indexFile)) return indexFile;
    }
  }

  return join(root, "index.html");
};

const server = createServer(async (request, response) => {
  try {
    const filePath = await fileForRequest(request.url || "/");
    const type = mimeTypes[extname(filePath)] || "application/octet-stream";
    response.writeHead(200, {
      "Cache-Control": filePath.endsWith("index.html") ? "no-cache" : "public, max-age=31536000, immutable",
      "Content-Type": type,
    });
    createReadStream(filePath).pipe(response);
  } catch (error) {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Erro ao servir a aplicacao.");
  }
});

server.listen(port, host, () => {
  console.log(`Serving dist on http://${host}:${port}`);
});
