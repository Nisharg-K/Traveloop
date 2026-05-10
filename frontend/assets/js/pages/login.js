import { api, routes } from "../common.js";

const form = document.querySelector("#auth-form");
const toggleButtons = [...document.querySelectorAll("[data-mode]")];

toggleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    toggleButtons.forEach((entry) => entry.classList.remove("active"));
    button.classList.add("active");
    document.querySelector("#auth-title").textContent =
      button.dataset.mode === "signup" ? "Create your account" : "Welcome back";
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(form);
  await api.login({
    name: data.get("name"),
    email: data.get("email")
  });
  window.location.href = routes.dashboard;
});
