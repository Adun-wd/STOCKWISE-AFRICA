// ===== Stockwise Africa - Teams & Roles > Custom Permissions =====

// ---------- 1. Toggle switches ----------
// Each switch is a <button class="toggle"> with aria-checked="true" or "false".
// Tailwind draws the ON/OFF look from aria-checked, so we only flip that value.
const toggles = document.querySelectorAll(".toggle");

for (let i = 0; i < toggles.length; i++) {
  toggles[i].addEventListener("click", function () {
    const isOn = this.getAttribute("aria-checked") === "true";
    this.setAttribute("aria-checked", String(!isOn));
  });
}

// ---------- 2. Collapsible permission groups ----------
// Clicking a group heading shows/hides its rows.
// The chevron rotation is handled by Tailwind from aria-expanded.
const sectionButtons = document.querySelectorAll(".section-toggle");

for (let i = 0; i < sectionButtons.length; i++) {
  sectionButtons[i].addEventListener("click", function () {
    const isOpen = this.getAttribute("aria-expanded") === "true";
    const options = document.getElementById(this.getAttribute("aria-controls"));

    this.setAttribute("aria-expanded", String(!isOpen));
    options.classList.toggle("hidden", isOpen);
  });
}

// ---------- 3. Search ----------
// Typing in the header search box hides permission rows that do not match.
const searchInput = document.getElementById("permission-search");
const permissionCards = document.querySelectorAll(".permission-card");
const noResultsMessage = document.getElementById("no-results");

function searchPermissions() {
  const searchText = searchInput.value.trim().toLowerCase();
  let totalMatches = 0;

  // Go through every card, then every row inside it
  for (let i = 0; i < permissionCards.length; i++) {
    const rows = permissionCards[i].querySelectorAll(".permission-row");
    let matchesInCard = 0;

    for (let j = 0; j < rows.length; j++) {
      const name = rows[j].querySelector(".permission-name").textContent.toLowerCase();
      const isMatch = name.includes(searchText);

      rows[j].classList.toggle("hidden", !isMatch);
      if (isMatch) {
        matchesInCard++;
      }
    }

    // Hide the whole card when none of its rows match
    permissionCards[i].classList.toggle("hidden", matchesInCard === 0);
    totalMatches += matchesInCard;
  }

  // Show "No permissions found." when nothing matches
  noResultsMessage.classList.toggle("hidden", totalMatches > 0);
}

searchInput.addEventListener("input", searchPermissions);

// ---------- 4. Save Changes / Cancel ----------
const saveButton = document.getElementById("save-button");
const cancelButton = document.getElementById("cancel-button");
const saveMessage = document.getElementById("save-message");

// Remember the toggle states so Cancel can go back to them.
// Starts as the design's initial state and updates after each save.
let savedStates = [];

function rememberToggleStates() {
  savedStates = [];
  for (let i = 0; i < toggles.length; i++) {
    savedStates.push(toggles[i].getAttribute("aria-checked"));
  }
}
rememberToggleStates();

saveButton.addEventListener("click", function () {
  rememberToggleStates();

  // Show the success message for 3 seconds
  saveMessage.classList.remove("hidden");
  setTimeout(function () {
    saveMessage.classList.add("hidden");
  }, 3000);
});

cancelButton.addEventListener("click", function () {
  for (let i = 0; i < toggles.length; i++) {
    toggles[i].setAttribute("aria-checked", savedStates[i]);
  }
});

// ---------- 5. Simple buttons (to be replaced by real project functionality) ----------
document.getElementById("invite-button").addEventListener("click", function () {
  alert("Invite Team Member clicked");
});

document.getElementById("change-role-button").addEventListener("click", function () {
  alert("Change Role clicked");
});

// ---------- 6. Mobile sidebar menu ----------
const sidebar = document.getElementById("sidebar");

document.getElementById("open-menu-button").addEventListener("click", function () {
  sidebar.classList.remove("-translate-x-full");
});

document.getElementById("close-menu-button").addEventListener("click", function () {
  sidebar.classList.add("-translate-x-full");
});