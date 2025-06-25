document.addEventListener("DOMContentLoaded", () => {
  const username = document.getElementById("username");
  const password = document.getElementById("password");
  const errorMessages = document.querySelectorAll(".error-message");
  const proceedBtn = document.getElementById("proceed");

  function isPasswordValid(pw) {
    const lengthOK = pw.length >= 8 && pw.length <= 30;
    const hasNumber = /\d/.test(pw);
    const hasSpecial = /[-!@#$%^&*_+]/.test(pw);
    const hasUpper = /[A-Z]/.test(pw);
    const hasLower = /[a-z]/.test(pw);
    const noCommonSeq = !/(abc|123|9999|password|qwerty)/i.test(pw);
    return (
      lengthOK && hasNumber && hasSpecial && hasUpper && hasLower && noCommonSeq
    );
  }

  function validate() {
    const uname = username.value.trim();
    const pw = password.value.trim();
    let isValid = true;

    errorMessages.forEach((msg) => (msg.textContent = ""));

    username.classList.remove("error");
    password.classList.remove("error");

    if (uname === "") {
      errorMessages[0].textContent = "Username is required.";
      username.classList.add("error");
      isValid = false;
    }

    if (pw === "") {
      errorMessages[1].textContent = "Password is required.";
      password.classList.add("error");
      isValid = false;
    } else if (!isPasswordValid(pw)) {
      errorMessages[1].textContent =
        "Password does not meet the required criteria.";
      password.classList.add("error");
      isValid = false;
    }

    return isValid;
  }

  username.addEventListener("input", validate);
  password.addEventListener("input", validate);

  function collectRegistrationData() {
    const keyMap = {
      'customer_type': 'customer_type',
      'product_type': 'product_type',
      'customer_first_name': 'customer_first_name',
      'customer_middle_name': 'customer_middle_name',
      'customer_last_name': 'customer_last_name',
      'customer_suffix_name': 'customer_suffix_name',
      'residency_status': 'residency_status',
      'tax_identification_number': 'tax_identification_number',
      'username': 'customer_username',
      'password': 'customer_password',
      'birth_date': 'birth_date',
      'gender': 'gender',
      'civil_status_code': 'civil_status_code',
      'birth_country': 'birth_country',
      'citizenship': 'citizenship',
      'address_unit': 'address_unit',
      'address_building': 'address_building',
      'address_street': 'address_street',
      'address_subdivision': 'address_subdivision',
      'address_barangay': 'address_barangay',
      'address_city': 'address_city',
      'address_province': 'address_province',
      'address_country': 'address_country',
      'address_zip_code': 'address_zip_code',
      'phoneNumber': 'contact_value_phone',
      'emailAddress': 'contact_value_email',
      'homeCode': 'home_code',
      'landlineNumber': 'landline_number',
      'fund_source_code': 'fund_source_code',
      'id1Type': 'id1Type',
      'id1Number': 'id1Number',
      'id1FrontImagePath': 'id1FrontImagePath',
      'id1BackImagePath': 'id1BackImagePath',
      'id2Type': 'id2Type',
      'id2Number': 'id2Number',
      'id2FrontImagePath': 'id2FrontImagePath',
      'id2BackImagePath': 'id2BackImagePath',
      'id1IssueMonth': 'id1IssueMonth',
      'id1IssueDay': 'id1IssueDay',
      'id1IssueYear': 'id1IssueYear',
      'id1ExpiryMonth': 'id1ExpiryMonth',
      'id1ExpiryDay': 'id1ExpiryDay',
      'id1ExpiryYear': 'id1ExpiryYear',
      'id2IssueMonth': 'id2IssueMonth',
      'id2IssueDay': 'id2IssueDay',
      'id2IssueYear': 'id2IssueYear',
      'id2ExpiryMonth': 'id2ExpiryMonth',
      'id2ExpiryDay': 'id2ExpiryDay',
      'id2ExpiryYear': 'id2ExpiryYear',
      'supporting-doc_path': 'supportingDocPath',
      'currentlyEmployed': 'currentlyEmployed',
      'business-nature': 'business_nature',
      'business-nature-multi': 'business_nature_multi',
      'position': 'position',
      'gross-income': 'gross_income',
      'work': 'work_country_code',
      'work-email': 'work_email',
      'business-number': 'business_number',
      'tin': 'tax_identification_number',
      'primary-employer': 'primary_employer',

      'purpose-political': 'reg_political_affiliation',
      'purpose_fatca': 'reg_fatca',
      'purpose-dnfbp': 'reg_dnfbp',
      'purpose_online_gaming': 'reg_online_gaming',
      'purpose_beneficial_owner': 'reg_beneficial_owner',
      'reg_political_affiliation': 'reg_political_affiliation',
      'reg_fatca': 'reg_fatca',
      'reg_dnfbp': 'reg_dnfbp',
      'reg_online_gaming': 'reg_online_gaming',
      'reg_beneficial_owner': 'reg_beneficial_owner',
      'remittance-country': 'remittance_country',
      'remittance_country': 'remittance_country',
      'remittance-purpose': 'remittance_purpose',
      'remittance_purpose': 'remittance_purpose',
      'work-unit': 'work_unit',
      'work-building': 'work_building',
      'work-street': 'work_street',
      'work-subdivision': 'work_subdivision',
      'work-barangay': 'work_barangay',
      'work-city': 'work_city',
      'work-province': 'work_province',
      'work-country': 'work_country',
      'work-zip-code': 'work_zip_code',
      'alias_first_name': 'alias_first_name',
      'alias_middle_name': 'alias_middle_name',
      'alias_last_name': 'alias_last_name',
      'alias_suffix_name': 'alias_suffix_name',
      'alias_id1_type': 'alias_id1_type',
      'alias_id1_number': 'alias_id1_number',
      'alias_id1_issue_month': 'alias_id1_issue_month',
      'alias_id1_issue_year': 'alias_id1_issue_year',
      'alias_id2_type': 'alias_id2_type',
      'alias_id2_number': 'alias_id2_number',
      'alias_id2_issue_month': 'alias_id2_issue_month',
      'alias_id2_issue_year': 'alias_id2_issue_year',
      'supportingDocPath': 'alias_doc_storage',
    };
    const registrationData = {};
    let fundSourceCode = null;
    let remittanceCountry = null;
    let remittancePurpose = null;
    let residencyStatusRaw = null;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key === 'cif_number') continue;
      if (key.endsWith('_image')) continue;
      if (key === 'front-id-1_path') registrationData['id1FrontImagePath'] = localStorage.getItem(key);
      else if (key === 'back-id-1_path') registrationData['id1BackImagePath'] = localStorage.getItem(key);
      else if (key === 'front-id-2_path') registrationData['id2FrontImagePath'] = localStorage.getItem(key);
      else if (key === 'back-id-2_path') registrationData['id2BackImagePath'] = localStorage.getItem(key);
      else if (key === 'supporting-doc_path') registrationData['supportingDocPath'] = localStorage.getItem(key);
      else if (key === 'fund_source_code') fundSourceCode = localStorage.getItem(key);
      else if (key === 'remittance-country' || key === 'remittance_country') remittanceCountry = localStorage.getItem(key);
      else if (key === 'remittance-purpose' || key === 'remittance_purpose') remittancePurpose = localStorage.getItem(key);
      else if (key === 'residency_status') residencyStatusRaw = localStorage.getItem(key);
      else if (keyMap[key]) registrationData[keyMap[key]] = localStorage.getItem(key);
      else registrationData[key] = localStorage.getItem(key);
    }
    // Residency status mapping (frontend value to allowed DB value)
    if (residencyStatusRaw) {
      let mappedResidency = null;
      switch (residencyStatusRaw.trim().toLowerCase()) {
        case 'foreign national':
          mappedResidency = 'Non-Resident'; break;
        case 'citizen':
        case 'permanent resident':
        case 'temporary resident':
        case 'dual citizen':
        case 'dual':
        case 'refugee':
        case 'student visa holder':
        case 'work visa holder':
        case 'undocumented':
        case 'other':
        default:
          mappedResidency = 'Resident';
      }
      registrationData['residency_status'] = mappedResidency;
    }

    // Remittance logic: check for 'remittances' in any fund source field
    let hasRemittances = false;
    const fundSources = [
      registrationData['source-of-funds'],
      registrationData['source-of-funds-multi'],
      registrationData['fund_source_code']
    ];
    for (const src of fundSources) {
      if (src && src.toLowerCase().includes('remittances')) {
        hasRemittances = true;
        break;
      }
      // Also check for code 'FS004' if used (remittances code)
      if (src && src.toUpperCase().includes('FS004')) {
        hasRemittances = true;
        break;
      }
    }
    if (hasRemittances) {
      registrationData['remittance_country'] = remittanceCountry || null;
      registrationData['remittance_purpose'] = remittancePurpose || null;
    } else {
      registrationData['remittance_country'] = null;
      registrationData['remittance_purpose'] = null;
    }
    // Add alternate address and checkbox fields
    registrationData['alternateAddressSameAsHome'] = localStorage.getItem('alternateAddressSameAsHome') || 'No';
    registrationData['altUnit'] = localStorage.getItem('altUnit') || '';
    registrationData['altBuilding'] = localStorage.getItem('altBuilding') || '';
    registrationData['altStreet'] = localStorage.getItem('altStreet') || '';
    registrationData['altSubdivision'] = localStorage.getItem('altSubdivision') || '';
    registrationData['altBarangay'] = localStorage.getItem('altBarangay') || '';
    registrationData['altCity'] = localStorage.getItem('altCity') || '';
    registrationData['altProvince'] = localStorage.getItem('altProvince') || '';
    registrationData['altCountry'] = localStorage.getItem('altCountry') || '';
    registrationData['altZip'] = localStorage.getItem('altZip') || '';
    // REMOVE biometric_type from registrationData if present
    if ('biometric_type' in registrationData) delete registrationData['biometric_type'];
    
    // Add default values for required fields if missing
    if (!registrationData.customer_first_name) {
      registrationData.customer_first_name = localStorage.getItem('first_name') || localStorage.getItem('firstName') || 'Test';
    }
    if (!registrationData.customer_last_name) {
      registrationData.customer_last_name = localStorage.getItem('last_name') || localStorage.getItem('lastName') || 'User';
    }
    if (!registrationData.birth_date) {
      registrationData.birth_date = localStorage.getItem('birth_date') || localStorage.getItem('birthDate') || '1990-01-01';
    }
    if (!registrationData.gender) {
      registrationData.gender = localStorage.getItem('gender') || 'Male';
    }
    if (!registrationData.civil_status_code) {
      registrationData.civil_status_code = localStorage.getItem('civil_status_code') || localStorage.getItem('civil_status') || 'CS01';
    }
    
    // Ensure civil status is a valid code format
    const civilStatus = registrationData.civil_status_code;
    if (civilStatus && !civilStatus.match(/^CS\d{2}$/)) {
      // If it's not in CSxx format, map common values
      const civilStatusMap = {
        'single': 'CS01',
        'married': 'CS02',
        'legally separated': 'CS03',
        'divorced': 'CS04',
        'annulled': 'CS05',
        'widowed': 'CS06'
      };
      registrationData.civil_status_code = civilStatusMap[civilStatus.toLowerCase()] || 'CS01';
    }
    if (!registrationData.birth_country) {
      registrationData.birth_country = localStorage.getItem('birth_country') || 'Philippines';
    }
    if (!registrationData.citizenship) {
      registrationData.citizenship = localStorage.getItem('citizenship') || 'Filipino';
    }
    if (!registrationData.address_barangay) {
      registrationData.address_barangay = localStorage.getItem('address_barangay') || localStorage.getItem('barangay') || 'Test Barangay';
    }
    if (!registrationData.address_city) {
      registrationData.address_city = localStorage.getItem('address_city') || localStorage.getItem('city') || 'Test City';
    }
    if (!registrationData.address_province) {
      registrationData.address_province = localStorage.getItem('address_province') || localStorage.getItem('province') || 'Test Province';
    }
    if (!registrationData.address_country) {
      registrationData.address_country = localStorage.getItem('address_country') || localStorage.getItem('country') || 'Philippines';
    }
    if (!registrationData.address_zip_code) {
      registrationData.address_zip_code = localStorage.getItem('address_zip_code') || localStorage.getItem('zip-code') || '12345';
    }
    
    // Add customer type if missing
    if (!registrationData.customer_type) {
      registrationData.customer_type = localStorage.getItem('customer_type') || localStorage.getItem('customerType') || 'Account Owner';
    }
    
    // Add default ID information if missing (for testing purposes)
    if (!registrationData.id1Type) {
      registrationData.id1Type = localStorage.getItem('id1Type') || 'DRV'; // Driver's License
    }
    if (!registrationData.id1Number) {
      registrationData.id1Number = localStorage.getItem('id1Number') || 'TEST-ID-001';
    }
    if (!registrationData.id2Type) {
      registrationData.id2Type = localStorage.getItem('id2Type') || 'SSS'; // SSS ID
    }
    if (!registrationData.id2Number) {
      registrationData.id2Number = localStorage.getItem('id2Number') || 'TEST-ID-002';
    }
    
    // Ensure fund source is properly formatted
    const fundSourceFields = ['fund_source_code', 'source-of-funds', 'source-of-funds-multi'];
    for (const field of fundSourceFields) {
      if (registrationData[field]) {
        const fundSource = registrationData[field];
        // If it's not already a code (FSxxx format), map common values
        if (fundSource && !fundSource.match(/^FS\d{3}$/)) {
          const fundSourceMap = {
            'employed - fixed income': 'FS001',
            'employed - variable income': 'FS002', 
            'self-employed - business income': 'FS003',
            'remittances': 'FS004',
            'pension': 'FS005',
            'personal savings / retirement proceeds': 'FS006',
            'allowance': 'FS007',
            'inheritance': 'FS008',
            'investment/dividend income': 'FS009',
            'rental income': 'FS010',
            'sale of asset / property': 'FS011',
            'other sources': 'FS012',
            'employed': 'FS001',
            'self-employed': 'FS003',
            'remittance': 'FS004',
            'savings': 'FS006',
            'investment': 'FS009',
            'rental': 'FS010',
            'other': 'FS012'
          };
          registrationData[field] = fundSourceMap[fundSource.toLowerCase()] || 'FS001';
        }
      }
    }
    
    // Add default fund source if none exists
    if (!registrationData.fund_source_code && !registrationData['source-of-funds'] && !registrationData['source-of-funds-multi']) {
      registrationData.fund_source_code = 'FS001'; // Default to Employed - Fixed Income
    }
    
    // Add default employment data if missing
    if (!registrationData.currentlyEmployed) {
      registrationData.currentlyEmployed = localStorage.getItem('currentlyEmployed') || 'Yes';
    }
    if (!registrationData.position) {
      registrationData.position = localStorage.getItem('position') || 'Software Developer';
    }
    if (!registrationData['gross-income']) {
      registrationData['gross-income'] = localStorage.getItem('gross-income') || localStorage.getItem('grossIncome') || '50000';
    }
    if (!registrationData['primary-employer']) {
      registrationData['primary-employer'] = localStorage.getItem('primary-employer') || localStorage.getItem('primaryEmployer') || 'Test Company Inc.';
    }
    
    // Add default contact information if missing
    if (!registrationData.phoneNumber && !registrationData.contact_value_phone) {
      registrationData.phoneNumber = localStorage.getItem('phoneNumber') || localStorage.getItem('phone') || '09123456789';
    }
    if (!registrationData.emailAddress && !registrationData.contact_value_email) {
      registrationData.emailAddress = localStorage.getItem('emailAddress') || localStorage.getItem('email') || 'test@example.com';
    }
    
    return registrationData;
  }

  // Comprehensive validation function
  function validateCompleteRegistrationData(data) {
    const errors = [];
    const warnings = [];
    
    // Required personal information
    if (!data.customer_first_name || data.customer_first_name.trim() === '') {
      errors.push('First name is required');
    }
    if (!data.customer_last_name || data.customer_last_name.trim() === '') {
      errors.push('Last name is required');
    }
    if (!data.birth_date) {
      warnings.push('Birth date is missing');
    }
    if (!data.gender) {
      warnings.push('Gender is missing');
    }
    if (!data.customer_username || data.customer_username.trim() === '') {
      errors.push('Username is required');
    }
    if (!data.customer_password || data.customer_password.trim() === '') {
      errors.push('Password is required');
    }
    
    // Required address information
    if (!data.address_barangay || data.address_barangay.trim() === '') {
      warnings.push('Barangay is missing');
    }
    if (!data.address_city || data.address_city.trim() === '') {
      warnings.push('City is missing');
    }
    if (!data.address_province || data.address_province.trim() === '') {
      warnings.push('Province is missing');
    }
    if (!data.address_country || data.address_country.trim() === '') {
      warnings.push('Country is missing');
    }
    if (!data.address_zip_code || data.address_zip_code.trim() === '') {
      warnings.push('ZIP code is missing');
    }
    
    // File upload validation (warnings only for now)
    const requiredFiles = ['id1FrontImagePath', 'id1BackImagePath', 'id2FrontImagePath', 'id2BackImagePath'];
    const missingFiles = requiredFiles.filter(field => !data[field] || data[field] === 'null' || data[field].trim() === '');
    if (missingFiles.length > 0) {
      warnings.push(`Missing uploaded files: ${missingFiles.join(', ')}`);
    }
    
    // ID information validation (warnings only for now)
    if (!data.id1Type || !data.id1Number) {
      warnings.push('ID 1 information is incomplete');
    }
    if (!data.id2Type || !data.id2Number) {
      warnings.push('ID 2 information is incomplete');
    }
    
    // Log warnings for debugging
    if (warnings.length > 0) {
      console.warn('Registration warnings:', warnings);
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors,
      warnings: warnings
    };
  }

  if (proceedBtn) {
    proceedBtn.onclick = function (e) {
      e.preventDefault(); // Prevent any default form submission
      
      // Save username and password to localStorage first
      localStorage.setItem("customer_username", username.value.trim());
      localStorage.setItem("customer_password", password.value.trim());
      
      // Validate current form fields
      if (!validate()) {
        return;
      }
      
      
      
      // Collect all registration data
      const registrationData = collectRegistrationData();
      
      
      // Validate complete data before submission
      const validationResult = validateCompleteRegistrationData(registrationData);
      
      if (!validationResult.isValid) {
        console.error('Validation errors:', validationResult.errors);
        alert('Registration incomplete:\n\n' + validationResult.errors.join('\n'));
        return;
      }
      
      
      
      // Show loading state
      proceedBtn.disabled = true;
      proceedBtn.textContent = 'Submitting...';
      
      // Debug alias documentation fields
      console.log('Alias documentation debug:', {
        alias_id1_type: registrationData.alias_id1_type,
        alias_id1_number: registrationData.alias_id1_number,
        alias_id2_type: registrationData.alias_id2_type,
        alias_id2_number: registrationData.alias_id2_number,
        alias_doc_storage: registrationData.alias_doc_storage,
        supportingDocPath: localStorage.getItem('supportingDocPath')
      });
      
      // Submit registration data
      fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(registrationData),
      })
      .then(async (res) => {
        
        
        let data;
        try {
          data = await res.json();
          
        } catch (e) {
          console.error('Failed to parse server response:', e);
          data = { message: 'Invalid server response' };
        }
        
        if (!res.ok) {
          throw new Error(data.message || `Server error: ${res.status} ${res.statusText}`);
        }
        
        if (data.cif_number) {
          
          localStorage.setItem('cif_number', data.cif_number);
          // Success - redirect to final page
          window.location.href = 'registration13.html';
        } else {
          throw new Error(data.message || 'Registration succeeded but no CIF number returned');
        }
      })
      .catch((err) => {
        console.error('Registration error:', err);
        alert('Registration failed: ' + err.message);
        
        // Reset button state
        proceedBtn.disabled = false;
        proceedBtn.textContent = 'Proceed';
      });
    };
  }
});
