import { randomUUID } from "node:crypto";
import { activities, cities, trips, user } from "./seed-data.js";

let state = {
  user: { ...user },
  cities: [...cities],
  activities: [...activities],
  trips: trips.map((trip) => ({
    ...trip,
    costs: { ...trip.costs },
    stops: trip.stops.map((stop) => ({ ...stop, activities: [...stop.activities] })),
    packing: trip.packing.map((item) => ({ ...item }))
  }))
};

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

function getTripRaw(tripId) {
  return state.trips.find((trip) => trip.id === tripId);
}

function updateTrip(tripId, updater) {
  state = {
    ...state,
    trips: state.trips.map((trip) => (trip.id === tripId ? updater(trip) : trip))
  };
  return getTripRaw(tripId);
}

export async function initDatabase() {}

export async function getState() {
  return {
    user: state.user,
    cities: state.cities,
    activities: state.activities,
    trips: state.trips.map(enrichTrip)
  };
}

export async function login(payload) {
  state.user = {
    name: payload.name || "Traveler",
    email: payload.email || "traveler@traveloop.test"
  };
  return state.user;
}

export async function listCities() {
  return state.cities;
}

export async function listActivities() {
  return state.activities;
}

export async function listTrips() {
  return state.trips.map(enrichTrip);
}

export async function getTrip(tripId) {
  const trip = getTripRaw(tripId);
  return trip ? enrichTrip(trip) : null;
}

export async function createTrip(payload) {
  const trip = {
    id: randomUUID(),
    name: payload.name || "Untitled Trip",
    startDate: payload.startDate || "",
    endDate: payload.endDate || "",
    description: payload.description || "",
    coverImage: payload.coverImage || state.cities[0]?.image || "",
    budget: Number(payload.budget || 1800),
    shared: false,
    costs: { transport: 0, stay: 0, food: 0, activities: 0 },
    stops: [],
    packing: []
  };
  state.trips.unshift(trip);
  return enrichTrip(trip);
}

export async function patchTrip(tripId, payload) {
  const current = getTripRaw(tripId);
  if (!current) return null;
  const next = updateTrip(tripId, (trip) => ({
    ...trip,
    ...payload,
    id: trip.id,
    stops: Array.isArray(payload.stops) ? payload.stops : trip.stops,
    packing: Array.isArray(payload.packing) ? payload.packing : trip.packing,
    costs: payload.costs ? { ...trip.costs, ...payload.costs } : trip.costs
  }));
  return enrichTrip(next);
}

export async function deleteTrip(tripId) {
  state.trips = state.trips.filter((trip) => trip.id !== tripId);
}

export async function copyTrip(tripId) {
  const current = getTripRaw(tripId);
  if (!current) return null;
  const clone = {
    ...current,
    id: randomUUID(),
    name: `${current.name} Copy`,
    shared: false,
    stops: current.stops.map((stop) => ({ ...stop, id: randomUUID(), activities: [...stop.activities] })),
    packing: current.packing.map((item) => ({ ...item, id: randomUUID() }))
  };
  state.trips.unshift(clone);
  return enrichTrip(clone);
}

export async function addStop(tripId, payload) {
  const current = getTripRaw(tripId);
  if (!current) return null;
  const next = updateTrip(tripId, (trip) => ({
    ...trip,
    stops: [
      ...trip.stops,
      {
        id: randomUUID(),
        cityId: payload.cityId,
        startDate: payload.startDate || trip.startDate,
        endDate: payload.endDate || trip.endDate,
        activities: []
      }
    ]
  }));
  return enrichTrip(next);
}

export async function reorderStops(tripId, fromIndex, toIndex) {
  const current = getTripRaw(tripId);
  if (!current) return null;
  const next = updateTrip(tripId, (trip) => {
    const stops = [...trip.stops];
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= stops.length || toIndex >= stops.length) {
      return trip;
    }
    const [moved] = stops.splice(fromIndex, 1);
    stops.splice(toIndex, 0, moved);
    return { ...trip, stops };
  });
  return enrichTrip(next);
}

export async function removeStop(tripId, stopId) {
  const current = getTripRaw(tripId);
  if (!current) return null;
  const next = updateTrip(tripId, (trip) => ({
    ...trip,
    stops: trip.stops.filter((stop) => stop.id !== stopId)
  }));
  return enrichTrip(next);
}

export async function addActivityToStop(tripId, stopId, activityId) {
  const current = getTripRaw(tripId);
  if (!current) return null;
  const next = updateTrip(tripId, (trip) => ({
    ...trip,
    stops: trip.stops.map((stop) =>
      stop.id === stopId && !stop.activities.includes(activityId)
        ? { ...stop, activities: [...stop.activities, activityId] }
        : stop
    )
  }));
  return enrichTrip(next);
}

export async function removeActivityFromStop(tripId, stopId, activityId) {
  const current = getTripRaw(tripId);
  if (!current) return null;
  const next = updateTrip(tripId, (trip) => ({
    ...trip,
    stops: trip.stops.map((stop) =>
      stop.id === stopId
        ? { ...stop, activities: stop.activities.filter((id) => id !== activityId) }
        : stop
    )
  }));
  return enrichTrip(next);
}

export async function addPackingItem(tripId, payload) {
  const current = getTripRaw(tripId);
  if (!current) return null;
  const next = updateTrip(tripId, (trip) => ({
    ...trip,
    packing: [
      ...trip.packing,
      {
        id: randomUUID(),
        label: payload.label || "Untitled item",
        category: payload.category || "Essentials",
        packed: false
      }
    ]
  }));
  return enrichTrip(next);
}

export async function patchPackingItem(tripId, itemId, payload) {
  const current = getTripRaw(tripId);
  if (!current) return null;
  const next = updateTrip(tripId, (trip) => ({
    ...trip,
    packing: trip.packing.map((item) =>
      item.id === itemId ? { ...item, ...payload, id: item.id } : item
    )
  }));
  return enrichTrip(next);
}

export async function removePackingItem(tripId, itemId) {
  const current = getTripRaw(tripId);
  if (!current) return null;
  const next = updateTrip(tripId, (trip) => ({
    ...trip,
    packing: trip.packing.filter((item) => item.id !== itemId)
  }));
  return enrichTrip(next);
}
