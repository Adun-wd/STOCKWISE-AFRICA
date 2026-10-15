/*
  app.js
  ------
  This file handles four small jobs for the Add New Product screen:

  1. The back button
  2. Collapsing/expanding each of the three sections (Basic Information,
     Pricing & Stock, Product Details)
  3. Previewing the chosen product image
  4. Validating and "submitting" the form

  Each job is its own small function so it's easy to follow top to bottom.
*/

document.addEventListener("DOMContentLoaded", function () {
  setupBackButton();
  setupSectionToggles();
  setupImageUpload();
  setupFormSubmit();
});

// ---------- 1. Back button ----------
function setupBackButton() {
  const backButton = document.getElementById("backButton");

  backButton.addEventListener("click", function () {
    window.history.back();
  });
}

// ---------- 2. Collapsible sections ----------
function setupSectionToggles() {
  // Every section header button has class "section-toggle" and a
  // data-target attribute naming the id of the content it controls.
  const toggles = document.querySelectorAll(".section-toggle");

  toggles.forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      const targetId = toggle.getAttribute("data-target");
      const content = document.getElementById(targetId);
      const chevron = toggle.querySelector(".section-chevron");

      // "hidden" is a Tailwind utility class that sets display: none
      content.classList.toggle("hidden");

      // Flip the chevron upside down when the section is collapsed
      chevron.classList.toggle("rotate-180");
    });
  });
}

// ---------- 3. Image upload preview ----------
function setupImageUpload() {
  const chooseFileButton = document.getElementById("chooseFileButton");
  const fileInput = document.getElementById("productImageInput");
  const previewBox = document.getElementById("imagePreviewBox");

  // Clicking our styled "Choose file" button opens the real file picker
  chooseFileButton.addEventListener("click", function () {
    fileInput.click();
  });

  // When a file is chosen, show it as a preview image
  fileInput.addEventListener("change", function () {
    const file = fileInput.files[0];
    if (!file) {
      return;
    }

    // FileReader lets us turn the chosen file into a URL the browser
    // can display, without needing to upload it anywhere yet.
    const reader = new FileReader();
    reader.onload = function (event) {
      previewBox.innerHTML =
        '<img src="' + event.target.result + '" class="w-full h-full object-cover" alt="Product preview" />';
    };
    reader.readAsDataURL(file);
  });
}

// ---------- 4. Form validation and submission ----------
function setupFormSubmit() {
  const form = document.getElementById("productForm");

  form.addEventListener("submit", function (event) {
    // Stop the page from reloading, since there's no backend connected yet
    event.preventDefault();

    const productName = document.getElementById("productName");
    const category = document.getElementById("category");
    const sku = document.getElementById("sku");
    const sellingPrice = document.getElementById("sellingPrice");
    const stockQuantity = document.getElementById("stockQuantity");

    // The fields marked with * in the design are required.
    // We check them in order and stop at the first empty one.
    if (productName.value.trim() === "") {
      alert("Please enter a product name.");
      productName.focus();
      return;
    }

    if (category.value === "") {
      alert("Please select a category.");
      category.focus();
      return;
    }

    if (sku.value.trim() === "") {
      alert("Please enter a SKU.");
      sku.focus();
      return;
    }

    if (sellingPrice.value.trim() === "") {
      alert("Please enter a selling price.");
      sellingPrice.focus();
      return;
    }

    if (stockQuantity.value.trim() === "") {
      alert("Please enter the current stock quantity.");
      stockQuantity.focus();
      return;
    }

    // Everything required is filled in, so collect all the form data
    // into one simple object.
    const newProduct = {
      productName: productName.value.trim(),
      category: category.value,
      sku: sku.value.trim(),
      sellingPrice: sellingPrice.value,
      costPrice: document.getElementById("costPrice").value,
      stockQuantity: stockQuantity.value,
      reorderLevel: document.getElementById("reorderLevel").value,
      supplier: document.getElementById("supplier").value,
      batchNumber: document.getElementById("batchNumber").value,
      expiryDate: document.getElementById("expiryDate").value,
      unitOfMeasure: document.getElementById("unitOfMeasure").value,
      description: document.getElementById("description").value,
    };

    // In a real app, this is where you'd send newProduct to the backend
    // with fetch(). For now, we just log it so you can see the result.
    console.log("New product submitted:", newProduct);
    alert("Product saved! Check the browser console to see the data.");
  });
}