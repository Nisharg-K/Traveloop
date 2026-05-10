export const routes = {
  login: "/index.html",
  dashboard: "/dashboard.html",
  createTrip: "/create-trip.html",
  trips: "/trips.html",
  itineraryBuilder: "/itinerary-builder.html",
  itineraryView: "/itinerary-view.html",
  citySearch: "/city-search.html",
  activitySearch: "/activity-search.html",
  budget: "/budget.html",
  packing: "/packing.html",
  shared: "/shared.html"
};

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  if (!response.ok) {
    let message = "Request failed";
    try {
      const data = await response.json();
      message = data.error || message;
    } catch {}
    throw new Error(message);
  }
  return response.json();
}

export const api = {
  getState: () => request("/api/state"),
  getTrips: () => request("/api/trips"),
  getTrip: (tripId) => request(`/api/trips/${tripId}`),
  createTrip: (payload) => request("/api/trips", { method: "POST", body: JSON.stringify(payload) }),
  updateTrip: (tripId, payload) => request(`/api/trips/${tripId}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteTrip: (tripId) => request(`/api/trips/${tripId}`, { method: "DELETE" }),
  login: (payload) => request("/api/login", { method: "POST", body: JSON.stringify(payload) }),
  getCities: () => request("/api/cities"),
  getActivities: () => request("/api/activities"),
  addStop: (tripId, payload) => request(`/api/trips/${tripId}/stops`, { method: "POST", body: JSON.stringify(payload) }),
  reorderStops: (tripId, payload) => request(`/api/trips/${tripId}/stops/reorder`, { method: "POST", body: JSON.stringify(payload) }),
  removeStop: (tripId, stopId) => request(`/api/trips/${tripId}/stops/${stopId}`, { method: "DELETE" }),
  addActivity: (tripId, stopId, activityId) =>
    request(`/api/trips/${tripId}/stops/${stopId}/activities`, { method: "POST", body: JSON.stringify({ activityId }) }),
  removeActivity: (tripId, stopId, activityId) =>
    request(`/api/trips/${tripId}/stops/${stopId}/activities/${activityId}`, { method: "DELETE" }),
  addPacking: (tripId, payload) => request(`/api/trips/${tripId}/packing`, { method: "POST", body: JSON.stringify(payload) }),
  updatePacking: (tripId, itemId, payload) =>
    request(`/api/trips/${tripId}/packing/${itemId}`, { method: "PATCH", body: JSON.stringify(payload) }),
  removePacking: (tripId, itemId) => request(`/api/trips/${tripId}/packing/${itemId}`, { method: "DELETE" }),
  copyTrip: (tripId) => request(`/api/trips/${tripId}/copy`, { method: "POST" })
};

export function mountTopbar(active, user = { name: "Traveler", email: "traveler@traveloop.test" }) {
  const node = document.querySelector("[data-topbar]");
  if (!node) return;
  const items = [
    ["dashboard", "Dashboard", routes.dashboard],
    ["create-trip", "Create Trip", routes.createTrip],
    ["trips", "My Trips", routes.trips]
  ];
  node.innerHTML = `
    <div class="topbar">
      <div class="brand">
        <div class="logo">TL</div>
        <div class="brand-copy">
          <h1>Traveloop</h1>
          <p>Neo-brutalist travel planner prototype</p>
        </div>
      </div>
      <nav class="nav">
        ${items
          .map(
            ([key, label, href]) =>
              `<a class="${active === key ? "active" : ""}" href="${href}">${label}</a>`
          )
          .join("")}
      </nav>
      <div class="user-pill">${user.name} · ${user.email}</div>
    </div>
  `;
}

export function getTripId() {
  return new URLSearchParams(window.location.search).get("trip");
}

export function tripRoute(pathname, tripId) {
  return `${pathname}?trip=${encodeURIComponent(tripId)}`;
}

export function money(value) {
  return `$${Number(value || 0).toLocaleString("en-US")}`;
}

export function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) return "Dates not set";
  const start = new Date(startDate);
  const end = new Date(endDate);
  return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  })}`;
}

export function daysBetween(startDate, endDate) {
  if (!startDate || !endDate) return 1;
  return Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000) + 1);
}

export function el(selector) {
  return document.querySelector(selector);
}

export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function showEmpty(container, title, message) {
  container.innerHTML = `
    <div class="empty-state">
      <h3>${escapeHtml(title)}</h3>
      <p class="muted">${escapeHtml(message)}</p>
    </div>
  `;
}

export function buildChartGradient(costs) {
  const entries = Object.entries(costs);
  const colors = ["#ff7a59", "#55d6be", "#ffd84d", "#7dc7ff"];
  const total = entries.reduce((sum, [, value]) => sum + Number(value || 0), 0) || 1;
  let progress = 0;
  const stops = entries
    .map(([, value], index) => {
      const start = progress;
      progress += (Number(value || 0) / total) * 100;
      return `${colors[index % colors.length]} ${start}% ${progress}%`;
    })
    .join(", ");
  return { gradient: `conic-gradient(${stops})`, colors };
}
