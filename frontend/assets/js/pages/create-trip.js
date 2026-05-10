import { api, mountTopbar, routes } from "../common.js";

const state = await api.getState();
mountTopbar("create-trip", state.user);

const form = document.querySelector("#create-trip-form");
const previewTitle = document.querySelector("#preview-title");
const previewDates = document.querySelector("#preview-dates");
const previewDescription = document.querySelector("#preview-description");
const previewImage = document.querySelector("#preview-image");

form.coverImage.value = state.cities[0]?.image || "";
previewImage.src = form.coverImage.value;

form.addEventListener("input", () => {
  previewTitle.textContent = form.name.value || "Untitled Journey";
  previewDates.textContent =
    form.startDate.value && form.endDate.value
      ? `${form.startDate.value} to ${form.endDate.value}`
      : "Choose dates to frame the trip";
  previewDescription.textContent =
    form.description.value || "Your description, mood, and route notes will appear here.";
  previewImage.src = form.coverImage.value || state.cities[0]?.image || "";
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const trip = await api.createTrip({
    name: form.name.value,
    startDate: form.startDate.value,
    endDate: form.endDate.value,
    description: form.description.value,
    coverImage: form.coverImage.value,
    budget: Number(form.budget.value || 1800)
  });
  window.location.href = `${routes.itineraryBuilder}?trip=${trip.id}`;
});
