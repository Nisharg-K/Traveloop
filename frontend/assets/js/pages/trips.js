import { api, mountTopbar, formatDateRange, money, routes, tripRoute, showEmpty } from "../common.js";

const state = await api.getState();
mountTopbar("trips", state.user);

const root = document.querySelector("#trips-grid");

async function render() {
  const trips = await api.getTrips();
  if (!trips.length) {
    showEmpty(root, "No trips planned", "Create a trip to see editable cards here.");
    return;
  }

  root.innerHTML = trips
    .map(
      (trip) => `
        <article class="trip-card">
          <img src="${trip.coverImage}" alt="${trip.name}">
          <h4>${trip.name}</h4>
          <p class="muted">${formatDateRange(trip.startDate, trip.endDate)}</p>
          <div class="list-row">
            <span>${trip.stops.length} stops</span>
            <strong>${money(trip.budget)}</strong>
          </div>
          <div class="inline-actions">
            <a class="button button-primary" href="${tripRoute(routes.itineraryBuilder, trip.id)}">Edit</a>
            <a class="button button-accent" href="${tripRoute(routes.itineraryView, trip.id)}">View</a>
            <button class="button-warn" data-delete="${trip.id}">Delete</button>
          </div>
        </article>
      `
    )
    .join("");

  root.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", async () => {
      await api.deleteTrip(button.dataset.delete);
      render();
    });
  });
}

render();
