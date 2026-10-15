// ---------- 1. Grab the elements we need ----------
const screenWrapper = document.getElementById("screen-wrapper");
const screen = document.getElementById("screen");
const form = document.getElementById("business-form");
const backButton = document.getElementById("back-button");
const rcNumberInput = document.getElementById("rc-number");
const currencyInput = document.getElementById("currency"); // hidden input that stores the value
const currencyButton = document.getElementById("currency-button");
const currencyLabel = document.getElementById("currency-label");
const currencyArrow = document.getElementById("currency-arrow");
const currencyList = document.getElementById("currency-list");
const currencyOptions = document.querySelectorAll(".currency-option");
const addressInput = document.getElementById("address");
const typeButtons = document.querySelectorAll(".type-button");

// ---------- 2. Business type selection ----------
// Pharmacy is selected by default (it is already highlighted in the HTML).
let selectedType = "Pharmacy";

function selectType(clickedButton) {
  // First, un-highlight every button
  typeButtons.forEach(function (button) {
    button.classList.remove("bg-[#D0E3FA]");
    button.classList.add("bg-transparent");
  });

  // Then highlight only the button that was clicked
  clickedButton.classList.remove("bg-transparent");
  clickedButton.classList.add("bg-[#D0E3FA]");

  // Remember which type is selected
  selectedType = clickedButton.dataset.type;
}

typeButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    selectType(button);
  });
});

// ---------- 3. Currency dropdown ----------
function openCurrencyList() {
  currencyList.hidden = false;
  currencyArrow.classList.add("rotate-180");
}

function closeCurrencyList() {
  currencyList.hidden = true;
  currencyArrow.classList.remove("rotate-180");
}

// Click the box to open or close the list
currencyButton.addEventListener("click", function () {
  if (currencyList.hidden) {
    openCurrencyList();
  } else {
    closeCurrencyList();
  }
});

// Click an option to choose it
currencyOptions.forEach(function (option) {
  option.addEventListener("click", function () {
    currencyInput.value = option.dataset.value;
    currencyLabel.textContent = option.dataset.label;
    currencyLabel.classList.remove("text-[#143967]/60");
    closeCurrencyList();
  });
});

// Click anywhere else to close the list
document.addEventListener("click", function (event) {
  const clickedInsideCurrency = currencyButton.contains(event.target) || currencyList.contains(event.target);
  if (!clickedInsideCurrency) {
    closeCurrencyList();
  }
});

// ---------- 4. Form validation and submit ----------
form.addEventListener("submit", function (event) {
  // Stop the page from refreshing
  event.preventDefault();

  const rcNumber = rcNumberInput.value.trim();
  const currency = currencyInput.value;
  const address = addressInput.value.trim();

  if (rcNumber === "") {
    alert("Please enter your RC-Number.");
    rcNumberInput.focus();
    return;
  }

  if (currency === "") {
    alert("Please select a currency.");
    currencyButton.focus();
    return;
  }

  if (address === "") {
    alert("Please enter your business address.");
    addressInput.focus();
    return;
  }

  // Everything is valid
  const businessData = {
    rcNumber: rcNumber,
    businessType: selectedType,
    currency: currency,
    address: address,
  };

  console.log("Submitted business information:", businessData);
  alert("Success! Your business details have been saved.");
});

// ---------- 5. Back button ----------
backButton.addEventListener("click", function () {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    alert("There is no previous page to go back to.");
  }
});

// ---------- 6. Scale the 440px design to fit small screens ----------
const DESIGN_WIDTH = 440;
const DESIGN_HEIGHT = 956;

function scaleScreen() {
  // Never scale above 1, only shrink on narrow screens
  const scale = Math.min(1, window.innerWidth / DESIGN_WIDTH);

  screen.style.transform = "scale(" + scale + ")";
  screenWrapper.style.width = DESIGN_WIDTH * scale + "px";
  screenWrapper.style.height = DESIGN_HEIGHT * scale + "px";
}

scaleScreen();
window.addEventListener("resize", scaleScreen);