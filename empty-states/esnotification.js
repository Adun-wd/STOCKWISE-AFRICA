// Stockwise Africa - Notifications page
// Frontend-only prototype: there is no backend, so there are no real notifications.

// ---------- Data ----------
// Starts empty so the page matches the design's "No notification yet" screen.
// Each notification would look like:
// { id: 1, title: "Low stock", message: "Paracetamol 500mg has 8 left.", time: "Today, 9:41 AM", read: false }
const notifications = [];

// ---------- Page elements ----------
const emptyState = document.getElementById("empty-state");
const listSection = document.getElementById("notification-list-section");
const notificationList = document.getElementById("notification-list");
const topSearch = document.getElementById("top-search");
const markAllButton = document.getElementById("mark-all-button");
const statusMessage = document.getElementById("status-message");

const bellButton = document.getElementById("notification-button");
const bellPanel = document.getElementById("notification-panel");
const bellPanelMessage = document.getElementById("notification-panel-message");

const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebar-overlay");

// ---------- Floating message ----------
let statusTimer = null;

function showStatus(message) {
  statusMessage.textContent = message; // textContent keeps text safe
  statusMessage.classList.remove("hidden");
  clearTimeout(statusTimer);
  statusTimer = setTimeout(function () {
    statusMessage.classList.add("hidden");
  }, 3500);
}

// ---------- Helpers ----------
function countUnread() {
  return notifications.filter(function (item) { return !item.read; }).length;
}

// Notifications that match the search box (title or message)
function getVisibleNotifications() {
  const text = topSearch.value.trim().toLowerCase();
  return notifications.filter(function (item) {
    return item.title.toLowerCase().includes(text) || item.message.toLowerCase().includes(text);
  });
}

// ---------- Rendering ----------
function createNotificationItem(item) {
  const listItem = document.createElement("li");
  listItem.className = "flex flex-wrap items-center justify-between gap-3 rounded-[5px] border border-navy/20 p-4 " + (item.read ? "" : "bg-navy/5");

  const textBox = document.createElement("div");

  const title = document.createElement("p");
  title.className = "text-lg font-semibold";
  title.textContent = (item.read ? "" : "● ") + item.title; // dot marks unread items

  const message = document.createElement("p");
  message.className = "text-sm font-medium";
  message.textContent = item.message;

  const time = document.createElement("p");
  time.className = "mt-1 text-xs font-medium text-navy/80";
  time.textContent = item.time;

  textBox.append(title, message, time);
  listItem.append(textBox);

  if (!item.read) {
    const readButton = document.createElement("button");
    readButton.type = "button";
    readButton.textContent = "Mark as read";
    readButton.className = "rounded-[5px] border border-navy px-3 py-1.5 text-sm font-semibold hover:bg-navy/5";
    readButton.setAttribute("aria-label", "Mark as read: " + item.title);
    readButton.addEventListener("click", function () {
      item.read = true;
      renderNotifications();
    });
    listItem.append(readButton);
  }

  return listItem;
}

// Draws either the empty state or the list. Call this after ANY change.
function renderNotifications() {
  const hasNotifications = notifications.length > 0;

  emptyState.classList.toggle("hidden", hasNotifications);
  emptyState.classList.toggle("flex", !hasNotifications);
  listSection.classList.toggle("hidden", !hasNotifications);

  notificationList.replaceChildren(...getVisibleNotifications().map(createNotificationItem));

  const unread = countUnread();
  bellPanelMessage.textContent = unread === 0
    ? "You have no new notifications."
    : "You have " + unread + " unread notification(s).";
}

// ---------- Mark all as read ----------
function markAllAsRead() {
  if (notifications.length === 0) {
    showStatus("There are no notifications to mark as read.");
    return;
  }
  if (countUnread() === 0) {
    showStatus("All notifications are already read.");
    return;
  }
  notifications.forEach(function (item) { item.read = true; });
  renderNotifications();
  showStatus("All notifications marked as read.");
}

// ---------- Search ----------
// There is no backend search, so this only filters the notifications on this page.
function handleSearch() {
  renderNotifications();
  if (topSearch.value.trim() !== "" && notifications.length === 0) {
    showStatus("There are no notifications to search yet.");
  }
}

// ---------- Bell ----------
function closeBellPanel() {
  bellPanel.classList.add("hidden");
  bellButton.setAttribute("aria-expanded", "false");
}

function toggleBellPanel() {
  const isOpen = bellPanel.classList.toggle("hidden") === false;
  bellButton.setAttribute("aria-expanded", String(isOpen));
}

// ---------- Sidebar ----------
function setSidebarOpen(isOpen) {
  sidebar.classList.toggle("-translate-x-full", !isOpen);
  sidebarOverlay.classList.toggle("hidden", !isOpen);
}

// Real pages navigate normally; Home has no page yet, so it shows a message.
document.querySelectorAll(".nav-link").forEach(function (link) {
  link.addEventListener("click", function (event) {
    if (link.getAttribute("href") === "#") {
      event.preventDefault();
      showStatus(link.dataset.page + " page is not implemented in this demo.");
      setSidebarOpen(false);
    }
  });
});

// ---------- Event listeners ----------
markAllButton.addEventListener("click", markAllAsRead);
topSearch.addEventListener("input", handleSearch);
bellButton.addEventListener("click", toggleBellPanel);

// Click outside the bell panel closes it
document.addEventListener("click", function (event) {
  if (!bellPanel.contains(event.target) && !bellButton.contains(event.target)) closeBellPanel();
});

// Escape closes the bell panel and the mobile menu
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeBellPanel();
    setSidebarOpen(false);
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
renderNotifications();