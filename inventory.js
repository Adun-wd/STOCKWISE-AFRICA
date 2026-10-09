/*
  inventory.js
  ------------
  Logic for the Inventory page (section 8):
    1. Mock product data (replace with the API / shared storage later)
    2. Status rules: out of stock, low stock, expiring soon, in stock
    3. Search + category + status filters
    4. Pagination
    5. Rendering the mobile cards and the desktop table
    6. Building the sidebar and bottom nav
*/
 
// ---------- 1. MOCK DATA ----------
// stock <= reorderLevel means "low stock"; stock 0 means "out of stock".
// Prices and some numbers are placeholders taken from the Figma screens.
const products = [
  { id: 1, name: "Paracetamol 500mg", category: "Tablet", price: 1200, stock: 48, reorderLevel: 10, expiry: "2027-02-28", added: "2026-04-12", batch: "B12345", image: "paracetamol.png" },
  { id: 2, name: "Amoxicillin 250mg", category: "Capsule", price: 2500, stock: 6, reorderLevel: 10, expiry: "2027-02-28", added: "2026-04-20", batch: "B12345", image: "images/amoxicillin.png" },
  { id: 3, name: "Vitamin C 1000mg", category: "Tablet", price: 3000, stock: 32, reorderLevel: 10, expiry: "2027-06-30", added: "2026-05-03", batch: "B12345", image: "images/vitamin-c.png" },
  { id: 4, name: "Ibuprofen 400mg", category: "Tablet", price: 1000, stock: 9, reorderLevel: 10, expiry: "2027-10-31", added: "2026-05-18", batch: "B12345", image: "images/ibuprofen.png" },
  { id: 5, name: "Loratadine 10mg", category: "Tablet", price: 1600, stock: 0, reorderLevel: 10, expiry: "2027-07-31", added: "2026-06-02", batch: "B12345", image: "images/loratadine.png" },
  { id: 6, name: "Oral Rehydration Salts", category: "Sachet", price: 200, stock: 75, reorderLevel: 10, expiry: "2027-09-30", added: "2026-06-15", batch: "B12345", image: "images/oral-rehydration-salts.png" },
  { id: 7, name: "Hydrogen Peroxide", category: "Liquid", price: 600, stock: 14, reorderLevel: 10, expiry: "2026-10-31", added: "2026-07-01", batch: "B12345", image: "images/hydrogen-peroxide.png" },
  { id: 8, name: "Coartem 20/120mg", category: "Tablet", price: 3800, stock: 40, reorderLevel: 10, expiry: "2027-01-31", added: "2026-07-22", batch: "B12345", image: "images/coartem.png" },
  { id: 9, name: "Metformin 500mg", category: "Tablet", price: 2200, stock: 25, reorderLevel: 10, expiry: "2027-08-31", added: "2026-08-05", batch: "B12345", image: "images/metformin.png" },
  { id: 10, name: "Multivitamin Syrup", category: "Syrup", price: 1800, stock: 8, reorderLevel: 10, expiry: "2027-02-28", added: "2026-08-19", batch: "B12345", image: "images/multivitamin-syrup.png" },
  { id: 11, name: "Diclofenac Gel", category: "Gel", price: 2800, stock: 5, reorderLevel: 10, expiry: "2027-04-30", added: "2026-09-10", batch: "B12345", image: "images/diclofenac-gel.png" },
];
 
// ---------- 2. SETTINGS AND STATUS RULES ----------
const PAGE_SIZE = 10;
const EXPIRING_DAYS = 90; // "expiring soon" = expires within this many days
 
const STATUS = {
  in: { label: "In stock", cls: "bg-green-100 text-green-700" },
  low: { label: "Low stock", cls: "bg-orange-100 text-orange-600" },
  out: { label: "Out of stock", cls: "bg-red-100 text-red-500" },
  expiring: { label: "Expiring soon", cls: "bg-pink-100 text-rose-500" },
};
 
function statusOf(p) {
  if (p.stock === 0) return "out";
  if (p.stock <= p.reorderLevel) return "low";
  const daysLeft = (new Date(p.expiry) - new Date()) / 86400000;
  if (daysLeft <= EXPIRING_DAYS) return "expiring";
  return "in";
}
 
// ---------- 3. PAGE STATE ----------
const state = { query: "", status: "all", category: "all", from: "", to: "", page: 1 };
 
// ---------- GRAB ELEMENTS ----------
const $ = (id) => document.getElementById(id);
const searchInput = $("search");
const statusSelect = $("statusSelect");
const categorySelects = [$("category"), $("categoryMobile")];
 
// ---------- HELPERS ----------
function money(n) {
  return "₦" + n.toLocaleString("en-NG");
}
 
function monthYear(iso) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
 
function badge(p) {
  const s = STATUS[statusOf(p)];
  return `<span class="inline-block rounded-md px-2 py-1 text-[11px] font-medium ${s.cls}">${s.label}</span>`;
}
 
// Letter tile, used when a product has no picture or the file is missing
function tile(p, size) {
  return `<div class="${size} rounded-md bg-[#143967]/10 flex items-center justify-center font-bold shrink-0">${p.name[0]}</div>`;
}
 
// Picture if the product has one. If the file fails to load, swap in the tile.
function thumb(p, size) {
  if (!p.image) return tile(p, size);
  return `<img src="${p.image}" alt="" class="${size} rounded-md object-cover bg-[#143967]/10 shrink-0" data-tile='${tile(p, size)}' onerror="this.outerHTML = this.dataset.tile" />`;
}
 
function getFiltered() {
  const q = state.query.trim().toLowerCase();
  return products.filter((p) => {
    const matchesText = p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    const matchesStatus = state.status === "all" || statusOf(p) === state.status;
    const matchesCategory = state.category === "all" || p.category === state.category;
    const matchesDate = (!state.from || p.added >= state.from) && (!state.to || p.added <= state.to);
    return matchesText && matchesStatus && matchesCategory && matchesDate;
  });
}
 
// ---------- 4 + 5. RENDER ----------
function render() {
  const list = getFiltered();
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  if (state.page > totalPages) state.page = totalPages;
  const start = (state.page - 1) * PAGE_SIZE;
  const pageItems = list.slice(start, start + PAGE_SIZE);
 
  $("totalLabel").textContent = "Total products: " + products.length;
 
  // Mobile cards. The chevron links to the product details page (not built yet).
  $("cards").innerHTML = pageItems
    .map(
      (p) => `
    <li>
      <a href="#" class="flex items-center gap-3 py-3">
        ${thumb(p, "w-14 h-14")}
        <div class="flex-1 min-w-0">
          <p class="text-[13px] font-bold text-black truncate">${p.name}</p>
          <p class="text-[11px] font-semibold">${p.category}</p>
          <p class="text-[11px] text-black/60">Stock: ${p.stock} | Exp: ${monthYear(p.expiry)}</p>
          <p class="mt-1 flex items-center gap-2 text-[13px] font-bold text-black">${money(p.price)} ${badge(p)}</p>
        </div>
        <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="#143967" stroke-width="2" stroke-linecap="round"><path d="M9 6l6 6-6 6" /></svg>
      </a>
    </li>`
    )
    .join("");
 
  // Desktop table rows
  $("rows").innerHTML = pageItems
    .map(
      (p) => `
    <tr>
      <td class="p-3"><input type="checkbox" class="row-check" aria-label="Select ${p.name}" /></td>
      <td class="p-3 text-left"><div class="flex items-center gap-3">${thumb(p, "w-9 h-9")}<div><p class="font-semibold">${p.name}</p><p class="text-[10px] text-[#143967]/60">Batch: ${p.batch}</p></div></div></td>
      <td class="p-3 font-semibold">${p.category}</td>
      <td class="p-3 font-semibold">${money(p.price)}</td>
      <td class="p-3 font-semibold">${p.stock}</td>
      <td class="p-3 font-semibold">${p.reorderLevel}</td>
      <td class="p-3 font-semibold">${monthYear(p.expiry)}</td>
      <td class="p-3">${badge(p)}</td>
      <td class="p-3">
        <div class="flex items-center justify-center gap-3">
          <a href="#" aria-label="Edit ${p.name}"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#143967" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1-4L16 5l3 3L8 19zM14 7l3 3" /></svg></a>
          <button type="button" data-delete="${p.id}" aria-label="Delete ${p.name}"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#143967" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" /></svg></button>
        </div>
      </td>
    </tr>`
    )
    .join("");
  $("selectAll").checked = false;
 
  // Empty state
  $("empty").classList.toggle("hidden", list.length > 0);
  $("pager").classList.toggle("hidden", list.length === 0);
 
  // Pagination text and buttons
  const from = list.length === 0 ? 0 : start + 1;
  $("showing").textContent = `Showing ${from}-${start + pageItems.length} of ${list.length} products`;
 
  let pagesHtml = pageButton("‹", state.page - 1, state.page === 1);
  for (let i = 1; i <= totalPages; i++) pagesHtml += pageButton(i, i, false, i === state.page);
  pagesHtml += pageButton("›", state.page + 1, state.page === totalPages);
  $("pages").innerHTML = pagesHtml;
 
  renderChips();
}
 
function pageButton(label, page, disabled, active) {
  const look = active ? "bg-[#143967] text-white" : "border border-[#143967]/20";
  return `<button type="button" data-page="${page}" ${disabled ? "disabled" : ""} class="w-8 h-8 rounded-md ${look} disabled:opacity-30">${label}</button>`;
}
 
// Mobile status chips
const CHIPS = [["all", "All"], ["in", "In Stock"], ["low", "Low Stock"], ["out", "Out of Stock"], ["expiring", "Expiring"]];
 
function renderChips() {
  $("chips").innerHTML = CHIPS.map(([key, label]) => {
    const look = state.status === key ? "bg-[#143967] text-white" : "bg-[#143967]/10 text-[#143967]";
    return `<button type="button" data-status="${key}" class="shrink-0 rounded-full px-4 py-2 text-[12px] font-semibold ${look}">${label}</button>`;
  }).join("");
}
 
// ---------- EVENTS ----------
// The top-bar search and the filter-row search share one query
[searchInput, $("globalSearch")].forEach((input) =>
  input.addEventListener("input", () => {
    state.query = input.value;
    searchInput.value = state.query;
    $("globalSearch").value = state.query;
    state.page = 1;
    render();
  })
);
 
// Date range (filters by the date the product was added)
[["dateFrom", "from"], ["dateTo", "to"]].forEach(([id, key]) =>
  $(id).addEventListener("change", () => {
    state[key] = $(id).value;
    state.page = 1;
    render();
  })
);
 
// Header checkbox selects or clears every row on this page
$("selectAll").addEventListener("change", () => {
  document.querySelectorAll(".row-check").forEach((box) => (box.checked = $("selectAll").checked));
});
 
statusSelect.addEventListener("change", () => {
  state.status = statusSelect.value;
  state.page = 1;
  render();
});
 
categorySelects.forEach((select) =>
  select.addEventListener("change", () => {
    state.category = select.value;
    categorySelects.forEach((s) => (s.value = state.category)); // keep both in sync
    state.page = 1;
    render();
  })
);
 
$("chips").addEventListener("click", (e) => {
  const chip = e.target.closest("[data-status]");
  if (!chip) return;
  state.status = chip.dataset.status;
  statusSelect.value = state.status;
  state.page = 1;
  render();
});
 
$("pages").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-page]");
  if (!btn || btn.disabled) return;
  state.page = Number(btn.dataset.page);
  render();
});
 
$("rows").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-delete]");
  if (!btn) return;
  const id = Number(btn.dataset.delete);
  const product = products.find((p) => p.id === id);
  if (product && confirm("Delete " + product.name + "?")) {
    products.splice(products.indexOf(product), 1);
    render();
  }
});
 
// Mobile filter button shows/hides the category dropdown
$("filterBtn").addEventListener("click", () => $("categoryMobile").classList.toggle("hidden"));
 
$("clearBtn").addEventListener("click", () => {
  state.query = "";
  state.status = "all";
  state.category = "all";
  state.from = "";
  state.to = "";
  searchInput.value = "";
  $("globalSearch").value = "";
  $("dateFrom").value = "";
  $("dateTo").value = "";
  statusSelect.value = "all";
  categorySelects.forEach((s) => (s.value = "all"));
  render();
});
 
// ---------- 6. NAVIGATION ----------
// Links that point to "#" are pages that are not built yet.
const ICONS = {
  home: "M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9z",
  inventory: "M4 4h16v16H4zM8 9h8M8 13h5",
  sales: "M4 3h16v18H4zM7 7h10M7 11h10M7 15h6",
  alerts: "M6 10a6 6 0 0 1 12 0c0 3 1 4 1 5H5c0-1 1-2 1-5zM10 18a2 2 0 0 0 4 0",
  reports: "M3 3v18h18M7 15l4-4 3 3 5-6",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12h2M3 12h2M12 3v2M12 19v2",
  logout: "M9 21H5V3h4M16 17l5-5-5-5M21 12H9",
  more: "M5 5h2M11 5h2M17 5h2M5 11h2M11 11h2M17 11h2M5 17h2M11 17h2M17 17h2",
};
 
const NAV = {
  home: { label: "Home", href: "#" },
  inventory: { label: "Inventory", href: "inventory.html" },
  sales: { label: "Sales", href: "#" },
  alerts: { label: "Alerts", href: "alerts.html" },
  reports: { label: "Reports", href: "#" },
  settings: { label: "Settings", href: "#" },
  logout: { label: "Logout", href: "#" },
  more: { label: "More", href: "#" },
};
 
function icon(key) {
  return `<svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${ICONS[key]}" /></svg>`;
}
 
function sidebarLink(key) {
  const item = NAV[key];
  const look = key === "inventory" ? "bg-white text-[#143967] font-semibold" : key === "logout" ? "text-red-400 hover:bg-white/10" : "text-white hover:bg-white/10";
  return `<a href="${item.href}" class="flex items-center gap-3 rounded-lg px-3 py-2.5 ${look}">${icon(key)}${item.label}</a>`;
}
 
function bottomLink(key) {
  const item = NAV[key];
  const look = key === "inventory" ? "bg-[#143967] text-white px-[15px] py-1 rounded-full" : "text-[#143967]";
  return `<a href="${item.href}" class="flex flex-col items-center gap-1 ${look}">${icon(key)}<span class="text-[12px]">${item.label}</span></a>`;
}
 
$("sidebarNav").innerHTML = ["home", "inventory", "sales", "alerts", "reports"].map(sidebarLink).join("");
$("sidebarFooter").innerHTML = sidebarLink("settings") + sidebarLink("logout");
$("bottomNav").innerHTML = ["home", "inventory", "sales", "alerts", "more"].map(bottomLink).join("");
 
// ---------- START ----------
// Fill the category dropdowns from the data, then draw the page.
const categories = [...new Set(products.map((p) => p.category))];
categorySelects.forEach((select) => {
  select.innerHTML += categories.map((c) => `<option value="${c}">${c}</option>`).join("");
});
render();
 