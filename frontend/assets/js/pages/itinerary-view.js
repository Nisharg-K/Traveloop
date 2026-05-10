import { api, mountTopbar, getTripId, formatDateRange, tripRoute, routes, money, showEmpty } from "../common.js";

const tripId = getTripId();
if (!tripId) window.location.href = routes.trips;

const state = await api.getState();
mountTopbar("trips", state.user);

const trip = await api.getTrip(tripId);
document.querySelector("#hero-cover").src = trip.coverImage;
document.querySelector("#trip-name").textContent = trip.name;
document.querySelector("#trip-description").textContent = trip.description;
document.querySelector("#trip-meta").textContent = `${formatDateRange(trip.startDate, trip.endDate)} · ${trip.stops.length} stops`;
document.querySelector("#view-links").innerHTML = `
  <a class="button button-primary" href="${tripRoute(routes.itineraryBuilder, trip.id)}">Edit itinerary</a>
  <a class="button button-accent" href="${tripRoute(routes.shared, trip.id)}">Shared view</a>
`;

const root = document.querySelector("#itinerary-days");
if (!trip.stops.length) {
  showEmpty(root, "No itinerary yet", "Head back to the builder and add your first stop.");
} else {
  root.innerHTML = trip.stops
    .map(
      (stop, index) => `
        <section class="panel">
          <div class="panel-header">
            <div>
              <h3>Stop ${index + 1}: ${stop.city?.name || "Unknown city"}</h3>
              <p class="muted">${stop.city?.country || ""} · ${formatDateRange(stop.startDate, stop.endDate)}</p>
            </div>
          </div>
          ${
            stop.activityDetails.length
              ? stop.activityDetails
                  .map(
                    (activity, activityIndex) => `
                      <div class="timeline-block">
                        <div class="timeline-time">${activity.time}</div>
                        <div>
                          <strong>${activity.name}</strong>
                          <p class="muted">Day ${activityIndex + 1} · ${activity.type} · ${activity.duration} hrs</p>
                        </div>
                        <div><strong>${money(activity.cost)}</strong></div>
                      </div>
                    `
                  )
                  .join("")
              : `<div class="empty-state"><p>No activities assigned for this stop yet.</p></div>`
          }
        </section>
      `
    )
    .join("");
}
