// Stockwise Africa - Sales page
// Frontend-only prototype: sales are saved in the browser with localStorage.

// ---------- Settings ----------
const STORAGE_KEY = "stockwise-sales";

// The date range shown in the screenshot. It only filters after the user applies a range.
const DEFAULT_DATE_LABEL = "Sep 20, 2026 - Sep 26, 2026";
const DEFAULT_START = "2026-09-20";
const DEFAULT_END = "2026-09-26";

// ---------- State ----------
let sales = loadSales();
let dateFilter = null; // null = date filter off, otherwise { start, end }

// ---------- Page elements ----------
const emptyState = document.getElementById("empty-state");
const salesSection = document.getElementById("sales-section");
const tableBody = document.getElementById("sales-table-body");
const noResults = document.getElementById("no-results");
const topSearch = document.getElementById("top-search");

const saleDialog = document.getElementById("sale-dialog");
const saleForm = document.getElementById("sale-form");

const dateDialog = document.getElementById("date-dialog");
const dateForm = document.getElementById("date-form");
const dateStart = document.getElementById("date-start");
const dateEnd = document.getElementById("date-end");
const dateError = document.getElementById("date-error");
const dateLabel = document.getElementById("date-label");

// ---------- Saving and loading ----------
function loadSales() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
}

function saveSales() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sales));
}

// ---------- Helpers ----------
function todayAsText() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function formatDate(text) {
  return new Date(text + "T00:00:00").toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function formatPrice(amount) {
  return amount.toLocaleString("en-NG", { style: "currency", currency: "NGN" });
}

// ---------- Filtering ----------
// Search matches product name or payment method; the date range is applied on top.
function getFilteredSales() {
  const text = topSearch.value.trim().toLowerCase();

  return sales.filter(function (sale) {
    const matchesText = sale.product.toLowerCase().includes(text) || sale.payment.toLowerCase().includes(text);
    const matchesDate = !dateFilter || (sale.date >= dateFilter.start && sale.date <= dateFilter.end);
    return matchesText && matchesDate;
  });
}

// ---------- Rendering ----------
function createCell(text, extraClasses) {
  const cell = document.createElement("td");
  cell.className = "px-4 py-3 " + (extraClasses || "");
  cell.textContent = text; // textContent keeps typed text safe
  return cell;
}

function createSaleRow(sale) {
  const row = document.createElement("tr");
  row.className = "border-t border-navy/10";

  row.append(
    createCell(sale.product, "font-semibold"),
    createCell(String(sale.quantity)),
    createCell(formatPrice(sale.price)),
    createCell(formatPrice(sale.quantity * sale.price), "font-semibold"),
    createCell(sale.payment),
    createCell(formatDate(sale.date))
  );

  const actionCell = document.createElement("td");
  actionCell.className = "px-4 py-3 text-right";
  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.textContent = "Delete";
  deleteButton.className = "rounded-[5px] px-2 py-1 text-accent-red hover:bg-accent-red/10";
  deleteButton.setAttribute("aria-label", "Delete sale of " + sale.product);
  deleteButton.addEventListener("click", function () {
    deleteSale(sale.id);
  });
  actionCell.append(deleteButton);
  row.append(actionCell);

  return row;
}

// Redraws the sales area. Call this after ANY change.
function renderSales() {
  const hasSales = sales.length > 0;
  emptyState.classList.toggle("hidden", hasSales);
  emptyState.classList.toggle("flex", !hasSales);
  salesSection.classList.toggle("hidden", !hasSales);

  const visibleSales = getFilteredSales();
  tableBody.replaceChildren(...visibleSales.map(createSaleRow));
  noResults.classList.toggle("hidden", visibleSales.length > 0);
}

// ---------- Recording and deleting ----------
function openSaleDialog() {
  saleForm.reset();
  clearErrors();
  saleDialog.showModal();
}

function showError(fieldName, message) {
  const errorText = saleForm.querySelector(`[data-error-for="${fieldName}"]`);
  errorText.textContent = message;
  errorText.classList.remove("hidden");
}

function clearErrors() {
  saleForm.querySelectorAll(".field-error").forEach(function (errorText) {
    errorText.classList.add("hidden");
  });
}

function validateForm(values) {
  clearErrors();
  let isValid = true;

  if (values.product === "") { showError("product", "Enter a product name."); isValid = false; }
  if (!Number.isInteger(values.quantity) || values.quantity < 1) {
    showError("quantity", "Enter a whole number, 1 or more.");
    isValid = false;
  }
  if (Number.isNaN(values.price) || values.price < 0) {
    showError("price", "Enter a price, 0 or more.");
    isValid = false;
  }
  if (values.payment === "") { showError("payment", "Choose a payment method."); isValid = false; }
  return isValid;
}

function handleSaleSubmit(event) {
  event.preventDefault();

  const formData = new FormData(saleForm);
  const values = {
    product: formData.get("product").trim(),
    quantity: formData.get("quantity") === "" ? NaN : Number(formData.get("quantity")),
    price: formData.get("price") === "" ? NaN : Number(formData.get("price")),
    payment: formData.get("payment"),
  };

  if (!validateForm(values)) return;

  sales.push({ id: Date.now(), ...values, date: todayAsText() });
  saveSales();
  saleDialog.close();
  renderSales();
  updateNotificationMessage();
}

function deleteSale(saleId) {
  sales = sales.filter(function (sale) { return sale.id !== saleId; });
  saveSales();
  renderSales();
  updateNotificationMessage();
}

// ---------- Date filter ----------
function openDateDialog() {
  dateStart.value = dateFilter ? dateFilter.start : DEFAULT_START;
  dateEnd.value = dateFilter ? dateFilter.end : DEFAULT_END;
  dateError.classList.add("hidden");
  dateDialog.showModal();
}

function applyDateRange(event) {
  event.preventDefault();
  if (dateStart.value === "" || dateEnd.value === "" || dateStart.value > dateEnd.value) {
    dateError.classList.remove("hidden");
    return;
  }
  dateFilter = { start: dateStart.value, end: dateEnd.value };
  dateLabel.textContent = formatDate(dateStart.value) + " - " + formatDate(dateEnd.value);
  dateDialog.close();
  renderSales();
}

function resetDateRange() {
  dateFilter = null;
  dateLabel.textContent = DEFAULT_DATE_LABEL;
  dateDialog.close();
  renderSales();
}

// ---------- Notifications ----------
const notificationButton = document.getElementById("notification-button");
const notificationPanel = document.getElementById("notification-panel");
const notificationMessage = document.getElementById("notification-message");

function updateNotificationMessage() {
  if (sales.length === 0) {
    notificationMessage.textContent = "No notifications yet. Record a sale to start tracking revenue.";
    return;
  }
  const revenue = sales.reduce(function (sum, sale) { return sum + sale.quantity * sale.price; }, 0);
  notificationMessage.textContent = sales.length + " sale(s) recorded, " + formatPrice(revenue) + " in total.";
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

// Links with "#" have no page yet, so we stop them from jumping to the top.
// Inventory and Sales are real pages and navigate normally.
document.querySelectorAll(".nav-link").forEach(function (link) {
  link.addEventListener("click", function (event) {
    if (link.getAttribute("href") === "#") event.preventDefault();
  });
});

// ---------- Event listeners ----------
document.querySelectorAll("[data-open-sale-dialog]").forEach(function (button) {
  button.addEventListener("click", openSaleDialog);
});
document.getElementById("cancel-sale").addEventListener("click", function () { saleDialog.close(); });
saleForm.addEventListener("submit", handleSaleSubmit);

topSearch.addEventListener("input", renderSales);

document.getElementById("date-button").addEventListener("click", openDateDialog);
dateForm.addEventListener("submit", applyDateRange);
document.getElementById("date-clear").addEventListener("click", resetDateRange);

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
updateNotificationMessage();
renderSales();