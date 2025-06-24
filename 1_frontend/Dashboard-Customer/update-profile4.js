document.addEventListener("DOMContentLoaded", () => {
  const proceedBtn = document.getElementById("proceed");
  const checkboxes = document.querySelectorAll(
    ".second-container input[type='checkbox']"
  );
  const errorMessage = document.getElementById("error-message");

  checkboxes.forEach((cb) => {
    cb.addEventListener("change", () => {
      if (cb.checked) {
        // Uncheck all others
        checkboxes.forEach((otherCb) => {
          if (otherCb !== cb) {
            otherCb.checked = false;
          }
        });
        errorMessage.textContent = ""; // Clear error if one is selected
      }
    });
  });

  proceedBtn.addEventListener("click", (e) => {
    const oneChecked = Array.from(checkboxes).some((cb) => cb.checked);

    if (!oneChecked) {
      e.preventDefault();
      errorMessage.textContent =
        "Please select either 'I give consent' or 'I do not give consent.'";
    } else {
      errorMessage.textContent = "";
      window.location.href = "update-profile5.html";
    }
  });
});
