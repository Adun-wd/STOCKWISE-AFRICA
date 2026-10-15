// ===== Stockwise Africa - Dashboard =====

// ---------- 1. Dropdown menus ----------
// A button with data-dropdown="some-id" opens/closes the menu with that id
// (profile menu, date selector, "Last 7 days").
const dropdownButtons = document.querySelectorAll("[data-dropdown]");

function closeAllMenus() {
  const menus = document.querySelectorAll(".dropdown-menu");
  for (let i = 0; i < menus.length; i++) {
    menus[i].classList.add("hidden");
  }
  for (let i = 0; i < dropdownButtons.length; i++) {
    dropdownButtons[i].setAttribute("aria-expanded", "false");
  }
}

for (let i = 0; i < dropdownButtons.length; i++) {
  dropdownButtons[i].addEventListener("click", function (event) {
    event.stopPropagation(); // stops the "click outside" code below from closing it straight away

    const menu = document.getElementById(this.dataset.dropdown);
    const wasOpen = !menu.classList.contains("hidden");

    closeAllMenus();

    if (!wasOpen) {
      menu.classList.remove("hidden");
      this.setAttribute("aria-expanded", "true");
    }
  });
}

// Clicking anywhere else, or pressing Escape, closes the menus
document.addEventListener("click", closeAllMenus);
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeAllMenus();
  }
});

// ---------- 2. Choosing an option in the date / range dropdowns ----------
// Items with data-label-target change the text of that label.
// (The chart and numbers are sample data, so only the label changes.)
const choiceItems = document.querySelectorAll("[data-label-target]");

for (let i = 0; i < choiceItems.length; i++) {
  choiceItems[i].addEventListener("click", function () {
    const label = document.getElementById(this.dataset.labelTarget);
    label.textContent = this.dataset.value;
  });
}

// ---------- 3. Simple buttons ----------
// Any button with data-message shows that message in an alert.
// Replace these alerts later with the real modal or page.
const messageButtons = document.querySelectorAll("[data-message]");

for (let i = 0; i < messageButtons.length; i++) {
  messageButtons[i].addEventListener("click", function () {
    alert(this.dataset.message);
  });
}

document.getElementById("add-product-button").addEventListener("click", function () {
  alert("Add Product clicked");
});

// ---------- 4. Search ----------
// Typing in the top search box hides table rows whose product name does not match.
const searchInput = document.getElementById("search-input");
const tableBodies = [
  document.getElementById("recent-sales-body"),
  document.getElementById("low-stock-body"),
];

function searchProducts() {
  const searchText = searchInput.value.trim().toLowerCase();

  for (let i = 0; i < tableBodies.length; i++) {
    const rows = tableBodies[i].querySelectorAll(".searchable-row");
    const noResultsRow = tableBodies[i].querySelector(".no-results-row");
    let matchCount = 0;

    for (let j = 0; j < rows.length; j++) {
      const productName = rows[j].querySelector(".product-name").textContent.toLowerCase();
      const isMatch = productName.includes(searchText);

      rows[j].classList.toggle("hidden", !isMatch);
      if (isMatch) {
        matchCount++;
      }
    }

    // Show "No matching products." when every row is hidden
    noResultsRow.classList.toggle("hidden", matchCount > 0);
  }
}

searchInput.addEventListener("input", searchProducts);

// ---------- 5. Mobile sidebar menu ----------
const sidebar = document.getElementById("sidebar");

document.getElementById("open-menu-button").addEventListener("click", function () {
  sidebar.classList.remove("-translate-x-full");
});

document.getElementById("close-menu-button").addEventListener("click", function () {
  sidebar.classList.add("-translate-x-full");
});