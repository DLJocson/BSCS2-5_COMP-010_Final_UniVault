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

  window.location.href = "apply-account2.html";
});

document.getElementById("back").addEventListener("click", () => {
  window.location.href = "account1.html";
});
