// Stockwise Africa - Alerts page
// Alerts are created from the products saved on the Inventory page
// (same browser localStorage). Nothing is stored for the alerts themselves
// except which ones the user has marked as read.

// ---------- Settings ----------
const PRODUCTS_KEY = "stockwise-products";   // written by the Inventory page
const READ_ALERTS_KEY = "stockwise-read-alerts";
const LOW_STOCK_LIMIT = 10;                  // keep in sync with script.js

// ---------- State ----------
let alerts = buildAlerts();
let readAlertIds = loadReadAlertIds();

// ---------- Page elements ----------
const emptyState = document.getElementById("empty-state");
const alertsSection = document.getElementById("alerts-section");
const alertsList = document.getElementById("alerts-list");
const noResults = document.getElementById("no-results");
const topSearch = document.getElementById("top-search");
const markAllButton = document.getElementById("mark-all-button");
const statusMessage = document.getElementById("status-message");
const lastUpdatedDate = document.getElementById("last-updated-date");
const lastUpdatedTime = document.getElementById("last-updated-time");

// ---------- Loading data ----------
function loadProducts() {
  try {
    const saved = localStorage.getItem(PRODUCTS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
}

function loadReadAlertIds() {
  try {
    const saved = localStorage.getItem(READ_ALERTS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
}

function saveReadAlertIds() {
  localStorage.setItem(READ_ALERTS_KEY, JSON.stringify(readAlertIds));
}

// Turns low / out-of-stock products into alert objects.
// The id includes the status, so a product whose stock changes creates a fresh alert.
function buildAlerts() {
  const newAlerts = [];

  loadProducts().forEach(function (product) {
    if (product.quantity === 0) {
      newAlerts.push({
        id: product.id + "-out",
        title: "Out of stock",
        message: product.name + " (" + product.sku + ") has run out of stock.",
        product: product,
      });
    } else if (product.quantity <= LOW_STOCK_LIMIT) {
      newAlerts.push({
        id: product.id + "-low",
        title: "Low stock",
        message: product.name + " (" + product.sku + ") has only " + product.quantity + " left.",
        product: product,
      });
    }
  });

  return newAlerts;
}

// ---------- Helpers ----------
function isRead(alert) {
  return readAlertIds.includes(alert.id);
}

function countUnread() {
  return alerts.filter(function (alert) { return !isRead(alert); }).length;
}

let statusTimer = null;

// Shows a short message at the bottom of the screen, then hides it after 3 seconds.
function showStatus(message) {
  statusMessage.textContent = message;
  statusMessage.classList.remove("hidden");
  clearTimeout(statusTimer);
  statusTimer = setTimeout(function () {
    statusMessage.classList.add("hidden");
  }, 3000);
}

function setLastUpdatedToNow() {
  const now = new Date();
  lastUpdatedDate.textContent = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  lastUpdatedTime.textContent = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

// ---------- Filtering ----------
// The top search matches product name, SKU or category.
function getFilteredAlerts() {
  const text = topSearch.value.trim().toLowerCase();

  return alerts.filter(function (alert) {
    const product = alert.product;
    return (
      product.name.toLowerCase().includes(text) ||
      product.sku.toLowerCase().includes(text) ||
      product.category.toLowerCase().includes(text)
    );
  });
}

// ---------- Rendering ----------
function createAlertItem(alert) {
  const item = document.createElement("li");
  const read = isRead(alert);
  item.className = "flex flex-wrap items-center justify-between gap-3 rounded-[5px] border border-navy/20 p-4 " + (read ? "" : "bg-navy/5");

  const textBox = document.createElement("div");

  const title = document.createElement("p");
  title.className = "text-lg font-semibold " + (alert.title === "Out of stock" ? "text-accent-red" : "");
  title.textContent = (read ? "" : "● ") + alert.title; // dot marks unread alerts

  const message = document.createElement("p");
  message.className = "text-sm font-medium";
  message.textContent = alert.message; // textContent keeps typed product names safe

  textBox.append(title, message);
  item.append(textBox);

  if (!read) {
    const readButton = document.createElement("button");
    readButton.type = "button";
    readButton.textContent = "Mark as read";
    readButton.className = "rounded-[5px] border border-navy px-3 py-1.5 text-sm font-semibold hover:bg-navy/5";
    readButton.setAttribute("aria-label", "Mark alert as read: " + alert.message);
    readButton.addEventListener("click", function () {
      markAsRead(alert.id);
    });
    item.append(readButton);
  }

  return item;
}

// Redraws the alert area. Call this after ANY change.
function renderAlerts() {
  const hasAlerts = alerts.length > 0;
  emptyState.classList.toggle("hidden", hasAlerts);
  emptyState.classList.toggle("flex", !hasAlerts);
  alertsSection.classList.toggle("hidden", !hasAlerts);

  const visibleAlerts = getFilteredAlerts();
  alertsList.replaceChildren(...visibleAlerts.map(createAlertItem));
  noResults.classList.toggle("hidden", visibleAlerts.length > 0);
}

// ---------- Marking as read ----------
function markAsRead(alertId) {
  if (!readAlertIds.includes(alertId)) readAlertIds.push(alertId);
  saveReadAlertIds();
  setLastUpdatedToNow();
  renderAlerts();
  updateNotificationMessage();
}

function markAllAsRead() {
  if (alerts.length === 0) {
    showStatus("There are no alerts to mark as read.");
    return;
  }
  if (countUnread() === 0) {
    showStatus("All alerts are already read.");
    return;
  }
  readAlertIds = alerts.map(function (alert) { return alert.id; });
  saveReadAlertIds();
  setLastUpdatedToNow();
  showStatus("All alerts marked as read.");
  renderAlerts();
  updateNotificationMessage();
}

// ---------- Notifications (header bell) ----------
const notificationButton = document.getElementById("notification-button");
const notificationPanel = document.getElementById("notification-panel");
const notificationMessage = document.getElementById("notification-message");

function updateNotificationMessage() {
  const unread = countUnread();
  notificationMessage.textContent = unread === 0
    ? "You're all caught up. No unread alerts."
    : unread + " unread alert(s) need your attention.";
}

function toggleNotifications() {
  const isOpen = notificationPanel.classList.toggle("hidden") === false;
  notificationButton.setAttribute("aria-expanded", String(isOpen));
}

// ---------- Sidebar ----------
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebar-overlay");

function setSidebarOpen(isOpen) {
  sidebar.classList.toggle("-translate-x-full", !isOpen);
  sidebarOverlay.classList.toggle("hidden", !isOpen);
}

// "#" links have no page yet, so stop them from jumping to the top.
document.querySelectorAll(".nav-link").forEach(function (link) {
  link.addEventListener("click", function (event) {
    if (link.getAttribute("href") === "#") event.preventDefault();
  });
});

// ---------- Event listeners ----------
topSearch.addEventListener("input", renderAlerts);
markAllButton.addEventListener("click", markAllAsRead);

notificationButton.addEventListener("click", toggleNotifications);
document.addEventListener("click", function (event) {
  if (!notificationPanel.contains(event.target) && !notificationButton.contains(event.target)) {
    notificationPanel.classList.add("hidden");
    notificationButton.setAttribute("aria-expanded", "false");
  }
});

document.getElementById("menu-button").addEventListener("click", function () { setSidebarOpen(true); });
sidebarOverlay.addEventListener("click", function () { setSidebarOpen(false); });

document.getElementById("logout-button").addEventListener("click", function () {
  if (confirm("Are you sure you want to log out?")) {
    alert("You have been logged out. (Prototype: no real login yet.)");
  }
});

// ---------- Start the page ----------
// With no alerts the screenshot's "Oct 3, 2026 • 9:41 AM" stays; otherwise show the real time.
if (alerts.length > 0) setLastUpdatedToNow();
updateNotificationMessage();
renderAlerts();