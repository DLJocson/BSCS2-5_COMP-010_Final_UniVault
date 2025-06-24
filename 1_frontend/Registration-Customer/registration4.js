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

    const phoneCountryCodeInput = document.querySelector(
      ".phone-number-text #phone-country-code"
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

    if (!phoneCountryCodeInput.value.trim()) {
      showError(phoneCountryCodeInput, "Phone country code is required");
      isValid = false;
    } else if (!/^\d{2,3}$/.test(phoneCountryCodeInput.value.trim())) {
      showError(phoneCountryCodeInput, "Phone country code must be 2-3 digits");
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

    // Address: at least one of unit, building, street, subdivision required
    if (
      !unitInput.value.trim() &&
      !buildingInput.value.trim() &&
      !streetInput.value.trim() &&
      !subdivisionInput.value.trim()
    ) {
      showError(unitInput, "At least one of Unit, Building, Street, or Subdivision is required");
      showError(buildingInput, "");
      showError(streetInput, "");
      showError(subdivisionInput, "");
      isValid = false;
    }

    // City, Province, Country, Zip Code are always required
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

    // Alternative address
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

      // At least one of alt unit, building, street, subdivision required
      if (
        (!altUnitInput || !altUnitInput.value.trim()) &&
        (!altBuildingInput || !altBuildingInput.value.trim()) &&
        (!altStreetInput || !altStreetInput.value.trim()) &&
        (!altSubdivisionInput || !altSubdivisionInput.value.trim())
      ) {
        if (altUnitInput) showError(altUnitInput, "At least one of Unit, Building, Street, or Subdivision is required");
        if (altBuildingInput) showError(altBuildingInput, "");
        if (altStreetInput) showError(altStreetInput, "");
        if (altSubdivisionInput) showError(altSubdivisionInput, "");
        isValid = false;
      }

      // City, Province, Country, Zip Code are always required for alt address
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
      if (altZipCode && !altZipCode.value.trim()) {
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
      errorDiv.style.display = message ? "block" : "none";
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

  if (proceedBtn) {
    proceedBtn.onclick = function (e) {
      e.preventDefault();

      // Save all relevant fields to localStorage here
      const phoneCountryCode = document.querySelector(".phone-number-text #phone-country-code").value.trim();
      const phoneNumber = document.querySelector(".phone-number-text #phone-num").value.trim();
      const homeCode = document.querySelector(".home-landline-text #home").value.trim();
      const landlineNumber = document.querySelector(".home-landline-text #landline").value.trim();
      const emailAddress = document.querySelector(".personal-email #email").value.trim();

      const unit = document.querySelector(".unit-building-text #unit").value.trim();
      const building = document.querySelector(".unit-building-text #building").value.trim();
      const street = document.querySelector(".street-subdivision-text #street").value.trim();
      const subdivision = document.querySelector(".street-subdivision-text #subdivision").value.trim();
      const barangay = document.querySelector(".barangay-city-text #barangay").value.trim();
      const city = document.querySelector(".barangay-city-text #city").value.trim();
      const province = document.querySelector(".province-country-text #province").value.trim();
      const country = document.querySelector(".province-country-text #country").value.trim();
      const zip = document.querySelector(".zip-code #zip-code").value.trim();

      // Save to localStorage
      localStorage.setItem("phoneCountryCode", phoneCountryCode);
      localStorage.setItem("phoneNumber", phoneNumber);
      localStorage.setItem("homeCode", homeCode);
      localStorage.setItem("landlineNumber", landlineNumber);
      localStorage.setItem("emailAddress", emailAddress);

      localStorage.setItem("address_unit", unit);
      localStorage.setItem("address_building", building);
      localStorage.setItem("address_street", street);
      localStorage.setItem("address_subdivision", subdivision);
      localStorage.setItem("address_barangay", barangay);
      localStorage.setItem("address_city", city);
      localStorage.setItem("address_province", province);
      localStorage.setItem("address_country", country);
      localStorage.setItem("address_zip_code", zip);

      // Alternate address checkbox state
      if (isAlternativeCheckbox.checked) {
        localStorage.setItem("alternateAddressSameAsHome", "Yes");
        // Clear any previously saved alternate address fields
        localStorage.removeItem("altUnit");
        localStorage.removeItem("altBuilding");
        localStorage.removeItem("altStreet");
        localStorage.removeItem("altSubdivision");
        localStorage.removeItem("altBarangay");
        localStorage.removeItem("altCity");
        localStorage.removeItem("altProvince");
        localStorage.removeItem("altCountry");
        localStorage.removeItem("altZip");
      } else {
        localStorage.setItem("alternateAddressSameAsHome", "No");
        const altUnit = document.querySelector(
          "#third-container .unit-building-text #unit"
        ).value.trim();
        const altBuilding = document.querySelector(
          "#third-container .unit-building-text #building"
        ).value.trim();
        const altStreet = document.querySelector(
          "#third-container .street-subdivision-text #street"
        ).value.trim();
        const altSubdivision = document.querySelector(
          "#third-container .street-subdivision-text #subdivision"
        ).value.trim();
        const altBarangay = document.querySelector(
          "#third-container .barangay-city-text #barangay"
        ).value.trim();
        const altCity = document.querySelector(
          "#third-container .barangay-city-text #city"
        ).value.trim();
        const altProvince = document.querySelector(
          "#third-container .province-country-text #province"
        ).value.trim();
        const altCountry = document.querySelector(
          "#third-container .province-country-text #country"
        ).value.trim();
        const altZip = document.querySelector(
          "#third-container .zip-code #zip-code"
        ).value.trim();

        // Save alternative address to localStorage
        localStorage.setItem("altUnit", altUnit);
        localStorage.setItem("altBuilding", altBuilding);
        localStorage.setItem("altStreet", altStreet);
        localStorage.setItem("altSubdivision", altSubdivision);
        localStorage.setItem("altBarangay", altBarangay);
        localStorage.setItem("altCity", altCity);
        localStorage.setItem("altProvince", altProvince);
        localStorage.setItem("altCountry", altCountry);
        localStorage.setItem("altZip", altZip);
      }

      if (validateForm()) {
        window.location.href = "registration5.html";
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
