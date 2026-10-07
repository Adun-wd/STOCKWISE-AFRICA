/*
  stock.js
  ---------
  Makes the Stock Out screen interactive:
    1. Plus / minus buttons change the quantity
    2. Quantity stays between 1 and the current stock
    3. "New stock quantity" is recalculated every time the quantity changes
    4. Confirm button shows a summary message
    5. Back button and quick action buttons respond to clicks

  There is no backend: everything happens in the browser.
*/

// ---------- DATA ----------
// Current stock of the product (matches "Current stock: 48" on the screen).
// In a real app this would come from a database.
const currentStock = 48;

// The quantity the user wants to remove. The design starts at 10.
let quantity = 10;

// The smallest quantity allowed
const minQuantity = 1;

// ---------- GRAB ELEMENTS FROM THE PAGE ----------
// Each ID below must exist in index.html.
const quantityDisplay = document.getElementById("quantityDisplay");
const newStockDisplay = document.getElementById("newStockDisplay");
const currentStockLabel = document.getElementById("currentStockLabel");
const minusBtn = document.getElementById("minusBtn");
const plusBtn = document.getElementById("plusBtn");
const reasonSelect = document.getElementById("reasonSelect");
const stockOutForm = document.getElementById("stockOutForm");
const confirmMessage = document.getElementById("confirmMessage");
const backBtn = document.getElementById("backBtn");

// ---------- SHOW THE LATEST NUMBERS ----------
// Call this whenever "quantity" changes so the screen stays in sync.
function updateDisplay() {
  // Show the quantity the user picked
  quantityDisplay.textContent = quantity;

  // new stock = current stock - quantity to remove
  const newStock = currentStock - quantity;
  newStockDisplay.textContent = newStock;
}

// ---------- QUANTITY BUTTONS ----------
function increaseQuantity() {
  // Only add 1 if we have not reached the current stock yet
  if (quantity < currentStock) {
    quantity = quantity + 1;
    updateDisplay();
  }
}

function decreaseQuantity() {
  // Only subtract 1 if we are above the minimum
  if (quantity > minQuantity) {
    quantity = quantity - 1;
    updateDisplay();
  }
}

minusBtn.addEventListener("click", decreaseQuantity);
plusBtn.addEventListener("click", increaseQuantity);

// ---------- CONFIRM BUTTON ----------
// The button is inside a form, so we listen for the form "submit" event
// and stop the page from reloading with preventDefault().
stockOutForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const reason = reasonSelect.value;
  const newStock = currentStock - quantity;

  confirmMessage.textContent =
    "Removed " + quantity + " item(s). Reason: " + reason + ". New stock: " + newStock + ".";

  // Remove Tailwind's "hidden" class so the message appears
  confirmMessage.classList.remove("hidden");
});

// ---------- BACK BUTTON ----------
backBtn.addEventListener("click", function () {
  // Go to the previous page in the browser history
  window.history.back();
});

// ---------- QUICK ACTION BUTTONS ----------
// Basic click interactions. Replace the alerts with real navigation later.
document.getElementById("recordSaleBtn").addEventListener("click", function () {
  alert("Record Sale clicked");
});

document.getElementById("addStockBtn").addEventListener("click", function () {
  alert("Add Stock clicked");
});

document.getElementById("removeStockBtn").addEventListener("click", function () {
  // We are already on the Remove Stock screen, so nothing else to do.
  alert("You are already on the Remove Stock screen");
});

document.getElementById("editProductBtn").addEventListener("click", function () {
  alert("Edit Product clicked");
});

document.getElementById("viewInventoryBtn").addEventListener("click", function () {
  alert("View Stock Inventory clicked");
});

// ---------- BOTTOM NAVIGATION ----------
// The links use href="#", which would jump the page to the top.
// This stops that until real pages exist.
const navLinks = document.querySelectorAll("nav[aria-label='Main navigation'] a");

navLinks.forEach(function (link) {
  link.addEventListener("click", function (event) {
    event.preventDefault();
  });
});

// ---------- START ----------
// Make sure the screen shows the right numbers when the page loads.
currentStockLabel.textContent = currentStock;
updateDisplay();