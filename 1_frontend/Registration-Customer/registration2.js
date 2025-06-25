const checkboxes = document.querySelectorAll('input[type="checkbox"]');
const errorMessage = document.getElementById("error-message");

checkboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      checkboxes.forEach((cb) => {
        if (cb !== checkbox) cb.checked = false;
      });
      errorMessage.textContent = "";
    }
  });
});

document.getElementById("proceed").addEventListener("click", () => {
  const anyChecked = Array.from(checkboxes).some((cb) => cb.checked);

  if (!anyChecked) {
    errorMessage.textContent =
      "Please select an account type before proceeding.";
    return;
  }

  errorMessage.textContent = "";

  // Save account_type to localStorage (do not overwrite customer_type)
  const accountTypeInput = document.querySelector('input[name="account_type"]:checked');
  localStorage.setItem('account_type', accountTypeInput.value.trim());

  // Proceed directly to next registration step
  window.location.href = "registration3.html";
});

document.getElementById("back").addEventListener("click", () => {
  window.location.href = "registration1.html";
});
