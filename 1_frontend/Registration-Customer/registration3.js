const config = {
  cUrl: "/api/countries",
};

function populateCountryDropdown(selectId) {
  const selectElement = document.getElementById(selectId);
  if (!selectElement) {
    console.error(`Dropdown with ID '${selectId}' not found.`);
    return;
  }

  console.log(`Starting to populate countries for ${selectId}...`);
  console.log(`Fetching from: ${config.cUrl}`);
  
  fetch(config.cUrl)
    .then((res) => {
      console.log(`Response status: ${res.status}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res.json();
    })
    .then((data) => {
      console.log(`Received ${data.length} countries`);
      // Clear existing options except the first one
      const options = selectElement.querySelectorAll('option:not(:first-child)');
      options.forEach(option => option.remove());
      
      data.forEach((country) => {
        const option = document.createElement("option");
        option.value = country.iso2;
        option.textContent = country.name;
        selectElement.appendChild(option);
      });
      console.log(`Successfully populated ${data.length} countries for ${selectId}`);
    })
    .catch((error) => {
      console.error(`Error loading countries for ${selectId}:`, error);
      // Add an error option to make it visible something went wrong
      const errorOption = document.createElement("option");
      errorOption.value = "";
      errorOption.textContent = "Error loading countries";
      errorOption.disabled = true;
      selectElement.appendChild(errorOption);
    });
}

function populateCitizenshipDropdown() {
  const citizenshipSelect = document.getElementById("citizenship");
  if (!citizenshipSelect) {
    console.error("Citizenship dropdown not found.");
    return;
  }

  const citizenshipList = [
    "Afghan",
    "Albanian",
    "Algerian",
    "American",
    "Andorran",
    "Angolan",
    "Argentine",
    "Armenian",
    "Australian",
    "Austrian",
    "Azerbaijani",
    "Bahamian",
    "Bahraini",
    "Bangladeshi",
    "Barbadian",
    "Belarusian",
    "Belgian",
    "Belizean",
    "Beninese",
    "Bhutanese",
    "Bolivian",
    "Bosnian",
    "Botswanan",
    "Brazilian",
    "British",
    "Bruneian",
    "Bulgarian",
    "Burkinabe",
    "Burmese",
    "Burundian",
    "Cambodian",
    "Cameroonian",
    "Canadian",
    "Cape Verdean",
    "Central African",
    "Chadian",
    "Chilean",
    "Chinese",
    "Colombian",
    "Comorian",
    "Congolese",
    "Costa Rican",
    "Croatian",
    "Cuban",
    "Cypriot",
    "Czech",
    "Danish",
    "Djiboutian",
    "Dominican",
    "Dutch",
    "East Timorese",
    "Ecuadorean",
    "Egyptian",
    "Emirati",
    "English",
    "Equatorial Guinean",
    "Eritrean",
    "Estonian",
    "Ethiopian",
    "Fijian",
    "Finnish",
    "Filipino",
    "French",
    "Gabonese",
    "Gambian",
    "Georgian",
    "German",
    "Ghanaian",
    "Greek",
    "Grenadian",
    "Guatemalan",
    "Guinean",
    "Guyanese",
    "Haitian",
    "Honduran",
    "Hungarian",
    "Icelandic",
    "Indian",
    "Indonesian",
    "Iranian",
    "Iraqi",
    "Irish",
    "Israeli",
    "Italian",
    "Ivorian",
    "Jamaican",
    "Japanese",
    "Jordanian",
    "Kazakh",
    "Kenyan",
    "Kiribati",
    "Korean",
    "Kuwaiti",
    "Kyrgyz",
    "Lao",
    "Latvian",
    "Lebanese",
    "Liberian",
    "Libyan",
    "Liechtensteiner",
    "Lithuanian",
    "Luxembourger",
    "Macedonian",
    "Malagasy",
    "Malawian",
    "Malaysian",
    "Maldivian",
    "Malian",
    "Maltese",
    "Marshallese",
    "Mauritanian",
    "Mauritian",
    "Mexican",
    "Micronesian",
    "Moldovan",
    "Monacan",
    "Mongolian",
    "Montenegrin",
    "Moroccan",
    "Mozambican",
    "Namibian",
    "Nauruan",
    "Nepalese",
    "New Zealander",
    "Nicaraguan",
    "Nigerien",
    "Nigerian",
    "Norwegian",
    "Omani",
    "Pakistani",
    "Palauan",
    "Palestinian",
    "Panamanian",
    "Papua New Guinean",
    "Paraguayan",
    "Peruvian",
    "Polish",
    "Portuguese",
    "Qatari",
    "Romanian",
    "Russian",
    "Rwandan",
    "Saint Lucian",
    "Salvadoran",
    "Samoan",
    "San Marinese",
    "Saudi",
    "Scottish",
    "Senegalese",
    "Serbian",
    "Seychellois",
    "Sierra Leonean",
    "Singaporean",
    "Slovak",
    "Slovenian",
    "Solomon Islander",
    "Somali",
    "South African",
    "South Sudanese",
    "Spanish",
    "Sri Lankan",
    "Sudanese",
    "Surinamese",
    "Swazi",
    "Swedish",
    "Swiss",
    "Syrian",
    "Taiwanese",
    "Tajik",
    "Tanzanian",
    "Thai",
    "Togolese",
    "Tongan",
    "Trinidadian",
    "Tunisian",
    "Turkish",
    "Turkmen",
    "Tuvaluan",
    "Ugandan",
    "Ukrainian",
    "Uruguayan",
    "Uzbek",
    "Vanuatuan",
    "Vatican Citizen",
    "Venezuelan",
    "Vietnamese",
    "Welsh",
    "Yemeni",
    "Zambian",
    "Zimbabwean",
  ];

  citizenshipList.forEach((citizen) => {
    const option = document.createElement("option");
    option.value = citizen;
    option.textContent = citizen;
    citizenshipSelect.appendChild(option);
  });
}

// Age calculation function (global scope)
function calculateAge(birthYear, birthMonth, birthDay) {
  const today = new Date();
  const birthDate = new Date(birthYear, birthMonth - 1, birthDay); // Month is 0-indexed
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

function initializeDateDropdowns() {
  const monthSelect = document.getElementById("month");
  const daySelect = document.getElementById("day");
  const yearSelect = document.getElementById("year");

  if (!monthSelect || !daySelect || !yearSelect) {
    console.error("Date dropdown elements not found.");
    return;
  }

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  months.forEach((month, index) => {
    const option = document.createElement("option");
    option.value = index + 1;
    option.textContent = month;
    monthSelect.appendChild(option);
  });

  function populateDays(totalDays = 31) {
    const previousDay = parseInt(daySelect.value);
    daySelect.innerHTML = '<option value="">Select Day</option>';

    for (let i = 1; i <= totalDays; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = i;
      if (i === previousDay) {
        option.selected = true;
      }
      daySelect.appendChild(option);
    }
  }

  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= 1900; y--) {
    const option = document.createElement("option");
    option.value = y;
    option.textContent = y;
    yearSelect.appendChild(option);
  }

  function updateDays() {
    const month = parseInt(monthSelect.value);
    const year = parseInt(yearSelect.value);
    if (!month || !year) return;

    const daysInMonth = new Date(year, month, 0).getDate();
    populateDays(daysInMonth);
  }

  // Age validation function to be used in change listeners
  const validateAgeOnChange = () => {
    if (monthSelect.value && daySelect.value && yearSelect.value) {
      const age = calculateAge(
        parseInt(yearSelect.value),
        parseInt(monthSelect.value),
        parseInt(daySelect.value)
      );
      
      const existingAgeWarning = document.querySelector('.age-warning');
      
      if (age < 18) {
        if (!existingAgeWarning) {
          const ageWarning = document.createElement('div');
          ageWarning.className = 'age-warning';
          ageWarning.style.cssText = `
            background: #ffe6e6;
            border: 2px solid #ff3860;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
            color: #d32f2f;
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            animation: fadeInDown 0.5s;
          `;
          ageWarning.innerHTML = `
            <strong>⚠️ Age Restriction</strong><br>
            You must be at least 18 years old to open a bank account.<br>
            Current age: ${age} years old<br>
            <small style="font-weight: normal;">Please verify your birth date is correct.</small>
          `;
          
          const dateContainer = document.querySelector('.date-container');
          dateContainer.parentNode.insertBefore(ageWarning, dateContainer.nextSibling);
        } else {
          // Update existing warning with current age
          existingAgeWarning.innerHTML = `
            <strong>⚠️ Age Restriction</strong><br>
            You must be at least 18 years old to open a bank account.<br>
            Current age: ${age} years old<br>
            <small style="font-weight: normal;">Please verify your birth date is correct.</small>
          `;
        }
      } else {
        if (existingAgeWarning) {
          existingAgeWarning.remove();
        }
      }
    }
  };

  monthSelect.addEventListener("change", () => {
    updateDays();
    validateAgeOnChange();
  });
  yearSelect.addEventListener("change", () => {
    updateDays();
    validateAgeOnChange();
  });
  daySelect.addEventListener("change", validateAgeOnChange);

  populateDays();
}

function addInputListeners() {
  const firstName = document.getElementById("first-name");
  const middleName = document.getElementById("middle-name");
  const lastName = document.getElementById("last-name");
  const suffix = document.getElementById("suffix-name");
  const monthSelect = document.getElementById("month");
  const daySelect = document.getElementById("day");
  const yearSelect = document.getElementById("year");
  const countrySelect = document.getElementById("country");
  const citizenshipSelect = document.getElementById("citizenship");
  const genderSelect = document.getElementById("gender");
  const civilStatusSelect = document.getElementById("civil-status");
  const residencyStatusSelect = document.getElementById("residency-status");

  const resetToDefault = (element) => {
    const inputControl =
      element.closest(".checkbox-container") ||
      element.closest(".date") ||
      element.parentElement;

    inputControl.classList.remove("error", "success");

    const errorDisplay = inputControl.querySelector(".error-message");
    if (errorDisplay) {
      errorDisplay.innerText = "";
    }
  };

  [firstName, middleName, lastName, suffix].forEach((input) => {
    if (input) {
      input.addEventListener("input", () => resetToDefault(input));
    }
  });

  [
    monthSelect,
    daySelect,
    yearSelect,
    countrySelect,
    citizenshipSelect,
    genderSelect,
    civilStatusSelect,
    residencyStatusSelect,
  ].forEach((select) => {
    if (select) {
      select.addEventListener("change", () => resetToDefault(select));
    }
  });
}

function initializeFormValidation() {
  

  const firstName = document.getElementById("first-name");
  const middleName = document.getElementById("middle-name");
  const lastName = document.getElementById("last-name");
  const suffix = document.getElementById("suffix-name");
  const monthSelect = document.getElementById("month");
  const daySelect = document.getElementById("day");
  const yearSelect = document.getElementById("year");
  const countrySelect = document.getElementById("country");
  const citizenshipSelect = document.getElementById("citizenship");
  const genderSelect = document.getElementById("gender");
  const civilStatusSelect = document.getElementById("civil-status");
  const proceedButton = document.getElementById("proceed");
  const residencyStatusSelect = document.getElementById("residency-status");

  

  if (!proceedButton) {
    console.error("Proceed button not found!");
    return;
  }

  const setError = (element, message) => {
    const inputControl =
      element.closest(".checkbox-container") ||
      element.closest(".date") ||
      element.parentElement;
    const errorDisplay = inputControl.querySelector(".error-message");

    if (errorDisplay) {
      errorDisplay.innerText = message;
    }
    inputControl.classList.add("error");
    inputControl.classList.remove("success");
  };

  const setSuccess = (element) => {
    const inputControl =
      element.closest(".checkbox-container") ||
      element.closest(".date") ||
      element.parentElement;
    const errorDisplay = inputControl.querySelector(".error-message");

    if (errorDisplay) {
      errorDisplay.innerText = "";
    }
    inputControl.classList.add("success");
    inputControl.classList.remove("error");
  };

  const validateInputs = () => {
    let isValid = true;

    if (!firstName.value.trim()) {
      setError(firstName, "First Name is required");
      isValid = false;
    } else {
      setSuccess(firstName);
    }

    // Middle name is optional
    if (middleName.value.trim() && middleName.value.trim().length < 2) {
      setError(middleName, "Middle Name must be at least 2 characters if provided");
      isValid = false;
    } else {
      setSuccess(middleName);
    }

    if (!lastName.value.trim()) {
      setError(lastName, "Last Name is required");
      isValid = false;
    } else {
      setSuccess(lastName);
    }

    if (!monthSelect.value) {
      setError(monthSelect, "Month is required");
      isValid = false;
    } else {
      setSuccess(monthSelect);
    }

    if (!daySelect.value) {
      setError(daySelect, "Day is required");
      isValid = false;
    } else {
      setSuccess(daySelect);
    }

    if (!yearSelect.value) {
      setError(yearSelect, "Year is required");
      isValid = false;
    } else {
      setSuccess(yearSelect);
    }

    // Age validation - must be 18 or older
    if (monthSelect.value && daySelect.value && yearSelect.value) {
      const age = calculateAge(
        parseInt(yearSelect.value),
        parseInt(monthSelect.value),
        parseInt(daySelect.value)
      );
      
      
      
      if (age < 18) {
        setError(yearSelect, "You must be at least 18 years old to register");
        isValid = false;
        
        // Show additional warning message
        const existingAgeWarning = document.querySelector('.age-warning');
        if (existingAgeWarning) {
          existingAgeWarning.remove();
        }
        
        const ageWarning = document.createElement('div');
        ageWarning.className = 'age-warning';
        ageWarning.style.cssText = `
          background: #ffe6e6;
          border: 2px solid #ff3860;
          border-radius: 8px;
          padding: 15px;
          margin: 15px 0;
          color: #d32f2f;
          font-size: 18px;
          font-weight: bold;
          text-align: center;
          animation: fadeInDown 0.5s;
        `;
        ageWarning.innerHTML = `
          <strong>⚠️ Age Restriction</strong><br>
          You must be at least 18 years old to open a bank account.<br>
          Current age: ${age} years old<br>
          <small style="font-weight: normal;">Please verify your birth date is correct.</small>
        `;
        
        const dateContainer = document.querySelector('.date-container');
        dateContainer.parentNode.insertBefore(ageWarning, dateContainer.nextSibling);
      } else {
        // Remove age warning if age is valid
        const existingAgeWarning = document.querySelector('.age-warning');
        if (existingAgeWarning) {
          existingAgeWarning.remove();
        }
        setSuccess(yearSelect);
      }
    }

    if (!countrySelect.value) {
      setError(countrySelect, "Country is required");
      isValid = false;
    } else {
      setSuccess(countrySelect);
    }

    if (!citizenshipSelect.value) {
      setError(citizenshipSelect, "Citizenship is required");
      isValid = false;
    } else {
      setSuccess(citizenshipSelect);
    }

    if (!genderSelect.value) {
      setError(genderSelect, "Gender is required");
      isValid = false;
    } else {
      setSuccess(genderSelect);
    }

    if (!civilStatusSelect.value) {
      setError(civilStatusSelect, "Civil Status is required");
      isValid = false;
    } else {
      setSuccess(civilStatusSelect);
    }

    if (!residencyStatusSelect.value) {
      setError(residencyStatusSelect, "Civil Status is required");
      isValid = false;
    } else {
      setSuccess(residencyStatusSelect);
    }

    return isValid;
  };

  proceedButton.addEventListener("click", (e) => {
    e.preventDefault();
    

    const isFormValid = validateInputs();

    if (isFormValid) {
      // Save all relevant fields to localStorage with backend-compatible keys
      localStorage.setItem('customer_first_name', firstName.value.trim());
      localStorage.setItem('customer_middle_name', middleName.value.trim());
      localStorage.setItem('customer_last_name', lastName.value.trim());
      localStorage.setItem('customer_suffix_name', suffix.value.trim());
      localStorage.setItem('birth_date', `${yearSelect.value}-${monthSelect.value}-${daySelect.value}`);
      localStorage.setItem('gender', genderSelect.value);
      localStorage.setItem('civil_status_code', civilStatusSelect.value);
      localStorage.setItem('birth_country', countrySelect.value);
      localStorage.setItem('citizenship', citizenshipSelect.value);
      localStorage.setItem('residency_status', residencyStatusSelect.value);

      location.href = "registration4.html";

      const existingMessage = document.querySelector(".success-message");
      if (existingMessage) {
        existingMessage.remove();
      }

      const successMessage = document.createElement("div");
      successMessage.className = "success-message";
      successMessage.textContent =
        "✓ Form is valid! Ready to proceed to the next step.";

      const secondContainer = document.querySelector(".second-container");
      secondContainer.insertBefore(
        successMessage,
        document.querySelector(".button")
      );
    } else {
      
    }
  });
  addInputListeners();
}

document.addEventListener("DOMContentLoaded", () => {
  
  populateCountryDropdown("country");
  populateCitizenshipDropdown();
  initializeDateDropdowns();
  initializeFormValidation();
});

document.getElementById("month").addEventListener("change", function () {
  const month = parseInt(this.value);
  const year = parseInt(document.getElementById("year").value) || new Date().getFullYear();
  const daysInMonth = new Date(year, month, 0).getDate();
  const daySelect = document.getElementById("day");
  const previousDay = parseInt(daySelect.value);
  daySelect.innerHTML = '<option value="">Select Day</option>';
  for (let i = 1; i <= daysInMonth; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = i;
    if (i === previousDay) option.selected = true;
    daySelect.appendChild(option);
  }
});

document.getElementById("year").addEventListener("change", function () {
  const month = parseInt(document.getElementById("month").value);
  if (!month) return;
  const year = parseInt(this.value);
  const daysInMonth = new Date(year, month, 0).getDate();
  const daySelect = document.getElementById("day");
  const previousDay = parseInt(daySelect.value);
  daySelect.innerHTML = '<option value="">Select Day</option>';
  for (let i = 1; i <= daysInMonth; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = i;
    if (i === previousDay) option.selected = true;
    daySelect.appendChild(option);
  }
});



document.addEventListener("DOMContentLoaded", function () {
  // AUTO-FILL TEST DATA (remove/comment out for production)
  // Removed: No auto-fill, user must enter data manually.
});
