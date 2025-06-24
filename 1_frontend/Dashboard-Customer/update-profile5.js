document.addEventListener("DOMContentLoaded", () => {
  const proceedBtn = document.getElementById("proceed");
  const checkboxes = document.querySelectorAll(
    ".second-container input[type='checkbox']"
  );
  const errorMessage = document.getElementById("error-message");

  checkboxes.forEach((cb) => {
    cb.addEventListener("change", () => {
      if (cb.checked) {
        checkboxes.forEach((otherCb) => {
          if (otherCb !== cb) {
            otherCb.checked = false;
          }
        });
      }

      const oneChecked = Array.from(checkboxes).some((box) => box.checked);
      if (oneChecked) {
        errorMessage.textContent = "";
      }
    });
  });

  proceedBtn.addEventListener("click", (e) => {
    const oneChecked = Array.from(checkboxes).some((cb) => cb.checked);

    if (!oneChecked) {
      e.preventDefault();
      errorMessage.textContent = "Please select one option.";
    } else {
      errorMessage.textContent = "";
      window.location.href = "update-profile6.html";
    }
  });
});
