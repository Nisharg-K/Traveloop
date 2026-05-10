import { api, mountTopbar, getTripId, tripRoute, routes, money, daysBetween, buildChartGradient } from "../common.js";

const tripId = getTripId();
if (!tripId) window.location.href = routes.trips;

const state = await api.getState();
mountTopbar("trips", state.user);

const trip = await api.getTrip(tripId);
const total = Object.values(trip.costs).reduce((sum, value) => sum + Number(value || 0), 0);
const avgPerDay = Math.round(total / daysBetween(trip.startDate, trip.endDate));
const remaining = trip.budget - total;
const chart = buildChartGradient(trip.costs);

document.querySelector("#budget-links").innerHTML = `
  <a class="button button-primary" href="${tripRoute(routes.itineraryBuilder, trip.id)}">Back to builder</a>
`;

document.querySelector("#budget-stats").innerHTML = `
  <div class="stat"><strong>${money(trip.budget)}</strong>Budget</div>
  <div class="stat"><strong>${money(total)}</strong>Current spend</div>
  <div class="stat"><strong>${money(avgPerDay)}</strong>Average per day</div>
`;

document.querySelector("#budget-notice").innerHTML = `
  <div class="notice">
    <strong>${remaining < 0 ? "Over budget" : "Budget healthy"}</strong>
    <p>${remaining < 0 ? `${money(Math.abs(remaining))} above your target.` : `${money(remaining)} still available.`}</p>
  </div>
`;

document.querySelector("#budget-chart").style.background = chart.gradient;
document.querySelector("#chart-total").textContent = money(total);

document.querySelector("#budget-legend").innerHTML = Object.entries(trip.costs)
  .map(
    ([label, value], index) => `
      <div class="chart-legend-item">
        <div><span class="swatch" style="background:${chart.colors[index % chart.colors.length]}"></span>${label}</div>
        <strong>${money(value)}</strong>
      </div>
    `
  )
  .join("");
