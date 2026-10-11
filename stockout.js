/* Stock Out confirmation page: behaviour for stock-out-confirmation.html (Stockwise Africa) */
(function () {
  'use strict';

  var $ = function (selector, root) { return (root || document).querySelector(selector); };
  var $$ = function (selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); };

  /* ---------------------------------------------------------------
     0. Page settings: change these to match your real pages
  ---------------------------------------------------------------- */
  var PRODUCT_DETAILS_PAGE = 'product-details.html'; // TODO: your product details page
  var INVENTORY_PAGE = 'inventory.html';             // TODO: your inventory page

  /* ---------------------------------------------------------------
     1. Sidebar
        Opened by the tablet menu button or the mobile "More" button.
        Closed by the X, the dark overlay, the Escape key, a nav link,
        or when the screen grows to desktop size (where it is always visible).
  ---------------------------------------------------------------- */
  var sidebar = $('#sidebar');
  var overlay = $('#sidebarOverlay');
  var openButtons = $$('[data-open-menu]');

  function setMenu(open) {
    sidebar.classList.toggle('-translate-x-full', !open);
    overlay.classList.toggle('hidden', !open);
    openButtons.forEach(function (button) { button.setAttribute('aria-expanded', String(open)); });
  }

  openButtons.forEach(function (button) {
    button.addEventListener('click', function () { setMenu(true); });
  });
  $('#closeSidebarButton').addEventListener('click', function () { setMenu(false); });
  overlay.addEventListener('click', function () { setMenu(false); });
  $$('a', sidebar).forEach(function (link) {
    link.addEventListener('click', function () { setMenu(false); });
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      setMenu(false);
      closeProfileMenu();
    }
  });

  window.matchMedia('(min-width: 1024px)').addEventListener('change', function (event) {
    if (event.matches) setMenu(false);
  });

  /* ---------------------------------------------------------------
     2. Profile dropdown
  ---------------------------------------------------------------- */
  var profileButton = $('#profileButton');
  var profileMenu = $('#profileMenu');

  function closeProfileMenu() {
    profileMenu.classList.add('hidden');
    profileButton.setAttribute('aria-expanded', 'false');
  }

  profileButton.addEventListener('click', function (event) {
    event.stopPropagation();
    var willOpen = profileMenu.classList.contains('hidden');
    profileMenu.classList.toggle('hidden', !willOpen);
    profileButton.setAttribute('aria-expanded', String(willOpen));
  });

  document.addEventListener('click', function (event) {
    if (!profileMenu.contains(event.target)) closeProfileMenu();
  });

  /* ---------------------------------------------------------------
     3. Small message at the bottom of the screen (toast)
  ---------------------------------------------------------------- */
  var toast = document.createElement('div');
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.className = 'pointer-events-none fixed bottom-[84px] left-1/2 z-[60] hidden -translate-x-1/2 rounded-[5px] bg-[#143967] px-4 py-2 text-sm font-semibold text-white shadow-md md:bottom-[24px]';
  document.body.appendChild(toast);
  var toastTimer = null;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toast.classList.add('hidden'); }, 2400);
  }

  $$('[data-notification]').forEach(function (button) {
    button.addEventListener('click', function () { showToast('You have no new notifications.'); });
  });

  // Pressing Enter in the search box opens the inventory page with the search text
  $('#searchInput').addEventListener('keydown', function (event) {
    if (event.key !== 'Enter') return;
    var query = event.target.value.trim();
    if (query) window.location.href = INVENTORY_PAGE + '?search=' + encodeURIComponent(query);
  });

  /* ---------------------------------------------------------------
     4. Product image fallback (shows a placeholder if the file is missing)
  ---------------------------------------------------------------- */
  $$('[data-product-image]').forEach(function (image) {
    function showPlaceholder() {
      var placeholder = $('[data-image-placeholder]', image.parentElement);
      image.classList.add('hidden');
      if (placeholder) {
        placeholder.classList.remove('hidden');
        placeholder.classList.add('flex');
      }
    }
    image.addEventListener('error', showPlaceholder);
    if (image.complete && image.naturalWidth === 0) showPlaceholder();
  });

  /* ---------------------------------------------------------------
     5. Fill the page with the stock out that was just saved

        The stock out page can send people here with details in the address, e.g.
          stock-out-confirmation.html?name=Paracetamol%20500mg&sku=SKU001&type=Tablet&previous=48&removed=10
        Anything missing keeps the sample value already written in the HTML.
        The new stock is worked out as previous - removed (or taken from "new" if given).
  ---------------------------------------------------------------- */
  var params = new URLSearchParams(window.location.search);

  function setText(selector, value) {
    if (value === null || value === undefined || value === '') return;
    $$(selector).forEach(function (element) { element.textContent = value; });
  }

  function whole(value) {
    var number = Number(value);
    return value !== null && value !== '' && Number.isInteger(number) && number >= 0 ? number : null;
  }

  setText('[data-product-name]', params.get('name'));
  setText('[data-product-sku]', params.get('sku'));
  setText('[data-product-type]', params.get('type'));

  var previous = whole(params.get('previous'));
  var removed = whole(params.get('removed'));
  var newStock = whole(params.get('new'));

  if (previous === null) previous = parseInt($('[data-previous-stock]').textContent, 10);
  if (removed === null) removed = parseInt($('[data-removed-quantity]').textContent, 10);
  if (newStock === null) newStock = Math.max(previous - removed, 0);

  setText('[data-previous-stock]', String(previous));
  setText('[data-removed-quantity]', String(removed));
  setText('[data-new-stock]', String(newStock));

  /* ---------------------------------------------------------------
     6. Buttons
  ---------------------------------------------------------------- */
  $('#viewProductLink').setAttribute('href', PRODUCT_DETAILS_PAGE);
  $('#backToInventoryLink').setAttribute('href', INVENTORY_PAGE);
})();