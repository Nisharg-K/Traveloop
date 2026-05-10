import { api, mountTopbar, getTripId, formatDateRange, routes, daysBetween } from "../common.js";

const tripId = getTripId();
if (!tripId) window.location.href = routes.trips;

const state = await api.getState();
mountTopbar("trips", state.user);

const trip = await api.getTrip(tripId);
const publicLink = `${window.location.origin}${routes.shared}?trip=${trip.id}`;
const routeCities = trip.stops.map((stop) => stop.city?.name).filter(Boolean);
const routeLabel = routeCities.join(" → ");
const tripCode = `TL-${new Date(trip.startDate || Date.now()).getFullYear()}-${state.user.name
  .replace(/[^A-Za-z]/g, "")
  .slice(0, 2)
  .toUpperCase()}${trip.id.slice(-4).toUpperCase()}`;

document.querySelector("#shared-title").textContent = trip.name;
document.querySelector("#shared-description").textContent = trip.description;
document.querySelector("#shared-cover").src = trip.coverImage;
document.querySelector("#public-link").textContent = publicLink;

document.querySelector("#bp-title").textContent = trip.name;
document.querySelector("#bp-subtitle").textContent =
  trip.description || "A shareable multi-city journey from Traveloop.";
document.querySelector("#bp-passenger").textContent = state.user.name;
document.querySelector("#bp-route").textContent = routeLabel || trip.name;
document.querySelector("#bp-start").textContent = formatBoardingDate(trip.startDate);
document.querySelector("#bp-end").textContent = formatBoardingDate(trip.endDate);
document.querySelector("#bp-code").textContent = tripCode;
document.querySelector("#bp-stops").textContent = String(Math.max(routeCities.length - 1, trip.stops.length));
document.querySelector("#bp-days").textContent = String(daysBetween(trip.startDate, trip.endDate));
document.querySelector("#bp-budget").textContent = formatBudget(trip.budget);
document.querySelector("#bp-route-chips").innerHTML = routeCities.length
  ? routeCities.map((city) => `<span class="boarding-route-chip">${city}</span>`).join("")
  : `<span class="boarding-route-chip">${trip.name}</span>`;

new window.QRCode(document.querySelector("#boarding-qr"), {
  text: publicLink,
  width: 104,
  height: 104,
  colorDark: "#111111",
  colorLight: "#ffffff",
  correctLevel: window.QRCode.CorrectLevel.M
});

document.querySelector("#copy-trip").addEventListener("click", async () => {
  await api.copyTrip(trip.id);
  window.location.href = routes.trips;
});

document.querySelector("#copy-link").addEventListener("click", async () => {
  await navigator.clipboard.writeText(publicLink);
  document.querySelector("#copy-link").textContent = "Link copied";
  setTimeout(() => {
    document.querySelector("#copy-link").textContent = "Copy public link";
  }, 1600);
});

document.querySelector("#download-image").addEventListener("click", async () => {
  const canvas = await exportBoardingPass();
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = `${slugify(trip.name)}-boarding-pass.png`;
  link.click();
});

document.querySelector("#download-pdf").addEventListener("click", async () => {
  const canvas = await exportBoardingPass();
  const image = canvas.toDataURL("image/png");
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [canvas.width, canvas.height]
  });
  pdf.addImage(image, "PNG", 0, 0, canvas.width, canvas.height);
  pdf.save(`${slugify(trip.name)}-boarding-pass.pdf`);
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

async function exportBoardingPass() {
  const hidden = [...document.querySelectorAll("[data-export-hide]")];
  hidden.forEach((node) => {
    node.dataset.previousDisplay = node.style.display;
    node.style.display = "none";
  });

  try {
    return await window.html2canvas(document.querySelector("#boarding-pass"), {
      backgroundColor: null,
      scale: 2
    });
  } finally {
    hidden.forEach((node) => {
      node.style.display = node.dataset.previousDisplay || "";
      delete node.dataset.previousDisplay;
    });
  }
}

function formatBoardingDate(dateValue) {
  if (!dateValue) return "TBD";
  return new Date(dateValue).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).toUpperCase();
}

function formatBudget(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
