import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { createReadStream, promises as fs } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataFile = path.join(root, "data", "store-products.json");
const uploadDir = path.join(root, "public", "uploads");
const port = Number(process.env.API_PORT || 3001);
const host = process.env.API_HOST || "0.0.0.0";
const adminPassword = process.env.ADMIN_PASSWORD;
const sessionSecret = process.env.SESSION_SECRET;
const maxJsonBytes = 1024 * 1024;
const maxImageBytes = 8 * 1024 * 1024;
const failedLogins = new Map();

if (!adminPassword || !sessionSecret || sessionSecret.length < 32) {
  console.error("Set ADMIN_PASSWORD and SESSION_SECRET (at least 32 characters) before starting the API.");
  process.exit(1);
}

const mimeExtensions = new Map([
  ["image/png", ".png"],
  ["image/jpeg", ".jpg"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
]);

function sendJson(response, status, payload, headers = {}) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...headers,
  });
  response.end(JSON.stringify(payload));
}

function parseCookies(request) {
  return Object.fromEntries((request.headers.cookie || "").split(";").map((part) => {
    const [key, ...value] = part.trim().split("=");
    return [key, decodeURIComponent(value.join("="))];
  }).filter(([key]) => key));
}

function sign(value) {
  return createHmac("sha256", sessionSecret).update(value).digest("base64url");
}

function createSession() {
  const payload = Buffer.from(JSON.stringify({ expires: Date.now() + 8 * 60 * 60 * 1000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function hasSession(request) {
  const token = parseCookies(request).hfq_admin;
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = sign(payload);
  const suppliedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (suppliedBuffer.length !== expectedBuffer.length || !timingSafeEqual(suppliedBuffer, expectedBuffer)) return false;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString()).expires > Date.now();
  } catch {
    return false;
  }
}

function isSameOrigin(request) {
  const origin = request.headers.origin;
  if (!origin) return true;
  try {
    const forwardedHost = request.headers["x-forwarded-host"]?.split(",")[0].trim();
    return new URL(origin).host === (forwardedHost || request.headers.host);
  } catch {
    return false;
  }
}

async function readJson(request, limit = maxJsonBytes) {
  const chunks = [];
  let bytes = 0;
  for await (const chunk of request) {
    bytes += chunk.length;
    if (bytes > limit) throw Object.assign(new Error("Request body is too large."), { status: 413 });
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw Object.assign(new Error("Request body must be valid JSON."), { status: 400 });
  }
}

function validateCatalog(catalog) {
  if (!catalog || typeof catalog !== "object") return false;
  const requiredGroups = ["ranks", "upgrades", "keys", "shards"];
  return requiredGroups.every((group) => Array.isArray(catalog[group]) && catalog[group].every((product) => {
    if (!product || typeof product !== "object") return false;
    if (!["id", "price", "url"].every((key) => typeof product[key] === "string")) return false;
    if (typeof product.description !== "string" || product.description.length > 280 || !Array.isArray(product.perks)) return false;
    if (group !== "upgrades" && !["name", "image", "color", "dark"].every((key) => typeof product[key] === "string")) return false;
    if (group !== "upgrades" && product.tag !== undefined && typeof product.tag !== "string") return false;
    if (group === "upgrades" && !["from", "to"].every((key) => typeof product[key] === "string")) return false;
    if (group === "ranks" && typeof product.popular !== "boolean") return false;
    if (group !== "upgrades" && (!/^#[0-9a-f]{6}$/i.test(product.color) || !/^#[0-9a-f]{6}$/i.test(product.dark))) return false;
    try {
      if (product.url && !["http:", "https:"].includes(new URL(product.url).protocol)) return false;
    } catch {
      return false;
    }
    return product.id.length > 0 && product.id.length <= 80 && (product.name || "").length <= 80 && (product.image || "").length <= 1000 && product.price.length <= 40 && product.url.length <= 500 && product.perks.length <= 30 && product.perks.every((perk) => typeof perk === "string" && perk.length <= 200);
  }));
}

async function loadCatalog() {
  return JSON.parse(await fs.readFile(dataFile, "utf8"));
}

async function saveCatalog(catalog) {
  const temporaryFile = `${dataFile}.${randomBytes(6).toString("hex")}.tmp`;
  await fs.writeFile(temporaryFile, `${JSON.stringify(catalog, null, 2)}\n`, { mode: 0o600 });
  await fs.rename(temporaryFile, dataFile);
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  const pathname = url.pathname;

  if (request.method === "GET" && pathname === "/api/health") {
    return sendJson(response, 200, { ok: true });
  }

  if (request.method === "GET" && pathname === "/api/store/products") {
    try {
      return sendJson(response, 200, await loadCatalog(), { "Cache-Control": "no-cache" });
    } catch {
      return sendJson(response, 500, { error: "Store catalog could not be loaded." });
    }
  }

  if (request.method === "GET" && pathname === "/api/admin/session") {
    const authenticated = hasSession(request);
    return sendJson(response, authenticated ? 200 : 401, { authenticated });
  }

  if (request.method === "POST" && pathname === "/api/admin/login") {
    if (!isSameOrigin(request)) return sendJson(response, 403, { error: "Request origin is not allowed." });
    const address = request.socket.remoteAddress || "unknown";
    let attempts = failedLogins.get(address);
    if (attempts?.blockedUntil && attempts.blockedUntil <= Date.now()) {
      attempts = undefined;
      failedLogins.delete(address);
    }
    if (attempts?.blockedUntil > Date.now()) return sendJson(response, 429, { error: "Too many sign-in attempts. Try again in 15 minutes." });
    try {
      const body = await readJson(request);
      const supplied = Buffer.from(typeof body.password === "string" ? body.password : "");
      const expected = Buffer.from(adminPassword);
      const valid = supplied.length === expected.length && timingSafeEqual(supplied, expected);
      if (!valid) {
        const failures = (attempts?.count || 0) + 1;
        failedLogins.set(address, { count: failures, blockedUntil: failures >= 5 ? Date.now() + 15 * 60 * 1000 : 0 });
        return sendJson(response, failures >= 5 ? 429 : 401, { error: failures >= 5 ? "Too many sign-in attempts. Try again in 15 minutes." : "That password does not match." });
      }
      failedLogins.delete(address);
      return sendJson(response, 200, { ok: true }, {
        "Set-Cookie": `hfq_admin=${encodeURIComponent(createSession())}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
      });
    } catch (error) {
      return sendJson(response, error.status || 400, { error: error.message || "Login failed." });
    }
  }

  if (request.method !== "GET" && pathname.startsWith("/api/admin/") && !isSameOrigin(request)) {
    return sendJson(response, 403, { error: "Request origin is not allowed." });
  }

  if (pathname.startsWith("/api/admin/")) {
    if (request.method === "POST" && pathname === "/api/admin/logout") {
      return sendJson(response, 200, { ok: true }, { "Set-Cookie": "hfq_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0" });
    }
    if (!isSameOrigin(request)) return sendJson(response, 403, { error: "Request origin is not allowed." });
    if (!hasSession(request)) return sendJson(response, 401, { error: "Sign in to manage the store." });

    if (request.method === "PUT" && pathname === "/api/admin/store/products") {
      try {
        const catalog = await readJson(request);
        if (!validateCatalog(catalog)) return sendJson(response, 400, { error: "The store data is incomplete or invalid." });
        const ids = Object.values(catalog).flat().map((product) => product.id);
        if (new Set(ids).size !== ids.length) return sendJson(response, 400, { error: "Product IDs must be unique." });
        await saveCatalog(catalog);
        return sendJson(response, 200, { ok: true });
      } catch (error) {
        return sendJson(response, error.status || 400, { error: error.message || "Store changes could not be saved." });
      }
    }

    if (request.method === "POST" && pathname === "/api/admin/images") {
      const mimeType = request.headers["content-type"]?.split(";")[0];
      const extension = mimeExtensions.get(mimeType);
      if (!extension) return sendJson(response, 415, { error: "Choose a PNG, JPG, WebP or GIF image." });
      const declaredLength = Number(request.headers["content-length"] || 0);
      if (declaredLength > maxImageBytes) return sendJson(response, 413, { error: "Images must be 8 MB or smaller." });
      const chunks = [];
      let bytes = 0;
      for await (const chunk of request) {
        bytes += chunk.length;
        if (bytes > maxImageBytes) return sendJson(response, 413, { error: "Images must be 8 MB or smaller." });
        chunks.push(chunk);
      }
      const image = Buffer.concat(chunks);
      const signatures = {
        "image/png": image.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
        "image/jpeg": image[0] === 0xff && image[1] === 0xd8,
        "image/webp": image.subarray(0, 4).toString() === "RIFF" && image.subarray(8, 12).toString() === "WEBP",
        "image/gif": image.subarray(0, 3).toString() === "GIF",
      };
      if (!image.length || !signatures[mimeType]) return sendJson(response, 400, { error: "The selected file is not a valid image." });
      await fs.mkdir(uploadDir, { recursive: true });
      const filename = `${Date.now().toString(36)}-${randomBytes(8).toString("hex")}${extension}`;
      await fs.writeFile(path.join(uploadDir, filename), image, { flag: "wx", mode: 0o644 });
      return sendJson(response, 201, { url: `/uploads/${filename}` });
    }

    return sendJson(response, 404, { error: "Admin endpoint not found." });
  }

  if (request.method === "GET" || request.method === "HEAD") {
    const requestedPath = decodeURIComponent(pathname === "/" ? "/index.html" : pathname);
    const buildRoot = path.join(root, "dist");
    const assetPath = pathname.startsWith("/uploads/")
      ? path.resolve(uploadDir, `.${pathname.slice("/uploads".length)}`)
      : path.resolve(buildRoot, `.${requestedPath}`);
    const allowedRoot = pathname.startsWith("/uploads/") ? uploadDir : buildRoot;
    if (assetPath.startsWith(`${allowedRoot}${path.sep}`)) {
      try {
        const details = await fs.stat(assetPath);
        if (details.isFile()) {
          const contentTypes = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif", ".woff2": "font/woff2", ".ico": "image/x-icon" };
          response.writeHead(200, { "Content-Type": contentTypes[path.extname(assetPath)] || "application/octet-stream", "Content-Length": details.size, "X-Content-Type-Options": "nosniff" });
          if (request.method === "HEAD") return response.end();
          return createReadStream(assetPath).pipe(response);
        }
      } catch {
        if (pathname.startsWith("/uploads/")) return sendJson(response, 404, { error: "Image not found." });
      }
      if (!pathname.startsWith("/api/") && !pathname.startsWith("/uploads/")) {
        try {
          const indexFile = path.join(buildRoot, "index.html");
          const html = await fs.readFile(indexFile);
          response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Content-Length": html.length, "X-Content-Type-Options": "nosniff" });
          return response.end(html);
        } catch {
          return sendJson(response, 503, { error: "Build the website before starting the production server." });
        }
      }
    }
  }

  return sendJson(response, 404, { error: "Endpoint not found." });
});

server.listen(port, host, () => {
  console.log(`HFQ website and store API listening on ${host}:${port}`);
});

process.on("SIGINT", () => server.close(() => process.exit(0)));
process.on("SIGTERM", () => server.close(() => process.exit(0)));
