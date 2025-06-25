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
      "Please select a product type before proceeding.";
    return;
  }

  errorMessage.textContent = "";

  // Save product_type to localStorage
  const productTypeInput = document.querySelector('input[name="product_type"]:checked');
  localStorage.setItem('product_type', productTypeInput.value.trim());

  // Proceed directly to next registration step
  window.location.href = "registration3.html";
});

document.getElementById("back").addEventListener("click", () => {
  window.location.href = "registration1.html";
});
