import { api, mountTopbar, getTripId, tripRoute, routes, showEmpty } from "../common.js";

const tripId = getTripId();
if (!tripId) window.location.href = routes.trips;

const state = await api.getState();
mountTopbar("trips", state.user);

const input = document.querySelector("#city-query");
const root = document.querySelector("#city-results");

async function render() {
  const cities = await api.getCities();
  const filtered = cities.filter((city) =>
    `${city.name} ${city.country}`.toLowerCase().includes(input.value.toLowerCase())
  );

  document.querySelector("#city-links").innerHTML = `
    <a class="button button-primary" href="${tripRoute(routes.itineraryBuilder, tripId)}">Back to builder</a>
  `;

  if (!filtered.length) {
    showEmpty(root, "No matching cities", "Try a broader keyword.");
    return;
  }

  root.innerHTML = filtered
    .map(
      (city) => `
        <article class="destination-card">
          <img src="${city.image}" alt="${city.name}">
          <h4>${city.name}, ${city.country}</h4>
          <p class="muted">Cost index ${city.costIndex} · ${city.popularity}</p>
          <p>${city.vibe}</p>
          <button class="button-primary" data-add-city="${city.id}">Add to trip</button>
        </article>
      `
    )
    .join("");

  root.querySelectorAll("[data-add-city]").forEach((button) => {
    button.addEventListener("click", async () => {
      await api.addStop(tripId, { cityId: button.dataset.addCity });
      window.location.href = tripRoute(routes.itineraryBuilder, tripId);
    });
  });
}

input.addEventListener("input", render);
render();
