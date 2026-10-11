/* Product details page: behaviour for product-details.html (Stockwise Africa) */
(function () {
  'use strict';

  var $ = function (selector, root) { return (root || document).querySelector(selector); };
  var $$ = function (selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); };

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
  toast.className = 'pointer-events-none fixed bottom-[84px] left-1/2 z-[60] hidden -translate-x-1/2 rounded-[5px] bg-[#143967] px-4 py-2 text-sm font-semibold text-white shadow-md md:bottom-[64px]';
  document.body.appendChild(toast);
  var toastTimer = null;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toast.classList.add('hidden'); }, 2200);
  }

  /* ---------------------------------------------------------------
     4. Back button, notifications and quick actions
        Replace the TODO lines with your real pages.
  ---------------------------------------------------------------- */
  function goBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = 'inventory.html'; // TODO: your inventory page
    }
  }

  ['#backButton', '#backButtonMobile'].forEach(function (selector) {
    var button = $(selector);
    if (button) button.addEventListener('click', goBack);
  });

  $$('[data-notification]').forEach(function (button) {
    button.addEventListener('click', function () { showToast('You have no new notifications.'); });
  });

  // Where each quick action should go (TODO: set real page addresses, then they will navigate)
  var actionPages = {
    'Record Sale': '',
    'Add Stock': '',
    'Remove Stock': 'stock.html',
    'Edit Product': '',
    'View Stock Inventory': ''
  };

  $$('.quick-action').forEach(function (button) {
    button.addEventListener('click', function () {
      var action = button.getAttribute('data-action');
      if (actionPages[action]) {
        window.location.href = actionPages[action];
      } else {
        showToast(action + ' is not connected to a page yet.');
      }
    });
  });

  /* ---------------------------------------------------------------
     5. Product image fallback (shows a placeholder if the file is missing)
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
     6. Search: hides the product when the search does not match it
        (matches the name, category, SKU, supplier or batch number)
  ---------------------------------------------------------------- */
  var searchInput = $('#searchInput');
  var noResults = $('#noResults');
  var searchables = $$('[data-searchable]');

  searchInput.addEventListener('input', function () {
    var query = searchInput.value.trim().toLowerCase();
    var matches = query === '' || query.split(/\s+/).every(function (word) {
      return searchables[0].getAttribute('data-search-text').indexOf(word) !== -1;
    });

    searchables.forEach(function (section) {
      // Remember the original display so it can be restored
      section.classList.toggle('!hidden', !matches);
    });
    noResults.classList.toggle('hidden', matches);
  });
})();