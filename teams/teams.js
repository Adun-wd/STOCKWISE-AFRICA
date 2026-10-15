// ===== Stockwise Africa - Settings > Teams & Roles =====

// ---------- 1. Data ----------
// The five team members shown in the design.
const members = [
  { id: 1, name: "John Doe",     email: "johndoe@example.com",      role: "Owner",     status: "Active",   lastActive: "Today, 9:24 AM" },
  { id: 2, name: "Alex Morgan",  email: "alex.morgan@example.com",  role: "Manager",   status: "Active",   lastActive: "Today, 8:12 AM" },
  { id: 3, name: "Sarah Connor", email: "s.connor@example.com",     role: "Attendant", status: "Active",   lastActive: "Today, 7:45 AM" },
  { id: 4, name: "Mary Smith",   email: "marysmith@domain.com",     role: "Attendant", status: "Active",   lastActive: "Yesterday, 6:32 PM" },
  { id: 5, name: "Jane Doe",     email: "janedoe@stockwave.com",    role: "Attendant", status: "Inactive", lastActive: "Apr 25, 2026" },
];

// Text shown under each person's name
const roleTitles = {
  Owner: "Owner",
  Manager: "Manager",
  Attendant: "Sales Attendant",
};

// Tailwind classes for each role badge
const roleBadgeClasses = {
  Owner: "bg-[#143967] text-white",
  Manager: "bg-[#115DE2]/20 text-[#115DE2]",
  Attendant: "bg-[#686CE4]/20 text-[#686CE4]",
};

// The member the action menu / modals are currently working on
let selectedMemberId = null;

// ---------- 2. Page elements ----------
const membersBody = document.getElementById("members-body");
const searchInput = document.getElementById("member-search");
const roleFilter = document.getElementById("role-filter");

const actionMenu = document.getElementById("action-menu");
const menuEdit = document.getElementById("menu-edit");
const menuRole = document.getElementById("menu-role");
const menuStatus = document.getElementById("menu-status");

const inviteModal = document.getElementById("invite-modal");
const editModal = document.getElementById("edit-modal");
const roleModal = document.getElementById("role-modal");
const guideModal = document.getElementById("guide-modal");

const toast = document.getElementById("toast");

// ---------- 3. Small helper functions ----------

// Stops names/emails typed by the user from being read as HTML
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// "Alex Morgan" -> "AM"
function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function findMember(id) {
  return members.find((member) => member.id === id);
}

let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 3000);
}

// ---------- 4. Showing the table ----------

// Returns only the members that match the search box and the role filter
function filterMembers() {
  const searchText = searchInput.value.trim().toLowerCase();
  const chosenRole = roleFilter.value;

  return members.filter((member) => {
    const matchesRole = chosenRole === "all" || member.role === chosenRole;
    const searchableText = `${member.name} ${member.email} ${member.role} ${member.status}`.toLowerCase();
    const matchesSearch = searchableText.includes(searchText);
    return matchesRole && matchesSearch;
  });
}

// Builds the HTML for one table row
function buildRow(member) {
  const isActive = member.status === "Active";
  const dotColor = isActive ? "bg-[#0D937E]" : "bg-[#6C6C6C]";
  const statusTextColor = isActive ? "text-[#143967]" : "text-[#6C6C6C]";
  const name = escapeHtml(member.name);

  return `
    <tr class="h-[60px] text-[12px] font-semibold leading-[15px]">
      <td class="border-b border-black/10 pl-[5px]">
        <div class="flex items-center gap-[10px]">
          <span class="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-[#143967] text-[18px] font-semibold leading-[22px] text-white">${getInitials(member.name)}</span>
          <div class="flex min-w-0 flex-col">
            <span class="truncate text-[14px] leading-[17px]">${name}</span>
            <span class="font-medium">${roleTitles[member.role]}</span>
          </div>
        </div>
      </td>
      <td class="truncate border-b border-black/10 pr-2">${escapeHtml(member.email)}</td>
      <td class="border-b border-black/10">
        <span class="inline-flex rounded-[5px] px-[15px] py-[5px] ${roleBadgeClasses[member.role]}">${member.role}</span>
      </td>
      <td class="border-b border-black/10">
        <span class="flex items-center gap-[5px] ${statusTextColor}">
          <span class="h-[5px] w-[5px] rounded-full ${dotColor}"></span>${member.status}
        </span>
      </td>
      <td class="border-b border-black/10">${escapeHtml(member.lastActive)}</td>
      <td class="border-b border-black/10 pr-[5px] text-center">
        <button type="button" class="action-button inline-flex h-[30px] w-[30px] items-center justify-center rounded-[5px] hover:bg-[#143967]/10 focus-visible:outline-2 focus-visible:outline-[#245EC2]" data-id="${member.id}" aria-label="Actions for ${name}" aria-haspopup="menu">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="5" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="12" cy="19" r="1.7" /></svg>
        </button>
      </td>
    </tr>`;
}

// Draws the table (and updates the statistics cards)
function renderMembers() {
  const visibleMembers = filterMembers();

  if (visibleMembers.length === 0) {
    membersBody.innerHTML = `<tr class="h-[60px]"><td colspan="6" class="text-center text-[14px] font-medium">No team members found.</td></tr>`;
  } else {
    membersBody.innerHTML = visibleMembers.map(buildRow).join("");
  }

  updateStats();
}

// Updates the four statistic cards from the members list
function updateStats() {
  document.getElementById("stat-total").textContent = members.length;
  document.getElementById("stat-owners").textContent = members.filter((m) => m.role === "Owner").length;
  document.getElementById("stat-managers").textContent = members.filter((m) => m.role === "Manager").length;
  document.getElementById("stat-attendants").textContent = members.filter((m) => m.role === "Attendant").length;
}

// ---------- 5. Search and role filter ----------
searchInput.addEventListener("input", renderMembers);
roleFilter.addEventListener("change", renderMembers);

// ---------- 6. Three-dot action menu ----------
let openMenuButton = null; // the three-dot button the menu belongs to

function closeActionMenu() {
  actionMenu.classList.add("hidden");
  if (openMenuButton) {
    openMenuButton.setAttribute("aria-expanded", "false");
  }
  openMenuButton = null;
}

function toggleActionMenu(button) {
  // Clicking the same button again closes the menu
  if (openMenuButton === button) {
    closeActionMenu();
    return;
  }
  closeActionMenu();

  selectedMemberId = Number(button.dataset.id);
  const member = findMember(selectedMemberId);

  // Third option changes depending on the member's status
  menuStatus.textContent = member.status === "Active" ? "Deactivate" : "Activate";

  // Show the menu just under the button (or above it if there is no room)
  actionMenu.classList.remove("hidden");
  const buttonBox = button.getBoundingClientRect();
  const menuWidth = actionMenu.offsetWidth;
  const menuHeight = actionMenu.offsetHeight;

  let top = buttonBox.bottom + 4;
  if (top + menuHeight > window.innerHeight) {
    top = buttonBox.top - menuHeight - 4;
  }
  let left = buttonBox.right - menuWidth;
  if (left < 8) {
    left = 8;
  }
  actionMenu.style.top = `${top}px`;
  actionMenu.style.left = `${left}px`;

  button.setAttribute("aria-expanded", "true");
  openMenuButton = button;
}

// One listener for every three-dot button in the table
membersBody.addEventListener("click", (event) => {
  const button = event.target.closest(".action-button");
  if (button) {
    toggleActionMenu(button);
  }
});

// Clicking anywhere else closes the menu
document.addEventListener("click", (event) => {
  if (!event.target.closest(".action-button") && !event.target.closest("#action-menu")) {
    closeActionMenu();
  }
});

// Escape key, scrolling and resizing also close it
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeActionMenu();
  }
});
window.addEventListener("scroll", closeActionMenu, true);
window.addEventListener("resize", closeActionMenu);

// ---------- 7. Menu actions ----------
menuEdit.addEventListener("click", () => {
  const memberId = selectedMemberId;
  closeActionMenu();
  openEditModal(memberId);
});

menuRole.addEventListener("click", () => {
  const memberId = selectedMemberId;
  closeActionMenu();
  openRoleModal(memberId);
});

menuStatus.addEventListener("click", () => {
  const memberId = selectedMemberId;
  closeActionMenu();
  updateMemberStatus(memberId);
});

// Switch a member between Active and Inactive
function updateMemberStatus(id) {
  const member = findMember(id);
  member.status = member.status === "Active" ? "Inactive" : "Active";
  renderMembers();
  showToast(`${member.name} is now ${member.status.toLowerCase()}.`);
}

// ---------- 8. Modals ----------

// Every button with data-close closes the modal it sits in
document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", () => {
    button.closest("dialog").close();
  });
});

// --- Invite Team Member ---
const inviteForm = document.getElementById("invite-form");

function openInviteModal() {
  inviteForm.reset();
  inviteModal.showModal();
}

document.getElementById("invite-button").addEventListener("click", openInviteModal);

inviteForm.addEventListener("submit", (event) => {
  event.preventDefault(); // no backend, so we only simulate sending
  inviteModal.close();
  showToast("Invitation sent successfully.");
});

// --- Edit Member ---
const editForm = document.getElementById("edit-form");

function openEditModal(id) {
  const member = findMember(id);
  selectedMemberId = id;
  document.getElementById("edit-name").value = member.name;
  document.getElementById("edit-email").value = member.email;
  document.getElementById("edit-role").value = member.role;
  editModal.showModal();
}

editForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const member = findMember(selectedMemberId);
  member.name = document.getElementById("edit-name").value.trim();
  member.email = document.getElementById("edit-email").value.trim();
  member.role = document.getElementById("edit-role").value;
  editModal.close();
  renderMembers();
  showToast("Member updated successfully.");
});

// --- Change Role ---
const roleForm = document.getElementById("role-form");

function openRoleModal(id) {
  const member = findMember(id);
  selectedMemberId = id;
  document.getElementById("role-modal-name").textContent = member.name;
  document.getElementById("role-select").value = member.role;
  roleModal.showModal();
}

roleForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const member = findMember(selectedMemberId);
  member.role = document.getElementById("role-select").value;
  roleModal.close();
  renderMembers();
  showToast(`${member.name} is now ${member.role}.`);
});

// --- Role Guide ---
document.getElementById("role-guide-button").addEventListener("click", () => {
  guideModal.showModal();
});

// ---------- 9. Mobile sidebar menu ----------
const sidebar = document.getElementById("sidebar");

document.getElementById("open-menu-button").addEventListener("click", () => {
  sidebar.classList.remove("-translate-x-full");
});

document.getElementById("close-menu-button").addEventListener("click", () => {
  sidebar.classList.add("-translate-x-full");
});

// ---------- 10. Start ----------
renderMembers();