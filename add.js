/* Add New Product page: behaviour for add.html (Stockwise Africa) */
(function () {
  'use strict';

  var $ = function (selector, root) { return (root || document).querySelector(selector); };
  var $$ = function (selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); };

  /* ---------------------------------------------------------------
     1. Sidebar (opens from the menu button / "More", closes on overlay, X or Escape)
  ---------------------------------------------------------------- */
  var sidebar = $('#sidebar');
  var overlay = $('#sidebar-overlay');

  function openMenu() {
    sidebar.classList.remove('-translate-x-full');
    overlay.classList.remove('hidden');
  }

  function closeMenu() {
    sidebar.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
  }

  $$('[data-open-menu]').forEach(function (button) { button.addEventListener('click', openMenu); });
  $('#close-menu-button').addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeMenu();
  });

  /* ---------------------------------------------------------------
     2. Collapsible cards (click a card header to show / hide its fields)
  ---------------------------------------------------------------- */
  $$('[data-card-toggle]').forEach(function (toggle) {
    toggle.addEventListener('click', function () {
      var body = document.getElementById(toggle.getAttribute('aria-controls'));
      var chevron = $('[data-chevron]', toggle);
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';

      toggle.setAttribute('aria-expanded', String(!isOpen));
      body.classList.toggle('hidden', isOpen);
      chevron.classList.toggle('rotate-180', !isOpen);
    });
  });

  /* ---------------------------------------------------------------
     3. Error helpers
  ---------------------------------------------------------------- */
  function showError(input, message) {
    var error = document.getElementById(input.id + '-error');
    input.setAttribute('aria-invalid', 'true');
    if (error) {
      error.textContent = message;
      error.classList.remove('hidden');
    }
  }

  function clearError(input) {
    var error = document.getElementById(input.id + '-error');
    input.removeAttribute('aria-invalid');
    if (error) {
      error.textContent = '';
      error.classList.add('hidden');
    }
  }

  /* ---------------------------------------------------------------
     4. Product image: choose, check type + size, preview
  ---------------------------------------------------------------- */
  var imageInput = $('#product-image');
  var imagePreview = $('#image-preview');
  var imagePlaceholder = $('#image-placeholder');
  var imageFileName = $('#image-file-name');
  var imageError = $('#image-error');
  var MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB
  var previewUrl = null;

  function resetImage() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = null;
    imageInput.value = '';
    imagePreview.removeAttribute('src');
    imagePreview.classList.add('hidden');
    imagePlaceholder.classList.remove('hidden');
    imageFileName.textContent = '';
    imageError.textContent = '';
    imageError.classList.add('hidden');
  }

  function showImageError(message) {
    resetImage();
    imageError.textContent = message;
    imageError.classList.remove('hidden');
  }

  $('#choose-file-button').addEventListener('click', function () { imageInput.click(); });

  imageInput.addEventListener('change', function () {
    var file = imageInput.files && imageInput.files[0];
    if (!file) return;

    if (['image/jpeg', 'image/png'].indexOf(file.type) === -1) {
      showImageError('Please choose a JPG or PNG image.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      showImageError('Image is too large. Maximum size is 2MB.');
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = URL.createObjectURL(file);
    imagePreview.src = previewUrl;
    imagePreview.classList.remove('hidden');
    imagePlaceholder.classList.add('hidden');
    imageFileName.textContent = file.name;
    imageError.textContent = '';
    imageError.classList.add('hidden');
  });

  /* ---------------------------------------------------------------
     5. Validation
  ---------------------------------------------------------------- */
  var form = $('#product-form');
  var status = $('#form-status');

  // Required fields: id -> message shown when empty
  var requiredFields = {
    'product-name': 'Product name is required.',
    'category': 'Please select a category.',
    'sku': 'SKU is required.',
    'selling-price': 'Selling price is required.',
    'stock-quantity': 'Current stock quantity is required.'
  };

  // Number fields (required or optional) that must not be negative
  var numberFields = ['selling-price', 'cost-price', 'stock-quantity', 'reorder-level'];
  var wholeNumberFields = ['stock-quantity', 'reorder-level'];

  function validateField(input) {
    var value = input.value.trim();
    var isRequired = Object.prototype.hasOwnProperty.call(requiredFields, input.id);

    if (isRequired && value === '') {
      showError(input, requiredFields[input.id]);
      return false;
    }

    if (value !== '' && numberFields.indexOf(input.id) !== -1) {
      var number = Number(value);
      if (isNaN(number) || number < 0) {
        showError(input, 'Enter a number that is 0 or more.');
        return false;
      }
      if (wholeNumberFields.indexOf(input.id) !== -1 && !Number.isInteger(number)) {
        showError(input, 'Enter a whole number.');
        return false;
      }
    }

    clearError(input);
    return true;
  }

  function validateForm() {
    var firstInvalid = null;
    var fieldIds = Object.keys(requiredFields).concat(['cost-price', 'reorder-level']);

    fieldIds.forEach(function (id) {
      var input = document.getElementById(id);
      if (!validateField(input) && !firstInvalid) firstInvalid = input;
    });

    if (imageError.textContent && !firstInvalid) firstInvalid = $('#choose-file-button');
    return firstInvalid;
  }

  // Re-check a field as soon as the person fixes it
  $$('.field-control', form).forEach(function (input) {
    var eventName = input.tagName === 'SELECT' ? 'change' : 'input';
    input.addEventListener(eventName, function () {
      if (input.getAttribute('aria-invalid') === 'true') validateField(input);
    });
    input.addEventListener('blur', function () {
      if (Object.prototype.hasOwnProperty.call(requiredFields, input.id) || numberFields.indexOf(input.id) !== -1) {
        if (input.value.trim() !== '' || input.getAttribute('aria-invalid') === 'true') validateField(input);
      }
    });
  });

  /* ---------------------------------------------------------------
     6. Form status message (also read out by screen readers)
  ---------------------------------------------------------------- */
  function setStatus(message, type) {
    status.textContent = message;
    status.className = message
      ? 'mt-[10px] rounded-[5px] px-[13px] py-[8px] text-[13px] font-semibold ' +
        (type === 'success' ? 'bg-[#E3F6EA] text-[#14683A]' : 'bg-[#FFE1E1] text-[#C91D24]')
      : '';
  }

  /* ---------------------------------------------------------------
     7. Save
  ---------------------------------------------------------------- */
  function collectProduct() {
    var data = new FormData(form);
    var product = {};
    data.forEach(function (value, key) {
      if (key === 'productImage') {
        product.imageName = value && value.name ? value.name : '';
      } else {
        product[key] = typeof value === 'string' ? value.trim() : value;
      }
    });
    return product;
  }

  function resetForm() {
    form.reset();
    resetImage();
    $$('.field-control', form).forEach(clearError);
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    setStatus('', '');

    var firstInvalid = validateForm();
    if (firstInvalid) {
      setStatus('Please fix the highlighted fields and try again.', 'error');
      firstInvalid.focus();
      return;
    }

    var product = collectProduct();

    // TODO: send `product` to your backend here (e.g. with fetch). For now it is logged.
    console.log('Product ready to save:', product);

    setStatus('"' + product.productName + '" was added to your inventory.', 'success');
    resetForm();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------------------------------------------------------------
     8. Cancel
  ---------------------------------------------------------------- */
  $('#cancel-button').addEventListener('click', function () {
    var hasChanges = Array.prototype.some.call(form.elements, function (el) {
      if (el.type === 'radio') return el.checked !== el.defaultChecked;
      if (el.type === 'file') return el.files && el.files.length > 0;
      if (el.tagName === 'SELECT') return el.selectedIndex !== Array.prototype.findIndex.call(el.options, function (o) { return o.defaultSelected; });
      return el.value !== el.defaultValue;
    });

    if (hasChanges && !window.confirm('Discard this product? Your changes will be lost.')) return;

    resetForm();
    setStatus('', '');
    // Replace with your real inventory page when it exists, e.g. window.location.href = 'inventory.html';
  });

  /* ---------------------------------------------------------------
     9. Sync status bar (click to retry)
  ---------------------------------------------------------------- */
  var syncButton = $('#sync-button');
  var syncLabel = $('#sync-label');
  var failedClasses = ['bg-[#FFE1E1]', 'text-[#C91D24]', 'hover:bg-[#FFD3D3]'];
  var okClasses = ['bg-[#E3F6EA]', 'text-[#14683A]', 'hover:bg-[#D3F0DE]'];

  function setSyncState(ok) {
    failedClasses.forEach(function (c) { syncButton.classList.toggle(c, !ok); });
    okClasses.forEach(function (c) { syncButton.classList.toggle(c, ok); });
    syncLabel.textContent = ok ? 'All changes synced' : 'Sync failed \u2022 Tap to retry';
  }

  syncButton.addEventListener('click', function () {
    syncButton.disabled = true;
    syncLabel.textContent = 'Syncing\u2026';

    // Placeholder: replace this timeout with a real sync request to your backend.
    window.setTimeout(function () {
      syncButton.disabled = false;
      setSyncState(navigator.onLine);
    }, 1200);
  });

  window.addEventListener('offline', function () { setSyncState(false); });
})();