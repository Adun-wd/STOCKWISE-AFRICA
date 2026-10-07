// ===== Stockwise Africa - Settings > Notification Alerts =====

// ---------- 1. Toggle switches ----------
// Each switch is a <button class="toggle"> with aria-pressed="true" or "false".
// Tailwind styles the ON/OFF look from aria-pressed, so we only flip that value.
const toggles = document.querySelectorAll(".toggle");

toggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const isOn = toggle.getAttribute("aria-pressed") === "true";
    toggle.setAttribute("aria-pressed", String(!isOn));
  });
});

// ---------- 2. Collapsible sections ----------
// Clicking a section heading shows/hides its options and rotates the chevron
// (the chevron rotation is handled by Tailwind from aria-expanded).
const sectionButtons = document.querySelectorAll(".section-toggle");

sectionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const isOpen = button.getAttribute("aria-expanded") === "true";
    const options = document.getElementById(button.getAttribute("aria-controls"));

    button.setAttribute("aria-expanded", String(!isOpen));
    options.classList.toggle("hidden", isOpen);
  });
});

// ---------- 3. Save Changes / Cancel ----------
const saveButton = document.getElementById("save-button");
const cancelButton = document.getElementById("cancel-button");
const saveMessage = document.getElementById("save-message");

// Remember the toggle states so Cancel can go back to them.
// Starts as the design's default (all ON) and updates after each save.
let savedStates = [];

function rememberToggleStates() {
  savedStates = Array.from(toggles).map((toggle) => toggle.getAttribute("aria-pressed"));
}
rememberToggleStates();

saveButton.addEventListener("click", () => {
  rememberToggleStates();

  // Show the success message for 3 seconds
  saveMessage.classList.remove("hidden");
  setTimeout(() => {
    saveMessage.classList.add("hidden");
  }, 3000);
});

cancelButton.addEventListener("click", () => {
  toggles.forEach((toggle, index) => {
    toggle.setAttribute("aria-pressed", savedStates[index]);
  });
});

// ---------- 4. Invite Team Member ----------
const inviteButton = document.getElementById("invite-button");

inviteButton.addEventListener("click", () => {
  alert("Invite Team Member");
});

// ---------- 5. Mobile sidebar menu ----------
const sidebar = document.getElementById("sidebar");
const openMenuButton = document.getElementById("open-menu-button");
const closeMenuButton = document.getElementById("close-menu-button");

openMenuButton.addEventListener("click", () => {
  sidebar.classList.remove("-translate-x-full");
});

closeMenuButton.addEventListener("click", () => {
  sidebar.classList.add("-translate-x-full");
});