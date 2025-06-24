document.addEventListener("DOMContentLoaded", function () {
  const proceedBtn = document.getElementById("proceed");
  const isAlternativeCheckbox = document.getElementById("is-alternative");
  const thirdContainer = document.getElementById("third-container");

  thirdContainer.style.display = "flex";

  isAlternativeCheckbox.addEventListener("change", function () {
    if (this.checked) {
      thirdContainer.style.display = "none";
    } else {
      thirdContainer.style.display = "flex";
    }
  });

  function validateForm() {
    let isValid = true;
    clearErrors();

    const personalInput = document.querySelector(
      ".phone-number-text #personal"
    );
    const phoneInput = document.querySelector(".phone-number-text #phone-num");
    const homeInput = document.querySelector(".home-landline-text #home");
    const landlineInput = document.querySelector(
      ".home-landline-text #landline"
    );
    const emailInput = document.querySelector(".personal-email #email");

    const unitInput = document.querySelector(".unit-building-text #unit");
    const buildingInput = document.querySelector(
      ".unit-building-text #building"
    );
    const streetInput = document.querySelector(
      ".street-subdivision-text #street"
    );
    const subdivisionInput = document.querySelector(
      ".street-subdivision-text #subdivision"
    );
    const barangayInput = document.querySelector(
      ".barangay-city-text #barangay"
    );
    const cityInput = document.querySelector(".barangay-city-text #city");
    const provinceInput = document.querySelector(
      ".province-country-text #province"
    );
    const countryInput = document.querySelector(
      ".province-country-text #country"
    );
    const zipCode = document.querySelector(".zip-code #zip-code");

    if (!personalInput.value.trim()) {
      showError(personalInput, "Personal code is required");
      isValid = false;
    } else if (!/^\d{2,3}$/.test(personalInput.value.trim())) {
      showError(personalInput, "Personal code must be 2-3 digits");
      isValid = false;
    }

    if (!phoneInput.value.trim()) {
      showError(phoneInput, "Phone number is required");
      isValid = false;
    } else if (!/^\d{10}$/.test(phoneInput.value.trim())) {
      showError(phoneInput, "Phone number must be 10 digits");
      isValid = false;
    }

    if (!homeInput.value.trim()) {
      showError(homeInput, "Home code is required");
      isValid = false;
    } else if (!/^\d{2,3}$/.test(homeInput.value.trim())) {
      showError(homeInput, "Home code must be 2-3 digits");
      isValid = false;
    }

    if (!landlineInput.value.trim()) {
      showError(landlineInput, "Landline number is required");
      isValid = false;
    } else if (!/^\d{4}-\d{4}$/.test(landlineInput.value.trim())) {
      showError(landlineInput, "Landline must be in format: 1234-1234");
      isValid = false;
    }

    if (!emailInput.value.trim()) {
      showError(emailInput, "Email address is required");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
      showError(emailInput, "Please enter a valid email address");
      isValid = false;
    }

    if (!unitInput.value.trim()) {
      showError(unitInput, "Unit is required");
      isValid = false;
    }

    if (!buildingInput.value.trim()) {
      showError(buildingInput, "Building is required");
      isValid = false;
    }

    if (!streetInput.value.trim()) {
      showError(streetInput, "Street is required");
      isValid = false;
    }

    if (!subdivisionInput.value.trim()) {
      showError(subdivisionInput, "Subdivision is required");
      isValid = false;
    }

    if (!barangayInput.value.trim()) {
      showError(barangayInput, "Barangay is required");
      isValid = false;
    }

    if (!cityInput.value.trim()) {
      showError(cityInput, "City is required");
      isValid = false;
    }

    if (!provinceInput.value.trim()) {
      showError(provinceInput, "Province is required");
      isValid = false;
    }

    if (!countryInput.value.trim()) {
      showError(countryInput, "Country is required");
      isValid = false;
    }

    if (!zipCode.value.trim()) {
      showError(zipCode, "Zip code is required");
      isValid = false;
    }

    if (!isAlternativeCheckbox.checked) {
      const altUnitInput = document.querySelector(
        "#third-container .unit-building-text #unit"
      );
      const altBuildingInput = document.querySelector(
        "#third-container .unit-building-text #building"
      );
      const altStreetInput = document.querySelector(
        "#third-container .street-subdivision-text #street"
      );
      const altSubdivisionInput = document.querySelector(
        "#third-container .street-subdivision-text #subdivision"
      );
      const altBarangayInput = document.querySelector(
        "#third-container .barangay-city-text #barangay"
      );
      const altCityInput = document.querySelector(
        "#third-container .barangay-city-text #city"
      );
      const altProvinceInput = document.querySelector(
        "#third-container .province-country-text #province"
      );
      const altCountryInput = document.querySelector(
        "#third-container .province-country-text #country"
      );
      const altZipCode = document.querySelector(
        "#third-container .zip-code #zip-code"
      );

      if (altUnitInput && !altUnitInput.value.trim()) {
        showError(altUnitInput, "Alternate unit is required");
        isValid = false;
      }

      if (altBuildingInput && !altBuildingInput.value.trim()) {
        showError(altBuildingInput, "Alternate building is required");
        isValid = false;
      }

      if (altStreetInput && !altStreetInput.value.trim()) {
        showError(altStreetInput, "Alternate street is required");
        isValid = false;
      }

      if (altSubdivisionInput && !altSubdivisionInput.value.trim()) {
        showError(altSubdivisionInput, "Alternate subdivision is required");
        isValid = false;
      }

      if (altBarangayInput && !altBarangayInput.value.trim()) {
        showError(altBarangayInput, "Alternate barangay is required");
        isValid = false;
      }

      if (altCityInput && !altCityInput.value.trim()) {
        showError(altCityInput, "Alternate city is required");
        isValid = false;
      }

      if (altProvinceInput && !altProvinceInput.value.trim()) {
        showError(altProvinceInput, "Alternate province is required");
        isValid = false;
      }

      if (altCountryInput && !altCountryInput.value.trim()) {
        showError(altCountryInput, "Alternate country is required");
        isValid = false;
      }

      if (!altZipCode.value.trim()) {
        showError(altZipCode, "Alternate zip code is required");
        isValid = false;
      }
    }

    return isValid;
  }

  function showError(input, message) {
    input.style.borderColor = "#ff3860";
    input.classList.add("error");

    let errorDiv = input.nextElementSibling;

    if (!errorDiv || !errorDiv.classList.contains("error-message")) {
      const parentContainer = input.parentNode;
      errorDiv = parentContainer.querySelector(".error-message");

      if (!errorDiv) {
        errorDiv = document.createElement("div");
        errorDiv.className = "error-message";
        input.parentNode.insertBefore(errorDiv, input.nextSibling);
      }
    }

    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = "block";
      errorDiv.style.color = "#ff3860";
      errorDiv.style.fontSize = "20px";
      errorDiv.style.marginTop = "5px";
      errorDiv.style.marginBottom = "10px";
    }
  }

  function clearErrors() {
    const inputs = document.querySelectorAll('input[type="text"]');
    inputs.forEach((input) => {
      input.style.borderColor = "#0072d8";
      input.classList.remove("error");

      let errorDiv = input.nextElementSibling;
      if (errorDiv && errorDiv.classList.contains("error-message")) {
        errorDiv.textContent = "";
        errorDiv.style.display = "none";
      } else {
        const parentContainer = input.parentNode;
        errorDiv = parentContainer.querySelector(".error-message");
        if (errorDiv) {
          errorDiv.textContent = "";
          errorDiv.style.display = "none";
        }
      }
    });
  }

  const allInputs = document.querySelectorAll('input[type="text"]');
  allInputs.forEach((input) => {
    input.addEventListener("input", function () {
      if (this.value.trim()) {
        this.style.borderColor = "#0072d8";
        this.classList.remove("error");

        const parentContainer = this.parentNode;
        const errorDiv = parentContainer.querySelector(".error-message");
        if (errorDiv) {
          errorDiv.textContent = "";
          errorDiv.style.display = "none";
        }
      }
    });
  });

  proceedBtn.onclick = function (e) {
    e.preventDefault();

    if (validateForm()) {
      window.location.href = "update-contact2.html";
    } else {
      const firstError = document.querySelector(".error");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        firstError.focus();
      }
    }

    return false;
  };
});
