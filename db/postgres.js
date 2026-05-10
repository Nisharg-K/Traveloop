import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { activities, cities, trips, user } from "./seed-data.js";

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.join(__dirname, "schema.sql");

let pool = null;

function toTripRecord(row) {
  return {
    id: row.id,
    name: row.name,
    startDate: row.start_date,
    endDate: row.end_date,
    description: row.description,
    coverImage: row.cover_image,
    budget: Number(row.budget),
    shared: row.shared,
    costs: row.costs || {},
    stops: row.stops || [],
    packing: row.packing || []
  };
}

function enrichTrip(trip, cityRows, activityRows) {
  return {
    ...trip,
    stops: trip.stops.map((stop) => ({
      ...stop,
      city: cityRows.find((city) => city.id === stop.cityId) || null,
      activityDetails: (stop.activities || [])
        .map((activityId) => activityRows.find((activity) => activity.id === activityId))
        .filter(Boolean)
    }))
  };
}

async function query(sql, params = []) {
  return pool.query(sql, params);
}

async function getCities() {
  const result = await query(
    `SELECT id, name, country, cost_index AS "costIndex", popularity, vibe, image
     FROM cities
     ORDER BY name`
  );
  return result.rows;
}

async function getActivities() {
  const result = await query(
    `SELECT id, city_id AS "cityId", name, type, cost, duration, time
     FROM activities
     ORDER BY name`
  );
  return result.rows;
}

async function getTripsRaw() {
  const result = await query(
    `SELECT id, name, start_date, end_date, description, cover_image, budget, shared, costs, stops, packing
     FROM trips
     ORDER BY created_at DESC, name ASC`
  );
  return result.rows.map(toTripRecord);
}

async function getTripRaw(tripId) {
  const result = await query(
    `SELECT id, name, start_date, end_date, description, cover_image, budget, shared, costs, stops, packing
     FROM trips
     WHERE id = $1`,
    [tripId]
  );
  return result.rows[0] ? toTripRecord(result.rows[0]) : null;
}

async function saveTrip(trip) {
  await query(
    `UPDATE trips
     SET name = $2,
         start_date = $3,
         end_date = $4,
         description = $5,
         cover_image = $6,
         budget = $7,
         shared = $8,
         costs = $9::jsonb,
         stops = $10::jsonb,
         packing = $11::jsonb
     WHERE id = $1`,
    [
      trip.id,
      trip.name,
      trip.startDate,
      trip.endDate,
      trip.description,
      trip.coverImage,
      trip.budget,
      trip.shared,
      JSON.stringify(trip.costs || {}),
      JSON.stringify(trip.stops || []),
      JSON.stringify(trip.packing || [])
    ]
  );
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export async function initDatabase() {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is not set");
  }

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : undefined
  });

  const schema = await readFile(schemaPath, "utf8");
  await query(schema);

  await seedDatabase();
}

async function seedDatabase() {
  const userCount = await query(`SELECT COUNT(*)::int AS count FROM app_user`);
  if (userCount.rows[0].count === 0) {
    await query(`INSERT INTO app_user (id, name, email) VALUES (1, $1, $2)`, [user.name, user.email]);
  }

  const cityCount = await query(`SELECT COUNT(*)::int AS count FROM cities`);
  if (cityCount.rows[0].count === 0) {
    for (const city of cities) {
      await query(
        `INSERT INTO cities (id, name, country, cost_index, popularity, vibe, image)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [city.id, city.name, city.country, city.costIndex, city.popularity, city.vibe, city.image]
      );
    }
  }

  const activityCount = await query(`SELECT COUNT(*)::int AS count FROM activities`);
  if (activityCount.rows[0].count === 0) {
    for (const activity of activities) {
      await query(
        `INSERT INTO activities (id, city_id, name, type, cost, duration, time)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [activity.id, activity.cityId, activity.name, activity.type, activity.cost, activity.duration, activity.time]
      );
    }
  }

  const tripCount = await query(`SELECT COUNT(*)::int AS count FROM trips`);
  if (tripCount.rows[0].count === 0) {
    for (const trip of trips) {
      await query(
        `INSERT INTO trips (id, name, start_date, end_date, description, cover_image, budget, shared, costs, stops, packing)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11::jsonb)`,
        [
          trip.id,
          trip.name,
          trip.startDate,
          trip.endDate,
          trip.description,
          trip.coverImage,
          trip.budget,
          trip.shared,
          JSON.stringify(trip.costs),
          JSON.stringify(trip.stops),
          JSON.stringify(trip.packing)
        ]
      );
    }
  }
}

export async function getState() {
  const [userResult, cityRows, activityRows, tripRows] = await Promise.all([
    query(`SELECT name, email FROM app_user WHERE id = 1`),
    getCities(),
    getActivities(),
    getTripsRaw()
  ]);

  return {
    user: userResult.rows[0] || user,
    cities: cityRows,
    activities: activityRows,
    trips: tripRows.map((trip) => enrichTrip(trip, cityRows, activityRows))
  };
}

export async function login(payload) {
  const nextUser = {
    name: payload.name || "Traveler",
    email: payload.email || "traveler@traveloop.test"
  };
  await query(
    `INSERT INTO app_user (id, name, email)
     VALUES (1, $1, $2)
     ON CONFLICT (id)
     DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email`,
    [nextUser.name, nextUser.email]
  );
  return nextUser;
}

export async function listCities() {
  return getCities();
}

export async function listActivities() {
  return getActivities();
}

export async function listTrips() {
  const [cityRows, activityRows, tripRows] = await Promise.all([getCities(), getActivities(), getTripsRaw()]);
  return tripRows.map((trip) => enrichTrip(trip, cityRows, activityRows));
}

export async function getTrip(tripId) {
  const [cityRows, activityRows, trip] = await Promise.all([getCities(), getActivities(), getTripRaw(tripId)]);
  return trip ? enrichTrip(trip, cityRows, activityRows) : null;
}

export async function createTrip(payload) {
  const cityRows = await getCities();
  const trip = {
    id: randomUUID(),
    name: payload.name || "Untitled Trip",
    startDate: payload.startDate || "",
    endDate: payload.endDate || "",
    description: payload.description || "",
    coverImage: payload.coverImage || cityRows[0]?.image || "",
    budget: Number(payload.budget || 1800),
    shared: false,
    costs: { transport: 0, stay: 0, food: 0, activities: 0 },
    stops: [],
    packing: []
  };

  await query(
    `INSERT INTO trips (id, name, start_date, end_date, description, cover_image, budget, shared, costs, stops, packing)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11::jsonb)`,
    [
      trip.id,
      trip.name,
      trip.startDate,
      trip.endDate,
      trip.description,
      trip.coverImage,
      trip.budget,
      trip.shared,
      JSON.stringify(trip.costs),
      JSON.stringify(trip.stops),
      JSON.stringify(trip.packing)
    ]
  );

  const activityRows = await getActivities();
  return enrichTrip(trip, cityRows, activityRows);
}

export async function patchTrip(tripId, payload) {
  const current = await getTripRaw(tripId);
  if (!current) return null;

  const next = {
    ...current,
    ...payload,
    id: current.id,
    stops: Array.isArray(payload.stops) ? payload.stops : current.stops,
    packing: Array.isArray(payload.packing) ? payload.packing : current.packing,
    costs: payload.costs ? { ...current.costs, ...payload.costs } : current.costs
  };

  await saveTrip(next);
  return getTrip(tripId);
}

export async function deleteTrip(tripId) {
  await query(`DELETE FROM trips WHERE id = $1`, [tripId]);
}

export async function copyTrip(tripId) {
  const current = await getTripRaw(tripId);
  if (!current) return null;

  const clone = {
    ...current,
    id: randomUUID(),
    name: `${current.name} Copy`,
    shared: false,
    stops: current.stops.map((stop) => ({ ...stop, id: randomUUID(), activities: [...(stop.activities || [])] })),
    packing: current.packing.map((item) => ({ ...item, id: randomUUID() }))
  };

  await query(
    `INSERT INTO trips (id, name, start_date, end_date, description, cover_image, budget, shared, costs, stops, packing)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11::jsonb)`,
    [
      clone.id,
      clone.name,
      clone.startDate,
      clone.endDate,
      clone.description,
      clone.coverImage,
      clone.budget,
      clone.shared,
      JSON.stringify(clone.costs),
      JSON.stringify(clone.stops),
      JSON.stringify(clone.packing)
    ]
  );

  return getTrip(clone.id);
}

export async function addStop(tripId, payload) {
  const current = await getTripRaw(tripId);
  if (!current) return null;

  current.stops.push({
    id: randomUUID(),
    cityId: payload.cityId,
    startDate: payload.startDate || current.startDate,
    endDate: payload.endDate || current.endDate,
    activities: []
  });

  await saveTrip(current);
  return getTrip(tripId);
}

export async function reorderStops(tripId, fromIndex, toIndex) {
  const current = await getTripRaw(tripId);
  if (!current) return null;
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= current.stops.length ||
    toIndex >= current.stops.length
  ) {
    return getTrip(tripId);
  }

  const [moved] = current.stops.splice(fromIndex, 1);
  current.stops.splice(toIndex, 0, moved);
  await saveTrip(current);
  return getTrip(tripId);
}

export async function removeStop(tripId, stopId) {
  const current = await getTripRaw(tripId);
  if (!current) return null;
  current.stops = current.stops.filter((stop) => stop.id !== stopId);
  await saveTrip(current);
  return getTrip(tripId);
}

export async function addActivityToStop(tripId, stopId, activityId) {
  const current = await getTripRaw(tripId);
  if (!current) return null;
  current.stops = current.stops.map((stop) =>
    stop.id === stopId && !stop.activities.includes(activityId)
      ? { ...stop, activities: [...stop.activities, activityId] }
      : stop
  );
  await saveTrip(current);
  return getTrip(tripId);
}

export async function removeActivityFromStop(tripId, stopId, activityId) {
  const current = await getTripRaw(tripId);
  if (!current) return null;
  current.stops = current.stops.map((stop) =>
    stop.id === stopId
      ? { ...stop, activities: stop.activities.filter((id) => id !== activityId) }
      : stop
  );
  await saveTrip(current);
  return getTrip(tripId);
}

export async function addPackingItem(tripId, payload) {
  const current = await getTripRaw(tripId);
  if (!current) return null;
  current.packing.push({
    id: randomUUID(),
    label: payload.label || "Untitled item",
    category: payload.category || "Essentials",
    packed: false
  });
  await saveTrip(current);
  return getTrip(tripId);
}

export async function patchPackingItem(tripId, itemId, payload) {
  const current = await getTripRaw(tripId);
  if (!current) return null;
  current.packing = current.packing.map((item) =>
    item.id === itemId ? { ...item, ...payload, id: item.id } : item
  );
  await saveTrip(current);
  return getTrip(tripId);
}

export async function removePackingItem(tripId, itemId) {
  const current = await getTripRaw(tripId);
  if (!current) return null;
  current.packing = current.packing.filter((item) => item.id !== itemId);
  await saveTrip(current);
  return getTrip(tripId);
}
