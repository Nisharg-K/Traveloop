import { api, mountTopbar, getTripId, formatDateRange, routes } from "../common.js";

const tripId = getTripId();
if (!tripId) window.location.href = routes.trips;

const state = await api.getState();
mountTopbar("trips", state.user);

const trip = await api.getTrip(tripId);
document.querySelector("#shared-title").textContent = trip.name;
document.querySelector("#shared-description").textContent = trip.description;
document.querySelector("#shared-cover").src = trip.coverImage;

document.querySelector("#copy-trip").addEventListener("click", async () => {
  await api.copyTrip(trip.id);
  window.location.href = routes.trips;
});

document.querySelector("#shared-stops").innerHTML = trip.stops
  .map(
    (stop) => `
      <div class="shared-stop">
        <strong>${stop.city?.name || "Unknown city"}, ${stop.city?.country || ""}</strong>
        <p class="muted">${formatDateRange(stop.startDate, stop.endDate)}</p>
      </div>
    `
  )
  .join("");
