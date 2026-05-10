import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.join(__dirname, "frontend");
const port = Number(process.env.PORT || 3000);

const cities = [
  {
    id: "lisbon",
    name: "Lisbon",
    country: "Portugal",
    costIndex: 72,
    popularity: "High",
    vibe: "sunlit trams and tiled streets",
    image:
      "https://images.unsplash.com/photo-1513735492246-483525079686?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "kyoto",
    name: "Kyoto",
    country: "Japan",
    costIndex: 88,
    popularity: "Trending",
    vibe: "quiet temples and tea houses",
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "marrakesh",
    name: "Marrakesh",
    country: "Morocco",
    costIndex: 61,
    popularity: "High",
    vibe: "riads, souks, and warm evenings",
    image:
      "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "copenhagen",
    name: "Copenhagen",
    country: "Denmark",
    costIndex: 93,
    popularity: "Rising",
    vibe: "harbor loops and design cafes",
    image:
      "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "seoul",
    name: "Seoul",
    country: "South Korea",
    costIndex: 79,
    popularity: "High",
    vibe: "late-night food and fast energy",
    image:
      "https://images.unsplash.com/photo-1538485399081-7c8976f6decb?auto=format&fit=crop&w=1200&q=80"
  }
];

const activities = [
  { id: "tram-tour", cityId: "lisbon", name: "Historic Tram Ride", type: "Sightseeing", cost: 18, duration: 2, time: "10:00" },
  { id: "fado-night", cityId: "lisbon", name: "Fado Dinner Set", type: "Food", cost: 42, duration: 3, time: "19:30" },
  { id: "tea-ceremony", cityId: "kyoto", name: "Tea Ceremony", type: "Culture", cost: 36, duration: 2, time: "14:00" },
  { id: "temple-walk", cityId: "kyoto", name: "Temple Sunrise Walk", type: "Outdoor", cost: 0, duration: 2, time: "06:30" },
  { id: "atlas-spa", cityId: "marrakesh", name: "Hammam Spa", type: "Relax", cost: 44, duration: 2, time: "17:00" },
  { id: "souq-tour", cityId: "marrakesh", name: "Souq Shopping Trail", type: "Sightseeing", cost: 22, duration: 3, time: "11:30" },
  { id: "harbor-bike", cityId: "copenhagen", name: "Harbor Bike Loop", type: "Outdoor", cost: 16, duration: 3, time: "09:00" },
  { id: "bistro-night", cityId: "copenhagen", name: "Canal Bistro Night", type: "Food", cost: 51, duration: 2, time: "20:00" },
  { id: "food-market", cityId: "seoul", name: "Night Market Tasting", type: "Food", cost: 24, duration: 3, time: "19:00" },
  { id: "han-river", cityId: "seoul", name: "Han River Picnic", type: "Relax", cost: 12, duration: 2, time: "16:00" }
];

let state = {
  user: {
    name: "Maya",
    email: "maya@traveloop.test"
  },
  trips: [
    {
      id: "trip-1",
      name: "Iberian Color Loop",
      startDate: "2026-06-08",
      endDate: "2026-06-17",
      description: "A sunny balance of food, boutique stays, and rail days.",
      coverImage: cities[0].image,
      budget: 2400,
      shared: true,
      costs: { transport: 620, stay: 940, food: 430, activities: 126 },
      stops: [
        { id: "stop-1", cityId: "lisbon", startDate: "2026-06-08", endDate: "2026-06-11", activities: ["tram-tour", "fado-night"] },
        { id: "stop-2", cityId: "copenhagen", startDate: "2026-06-12", endDate: "2026-06-17", activities: ["harbor-bike"] }
      ],
      packing: [
        { id: "pack-1", label: "Passport", category: "Essentials", packed: true },
        { id: "pack-2", label: "Portable charger", category: "Tech", packed: false },
        { id: "pack-3", label: "Light jacket", category: "Clothing", packed: false }
      ]
    },
    {
      id: "trip-2",
      name: "Kyoto Slow Week",
      startDate: "2026-09-03",
      endDate: "2026-09-10",
      description: "Quiet mornings, tea breaks, and a gentle neighborhood pace.",
      coverImage: cities[1].image,
      budget: 1950,
      shared: false,
      costs: { transport: 480, stay: 760, food: 320, activities: 110 },
      stops: [
        { id: "stop-3", cityId: "kyoto", startDate: "2026-09-03", endDate: "2026-09-10", activities: ["tea-ceremony", "temple-walk"] }
      ],
      packing: [
        { id: "pack-4", label: "Walking shoes", category: "Clothing", packed: false },
        { id: "pack-5", label: "Travel adapter", category: "Tech", packed: true }
      ]
    },
    {
      id: "trip-3",
      name: "Seoul Pulse",
      startDate: "2027-03-05",
      endDate: "2027-03-12",
      description: "Late bites, shopping lanes, and a flexible city rhythm.",
      coverImage: cities[4].image,
      budget: 2100,
      shared: true,
      costs: { transport: 540, stay: 810, food: 360, activities: 120 },
      stops: [
        { id: "stop-4", cityId: "seoul", startDate: "2027-03-05", endDate: "2027-03-12", activities: ["food-market", "han-river"] }
      ],
      packing: [
        { id: "pack-6", label: "Skincare pouch", category: "Toiletries", packed: false }
      ]
    }
  ],
  cities,
  activities
};

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
  for await (const chunk of req) {
    data += chunk;
  }
  if (!data) return {};
  try {
    return JSON.parse(data);
  } catch {
    return {};
  }
}

function getTrip(tripId) {
  return state.trips.find((trip) => trip.id === tripId);
}

function enrichTrip(trip) {
  return {
    ...trip,
    stops: trip.stops.map((stop) => ({
      ...stop,
      city: state.cities.find((city) => city.id === stop.cityId) || null,
      activityDetails: stop.activities
        .map((activityId) => state.activities.find((activity) => activity.id === activityId))
        .filter(Boolean)
    }))
  };
}

function updateTrip(tripId, updater) {
  state = {
    ...state,
    trips: state.trips.map((trip) => (trip.id === tripId ? updater(trip) : trip))
  };
  return getTrip(tripId);
}

async function handleApi(req, res, url) {
  const pathParts = url.pathname.split("/").filter(Boolean);

  if (req.method === "GET" && url.pathname === "/api/state") {
    return sendJson(res, 200, {
      user: state.user,
      cities: state.cities,
      activities: state.activities,
      trips: state.trips.map(enrichTrip)
    });
  }

  if (req.method === "POST" && url.pathname === "/api/login") {
    const body = await readBody(req);
    state.user = {
      name: body.name || "Traveler",
      email: body.email || "traveler@traveloop.test"
    };
    return sendJson(res, 200, { user: state.user });
  }

  if (req.method === "GET" && url.pathname === "/api/cities") {
    return sendJson(res, 200, state.cities);
  }

  if (req.method === "GET" && url.pathname === "/api/activities") {
    return sendJson(res, 200, state.activities);
  }

  if (req.method === "GET" && url.pathname === "/api/trips") {
    return sendJson(res, 200, state.trips.map(enrichTrip));
  }

  if (req.method === "POST" && url.pathname === "/api/trips") {
    const body = await readBody(req);
    const trip = {
      id: randomUUID(),
      name: body.name || "Untitled Trip",
      startDate: body.startDate || "",
      endDate: body.endDate || "",
      description: body.description || "",
      coverImage: body.coverImage || state.cities[0].image,
      budget: Number(body.budget || 1800),
      shared: false,
      costs: { transport: 0, stay: 0, food: 0, activities: 0 },
      stops: [],
      packing: []
    };
    state.trips.unshift(trip);
    return sendJson(res, 201, enrichTrip(trip));
  }

  if (pathParts[0] === "api" && pathParts[1] === "trips" && pathParts[2]) {
    const tripId = pathParts[2];
    const trip = getTrip(tripId);
    if (!trip) {
      return sendJson(res, 404, { error: "Trip not found" });
    }

    if (req.method === "GET" && pathParts.length === 3) {
      return sendJson(res, 200, enrichTrip(trip));
    }

    if (req.method === "PATCH" && pathParts.length === 3) {
      const body = await readBody(req);
      const next = updateTrip(tripId, (current) => ({
        ...current,
        ...body,
        id: current.id,
        stops: Array.isArray(body.stops) ? body.stops : current.stops,
        packing: Array.isArray(body.packing) ? body.packing : current.packing,
        costs: body.costs ? { ...current.costs, ...body.costs } : current.costs
      }));
      return sendJson(res, 200, enrichTrip(next));
    }

    if (req.method === "DELETE" && pathParts.length === 3) {
      state.trips = state.trips.filter((entry) => entry.id !== tripId);
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === "POST" && pathParts[3] === "copy") {
      const clone = {
        ...trip,
        id: randomUUID(),
        name: `${trip.name} Copy`,
        shared: false,
        stops: trip.stops.map((stop) => ({ ...stop, id: randomUUID(), activities: [...stop.activities] })),
        packing: trip.packing.map((item) => ({ ...item, id: randomUUID() }))
      };
      state.trips.unshift(clone);
      return sendJson(res, 201, enrichTrip(clone));
    }

    if (req.method === "POST" && pathParts[3] === "stops" && pathParts.length === 4) {
      const body = await readBody(req);
      const stop = {
        id: randomUUID(),
        cityId: body.cityId,
        startDate: body.startDate || trip.startDate,
        endDate: body.endDate || trip.endDate,
        activities: []
      };
      const next = updateTrip(tripId, (current) => ({ ...current, stops: [...current.stops, stop] }));
      return sendJson(res, 201, enrichTrip(next));
    }

    if (req.method === "POST" && pathParts[3] === "stops" && pathParts[4] === "reorder") {
      const body = await readBody(req);
      const next = updateTrip(tripId, (current) => {
        const stops = [...current.stops];
        const fromIndex = Number(body.fromIndex);
        const toIndex = Number(body.toIndex);
        if (fromIndex < 0 || toIndex < 0 || fromIndex >= stops.length || toIndex >= stops.length) {
          return current;
        }
        const [moved] = stops.splice(fromIndex, 1);
        stops.splice(toIndex, 0, moved);
        return { ...current, stops };
      });
      return sendJson(res, 200, enrichTrip(next));
    }

    if (req.method === "DELETE" && pathParts[3] === "stops" && pathParts[4]) {
      const stopId = pathParts[4];
      const next = updateTrip(tripId, (current) => ({
        ...current,
        stops: current.stops.filter((stop) => stop.id !== stopId)
      }));
      return sendJson(res, 200, enrichTrip(next));
    }

    if (req.method === "POST" && pathParts[3] === "stops" && pathParts[4] && pathParts[5] === "activities") {
      const stopId = pathParts[4];
      const body = await readBody(req);
      const next = updateTrip(tripId, (current) => ({
        ...current,
        stops: current.stops.map((stop) =>
          stop.id === stopId && !stop.activities.includes(body.activityId)
            ? { ...stop, activities: [...stop.activities, body.activityId] }
            : stop
        )
      }));
      return sendJson(res, 200, enrichTrip(next));
    }

    if (
      req.method === "DELETE" &&
      pathParts[3] === "stops" &&
      pathParts[4] &&
      pathParts[5] === "activities" &&
      pathParts[6]
    ) {
      const stopId = pathParts[4];
      const activityId = pathParts[6];
      const next = updateTrip(tripId, (current) => ({
        ...current,
        stops: current.stops.map((stop) =>
          stop.id === stopId
            ? { ...stop, activities: stop.activities.filter((id) => id !== activityId) }
            : stop
        )
      }));
      return sendJson(res, 200, enrichTrip(next));
    }

    if (req.method === "POST" && pathParts[3] === "packing") {
      const body = await readBody(req);
      const item = {
        id: randomUUID(),
        label: body.label || "Untitled item",
        category: body.category || "Essentials",
        packed: false
      };
      const next = updateTrip(tripId, (current) => ({
        ...current,
        packing: [...current.packing, item]
      }));
      return sendJson(res, 201, enrichTrip(next));
    }

    if (req.method === "PATCH" && pathParts[3] === "packing" && pathParts[4]) {
      const itemId = pathParts[4];
      const body = await readBody(req);
      const next = updateTrip(tripId, (current) => ({
        ...current,
        packing: current.packing.map((item) =>
          item.id === itemId ? { ...item, ...body, id: item.id } : item
        )
      }));
      return sendJson(res, 200, enrichTrip(next));
    }

    if (req.method === "DELETE" && pathParts[3] === "packing" && pathParts[4]) {
      const itemId = pathParts[4];
      const next = updateTrip(tripId, (current) => ({
        ...current,
        packing: current.packing.filter((item) => item.id !== itemId)
      }));
      return sendJson(res, 200, enrichTrip(next));
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

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname.startsWith("/api/")) {
    return handleApi(req, res, url);
  }

  return serveStatic(res, url.pathname);
});

server.listen(port, () => {
  console.log(`Traveloop server running at http://localhost:${port}`);
});
