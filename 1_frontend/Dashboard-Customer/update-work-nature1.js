document.addEventListener("DOMContentLoaded", function () {
  function clearFieldError(field) {
    if (!field) return;
    field.style.borderColor = "#0072d8";
    field.classList.remove("error");
    const parent = field.parentNode;
    if (parent) {
      const errorMsg = parent.querySelector(".error-message");
      if (errorMsg) {
        errorMsg.textContent = "";
        errorMsg.style.display = "none";
      }
      let next = field.nextElementSibling;
      if (next && next.classList && next.classList.contains("error-message")) {
        next.textContent = "";
        next.style.display = "none";
      }
    }
  }

  function showError(input, message) {
    if (!input) return;
    input.style.borderColor = "#ff3860";
    input.classList.add("error");
    const parent = input.parentNode;
    let errorDiv = parent.querySelector(".error-message");
    if (!errorDiv) {
      errorDiv = document.createElement("div");
      errorDiv.className = "error-message";
      parent.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
    errorDiv.style.color = "#ff3860";
    errorDiv.style.fontSize = "20px";
    errorDiv.style.marginTop = "5px";
    errorDiv.style.marginBottom = "10px";
  }

  function validateForm() {
    let isValid = true;
    const businessNature = document.getElementById("business-nature");
    if (businessNature && businessNature.value.trim() === "") {
      showError(businessNature, "Nature of work is required");
      isValid = false;
    }
    return isValid;
  }

  const businessNature = document.getElementById("business-nature");
  if (businessNature) {
    businessNature.addEventListener("change", function () {
      if (this.value.trim() !== "") {
        clearFieldError(this);
      }
    });
  }

  const proceedBtn = document.getElementById("proceed");
  if (proceedBtn) {
    proceedBtn.onclick = function (e) {
      e.preventDefault();
      if (validateForm()) {
        window.location.href = "update-work-nature2.html";
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
