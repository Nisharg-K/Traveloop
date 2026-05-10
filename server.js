import "dotenv/config";
import { createServer } from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as memoryStore from "./db/memory.js";
import * as postgresStore from "./db/postgres.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.join(__dirname, "frontend");
const port = Number(process.env.PORT || 3000);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

let store = memoryStore;
let databaseMode = "memory fallback";

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, message) {
  res.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(message);
}

async function readBody(req) {
  let data = "";
  for await (const chunk of req) data += chunk;
  if (!data) return {};
  try {
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function handleApi(req, res, url) {
  const pathParts = url.pathname.split("/").filter(Boolean);

  if (req.method === "GET" && url.pathname === "/api/state") {
    return sendJson(res, 200, await store.getState());
  }

  if (req.method === "POST" && url.pathname === "/api/login") {
    return sendJson(res, 200, { user: await store.login(await readBody(req)) });
  }

  if (req.method === "GET" && url.pathname === "/api/cities") {
    return sendJson(res, 200, await store.listCities());
  }

  if (req.method === "GET" && url.pathname === "/api/activities") {
    return sendJson(res, 200, await store.listActivities());
  }

  if (req.method === "GET" && url.pathname === "/api/trips") {
    return sendJson(res, 200, await store.listTrips());
  }

  if (req.method === "POST" && url.pathname === "/api/trips") {
    return sendJson(res, 201, await store.createTrip(await readBody(req)));
  }

  if (pathParts[0] === "api" && pathParts[1] === "trips" && pathParts[2]) {
    const tripId = pathParts[2];
    const trip = await store.getTrip(tripId);
    if (!trip) {
      return sendJson(res, 404, { error: "Trip not found" });
    }

    if (req.method === "GET" && pathParts.length === 3) {
      return sendJson(res, 200, trip);
    }

    if (req.method === "PATCH" && pathParts.length === 3) {
      return sendJson(res, 200, await store.patchTrip(tripId, await readBody(req)));
    }

    if (req.method === "DELETE" && pathParts.length === 3) {
      await store.deleteTrip(tripId);
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === "POST" && pathParts[3] === "copy") {
      return sendJson(res, 201, await store.copyTrip(tripId));
    }

    if (req.method === "POST" && pathParts[3] === "stops" && pathParts.length === 4) {
      return sendJson(res, 201, await store.addStop(tripId, await readBody(req)));
    }

    if (req.method === "POST" && pathParts[3] === "stops" && pathParts[4] === "reorder") {
      const body = await readBody(req);
      return sendJson(res, 200, await store.reorderStops(tripId, Number(body.fromIndex), Number(body.toIndex)));
    }

    if (req.method === "DELETE" && pathParts[3] === "stops" && pathParts[4]) {
      return sendJson(res, 200, await store.removeStop(tripId, pathParts[4]));
    }

    if (req.method === "POST" && pathParts[3] === "stops" && pathParts[4] && pathParts[5] === "activities") {
      const body = await readBody(req);
      return sendJson(res, 200, await store.addActivityToStop(tripId, pathParts[4], body.activityId));
    }

    if (
      req.method === "DELETE" &&
      pathParts[3] === "stops" &&
      pathParts[4] &&
      pathParts[5] === "activities" &&
      pathParts[6]
    ) {
      return sendJson(res, 200, await store.removeActivityFromStop(tripId, pathParts[4], pathParts[6]));
    }

    if (req.method === "POST" && pathParts[3] === "packing") {
      return sendJson(res, 201, await store.addPackingItem(tripId, await readBody(req)));
    }

    if (req.method === "PATCH" && pathParts[3] === "packing" && pathParts[4]) {
      return sendJson(res, 200, await store.patchPackingItem(tripId, pathParts[4], await readBody(req)));
    }

    if (req.method === "DELETE" && pathParts[3] === "packing" && pathParts[4]) {
      return sendJson(res, 200, await store.removePackingItem(tripId, pathParts[4]));
    }
  }

  return sendJson(res, 404, { error: "API route not found" });
}

async function serveStatic(res, pathname) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(frontendDir, safePath));
  if (!filePath.startsWith(frontendDir)) {
    return sendText(res, 403, "Forbidden");
  }

  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    res.end(data);
  } catch {
    try {
      const fallback = await fs.readFile(path.join(frontendDir, "index.html"));
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(fallback);
    } catch {
      sendText(res, 404, "Not found");
    }
  }
}

async function initStore() {
  if (!postgresStore.isDatabaseConfigured()) {
    await memoryStore.initDatabase();
    return;
  }

  try {
    await postgresStore.initDatabase();
    store = postgresStore;
    databaseMode = "PostgreSQL";
  } catch (error) {
    console.warn("PostgreSQL init failed, falling back to memory store.");
    console.warn(error.message);
    await memoryStore.initDatabase();
    store = memoryStore;
    databaseMode = "memory fallback";
  }
}

await initStore();

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith("/api/")) {
      return handleApi(req, res, url);
    }
    return serveStatic(res, url.pathname);
  } catch (error) {
    console.error(error);
    return sendJson(res, 500, { error: "Server error" });
  }
});

server.listen(port, () => {
  console.log(`Traveloop server running at http://localhost:${port} using ${databaseMode}`);
});
