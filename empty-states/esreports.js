// Stockwise Africa - Reports page
// Report data = the real sales recorded on the Sales page (same browser localStorage).
// Nothing is made up: with no sales in the chosen date range, the empty state stays.

// ---------- Settings ----------
const SALES_KEY = "stockwise-sales"; // written by the Sales page
const DEFAULT_START = "2026-09-20";  // range shown in the design
const DEFAULT_END = "2026-09-26";
const DEFAULT_EMPTY_MESSAGE =
  "There’s no data to show yet. Try adjusting your date range or create some activities in your inventory and sales";

// ---------- State ----------
const sales = loadSales();
let dateRange = { start: DEFAULT_START, end: DEFAULT_END };

// ---------- Page elements ----------
const emptyState = document.getElementById("empty-state");
const emptyMessage = document.getElementById("empty-message");
const reportSection = document.getElementById("report-section");
const reportSummary = document.getElementById("report-summary");
const reportTableBody = document.getElementById("report-table-body");
const topSearch = document.getElementById("top-search");

const dateButton = document.getElementById("date-button");
const dateForm = document.getElementById("date-form");
const dateStart = document.getElementById("date-start");
const dateEnd = document.getElementById("date-end");
const dateError = document.getElementById("date-error");
const dateLabel = document.getElementById("date-label");

const notificationButton = document.getElementById("notification-button");
const notificationPanel = document.getElementById("notification-panel");
const statusMessage = document.getElementById("status-message");

// ---------- Helpers ----------
function loadSales() {
  try {
    const saved = localStorage.getItem(SALES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
}

function formatDate(text) {
  // "2026-09-20" -> "Sep 20, 2026" (adding the time avoids timezone shifts)
  return new Date(text + "T00:00:00").toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function formatPrice(amount) {
  return amount.toLocaleString("en-NG", { style: "currency", currency: "NGN" });
}

let statusTimer = null;
function showStatus(message) {
  statusMessage.textContent = message;
  statusMessage.classList.remove("hidden");
  clearTimeout(statusTimer);
  statusTimer = setTimeout(function () {
    statusMessage.classList.add("hidden");
  }, 3500);
}

// ---------- Report data ----------
// Sales inside the chosen date range that also match the search box.
function getReportRows() {
  const text = topSearch.value.trim().toLowerCase();

  return sales.filter(function (sale) {
    const inRange = sale.date >= dateRange.start && sale.date <= dateRange.end;
    const matchesText = sale.product.toLowerCase().includes(text) || sale.payment.toLowerCase().includes(text);
    return inRange && matchesText;
  });
}

// ---------- Rendering ----------
function createCell(text, extraClasses) {
  const cell = document.createElement("td");
  cell.className = "px-4 py-3 " + (extraClasses || "");
  cell.textContent = text; // textContent keeps typed text safe
  return cell;
}

function createRow(sale) {
  const row = document.createElement("tr");
  row.className = "border-t border-navy/10";
  row.append(
    createCell(sale.product, "font-semibold"),
    createCell(String(sale.quantity)),
    createCell(formatPrice(sale.quantity * sale.price)),
    createCell(sale.payment),
    createCell(formatDate(sale.date))
  );
  return row;
}

// Redraws the page body. Call this after the search text or date range changes.
function renderReport() {
  const rows = getReportRows();
  const hasRows = rows.length > 0;

  reportSection.classList.toggle("hidden", !hasRows);
  emptyState.classList.toggle("hidden", hasRows);
  emptyState.classList.toggle("flex", !hasRows);

  // Empty-state wording: a different message while the user is searching
  const isSearching = topSearch.value.trim() !== "";
  emptyMessage.textContent = isSearching ? "No reports match your search." : DEFAULT_EMPTY_MESSAGE;

  if (hasRows) {
    const total = rows.reduce(function (sum, sale) { return sum + sale.quantity * sale.price; }, 0);
    reportSummary.textContent = rows.length + " sale(s) · " + formatPrice(total) + " total revenue";
    reportTableBody.replaceChildren(...rows.map(createRow));
  }
}

// ---------- Date range ----------
function openDatePanel() {
  dateStart.value = dateRange.start;
  dateEnd.value = dateRange.end;
  dateError.classList.add("hidden");
  dateForm.classList.remove("hidden");
  dateButton.setAttribute("aria-expanded", "true");
  dateStart.focus();
}

function closeDatePanel() {
  dateForm.classList.add("hidden");
  dateButton.setAttribute("aria-expanded", "false");
}

function toggleDatePanel() {
  if (dateForm.classList.contains("hidden")) openDatePanel();
  else closeDatePanel();
}

function applyDateRange(event) {
  event.preventDefault(); // stop the form from reloading the page

  if (dateStart.value === "" || dateEnd.value === "" || dateEnd.value < dateStart.value) {
    dateError.classList.remove("hidden");
    return;
  }

  dateRange = { start: dateStart.value, end: dateEnd.value };
  dateLabel.textContent = formatDate(dateRange.start) + " - " + formatDate(dateRange.end);
  closeDatePanel();
  renderReport();
}

// ---------- Export ----------
// Stops spreadsheet programs from running text like "=SUM(...)" as a formula.
function toCsvValue(value) {
  let text = String(value);
  if (/^[=+\-@]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}

function exportReport() {
  const rows = getReportRows();

  if (rows.length === 0) {
    showStatus("No report data available to export.");
    return;
  }

  const lines = [["Product", "Quantity", "Unit price (NGN)", "Total (NGN)", "Payment", "Date"].map(toCsvValue).join(",")];
  rows.forEach(function (sale) {
    lines.push([
      sale.product, sale.quantity, sale.price, sale.quantity * sale.price, sale.payment, sale.date,
    ].map(toCsvValue).join(","));
  });

  // Build the file in memory and click a temporary download link
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "stockwise-report-" + dateRange.start + "-to-" + dateRange.end + ".csv";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
  showStatus("Report exported.");
}

// ---------- Notifications ----------
function closeNotifications() {
  notificationPanel.classList.add("hidden");
  notificationButton.setAttribute("aria-expanded", "false");
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

// Real pages (Inventory, Sales, Alerts, Reports) navigate normally.
// Home and Settings have no page yet, so they show a message instead.
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
topSearch.addEventListener("input", renderReport);

dateButton.addEventListener("click", toggleDatePanel);
dateForm.addEventListener("submit", applyDateRange);
document.getElementById("date-cancel").addEventListener("click", closeDatePanel);

document.getElementById("export-button").addEventListener("click", exportReport);
notificationButton.addEventListener("click", toggleNotifications);

// Click outside a panel closes it
document.addEventListener("click", function (event) {
  if (!notificationPanel.contains(event.target) && !notificationButton.contains(event.target)) closeNotifications();
  if (!dateForm.contains(event.target) && !dateButton.contains(event.target)) closeDatePanel();
});

// Escape closes panels and the mobile menu
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeNotifications();
    closeDatePanel();
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
renderReport();