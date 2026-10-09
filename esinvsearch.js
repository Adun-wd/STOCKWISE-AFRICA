// Stockwise Africa - Inventory page
// Frontend-only prototype: data is saved in the browser with localStorage.

// ---------- Settings ----------
const STORAGE_KEY = "stockwise-products";
const CATEGORIES = ["Tablet", "Capsule", "Syrup", "Injection", "Cream", "Other"];
const LOW_STOCK_LIMIT = 10;

// The date range shown in the screenshot. It is only used for filtering
// after the user applies a range themselves.
const DEFAULT_DATE_LABEL = "Apr 1, 2026 - Sep 29, 2026";
const DEFAULT_START = "2026-04-01";
const DEFAULT_END = "2026-09-29";

// ---------- Demo mode ----------
// inventory-search.html turns this on (data-demo on <body>), and so does index.html?demo=no-results.
// It uses the fictional sample products below, starts with "Panadol extra" in the
// search box, and never touches the products saved in your browser.
const isDemoMode =
  document.body.dataset.demo === "no-results" ||
  new URLSearchParams(window.location.search).get("demo") === "no-results";
const DEMO_SEARCH_TERM = "Panadol extra";
const SAMPLE_PRODUCTS = [
  { id: 1, name: "Paracetamol 500mg", sku: "TAB-001", category: "Tablet", quantity: 120, price: 800, dateAdded: "2026-05-12" },
  { id: 2, name: "Amoxicillin 250mg", sku: "CAP-014", category: "Capsule", quantity: 8, price: 1500, dateAdded: "2026-06-03" },
  { id: 3, name: "Vitamin C Syrup", sku: "SYR-007", category: "Syrup", quantity: 0, price: 2200, dateAdded: "2026-07-21" },
  { id: 4, name: "Diclofenac Injection", sku: "INJ-022", category: "Injection", quantity: 45, price: 950, dateAdded: "2026-08-09" },
  { id: 5, name: "Hydrocortisone Cream", sku: "CRM-003", category: "Cream", quantity: 6, price: 1800, dateAdded: "2026-09-02" },
];

// ---------- State (the data the page is built from) ----------
let products = isDemoMode ? SAMPLE_PRODUCTS : loadProducts();
let dateFilter = null; // null = date filter is off, otherwise { start, end }

// ---------- Page elements ----------
const emptyState = document.getElementById("empty-state");
const productSection = document.getElementById("product-section");
const tableBody = document.getElementById("product-table-body");
const searchEmptyState = document.getElementById("search-empty-state");
const searchEmptyMessage = document.getElementById("search-empty-message");
const clearSearchButton = document.getElementById("clear-search-button");

const topSearch = document.getElementById("top-search");
const inventorySearch = document.getElementById("inventory-search");
const categoryFilter = document.getElementById("category-filter");
const statusFilter = document.getElementById("status-filter");

const addDialog = document.getElementById("add-dialog");
const addForm = document.getElementById("add-form");
const productCategory = document.getElementById("product-category");

const dateDialog = document.getElementById("date-dialog");
const dateForm = document.getElementById("date-form");
const dateStart = document.getElementById("date-start");
const dateEnd = document.getElementById("date-end");
const dateError = document.getElementById("date-error");
const dateLabel = document.getElementById("date-label");

// ---------- Saving and loading ----------
function loadProducts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return []; // corrupted data: start fresh
  }
}

function saveProducts() {
  if (isDemoMode) return; // demo data is never saved
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

// ---------- Helpers ----------
function getStockStatus(quantity) {
  if (quantity === 0) return "Out of Stock";
  if (quantity <= LOW_STOCK_LIMIT) return "Low Stock";
  return "In Stock";
}

function todayAsText() {
  // "YYYY-MM-DD" in the user's local time
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function formatDate(text) {
  // Turns "2026-04-01" into "Apr 1, 2026" (adding the time avoids timezone shifts)
  return new Date(text + "T00:00:00").toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function formatPrice(amount) {
  return amount.toLocaleString("en-NG", { style: "currency", currency: "NGN" });
}

// ---------- Filtering ----------
// Returns only the products that match every search box and filter.
function getFilteredProducts() {
  const topText = topSearch.value.trim().toLowerCase();
  const inventoryText = inventorySearch.value.trim().toLowerCase();

  return products.filter(function (product) {
    const name = product.name.toLowerCase();
    const sku = product.sku.toLowerCase();
    const category = product.category.toLowerCase();

    const matchesTop = name.includes(topText) || sku.includes(topText) || category.includes(topText);
    const matchesInventory = name.includes(inventoryText) || sku.includes(inventoryText);
    const matchesCategory = categoryFilter.value === "all" || product.category === categoryFilter.value;
    const matchesStatus = statusFilter.value === "all" || getStockStatus(product.quantity) === statusFilter.value;
    const matchesDate = !dateFilter || (product.dateAdded >= dateFilter.start && product.dateAdded <= dateFilter.end);

    return matchesTop && matchesInventory && matchesCategory && matchesStatus && matchesDate;
  });
}

// ---------- Rendering ----------
// Makes one <td>. textContent keeps user-typed text safe (no HTML injection).
function createCell(text, extraClasses) {
  const cell = document.createElement("td");
  cell.className = "px-4 py-3 " + (extraClasses || "");
  cell.textContent = text;
  return cell;
}

function createProductRow(product) {
  const row = document.createElement("tr");
  row.className = "border-t border-navy/10";

  const status = getStockStatus(product.quantity);
  const statusColors = {
    "In Stock": "text-green-700",
    "Low Stock": "text-amber-600",
    "Out of Stock": "text-accent-red",
  };

  row.append(
    createCell(product.name, "font-semibold"),
    createCell(product.sku),
    createCell(product.category),
    createCell(String(product.quantity)),
    createCell(formatPrice(product.price)),
    createCell(status, "font-semibold " + statusColors[status]),
    createCell(formatDate(product.dateAdded))
  );

  const actionCell = document.createElement("td");
  actionCell.className = "px-4 py-3 text-right";
  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.textContent = "Delete";
  deleteButton.className = "rounded-[5px] px-2 py-1 text-accent-red hover:bg-accent-red/10";
  deleteButton.setAttribute("aria-label", "Delete " + product.name);
  deleteButton.addEventListener("click", function () {
    deleteProduct(product.id);
  });
  actionCell.append(deleteButton);
  row.append(actionCell);

  return row;
}

// Redraws the whole product area. Call this after ANY change.
function renderProducts() {
  const hasProducts = products.length > 0;
  const visibleProducts = getFilteredProducts();
  const hasNoMatches = hasProducts && visibleProducts.length === 0;

  // 1) Inventory is empty -> "No Products yet" screen
  emptyState.classList.toggle("hidden", hasProducts);
  emptyState.classList.toggle("flex", !hasProducts);

  // 2) Products exist but nothing matches -> "No results found" screen
  searchEmptyState.classList.toggle("hidden", !hasNoMatches);
  searchEmptyState.classList.toggle("flex", hasNoMatches);
  if (hasNoMatches) updateSearchEmptyMessage();

  // 3) Products match -> table
  productSection.classList.toggle("hidden", !hasProducts || hasNoMatches);
  tableBody.replaceChildren(...visibleProducts.map(createProductRow));
}

// Writes: We couldn’t find any product matching “term”
// textContent keeps whatever the user typed safe.
function updateSearchEmptyMessage() {
  const term = topSearch.value.trim() || inventorySearch.value.trim();
  searchEmptyMessage.textContent = term !== ""
    ? "We couldn’t find any product matching “" + term + "”"
    : "We couldn’t find any product matching your filters";
}

// "Clear search" button: empties both search boxes. If the filters are what is
// hiding everything, they are reset as well, so the button always helps.
function clearSearch() {
  topSearch.value = "";
  inventorySearch.value = "";

  if (getFilteredProducts().length === 0) {
    categoryFilter.value = "all";
    statusFilter.value = "all";
    dateFilter = null;
    dateLabel.textContent = DEFAULT_DATE_LABEL;
  }

  renderProducts();
  topSearch.focus();
}

function fillCategoryLists() {
  CATEGORIES.forEach(function (category) {
    categoryFilter.append(new Option(category, category));
    productCategory.append(new Option(category, category));
  });
}

// ---------- Adding and deleting ----------
function openAddDialog() {
  addForm.reset();
  clearErrors();
  addDialog.showModal();
}

function showError(fieldName, message) {
  const errorText = addForm.querySelector(`[data-error-for="${fieldName}"]`);
  errorText.textContent = message;
  errorText.classList.remove("hidden");
}

function clearErrors() {
  addForm.querySelectorAll(".field-error").forEach(function (errorText) {
    errorText.classList.add("hidden");
  });
}

// Returns true when every field is valid.
function validateForm(values) {
  clearErrors();
  let isValid = true;

  if (values.name === "") { showError("name", "Enter a product name."); isValid = false; }
  if (values.sku === "") {
    showError("sku", "Enter a SKU.");
    isValid = false;
  } else if (products.some(function (p) { return p.sku.toLowerCase() === values.sku.toLowerCase(); })) {
    showError("sku", "This SKU already exists.");
    isValid = false;
  }
  if (values.category === "") { showError("category", "Choose a category."); isValid = false; }
  if (!Number.isInteger(values.quantity) || values.quantity < 0) {
    showError("quantity", "Enter a whole number, 0 or more.");
    isValid = false;
  }
  if (Number.isNaN(values.price) || values.price < 0) {
    showError("price", "Enter a price, 0 or more.");
    isValid = false;
  }
  return isValid;
}

function handleAddSubmit(event) {
  event.preventDefault(); // stop the browser from reloading the page

  const formData = new FormData(addForm);
  const values = {
    name: formData.get("name").trim(),
    sku: formData.get("sku").trim(),
    category: formData.get("category"),
    quantity: formData.get("quantity") === "" ? NaN : Number(formData.get("quantity")),
    price: formData.get("price") === "" ? NaN : Number(formData.get("price")),
  };

  if (!validateForm(values)) return;

  products.push({ id: Date.now(), ...values, dateAdded: todayAsText() });
  saveProducts();
  addDialog.close();
  renderProducts();
  updateNotificationMessage();
}

function deleteProduct(productId) {
  products = products.filter(function (product) { return product.id !== productId; });
  saveProducts();
  renderProducts();
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
  renderProducts();
}

function resetDateRange() {
  dateFilter = null; // filter off again; label returns to the original text
  dateLabel.textContent = DEFAULT_DATE_LABEL;
  dateDialog.close();
  renderProducts();
}

// ---------- Notifications ----------
const notificationButton = document.getElementById("notification-button");
const notificationPanel = document.getElementById("notification-panel");
const notificationMessage = document.getElementById("notification-message");

function updateNotificationMessage() {
  const needAttention = products.filter(function (p) { return p.quantity <= LOW_STOCK_LIMIT; }).length;
  if (products.length === 0) {
    notificationMessage.textContent = "No notifications yet. Add a product to start tracking stock.";
  } else if (needAttention === 0) {
    notificationMessage.textContent = "All products are well stocked.";
  } else {
    notificationMessage.textContent = needAttention + " product(s) are low or out of stock.";
  }
}

function toggleNotifications() {
  const isOpen = notificationPanel.classList.toggle("hidden") === false;
  notificationButton.setAttribute("aria-expanded", String(isOpen));
}

// ---------- Sidebar ----------
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebar-overlay");
const navLinks = document.querySelectorAll(".nav-link");

function setSidebarOpen(isOpen) {
  sidebar.classList.toggle("-translate-x-full", !isOpen);
  sidebarOverlay.classList.toggle("hidden", !isOpen);
}

function setActiveLink(clickedLink) {
  navLinks.forEach(function (link) {
    const isActive = link === clickedLink;
    link.classList.toggle("bg-white", isActive);
    link.classList.toggle("text-navy", isActive);
    link.classList.toggle("hover:bg-white/10", !isActive);
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

// ---------- Event listeners ----------
document.querySelectorAll("[data-open-add-dialog]").forEach(function (button) {
  button.addEventListener("click", openAddDialog);
});
document.getElementById("cancel-add").addEventListener("click", function () { addDialog.close(); });
addForm.addEventListener("submit", handleAddSubmit);

clearSearchButton.addEventListener("click", clearSearch);

[topSearch, inventorySearch].forEach(function (input) {
  input.addEventListener("input", renderProducts);
});
[categoryFilter, statusFilter].forEach(function (select) {
  select.addEventListener("change", renderProducts);
});

document.getElementById("date-button").addEventListener("click", openDateDialog);
dateForm.addEventListener("submit", applyDateRange);
document.getElementById("date-clear").addEventListener("click", resetDateRange);

notificationButton.addEventListener("click", toggleNotifications);
document.addEventListener("click", function (event) {
  // Close the notification panel when clicking anywhere else
  if (!notificationPanel.contains(event.target) && !notificationButton.contains(event.target)) {
    notificationPanel.classList.add("hidden");
    notificationButton.setAttribute("aria-expanded", "false");
  }
});

navLinks.forEach(function (link) {
  link.addEventListener("click", function (event) {
    // Only placeholder links ("#") are blocked; real pages like sales.html open normally
    if (link.getAttribute("href") === "#") {
      event.preventDefault();
      setActiveLink(link);
      setSidebarOpen(false);
    }
  });
});
document.getElementById("menu-button").addEventListener("click", function () { setSidebarOpen(true); });
sidebarOverlay.addEventListener("click", function () { setSidebarOpen(false); });

document.getElementById("logout-button").addEventListener("click", function () {
  if (confirm("Are you sure you want to log out?")) {
    alert("You have been logged out. (Prototype: no real login yet.)");
  }
});

// ---------- Start the page ----------
fillCategoryLists();
if (isDemoMode) topSearch.value = DEMO_SEARCH_TERM; // reproduces the design screen
updateNotificationMessage();
renderProducts();