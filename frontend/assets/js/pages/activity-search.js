import { api, mountTopbar, getTripId, tripRoute, routes, showEmpty } from "../common.js";

const tripId = getTripId();
if (!tripId) window.location.href = routes.trips;

const state = await api.getState();
mountTopbar("trips", state.user);

const typeField = document.querySelector("#filter-type");
const costField = document.querySelector("#filter-cost");
const durationField = document.querySelector("#filter-duration");
const root = document.querySelector("#activity-results");

async function render() {
  const trip = await api.getTrip(tripId);
  const allActivities = await api.getActivities();
  const filtered = allActivities.filter((activity) => {
    const typeMatches = typeField.value === "All" || activity.type === typeField.value;
    return typeMatches && Number(activity.cost) <= Number(costField.value) && Number(activity.duration) <= Number(durationField.value);
  });

  document.querySelector("#activity-links").innerHTML = `
    <a class="button button-primary" href="${tripRoute(routes.itineraryBuilder, tripId)}">Back to builder</a>
  `;

  const firstStop = trip.stops[0];
  if (!filtered.length) {
    showEmpty(root, "No activities match", "Relax the filters to see more ideas.");
    return;
  }

  root.innerHTML = filtered
    .map((activity) => {
      const attached = firstStop?.activities.includes(activity.id);
      return `
        <article class="activity-card">
          <div class="list-row">
            <strong>${activity.name}</strong>
            <span>$${activity.cost}</span>
          </div>
          <p class="muted">${activity.type} · ${activity.duration} hrs · ${activity.time}</p>
          <button class="${attached ? "button-warn" : "button-accent"}" data-activity="${activity.id}">
            ${attached ? "Remove from first stop" : "Add to first stop"}
          </button>
        </article>
      `;
    })
    .join("");

  root.querySelectorAll("[data-activity]").forEach((button) => {
    button.addEventListener("click", async () => {
      if (!firstStop) return;
      if (firstStop.activities.includes(button.dataset.activity)) {
        await api.removeActivity(trip.id, firstStop.id, button.dataset.activity);
      } else {
        await api.addActivity(trip.id, firstStop.id, button.dataset.activity);
      }
      render();
    });
  });
}

[typeField, costField, durationField].forEach((field) => field.addEventListener("input", render));
render();
