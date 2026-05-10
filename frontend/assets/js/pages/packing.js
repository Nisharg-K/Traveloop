import { api, mountTopbar, getTripId, tripRoute, routes, showEmpty } from "../common.js";

const tripId = getTripId();
if (!tripId) window.location.href = routes.trips;

const state = await api.getState();
mountTopbar("trips", state.user);

const form = document.querySelector("#packing-form");
const root = document.querySelector("#packing-list");

async function render() {
  const trip = await api.getTrip(tripId);
  document.querySelector("#packing-links").innerHTML = `
    <a class="button button-primary" href="${tripRoute(routes.itineraryBuilder, trip.id)}">Back to builder</a>
    <button class="button-warn" id="reset-packed">Reset packed status</button>
  `;

  if (!trip.packing.length) {
    showEmpty(root, "Packing list is empty", "Start with essentials, then layer in the rest.");
  } else {
    root.innerHTML = trip.packing
      .map(
        (item) => `
          <div class="packing-item">
            <div class="list-row">
              <div>
                <strong style="${item.packed ? "text-decoration:line-through;" : ""}">${item.label}</strong>
                <p class="muted">${item.category}</p>
              </div>
              <div class="inline-actions">
                <button class="button-accent" data-toggle="${item.id}">${item.packed ? "Unpack" : "Packed"}</button>
                <button class="button-warn" data-remove="${item.id}">Remove</button>
              </div>
            </div>
          </div>
        `
      )
      .join("");
  }

  document.querySelectorAll("[data-toggle]").forEach((button) => {
    button.addEventListener("click", async () => {
      const item = trip.packing.find((entry) => entry.id === button.dataset.toggle);
      if (!item) return;
      await api.updatePacking(trip.id, item.id, { packed: !item.packed });
      render();
    });
  });

  document.querySelectorAll("[data-remove]").forEach((button) => {
    button.addEventListener("click", async () => {
      await api.removePacking(trip.id, button.dataset.remove);
      render();
    });
  });

  document.querySelector("#reset-packed")?.addEventListener("click", async () => {
    for (const item of trip.packing) {
      if (item.packed) {
        await api.updatePacking(trip.id, item.id, { packed: false });
      }
    }
    render();
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  await api.addPacking(tripId, {
    label: form.label.value,
    category: form.category.value
  });
  form.reset();
  render();
});

render();
