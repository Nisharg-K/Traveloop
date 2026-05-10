import { api, mountTopbar, getTripId, formatDateRange, tripRoute, routes, showEmpty } from "../common.js";

const tripId = getTripId();
if (!tripId) window.location.href = routes.trips;

const state = await api.getState();
mountTopbar("trips", state.user);

const form = document.querySelector("#add-stop-form");
const stopList = document.querySelector("#stop-list");
const linkBar = document.querySelector("#builder-links");
const citySelect = form.cityId;

state.cities.forEach((city) => {
  citySelect.insertAdjacentHTML(
    "beforeend",
    `<option value="${city.id}">${city.name}, ${city.country}</option>`
  );
});

async function render() {
  const trip = await api.getTrip(tripId);
  document.querySelector("#trip-title").textContent = trip.name;
  linkBar.innerHTML = `
    <a class="button button-primary" href="${tripRoute(routes.itineraryView, trip.id)}">View itinerary</a>
    <a class="button button-accent" href="${tripRoute(routes.citySearch, trip.id)}">Search cities</a>
    <a class="button button-muted" href="${tripRoute(routes.activitySearch, trip.id)}">Search activities</a>
    <a class="button button-warn" href="${tripRoute(routes.budget, trip.id)}">Budget</a>
    <a class="button button-muted" href="${tripRoute(routes.packing, trip.id)}">Packing</a>
  `;

  if (!trip.stops.length) {
    showEmpty(stopList, "No stops yet", "Add your first city to start shaping the route.");
    return;
  }

  stopList.innerHTML = trip.stops
    .map((stop, index) => {
      const availableActivities = state.activities.filter((activity) => activity.cityId === stop.cityId);
      return `
        <section class="panel stop-card">
          <div class="panel-header">
            <div>
              <h3>${index + 1}. ${stop.city?.name || "Unknown city"}</h3>
              <p class="muted">${formatDateRange(stop.startDate, stop.endDate)}</p>
            </div>
            <div class="inline-actions">
              <button data-move-up="${index}">Up</button>
              <button data-move-down="${index}">Down</button>
              <button class="button-warn" data-remove-stop="${stop.id}">Remove</button>
            </div>
          </div>
          <div class="columns">
            <div>
              <h4>Available activities</h4>
              ${availableActivities.length
                ? availableActivities
                    .map(
                      (activity) => `
                        <div class="activity-card">
                          <div class="list-row">
                            <strong>${activity.name}</strong>
                            <span>$${activity.cost}</span>
                          </div>
                          <p class="muted">${activity.type} · ${activity.time}</p>
                          <button class="button-accent" data-add-activity="${stop.id}:${activity.id}">Add</button>
                        </div>
                      `
                    )
                    .join("")
                : `<div class="empty-state"><p>No activities for this city yet.</p></div>`}
            </div>
            <div>
              <h4>Assigned activities</h4>
              ${stop.activityDetails.length
                ? stop.activityDetails
                    .map(
                      (activity) => `
                        <div class="activity-chip">
                          <div class="list-row">
                            <strong>${activity.name}</strong>
                            <button class="button-warn" data-remove-activity="${stop.id}:${activity.id}">Remove</button>
                          </div>
                          <p class="muted">${activity.time} · ${activity.type} · $${activity.cost}</p>
                        </div>
                      `
                    )
                    .join("")
                : `<div class="empty-state"><p>Add activities to make this stop richer.</p></div>`}
            </div>
          </div>
        </section>
      `;
    })
    .join("");

  bindActions(trip);
}

function bindActions(trip) {
  stopList.querySelectorAll("[data-remove-stop]").forEach((button) => {
    button.addEventListener("click", async () => {
      await api.removeStop(trip.id, button.dataset.removeStop);
      render();
    });
  });

  stopList.querySelectorAll("[data-move-up]").forEach((button) => {
    button.addEventListener("click", async () => {
      const index = Number(button.dataset.moveUp);
      if (index <= 0) return;
      await api.reorderStops(trip.id, { fromIndex: index, toIndex: index - 1 });
      render();
    });
  });

  stopList.querySelectorAll("[data-move-down]").forEach((button) => {
    button.addEventListener("click", async () => {
      const index = Number(button.dataset.moveDown);
      if (index >= trip.stops.length - 1) return;
      await api.reorderStops(trip.id, { fromIndex: index, toIndex: index + 1 });
      render();
    });
  });

  stopList.querySelectorAll("[data-add-activity]").forEach((button) => {
    button.addEventListener("click", async () => {
      const [stopId, activityId] = button.dataset.addActivity.split(":");
      await api.addActivity(trip.id, stopId, activityId);
      render();
    });
  });

  stopList.querySelectorAll("[data-remove-activity]").forEach((button) => {
    button.addEventListener("click", async () => {
      const [stopId, activityId] = button.dataset.removeActivity.split(":");
      await api.removeActivity(trip.id, stopId, activityId);
      render();
    });
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  await api.addStop(tripId, {
    cityId: form.cityId.value,
    startDate: form.startDate.value,
    endDate: form.endDate.value
  });
  form.reset();
  render();
});

render();
