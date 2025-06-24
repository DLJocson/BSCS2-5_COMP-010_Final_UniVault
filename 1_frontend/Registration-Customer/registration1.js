const accountOwner = document.getElementById("account-owner");
const businessOwner = document.getElementById("business-owner");
const form = document.querySelector("form");
const errorMessage = document.getElementById("error-message");
let proceedBtn; // Declare proceedBtn here

function handleExclusiveSelection(clickedCheckbox) {
  [accountOwner, businessOwner].forEach((checkbox) => {
    if (checkbox !== clickedCheckbox) {
      checkbox.checked = false;
    }
  });

  // Clear error message when a selection is made
  errorMessage.textContent = "";
}

[accountOwner, businessOwner].forEach((checkbox) => {
  checkbox.addEventListener("change", () => handleExclusiveSelection(checkbox));
});

form.addEventListener("submit", function (event) {
  event.preventDefault();

  if (!accountOwner.checked && !businessOwner.checked) {
    errorMessage.textContent =
      "Please select a customer type before proceeding.";
    return; // Stop here, do not proceed
  }

  // Save only customer type to localStorage
  let customerType = '';
  if (accountOwner.checked) customerType = 'Account Owner';
  if (businessOwner.checked) customerType = 'Business Owner / Officer / Signatory';
  localStorage.setItem('customer_type', customerType);

  // Only proceed if a selection is made
  window.location.href = "registration2.html";
});

document.getElementById("back").addEventListener("click", () => {
  window.location.href = "entry.html";
});

document.addEventListener("DOMContentLoaded", function () {
  // Clear all registration-related keys at the start of registration
  [
    'customer_first_name', 'customer_middle_name', 'customer_last_name', 'customer_suffix_name',
    'customer_type', 'customer_username', 'password', 'birth_date', 'gender',
    'civil_status_code', 'birth_country', 'citizenship'
  ].forEach(k => localStorage.removeItem(k));

  proceedBtn = document.getElementById("proceed"); // Define proceedBtn here
  // --- AUTO-FILL REMOVED ---
  // (No auto-fill code here; user will fill out manually)
});
