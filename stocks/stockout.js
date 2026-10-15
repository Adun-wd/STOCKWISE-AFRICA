/*
  stockout.js
  ---------
  Makes the Stock Out Confirmation screen interactive:
    1. View Product button
    2. Back to Inventory button
    3. Bottom navigation buttons
    4. Fallback placeholder if images.jpg is missing
*/

// ---------- GRAB ELEMENTS FROM THE PAGE ----------
// Each ID below must exist in index.html.
const viewProductBtn = document.getElementById("viewProductBtn");
const backToInventoryBtn = document.getElementById("backToInventoryBtn");
const productImage = document.getElementById("productImage");
const imageFallback = document.getElementById("imageFallback");

// All five bottom navigation buttons (each has a data-nav attribute)
const navButtons = document.querySelectorAll("[data-nav]");

// ---------- VIEW PRODUCT BUTTON ----------
viewProductBtn.addEventListener("click", function () {
  alert("Opening product details...");
});

// ---------- BACK TO INVENTORY BUTTON ----------
backToInventoryBtn.addEventListener("click", function () {
  alert("Returning to inventory...");
});

// ---------- BOTTOM NAVIGATION ----------
// Loop through every nav button and log which one was clicked.
navButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const itemName = button.getAttribute("data-nav");
    console.log("Navigation clicked: " + itemName);
  });
});

// ---------- IMAGE FALLBACK ----------
// If images.jpg can't be loaded, hide the broken image
// and show the simple placeholder icon instead.
productImage.addEventListener("error", function () {
  productImage.classList.add("hidden");
  imageFallback.classList.remove("hidden");
  imageFallback.classList.add("flex");
});