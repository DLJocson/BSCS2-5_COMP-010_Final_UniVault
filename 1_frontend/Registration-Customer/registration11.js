document.addEventListener("DOMContentLoaded", () => {
  const proceedBtn = document.getElementById("proceed");
  const checkboxes = document.querySelectorAll(
    ".second-container input[type='checkbox']"
  );
  const errorMessage = document.getElementById("error-message");

  checkboxes.forEach((cb) => {
    cb.addEventListener("change", () => {
      // Uncheck all others if one is checked
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

  if (proceedBtn) {
    proceedBtn.onclick = function (e) {
      e.preventDefault();
      
      // Save the user's choice to localStorage
      let consent = null;
      checkboxes.forEach((cb) => {
        if (cb.checked) consent = cb.value || cb.id || "checked";
      });
      
      const oneChecked = Array.from(checkboxes).some((cb) => cb.checked);
      if (!oneChecked) {
        errorMessage.textContent = "Please select one option.";
        return;
      }

      // Block progression if user does not agree to undertaking
      if (consent === 'disagree') {
        errorMessage.textContent = 
          "You must agree to the customer undertaking terms to continue with registration.";
        return;
      }
      
      if (consent) {
        localStorage.setItem("customer-undertaking", consent);
      }
      
      errorMessage.textContent = "";
      window.location.href = "registration12.html";
    };
  }
});
