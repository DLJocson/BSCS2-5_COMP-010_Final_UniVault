document.addEventListener("DOMContentLoaded", () => {
  populateDateDropdowns();
  attachInputListeners();
  handleFileUploadValidation();
  handleProceedClick();
  
  // Add real-time duplicate ID type validation
  const id1Select = document.getElementById("select-id1");
  const id2Select = document.getElementById("select-id2");
  
  function checkDuplicateIdTypes() {
    const id1Type = id1Select?.value;
    const id2Type = id2Select?.value;
    
    if (id1Type && id2Type && id1Type === id2Type) {
      showError("select-id2", "ID 2 type must be different from ID 1 type");
    } else {
      clearError("select-id2");
    }
  }
  
  if (id1Select) id1Select.addEventListener("change", checkDuplicateIdTypes);
  if (id2Select) id2Select.addEventListener("change", checkDuplicateIdTypes);
});

function handleFileUploadValidation() {
  // Initialize standardized upload handler
  const uploadHandler = new ImageUploadHandler();
  const imageInputs = ["front-id-1", "back-id-1", "front-id-2", "back-id-2"];
  
  // Initialize image uploads with the standardized handler
  uploadHandler.initializeUploads(imageInputs);
  
  // Handle supporting document separately (allows PDF)
  const supportingDocInput = document.getElementById("supporting-doc");
  if (supportingDocInput) {
    setupSupportingDocUpload(supportingDocInput);
  }
  
  // Store reference for validation
  window.uploadHandler = uploadHandler;
}

// Special handler for supporting document (allows PDF)
function setupSupportingDocUpload(input) {
  input.addEventListener("change", async () => {
    const file = input.files[0];
    const errorElement = document.getElementById("error-supporting-doc");
    const uploadBox = input.closest(".upload-box");
    const direction = uploadBox?.querySelector(".direction");
    
    if (!file) return;
    
    // Validate file type (allow PDF for supporting doc)
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      errorElement.textContent = "Only JPG, PNG, or PDF files are allowed.";
      input.value = "";
      uploadBox.classList.add("error");
      return;
    }
    
    // Validate file size
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      errorElement.textContent = "File too large. Maximum size is 5MB.";
      input.value = "";
      uploadBox.classList.add("error");
      return;
    }
    
    // Clear errors
    errorElement.textContent = "";
    uploadBox.classList.remove("error");
    
    // Show upload progress
    if (direction) {
      direction.textContent = `Uploading ${file.name}...`;
      direction.style.color = "#007bff";
    }
    
    try {
      // Upload to server
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch("/upload", {
        method: "POST",
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }
      
      // Success
      localStorage.setItem("supporting-doc_path", data.filePath);
      localStorage.setItem("supporting-doc_filename", file.name);
      
      if (direction) {
        direction.textContent = `✓ ${file.name} uploaded successfully`;
        direction.style.color = "#28a745";
      }
      
    } catch (error) {
      // Error handling
      errorElement.textContent = error.message || "Upload failed. Please try again.";
      uploadBox.classList.add("error");
      
      if (direction) {
        direction.textContent = "Upload failed.";
        direction.style.color = "#dc3545";
      }
      
      // Clear stored data
      localStorage.removeItem("supporting-doc_path");
      localStorage.removeItem("supporting-doc_filename");
      input.value = "";
    }
  });
}



function populateDateDropdowns() {
  // Get all month selects
  const monthSelects = [
    document.getElementById("issue-month-id1"),
    document.getElementById("month"),
    document.getElementById("issue-month-id2"),
    document.getElementById("month-id2")
  ];

  // Get all year selects
  const issueYearSelects = [
    document.getElementById("issue-year-id1"),
    document.getElementById("issue-year-id2")
  ];
  const expiryYearSelects = [
    document.getElementById("year"),
    document.getElementById("year-id2")
  ];

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Populate months
  monthSelects.forEach(monthSelect => {
    if (monthSelect) {
      months.forEach((month, index) => {
        const option = document.createElement("option");
        option.value = index + 1;
        option.textContent = month;
        monthSelect.appendChild(option);
      });
    }
  });

  // Populate issue years (current year down to 1900)
  issueYearSelects.forEach(yearSelect => {
    if (yearSelect) {
      const currentYear = new Date().getFullYear();
      for (let y = currentYear; y >= 1900; y--) {
        const option = document.createElement("option");
        option.value = y;
        option.textContent = y;
        yearSelect.appendChild(option);
      }
    }
  });

  // Populate expiry years (current year up to 2050)
  expiryYearSelects.forEach(yearSelect => {
    if (yearSelect) {
      const currentYear = new Date().getFullYear();
      for (let y = 2050; y >= currentYear; y--) {
        const option = document.createElement("option");
        option.value = y;
        option.textContent = y;
        yearSelect.appendChild(option);
      }
    }
  });

  // Set up day population for each date set
  setupDayPopulation("issue-month-id1", "issue-year-id1", "issue-day-id1");
  setupDayPopulation("month", "year", "day");
  setupDayPopulation("issue-month-id2", "issue-year-id2", "issue-day-id2");
  setupDayPopulation("month-id2", "year-id2", "day-id2");
}

function setupDayPopulation(monthId, yearId, dayId) {
  const monthSelect = document.getElementById(monthId);
  const yearSelect = document.getElementById(yearId);
  const daySelect = document.getElementById(dayId);
  if (!monthSelect || !daySelect) return;
  
  function updateDays() {
    const month = parseInt(monthSelect.value);
    
    // Clear previous day options
    daySelect.innerHTML = '<option value="" disabled selected>Select Day</option>';
    
    // If no month selected, keep day dropdown empty
    if (isNaN(month)) {
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
  
  // Only listen to month changes for Month → Day flow
  monthSelect.addEventListener("change", updateDays);
}

function attachInputListeners() {
  const inputs = document.querySelectorAll("input, select");
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

function validateForm() {
  let isValid = true;
  // Required ID 1 fields - Type, Number, Issue Date (Month, Day, Year)
  const id1Fields = [
    { id: "select-id1", msg: "ID 1 type is required" },
    { id: "id1-num", msg: "ID 1 number is required" },
    { id: "issue-month-id1", msg: "ID 1 issue month is required" },
    { id: "issue-day-id1", msg: "ID 1 issue day is required" },
    { id: "issue-year-id1", msg: "ID 1 issue year is required" }
    // Removed expiry date fields as they're not required (some IDs don't have expiration dates)
  ];
  id1Fields.forEach(({ id, msg }) => {
    const el = document.getElementById(id);
    if (!el || el.value.trim() === "") {
      showError(id, msg);
      isValid = false;
    }
  });
  // Required ID 1 file uploads - Front and Back
  const id1FileFields = [
    { id: "front-id-1", msg: "Front image of ID 1 is required" },
    { id: "back-id-1", msg: "Back image of ID 1 is required" }
  ];
  id1FileFields.forEach(({ id, msg }) => {
    const fileInput = document.getElementById(id);
    const filePath = localStorage.getItem(id + '_path');
    if (!fileInput || !fileInput.files.length || !filePath || filePath === 'null' || filePath === '') {
      showError(id, msg + ' (Please upload and wait for confirmation)');
      isValid = false;
    }
  });
  // Required ID 2 fields - Type, Number, Issue Date (Month, Day, Year)
  const id2Fields = [
    { id: "select-id2", msg: "ID 2 type is required" },
    { id: "id2-num", msg: "ID 2 number is required" },
    { id: "issue-month-id2", msg: "ID 2 issue month is required" },
    { id: "issue-day-id2", msg: "ID 2 issue day is required" },
    { id: "issue-year-id2", msg: "ID 2 issue year is required" }
    // Removed expiry date fields as they're not required (some IDs don't have expiration dates)
  ];
  id2Fields.forEach(({ id, msg }) => {
    const el = document.getElementById(id);
    if (!el || el.value.trim() === "") {
      showError(id, msg);
      isValid = false;
    }
  });
  // Required ID 2 file uploads - Front and Back
  const id2FileFields = [
    { id: "front-id-2", msg: "Front image of ID 2 is required" },
    { id: "back-id-2", msg: "Back image of ID 2 is required" }
  ];
  id2FileFields.forEach(({ id, msg }) => {
    const fileInput = document.getElementById(id);
    if (!fileInput || !fileInput.files.length) {
      showError(id, msg);
      isValid = false;
    }
  });
  
  // Check for duplicate ID types
  const id1Type = document.getElementById("select-id1").value;
  const id2Type = document.getElementById("select-id2").value;
  
  if (id1Type && id2Type && id1Type === id2Type) {
    showError("select-id2", "ID 2 type must be different from ID 1 type");
    isValid = false;
  }
  
  return isValid;
}

function getIdTypeCode(displayName) {
  // Normalize input
  const key = displayName.trim().toLowerCase();
  const map = {
    "philsys id": "PSY",
    "new philippine passport": "NPP",
    "old philippine passport": "OPP",
    "passport": "NPP",
    "driver's license": "DRV",
    "prc id": "PRC",
    "umid": "UMD",
    "sss id": "SSS",
    "postal id": "POS",
    "tin id": "TIN",
    "barangay certification / id": "BRG",
    "barangay id": "BRG",
    "gsis id": "GSI",
    "philhealth id": "PHL",
    "owwa id": "OWW",
    "ofw id": "OFW",
    "ibp id": "IBP",
    "company id": "COM",
    "marina id": "MAR",
    "voter's id": "VOT",
    "senior citizen id": "SEN",
    "seaman's book": "SEA",
    "government office and gocc id": "GOV",
    "gov't / gocc id": "GOV",
    "dswd certification": "DSW",
    "certification from the national council for the welfare of disabled persons": "NCW",
    "ncwdp certification": "NCW",
    "person with disability (pwd) id issued by national council on disability affairs": "PWD",
    "pwd id": "PWD"
  };
  return map[key] || key.substring(0,3).toUpperCase();
}

function handleProceedClick() {
  const proceedBtn = document.getElementById("proceed");
  if (proceedBtn) {
    proceedBtn.onclick = function (e) {
      // Save all relevant fields to localStorage here
      // ID 1
      const id1TypeRaw = document.getElementById("select-id1").value;
      let id1Type = id1TypeRaw ? getIdTypeCode(id1TypeRaw) : "";
      localStorage.setItem("id1Type", id1Type);
      localStorage.setItem("id1Number", document.getElementById("id1-num").value);
      localStorage.setItem("id1IssueMonth", document.getElementById("issue-month-id1").value);
      localStorage.setItem("id1IssueDay", document.getElementById("issue-day-id1").value);
      localStorage.setItem("id1IssueYear", document.getElementById("issue-year-id1").value);
      localStorage.setItem("id1ExpiryMonth", document.getElementById("month").value);
      localStorage.setItem("id1ExpiryDay", document.getElementById("day").value);
      localStorage.setItem("id1ExpiryYear", document.getElementById("year").value);
      // ID 2
      const id2TypeRaw = document.getElementById("select-id2").value;
      let id2Type = id2TypeRaw ? getIdTypeCode(id2TypeRaw) : "";
      localStorage.setItem("id2Type", id2Type);
      localStorage.setItem("id2Number", document.getElementById("id2-num").value);
      localStorage.setItem("id2IssueMonth", document.getElementById("issue-month-id2").value);
      localStorage.setItem("id2IssueDay", document.getElementById("issue-day-id2").value);
      localStorage.setItem("id2IssueYear", document.getElementById("issue-year-id2").value);
      localStorage.setItem("id2ExpiryMonth", document.getElementById("month-id2").value);
      localStorage.setItem("id2ExpiryDay", document.getElementById("day-id2").value);
      localStorage.setItem("id2ExpiryYear", document.getElementById("year-id2").value);
      // Images: only save file paths (from upload)
      ["front-id-1", "back-id-1", "front-id-2", "back-id-2", "supporting-doc"].forEach(id => {
        // Save the uploaded file path, not the input value
        const uploadedPath = localStorage.getItem(id + '_path') || null;
        localStorage.setItem(id + '_path', uploadedPath);
      });
      // If any required ID image path is missing, set to null
      if (!localStorage.getItem("front-id-1_path")) localStorage.setItem("front-id-1_path", null);
      if (!localStorage.getItem("back-id-1_path")) localStorage.setItem("back-id-1_path", null);
      if (!localStorage.getItem("front-id-2_path")) localStorage.setItem("front-id-2_path", null);
      if (!localStorage.getItem("back-id-2_path")) localStorage.setItem("back-id-2_path", null);
      if (!localStorage.getItem("supporting-doc_path")) localStorage.setItem("supporting-doc_path", null);
      if (validateForm()) {
        window.location.href = "registration8.html";
      }
    };
  }
}
