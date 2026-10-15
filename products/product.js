// ---------- Grab the elements we need ----------
const searchInput = document.getElementById("searchInput");
const notificationButton = document.getElementById("notificationButton");
const profileButton = document.getElementById("profileButton");
const profileMenu = document.getElementById("profileMenu");
const backButton = document.getElementById("backButton");
const quickActionButtons = document.querySelectorAll(".quick-action");

const productSection = document.getElementById("productSection");
const productCard = document.getElementById("productCard");
const activitySection = document.getElementById("activitySection");
const activityRows = document.querySelectorAll("#activityBody tr");
const noResults = document.getElementById("noResults");

const productImage = document.getElementById("productImage");
const imagePlaceholder = document.getElementById("imagePlaceholder");

const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const menuButton = document.getElementById("menuButton");
const closeSidebarButton = document.getElementById("closeSidebarButton");


// ---------- Sidebar menu (tablet and mobile only) ----------
// On small screens the sidebar is hidden with "-translate-x-full".
// Opening it means swapping that class for "translate-x-0".
function openSidebar() {
  sidebar.classList.remove("-translate-x-full");
  sidebar.classList.add("translate-x-0");
  sidebarOverlay.classList.remove("hidden");
  menuButton.setAttribute("aria-expanded", "true");
}

function closeSidebar() {
  sidebar.classList.add("-translate-x-full");
  sidebar.classList.remove("translate-x-0");
  sidebarOverlay.classList.add("hidden");
  menuButton.setAttribute("aria-expanded", "false");
}

menuButton.addEventListener("click", openSidebar);
closeSidebarButton.addEventListener("click", closeSidebar);
sidebarOverlay.addEventListener("click", closeSidebar);


// ---------- Product image fallback ----------
// If images.jpg is missing, hide the broken image and show the placeholder.
productImage.addEventListener("error", function () {
  productImage.classList.add("hidden");
  imagePlaceholder.classList.remove("hidden");
  imagePlaceholder.classList.add("flex");
});


// ---------- Quick actions ----------
// Each button has a data-action attribute, e.g. data-action="Add Stock"
quickActionButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const actionName = button.dataset.action;
    alert(actionName + " clicked");
  });
});


// ---------- Back to Inventory ----------
backButton.addEventListener("click", function () {
  if (window.history.length > 1) {
    history.back();
  } else {
    alert("Back to Inventory clicked");
  }
});


// ---------- Notification ----------
notificationButton.addEventListener("click", function () {
  alert("You have new notifications");
});


// ---------- Profile dropdown ----------
profileButton.addEventListener("click", function (event) {
  // Stop this click from reaching the document (which would close the menu)
  event.stopPropagation();

  const isHidden = profileMenu.classList.contains("hidden");
  profileMenu.classList.toggle("hidden");
  profileButton.setAttribute("aria-expanded", isHidden ? "true" : "false");
});

// Clicking anywhere else closes the menu
document.addEventListener("click", function () {
  profileMenu.classList.add("hidden");
  profileButton.setAttribute("aria-expanded", "false");
});

// Pressing Escape also closes the menu
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeSidebar();
    profileMenu.classList.add("hidden");
    profileButton.setAttribute("aria-expanded", "false");
  }
});


// ---------- Search ----------
searchInput.addEventListener("input", function () {
  const searchValue = searchInput.value.toLowerCase().trim();

  // Empty search: show everything again
  if (searchValue === "") {
    productSection.classList.remove("hidden");
    activitySection.classList.remove("hidden");
    noResults.classList.add("hidden");
    activityRows.forEach(function (row) {
      row.classList.remove("hidden");
    });
    return;
  }

  // Does the product card contain the search text?
  // (name, SKU, category, supplier, batch number, etc.)
  const productText = productCard.textContent.toLowerCase();
  const productMatches = productText.includes(searchValue);

  // Show or hide the product card section
  if (productMatches) {
    productSection.classList.remove("hidden");
  } else {
    productSection.classList.add("hidden");
  }

  // Show or hide each activity row
  let visibleRows = 0;
  activityRows.forEach(function (row) {
    const rowText = row.textContent.toLowerCase();

    // If the product matches, keep all of its activity rows visible
    if (productMatches || rowText.includes(searchValue)) {
      row.classList.remove("hidden");
      visibleRows = visibleRows + 1;
    } else {
      row.classList.add("hidden");
    }
  });

  // Hide the table if no rows are left
  if (visibleRows === 0) {
    activitySection.classList.add("hidden");
  } else {
    activitySection.classList.remove("hidden");
  }

  // Show a message if nothing matched at all
  if (!productMatches && visibleRows === 0) {
    noResults.classList.remove("hidden");
  } else {
    noResults.classList.add("hidden");
  }
});