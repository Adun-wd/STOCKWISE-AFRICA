/* Stock Out page: behaviour for stock-out.html (Stockwise Africa) */
(function () {
  'use strict';

  var $ = function (selector, root) { return (root || document).querySelector(selector); };
  var $$ = function (selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); };

  /* ---------------------------------------------------------------
     0. Page settings: change these to match your real pages
  ---------------------------------------------------------------- */
  var PRODUCT_DETAILS_PAGE = 'product-details.html'; // TODO: your product details page
  var INVENTORY_PAGE = 'inventory.html';             // TODO: your inventory page

  // Where each quick action goes. Leave '' until the page exists (a small message is shown instead).
  var actionPages = {
    'Record Sale': '',
    'Add Stock': '',
    'Remove Stock': '',       // this is the current page
    'Edit Product': '',
    'View Stock Inventory': INVENTORY_PAGE
  };

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

  /* ---------------------------------------------------------------
     4. Notifications, search, quick actions
  ---------------------------------------------------------------- */
  $$('[data-notification]').forEach(function (button) {
    button.addEventListener('click', function () { showToast('You have no new notifications.'); });
  });

  // Pressing Enter in the search box opens the inventory page with the search text
  $('#searchInput').addEventListener('keydown', function (event) {
    if (event.key !== 'Enter') return;
    var query = event.target.value.trim();
    if (query) window.location.href = INVENTORY_PAGE + '?search=' + encodeURIComponent(query);
  });

  $$('.quick-action').forEach(function (button) {
    button.addEventListener('click', function () {
      var action = button.getAttribute('data-action');
      if (action === 'Remove Stock') return; // already on this page
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
     6. Stock out form
  ---------------------------------------------------------------- */
  var form = $('#stockOutForm');
  var quantityInput = $('#quantity');
  var quantityError = $('#quantityError');
  var quantityBox = quantityInput.parentElement;
  var reasonSelect = $('#reason');
  var noteInput = $('#note');
  var status = $('#formStatus');
  var currentStockLabel = $('#currentStockLabel');
  var newStockLabels = $$('[data-new-stock]');

  // Current stock for this product (TODO: load the real value from your backend)
  var currentStock = parseInt(currentStockLabel.textContent, 10) || 0;

  function setStatus(message, type) {
    status.textContent = message;
    status.className = message
      ? 'order-3 rounded-[5px] px-[13px] py-[8px] text-[13px] font-semibold ' +
        (type === 'success' ? 'bg-[#E3F6EA] text-[#14683A]' : 'bg-[#FFE1E1] text-[#C91D24]')
      : 'order-3 empty:hidden';
  }

  function showQuantityError(message) {
    quantityError.textContent = message;
    quantityError.classList.remove('hidden');
    quantityInput.setAttribute('aria-invalid', 'true');
    quantityBox.classList.add('border-[#C91D24]');
  }

  function clearQuantityError() {
    quantityError.textContent = '';
    quantityError.classList.add('hidden');
    quantityInput.removeAttribute('aria-invalid');
    quantityBox.classList.remove('border-[#C91D24]');
  }

  // Returns the quantity as a number, or null when it is not valid (and shows the reason)
  function readQuantity() {
    var raw = quantityInput.value.trim();
    if (raw === '') { showQuantityError('Enter the quantity to remove.'); return null; }

    var quantity = Number(raw);
    if (!Number.isInteger(quantity) || quantity < 1) {
      showQuantityError('Enter a whole number of 1 or more.');
      return null;
    }
    if (quantity > currentStock) {
      showQuantityError('You only have ' + currentStock + ' units in stock.');
      return null;
    }
    clearQuantityError();
    return quantity;
  }

  function updateNewStock() {
    var quantity = readQuantity();
    var value = quantity === null ? '-' : String(currentStock - quantity);
    newStockLabels.forEach(function (label) { label.textContent = value; });
  }

  quantityInput.addEventListener('input', function () {
    setStatus('', '');
    updateNewStock();
  });

  // Minus / plus buttons (mobile) and up / down arrows (tablet + desktop)
  function step(change) {
    var value = parseInt(quantityInput.value, 10);
    if (isNaN(value)) value = 0;
    value = Math.min(Math.max(value + change, 1), Math.max(currentStock, 1));
    quantityInput.value = String(value);
    setStatus('', '');
    updateNewStock();
  }
  $('#decreaseButton').addEventListener('click', function () { step(-1); });
  $('#increaseButton').addEventListener('click', function () { step(1); });
  // Tablet/desktop up and down arrow buttons
  $('#stepUpButton').addEventListener('click', function () { step(1); });
  $('#stepDownButton').addEventListener('click', function () { step(-1); });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    setStatus('', '');

    var quantity = readQuantity();
    if (quantity === null) {
      quantityInput.focus();
      return;
    }

    var record = {
      type: 'Stock Out',
      quantity: quantity,
      reason: reasonSelect.value,
      note: noteInput.value.trim(),
      newStock: currentStock - quantity
    };

    // TODO: send `record` to your backend here (e.g. with fetch). For now it is logged.
    console.log('Stock out ready to save:', record);

    currentStock = record.newStock;
    currentStockLabel.textContent = String(currentStock);
    quantityInput.value = currentStock > 0 ? '1' : '';
    noteInput.value = '';
    updateNewStock();

    setStatus(quantity + ' unit' + (quantity === 1 ? '' : 's') + ' removed. Current stock is now ' + currentStock + '.', 'success');
  });

  // Cancel: go back to the product details page (asks first if something was changed)
  $('#cancelButton').addEventListener('click', function () {
    var changed = quantityInput.value !== quantityInput.defaultValue ||
                  reasonSelect.value !== 'Expired product' ||
                  noteInput.value.trim() !== '';
    if (changed && !window.confirm('Discard this stock out? Your changes will be lost.')) return;
    window.location.href = PRODUCT_DETAILS_PAGE;
  });

  updateNewStock();
})();