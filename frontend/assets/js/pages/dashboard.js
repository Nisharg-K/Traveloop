import { api, mountTopbar, formatDateRange, tripRoute, routes, money, showEmpty } from "../common.js";

const state = await api.getState();
mountTopbar("dashboard", state.user);

document.querySelector("#welcome-name").textContent = state.user.name;
document.querySelector("#hero-stats").innerHTML = `
  <div class="stat"><strong>${state.trips.length}</strong>Trips</div>
  <div class="stat"><strong>${state.cities.length}</strong>Cities</div>
  <div class="stat"><strong>${state.activities.length}</strong>Activities</div>
`;

const recent = document.querySelector("#recent-trips");
if (!state.trips.length) {
  showEmpty(recent, "No trips yet", "Create your first trip to populate the dashboard.");
} else {
  recent.innerHTML = state.trips
    .slice(0, 3)
    .map(
      (trip) => `
        <article class="trip-card">
          <img src="${trip.coverImage}" alt="${trip.name}">
          <h4>${trip.name}</h4>
          <p class="muted">${formatDateRange(trip.startDate, trip.endDate)} · ${trip.stops.length} stops</p>
          <p>${trip.description}</p>
          <div class="inline-actions">
            <a class="button button-primary" href="${tripRoute(routes.itineraryView, trip.id)}">Open</a>
            <a class="button button-accent" href="${tripRoute(routes.itineraryBuilder, trip.id)}">Edit</a>
          </div>
        </article>
      `
    )
    .join("");
}

document.querySelector("#recommended").innerHTML = state.cities
  .slice(0, 4)
  .map(
    (city) => `
      <article class="destination-card">
        <img src="${city.image}" alt="${city.name}">
        <h4>${city.name}, ${city.country}</h4>
        <p class="muted">Cost index ${city.costIndex} · ${city.popularity}</p>
        <p>${city.vibe}</p>
      </article>
    `
  )
  .join("");

document.querySelector("#budget-highlight").innerHTML = state.trips
  .slice(0, 2)
  .map(
    (trip) => `
      <div class="card">
        <div class="list-row">
          <strong>${trip.name}</strong>
          <span class="sticker">${money(trip.budget)}</span>
        </div>
        <p class="muted">${formatDateRange(trip.startDate, trip.endDate)}</p>
      </div>
    `
  )
  .join("");
