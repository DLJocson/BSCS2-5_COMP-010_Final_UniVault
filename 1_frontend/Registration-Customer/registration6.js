document.addEventListener("DOMContentLoaded", () => {
  const containers = document.getElementById("containers");
  const yesCheckbox = document.getElementById("yes-alias");
  const noCheckbox = document.getElementById("no-alias");

  // Hide the alias form by default
  if (containers) containers.style.display = "none";

  function updateAliasForm() {
    if (yesCheckbox && yesCheckbox.checked) {
      if (noCheckbox) noCheckbox.checked = false;
      if (containers) containers.style.display = "block";
      localStorage.removeItem("alias"); // User will fill alias fields
    } else if (noCheckbox && noCheckbox.checked) {
      if (yesCheckbox) yesCheckbox.checked = false;
      if (containers) containers.style.display = "none";
      localStorage.setItem("alias", "No");
      clearAllErrorsInContainers();
    } else {
      // If neither is checked, hide the form
      if (containers) containers.style.display = "none";
      localStorage.removeItem("alias");
      clearAllErrorsInContainers();
    }
  }

  if (yesCheckbox) yesCheckbox.addEventListener("change", updateAliasForm);
  if (noCheckbox) noCheckbox.addEventListener("change", updateAliasForm);

  // On load, ensure correct state
  updateAliasForm();
  
  // Initialize all functionality
  handleFileUploadValidation(); // <-- Initialize file upload handlers
  populateDateDropdowns(); // <-- Initialize date dropdowns
  attachInputListeners(); // <-- Initialize input listeners for error clearing
  handleProceedClick(); // <-- Attach the Proceed button logic on page load
});

// New helper function to clear errors when hiding the form
function clearAllErrorsInContainers() {
    const containers = document.getElementById("containers");
    if (containers) {
        const errorMessages = containers.querySelectorAll(".error-message");
        errorMessages.forEach(errorEl => {
            errorEl.textContent = "";
        });
        const errorInputs = containers.querySelectorAll("input.error, select.error, .upload-box.error");
        errorInputs.forEach(inputEl => {
            inputEl.classList.remove("error");
        });
        // Also reset file upload text if needed
        const fileUploadDirections = containers.querySelectorAll(".upload-box .direction");
        fileUploadDirections.forEach(directionEl => {
            // You might need to adjust this to your default text
            if (directionEl.textContent.startsWith("✓")) { // Only reset if it shows an uploaded file
                const inputId = directionEl.closest(".upload-box").querySelector("input[type='file']").id;
                if (inputId === "front-id-1") directionEl.textContent = "Upload Front of ID 1";
                else if (inputId === "back-id-1") directionEl.textContent = "Upload Back of ID 1";
                else if (inputId === "front-id-2") directionEl.textContent = "Upload Front of ID 2";
                else if (inputId === "back-id-2") directionEl.textContent = "Upload Back of ID 2";
                directionEl.style.color = ""; // Remove green color
            }
        });
    }
}


function handleFileUploadValidation() {
  // Initialize standardized upload handler
  const uploadHandler = new ImageUploadHandler();
  const fileInputs = ["front-id-1", "back-id-1", "front-id-2", "back-id-2"];
  
  // Initialize uploads with the standardized handler
  uploadHandler.initializeUploads(fileInputs);
  
  // Store reference for validation
  window.uploadHandler = uploadHandler;
}

function populateDateDropdowns() {
  const monthSelect1 = document.getElementById("month");
  const daySelect1 = document.getElementById("day");
  const yearSelect1 = document.getElementById("year");

  const monthSelect2 = document.getElementById("month-id2");
  const daySelect2 = document.getElementById("day-id2");
  const yearSelect2 = document.getElementById("year-id2");

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

  // Only populate if elements exist
  if (monthSelect1 && monthSelect2) {
    months.forEach((month, index) => {
      const option1 = document.createElement("option");
      option1.value = index + 1;
      option1.textContent = month;
      monthSelect1.appendChild(option1);

      const option2 = document.createElement("option");
      option2.value = index + 1;
      option2.textContent = month;
      monthSelect2.appendChild(option2);
    });
  }

  // Populate years for expiry dates (extend to 2050)
  if (yearSelect1 && yearSelect2) {
    const currentYear = new Date().getFullYear();
    // For expiry dates, start from current year and go up to 2050
    for (let y = 2050; y >= currentYear; y--) {
      const option1 = document.createElement("option");
      option1.value = y;
      option1.textContent = y;
      yearSelect1.appendChild(option1);

      const option2 = document.createElement("option");
      option2.value = y;
      option2.textContent = y;
      yearSelect2.appendChild(option2);
    }
  }

  // Enhanced updateDays function - Month → Day → Year flow
  function updateDays(monthSelect, daySelect) {
    if (!monthSelect || !daySelect) return;

    const month = parseInt(monthSelect.value);
    
    // Clear previous day options
    daySelect.innerHTML = '<option value="" disabled selected>Select Day</option>';
    
    // If no month selected, keep day dropdown empty
    if (isNaN(month) || month === 0) {
      return;
    }

    let daysInMonth;
    // Calculate days in month (February = 29 to support leap years)
    if (month === 2) {
      daysInMonth = 29; // Always use 29 for February to support leap years
    } else if ([4, 6, 9, 11].includes(month)) {
      daysInMonth = 30; // April, June, September, November
    } else {
      daysInMonth = 31; // All other months
    }

    // Populate day options immediately after month selection
    for (let d = 1; d <= daysInMonth; d++) {
      const option = document.createElement("option");
      option.value = d;
      option.textContent = d;
      daySelect.appendChild(option);
    }
  }

  // Attach listeners - Month → Day flow (day populates as soon as month is selected)
  if (monthSelect1 && daySelect1) {
    monthSelect1.addEventListener("change", () =>
      updateDays(monthSelect1, daySelect1)
    );
  }

  if (monthSelect2 && daySelect2) {
    monthSelect2.addEventListener("change", () =>
      updateDays(monthSelect2, daySelect2)
    );
  }
}

function attachInputListeners() {
  const inputs = document.querySelectorAll("#containers input, #containers select"); // Target inputs only within #containers
  inputs.forEach((input) => {
    input.addEventListener("input", () => clearError(input.id));
    input.addEventListener("change", () => clearError(input.id));
  });
}

function showError(id, message = "This field is required!") {
  const errorElement = document.getElementById(`error-${id}`);
  const inputElement = document.getElementById(id);

  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.color = "red";
  }

  if (inputElement) {
    const uploadBox = inputElement.closest(".upload-box");
    if (uploadBox) {
      uploadBox.classList.add("error");
    } else {
      inputElement.classList.add("error");
    }
  }
}

function clearError(id) {
  const errorElement = document.getElementById(`error-${id}`);
  const inputElement = document.getElementById(id);

  if (errorElement) errorElement.textContent = "";
  if (inputElement) {
    const uploadBox = inputElement.closest(".upload-box");
    if (uploadBox) {
      uploadBox.classList.remove("error");
    } else {
      inputElement.classList.remove("error");
    }
  }
}



function handleProceedClick() {
  const proceedBtn = document.getElementById("proceed");
  const yesCheckbox = document.getElementById("yes-alias");
  const noCheckbox = document.getElementById("no-alias");

  if (!proceedBtn || proceedBtn.dataset.listenerAttached) {
      return;
  }
  proceedBtn.dataset.listenerAttached = "true";

  proceedBtn.addEventListener("click", () => {
    if (yesCheckbox && yesCheckbox.checked) {
      // Validate alias and ID fields if Yes
      if (validateAliasAndIDs()) {
        // Save all alias fields to localStorage
        localStorage.setItem("alias_first_name", document.getElementById("first-name").value);
        localStorage.setItem("alias_middle_name", document.getElementById("middle-name").value);
        localStorage.setItem("alias_last_name", document.getElementById("last-name").value);
        
        // Save alias ID 1 documentation
        const alias_id1_type_raw = document.getElementById("select-id1").value;
        const alias_id1_type = alias_id1_type_raw ? getAliasDocTypeCode(document.getElementById("select-id1").options[document.getElementById("select-id1").selectedIndex].text) : "";
        console.log("Alias ID1 debug:", {
          raw: alias_id1_type_raw,
          text: document.getElementById("select-id1").options[document.getElementById("select-id1").selectedIndex].text,
          mapped: alias_id1_type
        });
        localStorage.setItem("alias_id1_type", alias_id1_type);
        localStorage.setItem("alias_id1_number", document.getElementById("id1-num").value);
        localStorage.setItem("alias_id1_issue_month", document.getElementById("issue-month-id1").value);
        localStorage.setItem("alias_id1_issue_year", document.getElementById("issue-year-id1").value);
        
        // Save alias ID 2 documentation  
        const alias_id2_type_raw = document.getElementById("select-id2").value;
        const alias_id2_type = alias_id2_type_raw ? getAliasDocTypeCode(document.getElementById("select-id2").options[document.getElementById("select-id2").selectedIndex].text) : "";
        localStorage.setItem("alias_id2_type", alias_id2_type);
        localStorage.setItem("alias_id2_number", document.getElementById("id2-num").value);
        localStorage.setItem("alias_id2_issue_month", document.getElementById("issue-month-id2").value);
        localStorage.setItem("alias_id2_issue_year", document.getElementById("issue-year-id2").value);
        
        window.location.href = "registration7.html";
      }
    } else if (noCheckbox && noCheckbox.checked) {
      // Allow direct proceed if No
      localStorage.setItem("alias", "No");
      window.location.href = "registration7.html";
    }
  });
}


function validateAliasAndIDs() {
  let isValid = true;
  const containers = document.getElementById("containers"); // Get the container to limit validation to visible fields

  // Required alias fields - only First and Last name
  const aliasFields = [
    { id: "first-name", msg: "Alias first name is required" },
    { id: "last-name", msg: "Alias last name is required" }
    // Removed middle-name as it's not required
  ];

  aliasFields.forEach(({ id, msg }) => {
    const el = document.getElementById(id);
    // Only validate if the element exists and is inside the visible 'containers'
    if (el && containers.contains(el)) {
        if (el.value.trim() === "") {
            showError(id, msg);
            isValid = false;
        }
    }
  });

  // Required ID 1 fields - only ID Type, ID Number, and Issue Date (Month and Year)
  const id1Fields = [
    { id: "select-id1", msg: "ID 1 type is required" },
    { id: "id1-num", msg: "ID 1 number is required" },
    { id: "issue-month-id1", msg: "Issue month is required" },
    { id: "issue-year-id1", msg: "Issue year is required" }
    // Removed expiration date fields and day field as they're not required
  ];

  id1Fields.forEach(({ id, msg }) => {
    const el = document.getElementById(id);
    if (el && containers.contains(el)) {
        // For select dropdowns, check if a valid option is selected (value is not empty)
        if (!el.value || el.value === "" || el.value === null) {
            showError(id, msg);
            isValid = false;
        }
    }
  });

  // Validate file uploads using standardized upload handler
  const fileFields = ["front-id-1", "back-id-1", "front-id-2", "back-id-2"];
  const uploadValidation = window.uploadHandler?.validateAllUploads(fileFields);
  
  if (uploadValidation && !uploadValidation.isValid) {
    uploadValidation.missing.forEach(id => {
      const fieldName = id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      showError(id, `${fieldName} upload is required`);
    });
    isValid = false;
  }

  // Required ID 2 fields - only ID Type, ID Number, and Issue Date (Month and Year)
  const id2Fields = [
    { id: "select-id2", msg: "ID 2 type is required" },
    { id: "id2-num", msg: "ID 2 number is required" },
    { id: "issue-month-id2", msg: "Issue month is required" },
    { id: "issue-year-id2", msg: "Issue year is required" }
    // Removed expiration date fields and day field as they're not required
  ];

  id2Fields.forEach(({ id, msg }) => {
    const el = document.getElementById(id);
    if (el && containers.contains(el)) {
        if (!el.value || el.value === "" || el.value === null) {
            showError(id, msg);
            isValid = false;
        }
    }
  });

  return isValid;
}

function populateDays(daySelectId, monthSelectId, yearSelectId) {
  const daySelect = document.getElementById(daySelectId);
  const monthSelect = document.getElementById(monthSelectId);
  const yearSelect = document.getElementById(yearSelectId);

  function updateDays() {
    const month = parseInt(monthSelect.value, 10);
    let daysInMonth;
    
    // Clear previous day options
    daySelect.innerHTML = '<option value="" disabled selected>Select Day</option>';
    
    if (isNaN(month)) {
      return;
    }
    
    // February always shows 29 days to support leap years
    if (month === 2) {
      daysInMonth = 29;
    } else if ([4, 6, 9, 11].includes(month)) {
      daysInMonth = 30;
    } else {
      daysInMonth = 31;
    }
    
    // Populate day options immediately after month selection
    for (let d = 1; d <= daysInMonth; d++) {
      const option = document.createElement("option");
      option.value = d;
      option.textContent = d;
      daySelect.appendChild(option);
    }
  }

  // Only listen to month changes for Month → Day flow
  monthSelect.addEventListener("change", updateDays);
}

document.addEventListener("DOMContentLoaded", function() {
  populateDays("issue-day-id1", "issue-month-id1", "issue-year-id1");
  populateDays("day", "month", "year");
  populateDays("issue-day-id2", "issue-month-id2", "issue-year-id2");
  populateDays("day-id2", "month-id2", "year-id2");
});
