/*
  alerts.js
  ------
  This file handles two jobs for the Alerts screen:

  1. Building the list of alert cards from a simple array of data
  2. Letting the user click a filter pill (e.g. "Low Stock") to show only
     the matching cards

  Having the alert data in one array (instead of 7 copy-pasted blocks of
  HTML) makes it much easier to add, remove or edit an alert later.
*/

// Each status has its own badge color. Keeping that mapping in one place
// means we only write the colors once, not once per alert.
const statusStyles = {
  "Low Stock": { bg: "bg-[#CD7D40]/20", text: "text-[#CD7D40]" },
  "Out of Stock": { bg: "bg-[#E85363]/20", text: "text-[#E85363]" },
  "Expiring Soon": { bg: "bg-[#CD7D40]/20", text: "text-[#CD7D40]" },
  "Sync Issue": { bg: "bg-[#686CE4]/20", text: "text-[#686CE4]" },
};

// The alert data itself. To add a new alert, just add another object here.
const alertsData = [
  {
    name: "Amoxicillin 250mg",
    sku: "SKU001",
    status: "Low Stock",
    detail: "8 left",
    time: "Oct 3, 9:12 AM",
    image: "images/amoxicillin.png",
  },
  {
    name: "Loratadine 10mg",
    sku: "SKU002",
    status: "Out of Stock",
    detail: "",
    time: "Oct 3, 8:47 AM",
    image: "images/loratadine.png",
  },
  {
    name: "Hydrogen Peroxide",
    sku: "SKU003",
    status: "Expiring Soon",
    detail: "Expires in 5 days",
    time: "Oct 3, 8:21 AM",
    image: "images/hydrogen-peroxide.png",
  },
  {
    name: "Ibuprofen 400mg",
    sku: "SKU004",
    status: "Low Stock",
    detail: "12 left",
    time: "Oct 3, 7:56 AM",
     image: "images/ibuprofen.png",
  },
  {
    name: "Diclofenac Gel",
    sku: "SKU005",
    status: "Sync Issue",
    detail: "",
    time: "Oct 3, 7:32 AM",
    image: "images/diclofenac-gel.png",
  },
  {
    name: "Oral Rehydration Salts",
    sku: "SKU006",
    status: "Expiring Soon",
    detail: "Expires in 5 days",
    time: "Oct 3, 7:10 AM",
    image: "images/oral-rehydration-salts.jpg",
  },
  {
    name: "Multivitamin Syrup",
    sku: "SKU007",
    status: "Low Stock",
    detail: "5 left",
    time: "Oct 3, 6:48 AM",
    image: "images/multivitamin-syrup.jpg",
  },
];

document.addEventListener("DOMContentLoaded", function () {
  renderAlertList(alertsData);
  setupFilterPills();
});

// ---------- Build one alert card's HTML ----------
function createAlertCardHTML(alert) {
  const colors = statusStyles[alert.status];

  // "8 left • Oct 3, 9:12 AM" vs just "Oct 3, 8:47 AM" when there's no
  // stock-count detail (like Out of Stock or Sync Issue alerts).
  const detailLine = alert.detail
    ? alert.detail + ' <span class="mx-1">•</span> ' + alert.time
    : alert.time;

  return (
    '<div class="alert-card border border-[#143967]/20 rounded-[10px] p-[10px] flex items-center justify-between gap-[10px]" data-status="' +
    alert.status +
    '">' +
    '<div class="flex items-center gap-[10px]">' +
      '<img src="' + alert.image + '" alt="' + alert.name + '" class="w-[50px] h-[50px] shrink-0 rounded-[5px] object-cover" />' +
    '<div class="flex flex-col gap-[3px]">' +
    '<p class="text-[12px] leading-[15px] font-bold text-[#143967]">' + alert.name + "</p>" +
    '<p class="text-[10px] leading-[12px] font-semibold text-[#143967]">SKU: ' + alert.sku + "</p>" +
    '<span class="w-fit px-[5px] py-[2px] rounded-[3px] text-[10px] leading-[12px] font-semibold ' +
    colors.bg +
    " " +
    colors.text +
    '">' +
    alert.status +
    "</span>" +
    '<p class="text-[10px] leading-[12px] font-semibold text-[#143967]">' + detailLine + "</p>" +
    "</div>" +
    "</div>" +
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#143967" stroke-width="1.7" class="w-5 h-5 shrink-0">' +
    '<path d="M9 6l6 6-6 6" />' +
    "</svg>" +
    "</div>"
  );
}

// ---------- Draw the full list into the page ----------
function renderAlertList(alerts) {
  const listContainer = document.getElementById("alertList");
  listContainer.innerHTML = alerts.map(createAlertCardHTML).join("");
}

// ---------- Filter pills ----------
function setupFilterPills() {
  const pills = document.querySelectorAll(".filter-pill");

  pills.forEach(function (pill) {
    pill.addEventListener("click", function () {
      // Reset every pill to the "not selected" look
      pills.forEach(function (p) {
        p.classList.remove("bg-[#143967]", "text-white");
        p.classList.add("bg-[#143967]/10", "text-[#143967]");
      });

      // Style the clicked pill as "selected"
      pill.classList.remove("bg-[#143967]/10", "text-[#143967]");
      pill.classList.add("bg-[#143967]", "text-white");

      const filter = pill.getAttribute("data-filter");

      // "all" shows every alert; any other value shows only matching cards
      const filteredAlerts =
        filter === "all"
          ? alertsData
          : alertsData.filter(function (alert) {
              return alert.status === filter;
            });

      renderAlertList(filteredAlerts);
    });
  });
}