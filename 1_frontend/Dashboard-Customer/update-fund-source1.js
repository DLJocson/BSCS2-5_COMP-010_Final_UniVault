document.addEventListener("DOMContentLoaded", function () {
  const proceedBtn = document.getElementById("proceed");
  const source = document.getElementById("source-of-funds");

  function showError(input, message) {
    if (!input) return;

    // Add red border
    input.style.borderColor = "#ff3860";
    input.classList.add("error");

    const parent = input.parentNode;
    const errorDiv = parent.querySelector(".error-message");
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = "block";
      errorDiv.style.color = "#ff3860";
      errorDiv.style.fontSize = "14px";
    }
  }

  function clearFieldError(input) {
    if (!input) return;

    // Reset border
    input.style.borderColor = "#0072d8";
    input.classList.remove("error");

    const parent = input.parentNode;
    const errorDiv = parent.querySelector(".error-message");
    if (errorDiv) {
      errorDiv.textContent = "";
      errorDiv.style.display = "none";
    }
  }

  function validateSourceOfFunds() {
    if (!source || !source.value.trim()) {
      showError(source, "Source of funds is required");
      return false;
    }
    clearFieldError(source);
    return true;
  }

  if (source) {
    // Clear error when user changes the value
    source.addEventListener("change", () => {
      if (source.value.trim()) {
        clearFieldError(source);
      }
    });
  }

  if (proceedBtn) {
    proceedBtn.onclick = function (e) {
      e.preventDefault();

      const isValid = validateSourceOfFunds();

      if (isValid) {
        window.location.href = "update-fund-source2.html";
      } else {
        const firstError = document.querySelector(".error");
        if (firstError) {
          firstError.scrollIntoView({ behavior: "smooth", block: "center" });
          firstError.focus();
        }
      }

      return false;
    };
  }
});
