// Stockwise Africa - Settings > Teams & Roles
// Frontend-only prototype: there is no backend, so no team data is stored or emailed.

// ---------- Page elements ----------
const topSearch = document.getElementById("top-search");
const statusMessage = document.getElementById("status-message");

const inviteDialog = document.getElementById("invite-dialog");
const inviteForm = document.getElementById("invite-form");
const inviteEmail = document.getElementById("invite-email");
const inviteRole = document.getElementById("invite-role");
const inviteError = document.getElementById("invite-error");
const inviteSuccess = document.getElementById("invite-success");

const notificationButton = document.getElementById("notification-button");
const notificationPanel = document.getElementById("notification-panel");

const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebar-overlay");

// ---------- Floating message ----------
let statusTimer = null;

// Shows a short message at the bottom of the screen, then hides it after 3.5 seconds.
function showStatus(message) {
  statusMessage.textContent = message; // textContent keeps typed text safe
  statusMessage.classList.remove("hidden");
  clearTimeout(statusTimer);
  statusTimer = setTimeout(function () {
    statusMessage.classList.add("hidden");
  }, 3500);
}

// ---------- Invite dialog ----------
function openInviteDialog() {
  inviteForm.reset();
  inviteError.classList.add("hidden");
  inviteSuccess.classList.add("hidden");
  inviteDialog.showModal(); // the browser handles the Escape key and focus trapping
  inviteEmail.focus();
}

function closeInviteDialog() {
  inviteDialog.close();
}

// A simple check: something@something.something (no spaces)
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function handleInviteSubmit(event) {
  event.preventDefault(); // stop the form from reloading the page

  const email = inviteEmail.value.trim();
  inviteSuccess.classList.add("hidden");

  if (email === "") {
    inviteError.textContent = "Enter an email address.";
    inviteError.classList.remove("hidden");
    return;
  }
  if (!isValidEmail(email)) {
    inviteError.textContent = "Enter a valid email address, like name@company.com.";
    inviteError.classList.remove("hidden");
    return;
  }

  inviteError.classList.add("hidden");
  // No backend yet, so we only simulate the invitation and say so clearly.
  inviteSuccess.textContent =
    "Invitation prepared for " + email + " as " + inviteRole.value +
    ". This is a demo, so no email was actually sent.";
  inviteSuccess.classList.remove("hidden");
  inviteForm.reset();
  inviteRole.value = "Staff";
}

// Both Invite Team Member buttons share the same data attribute
document.querySelectorAll("[data-open-invite]").forEach(function (button) {
  button.addEventListener("click", openInviteDialog);
});
document.getElementById("invite-close").addEventListener("click", closeInviteDialog);
document.getElementById("invite-cancel").addEventListener("click", closeInviteDialog);
inviteForm.addEventListener("submit", handleInviteSubmit);

// ---------- Search ----------
// There are no team members to search, so we explain that instead of inventing results.
topSearch.addEventListener("input", function () {
  const text = topSearch.value.trim();
  if (text !== "") {
    showStatus("No results for \"" + text + "\". There are no team members yet.");
  } else {
    statusMessage.classList.add("hidden");
  }
});

// ---------- Notifications ----------
function closeNotifications() {
  notificationPanel.classList.add("hidden");
  notificationButton.setAttribute("aria-expanded", "false");
}

notificationButton.addEventListener("click", function () {
  const isOpen = notificationPanel.classList.toggle("hidden") === false;
  notificationButton.setAttribute("aria-expanded", String(isOpen));
});

// Click outside the panel closes it
document.addEventListener("click", function (event) {
  if (!notificationPanel.contains(event.target) && !notificationButton.contains(event.target)) {
    closeNotifications();
  }
});

// ---------- Sidebars ----------
function setSidebarOpen(isOpen) {
  sidebar.classList.toggle("-translate-x-full", !isOpen);
  sidebarOverlay.classList.toggle("hidden", !isOpen);
}

// Primary menu: real pages navigate normally; Home has no page yet.
document.querySelectorAll(".nav-link").forEach(function (link) {
  link.addEventListener("click", function (event) {
    if (link.getAttribute("href") === "#") {
      event.preventDefault();
      showStatus(link.dataset.page + " page is not implemented in this demo.");
      setSidebarOpen(false);
    }
  });
});

// Secondary Settings menu: only Teams & Roles exists, so the others show a message.
document.querySelectorAll(".settings-link").forEach(function (link) {
  link.addEventListener("click", function (event) {
    event.preventDefault();
    showStatus(link.dataset.section + " page is not implemented in this demo.");
  });
});

document.getElementById("menu-button").addEventListener("click", function () { setSidebarOpen(true); });
sidebarOverlay.addEventListener("click", function () { setSidebarOpen(false); });

// Escape closes the notification panel and the mobile menu (the dialog closes itself)
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeNotifications();
    setSidebarOpen(false);
  }
});

// ---------- Logout ----------
document.getElementById("logout-button").addEventListener("click", function () {
  if (confirm("Are you sure you want to log out?")) {
    alert("You have been logged out. (Prototype: no real login yet.)");
  }
});