// Global variables
let currentCustomer = null;
let documentVerificationStatus = {
    id1: false,
    id2: false,
    documents: false
};
let validationResults = {};

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const employeeId = localStorage.getItem('employee_id');
    const employeeUsername = localStorage.getItem('employee_username');
    
    if (!employeeId || !employeeUsername) {
        window.location.href = 'admin-login.html';
        return;
    }

    // Get CIF number from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const cifNumber = urlParams.get('cif');
    
    if (!cifNumber) {
        showNotification('No customer CIF number provided', 'error');
        setTimeout(() => {
            window.location.href = 'admin-dashboard.html';
        }, 2000);
        return;
    }
    
    // Initialize page
    initializePage(cifNumber);
});

async function initializePage(cifNumber) {
    try {
        showLoadingOverlay(true);
        
        // Load customer data
        await loadCustomerDetails(cifNumber);
        
        // Load account context
        await loadAccountContext(cifNumber);
        
        // Load verification history
        await loadVerificationHistory(cifNumber);
        
        // Setup event handlers
        setupEventHandlers(cifNumber);
        
        // Start profile validation
        await validateCustomerProfile(cifNumber);
        
        // Check document verification status
        await checkDocumentVerificationStatus(cifNumber);
        
    } catch (error) {
        console.error('Error initializing page:', error);
        showNotification('Error loading customer verification page', 'error');
    } finally {
        showLoadingOverlay(false);
    }
}

async function loadCustomerDetails(cifNumber) {
    try {
        // Try to load from backend first
        const response = await fetch(`/api/admin/customers/${cifNumber}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const customerData = await response.json();
            currentCustomer = customerData.customer;
            populateCustomerDetails(customerData);
        } else {
            // Fallback to mock data for development
            console.log('Backend not available, using mock data');
            const mockCustomerData = createMockCustomerData(cifNumber);
            currentCustomer = mockCustomerData.customer;
            populateCustomerDetails(mockCustomerData);
        }
    } catch (error) {
        console.error('Error loading customer details:', error);
        // Use mock data as fallback
        const mockCustomerData = createMockCustomerData(cifNumber);
        currentCustomer = mockCustomerData.customer;
        populateCustomerDetails(mockCustomerData);
    }
}

function createMockCustomerData(cifNumber) {
    return {
        customer: {
            cif_number: cifNumber,
            customer_first_name: 'Chryshella Grace',
            customer_middle_name: 'P.',
            customer_last_name: 'Bautista',
            customer_suffix_name: '',
            birth_date: '1995-03-15',
            birth_country: 'Philippines',
            citizenship: 'Filipino',
            gender: 'Female',
            civil_status_description: 'Single',
            residency_status: 'Resident',
            customer_status: 'Pending Verification',
            customer_type: 'Individual',
            tax_identification_number: '123-456-789-000'
        },
        addresses: [
            {
                address_type_code: 'AD01',
                address_unit: '4B',
                address_building: 'Sunrise Towers',
                address_street: '123 Maple Street',
                address_subdivision: 'Green Valley',
                address_barangay: 'San Antonio',
                address_city: 'Makati',
                address_province: 'Metro Manila',
                address_country: 'Philippines',
                address_zip_code: '1200'
            },
            {
                address_type_code: 'AD02',
                address_unit: '',
                address_building: '',
                address_street: '456 Oak Avenue',
                address_subdivision: 'Blue Ridge',
                address_barangay: 'San Jose',
                address_city: 'Quezon City',
                address_province: 'Metro Manila',
                address_country: 'Philippines',
                address_zip_code: '1100'
            }
        ],
        contacts: [
            {
                contact_type_code: 'CT02',
                contact_type_description: 'Mobile',
                contact_value: '+63 917 123 4567'
            },
            {
                contact_type_code: 'CT03',
                contact_type_description: 'Landline',
                contact_value: '+63 2 123 4567'
            },
            {
                contact_type_code: 'CT01',
                contact_type_description: 'Email',
                contact_value: 'chryshella.bautista@email.com'
            }
        ],
        employment: [
            {
                employer_business_name: 'Tech Solutions Inc.',
                job_title: 'Software Developer',
                income_monthly_gross: '50000.00',
                work_email: 'cbautista@techsolutions.com',
                work_phone: '+63 2 987 6543'
            }
        ],
        fundSources: [
            {
                fund_source: 'Employment Income'
            }
        ],
        aliases: [],
        businessNature: [
            {
                business_nature: 'Information Technology'
            }
        ]
    };
}

function populateCustomerDetails(data) {
    const { customer, addresses, contacts, employment, fundSources, aliases, businessNature } = data;
    
    // Update customer name in header
    const customerNameEl = document.getElementById('customer-name');
    if (customerNameEl && customer) {
        const fullName = `${customer.customer_last_name}, ${customer.customer_first_name} ${customer.customer_middle_name || ''}`.trim();
        customerNameEl.textContent = fullName;
    }
    
    // Personal Information
    updateFieldValue('first-name', customer?.customer_first_name);
    updateFieldValue('middle-name', customer?.customer_middle_name);
    updateFieldValue('last-name', customer?.customer_last_name);
    updateFieldValue('suffix-name', customer?.customer_suffix_name);
    updateFieldValue('date-of-birth', formatDate(customer?.birth_date));
    updateFieldValue('country-of-birth', customer?.birth_country);
    updateFieldValue('citizenship', customer?.citizenship);
    updateFieldValue('gender', customer?.gender);
    updateFieldValue('civil-status', customer?.civil_status_description);
    updateFieldValue('residency', customer?.residency_status);
    
    // Contact Information
    if (contacts && contacts.length > 0) {
        const mobile = contacts.find(c => c.contact_type_code === 'CT02');
        const landline = contacts.find(c => c.contact_type_code === 'CT03');
        const email = contacts.find(c => c.contact_type_code === 'CT01');
        
        updateFieldValue('mobile-number', mobile?.contact_value);
        updateFieldValue('landline-number', landline?.contact_value);
        updateFieldValue('email-address', email?.contact_value);
    }
    
    // Address Information
    if (addresses && addresses.length > 0) {
        const homeAddress = addresses.find(a => a.address_type_code === 'AD01');
        const altAddress = addresses.find(a => a.address_type_code === 'AD02');
        
        if (homeAddress) {
            const homeAddressText = formatAddress(homeAddress);
            document.getElementById('home-address').textContent = homeAddressText;
        }
        
        if (altAddress) {
            const altAddressText = formatAddress(altAddress);
            document.getElementById('alternate-address').textContent = altAddressText;
            document.getElementById('alt-address-group').style.display = 'block';
        }
    }
    
    // Employment Information
    if (employment && employment.length > 0) {
        const primaryEmployment = employment[0];
        updateFieldValue('primary-employer', primaryEmployment?.employer_business_name);
        updateFieldValue('position', primaryEmployment?.job_title);
        updateFieldValue('monthly-income', formatCurrency(primaryEmployment?.income_monthly_gross));
        updateFieldValue('work-email', primaryEmployment?.work_email);
        updateFieldValue('work-phone', primaryEmployment?.work_phone);
    }
    
    // TIN Number
    updateFieldValue('tin-number', customer?.tax_identification_number);
    
    // Fund Sources
    if (fundSources && fundSources.length > 0) {
        updateFieldValue('source-of-funds', fundSources[0]?.fund_source);
    }
    
    // Business Nature
    if (businessNature && businessNature.length > 0) {
        updateFieldValue('business-nature', businessNature[0]?.business_nature);
    }
    
    // Aliases
    if (aliases && aliases.length > 0) {
        const alias = aliases[0];
        updateFieldValue('alias-first-name', alias?.alias_first_name);
        updateFieldValue('alias-middle-name', alias?.alias_middle_name);
        updateFieldValue('alias-last-name', alias?.alias_last_name);
        document.getElementById('alias-section').style.display = 'block';
    }
    
    // Calculate and show profile completeness
    calculateProfileCompleteness(data);
}

function updateFieldValue(fieldId, value) {
    const element = document.getElementById(fieldId);
    if (element) {
        element.textContent = value || 'N/A';
    }
}

function formatDate(dateString) {
    if (!dateString) return null;
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

function formatCurrency(amount) {
    if (!amount) return null;
    try {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(parseFloat(amount));
    } catch (error) {
        return amount;
    }
}

function formatAddress(address) {
    if (!address) return 'N/A';
    
    const parts = [
        address.address_unit,
        address.address_building,
        address.address_street,
        address.address_subdivision,
        address.address_barangay,
        address.address_city,
        address.address_province,
        address.address_country,
        address.address_zip_code
    ].filter(part => part && part.trim());
    
    return parts.length > 0 ? parts.join(', ') : 'N/A';
}

function calculateProfileCompleteness(data) {
    const { customer, addresses, contacts, employment } = data;
    
    let totalFields = 0;
    let completedFields = 0;
    
    // Essential personal information fields
    const personalFields = [
        customer?.customer_first_name,
        customer?.customer_last_name,
        customer?.birth_date,
        customer?.gender,
        customer?.citizenship
    ];
    
    personalFields.forEach(field => {
        totalFields++;
        if (field && field.trim()) completedFields++;
    });
    
    // Contact information
    const hasValidContacts = contacts && contacts.length > 0;
    totalFields++;
    if (hasValidContacts) completedFields++;
    
    // Address information
    const hasValidAddress = addresses && addresses.length > 0 && addresses[0]?.address_city;
    totalFields++;
    if (hasValidAddress) completedFields++;
    
    // Employment information
    const hasValidEmployment = employment && employment.length > 0 && employment[0]?.employer_business_name;
    totalFields++;
    if (hasValidEmployment) completedFields++;
    
    // TIN Number
    totalFields++;
    if (customer?.tax_identification_number) completedFields++;
    
    const completeness = Math.round((completedFields / totalFields) * 100);
    
    // Update UI
    const completenessBar = document.getElementById('completeness-fill');
    const completenessText = document.getElementById('completeness-text');
    
    if (completenessBar) {
        completenessBar.style.width = `${completeness}%`;
    }
    
    if (completenessText) {
        completenessText.textContent = `${completeness}% Complete`;
    }
}

async function loadAccountContext(cifNumber) {
    const loadingEl = document.getElementById('account-context-loading');
    const gridEl = document.getElementById('account-context-grid');
    const noAccountsEl = document.getElementById('no-accounts-message');
    
    try {
        const response = await fetch(`/api/customers/${cifNumber}/accounts`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const accountsData = await response.json();
            displayAccountContext(accountsData.accounts);
        } else if (response.status === 404) {
            showNoAccounts();
        } else {
            throw new Error('Failed to load accounts');
        }
    } catch (error) {
        console.error('Error loading account context:', error);
        // Show mock account for development
        const mockAccounts = [
            {
                account_number: 'ACC-2024-001',
                product_type: 'Deposits',
                account_status: 'Active',
                account_open_date: '2023-01-15',
                relationship_type: 'Primary Account Holder'
            }
        ];
        displayAccountContext(mockAccounts);
    } finally {
        if (loadingEl) loadingEl.style.display = 'none';
    }
}

function displayAccountContext(accounts) {
    const gridEl = document.getElementById('account-context-grid');
    const noAccountsEl = document.getElementById('no-accounts-message');
    
    if (!accounts || accounts.length === 0) {
        showNoAccounts();
        return;
    }
    
    gridEl.innerHTML = '';
    
    accounts.forEach(account => {
        const accountCard = createAccountCard(account);
        gridEl.appendChild(accountCard);
    });
    
    gridEl.style.display = 'grid';
    if (noAccountsEl) noAccountsEl.style.display = 'none';
}

function createAccountCard(account) {
    const card = document.createElement('div');
    card.className = 'account-card';
    
    const openDate = formatDate(account.account_open_date);
    const closeDate = account.account_close_date ? formatDate(account.account_close_date) : null;
    
    card.innerHTML = `
        <div class="account-number">${account.account_number}</div>
        <div class="product-type">${account.product_type}</div>
        <div class="account-status ${account.account_status.toLowerCase()}">${account.account_status}</div>
        <div class="account-dates">
            <div>Opened: ${openDate}</div>
            ${closeDate ? `<div>Closed: ${closeDate}</div>` : ''}
        </div>
        <div class="account-relationship">${account.relationship_type}</div>
    `;
    
    return card;
}

function showNoAccounts() {
    const gridEl = document.getElementById('account-context-grid');
    const noAccountsEl = document.getElementById('no-accounts-message');
    
    if (gridEl) gridEl.style.display = 'none';
    if (noAccountsEl) noAccountsEl.style.display = 'block';
}

async function validateCustomerProfile(cifNumber) {
    // Simulate profile validation process
    const validationFields = [
        { field: 'name-status', label: 'Full Name', delay: 500 },
        { field: 'dob-status', label: 'Date of Birth', delay: 800 },
        { field: 'personal-details-status', label: 'Personal Details', delay: 1100 },
        { field: 'mobile-status', label: 'Mobile Number', delay: 1400 },
        { field: 'email-status', label: 'Email Address', delay: 1700 },
        { field: 'address-status', label: 'Address', delay: 2000 },
        { field: 'employment-status', label: 'Employment', delay: 2300 },
        { field: 'income-status', label: 'Income', delay: 2600 },
        { field: 'tin-status', label: 'TIN Number', delay: 2900 }
    ];
    
    validationFields.forEach(({ field, label, delay }) => {
        setTimeout(() => {
            validateField(field, label);
        }, delay);
    });
    
    // Update overall validation status after all fields
    setTimeout(() => {
        updateOverallValidationStatus();
    }, 3200);
}

function validateField(fieldId, label) {
    const statusEl = document.getElementById(fieldId);
    if (!statusEl) return;
    
    // Get the actual field value for validation
    let isValid = false;
    
    switch (fieldId) {
        case 'name-status':
            const firstName = document.getElementById('first-name')?.textContent;
            const lastName = document.getElementById('last-name')?.textContent;
            isValid = firstName && firstName !== 'N/A' && lastName && lastName !== 'N/A';
            break;
        case 'dob-status':
            const dob = document.getElementById('date-of-birth')?.textContent;
            isValid = dob && dob !== 'N/A';
            break;
        case 'personal-details-status':
            const gender = document.getElementById('gender')?.textContent;
            const civilStatus = document.getElementById('civil-status')?.textContent;
            isValid = gender && gender !== 'N/A' && civilStatus && civilStatus !== 'N/A';
            break;
        case 'mobile-status':
            const mobile = document.getElementById('mobile-number')?.textContent;
            isValid = mobile && mobile !== 'N/A' && mobile.includes('+63');
            break;
        case 'email-status':
            const email = document.getElementById('email-address')?.textContent;
            isValid = email && email !== 'N/A' && email.includes('@');
            break;
        case 'address-status':
            const address = document.getElementById('home-address')?.textContent;
            isValid = address && address !== 'N/A' && address.length > 10;
            break;
        case 'employment-status':
            const employer = document.getElementById('primary-employer')?.textContent;
            isValid = employer && employer !== 'N/A';
            break;
        case 'income-status':
            const income = document.getElementById('monthly-income')?.textContent;
            isValid = income && income !== 'N/A';
            break;
        case 'tin-status':
            const tin = document.getElementById('tin-number')?.textContent;
            isValid = tin && tin !== 'N/A';
            break;
        default:
            isValid = Math.random() > 0.3; // Random for other fields
    }
    
    validationResults[fieldId] = isValid;
    
    statusEl.className = `item-status ${isValid ? 'valid' : 'warning'}`;
    statusEl.textContent = isValid ? 'Valid' : 'Needs Review';
    
    // Update parent validation card status
    updateValidationCardStatus(fieldId);
}

function updateValidationCardStatus(fieldId) {
    let cardId;
    if (['name-status', 'dob-status', 'personal-details-status'].includes(fieldId)) {
        cardId = 'personal-info-validation';
    } else if (['mobile-status', 'email-status', 'address-status'].includes(fieldId)) {
        cardId = 'contact-info-validation';
    } else if (['employment-status', 'income-status', 'tin-status'].includes(fieldId)) {
        cardId = 'employment-validation';
    }
    
    if (!cardId) return;
    
    const card = document.getElementById(cardId);
    const statusEl = card?.querySelector('.validation-status');
    if (!statusEl) return;
    
    // Check if all fields in this card are validated
    const cardFields = getCardFields(cardId);
    const allFieldsValidated = cardFields.every(field => validationResults.hasOwnProperty(field));
    const allFieldsValid = cardFields.every(field => validationResults[field] === true);
    const hasWarnings = cardFields.some(field => validationResults[field] === false);
    
    if (allFieldsValidated) {
        if (allFieldsValid) {
            statusEl.className = 'validation-status valid';
            statusEl.innerHTML = '<span class="status-icon">✓</span><span class="status-text">Valid</span>';
        } else if (hasWarnings) {
            statusEl.className = 'validation-status warning';
            statusEl.innerHTML = '<span class="status-icon">⚠</span><span class="status-text">Needs Review</span>';
        } else {
            statusEl.className = 'validation-status invalid';
            statusEl.innerHTML = '<span class="status-icon">✗</span><span class="status-text">Invalid</span>';
        }
    }
}

function getCardFields(cardId) {
    switch (cardId) {
        case 'personal-info-validation':
            return ['name-status', 'dob-status', 'personal-details-status'];
        case 'contact-info-validation':
            return ['mobile-status', 'email-status', 'address-status'];
        case 'employment-validation':
            return ['employment-status', 'income-status', 'tin-status'];
        default:
            return [];
    }
}

function updateOverallValidationStatus() {
    const allValid = Object.values(validationResults).every(result => result === true);
    const hasWarnings = Object.values(validationResults).some(result => result === false);
    
    // Enable/disable approval button based on validation
    const approveBtn = document.getElementById('approve-btn');
    if (approveBtn) {
        if (allValid) {
            approveBtn.disabled = false;
            approveBtn.style.opacity = '1';
        } else {
            approveBtn.disabled = true;
            approveBtn.style.opacity = '0.6';
        }
    }
}

async function checkDocumentVerificationStatus(cifNumber) {
    try {
        // Load saved verification status
        const savedStatus = localStorage.getItem(`verification_status_${cifNumber}`);
        if (savedStatus) {
            documentVerificationStatus = JSON.parse(savedStatus);
        }
        
        // Update document validation card
        const docValidationCard = document.getElementById('document-validation');
        const docStatusEl = docValidationCard?.querySelector('.validation-status');
        const idStatusEl = document.getElementById('id-documents-status');
        const supportingStatusEl = document.getElementById('supporting-docs-status');
        
        const allDocsVerified = Object.values(documentVerificationStatus).every(status => status === true);
        
        if (allDocsVerified) {
            if (docStatusEl) {
                docStatusEl.className = 'validation-status valid';
                docStatusEl.innerHTML = '<span class="status-icon">✓</span><span class="status-text">Verified</span>';
            }
            if (idStatusEl) {
                idStatusEl.className = 'item-status valid';
                idStatusEl.textContent = 'Verified';
            }
            if (supportingStatusEl) {
                supportingStatusEl.className = 'item-status valid';
                supportingStatusEl.textContent = 'Verified';
            }
            
            // Enable approval if all validations are good
            updateApprovalButtonStatus();
        } else {
            if (idStatusEl) {
                idStatusEl.className = 'item-status pending';
                idStatusEl.textContent = documentVerificationStatus.id1 && documentVerificationStatus.id2 ? 'Verified' : 'Not Reviewed';
            }
            if (supportingStatusEl) {
                supportingStatusEl.className = 'item-status pending';
                supportingStatusEl.textContent = documentVerificationStatus.documents ? 'Verified' : 'Not Reviewed';
            }
        }
        
    } catch (error) {
        console.error('Error checking document verification status:', error);
    }
}

function updateApprovalButtonStatus() {
    const approveBtn = document.getElementById('approve-btn');
    if (!approveBtn) return;
    
    const allDocsVerified = Object.values(documentVerificationStatus).every(status => status === true);
    const profileValid = Object.values(validationResults).every(result => result === true);
    
    if (allDocsVerified && profileValid) {
        approveBtn.disabled = false;
        approveBtn.style.opacity = '1';
        
        // Update verification status
        const statusIndicator = document.querySelector('.status-indicator');
        if (statusIndicator) {
            statusIndicator.className = 'status-indicator';
            statusIndicator.style.background = '#d4edda';
            statusIndicator.style.color = '#155724';
            statusIndicator.style.border = '1px solid #c3e6cb';
            statusIndicator.textContent = 'Ready for Approval';
        }
    }
}

async function loadVerificationHistory(cifNumber) {
    const historyContainer = document.getElementById('verification-history');
    
    try {
        const response = await fetch(`/api/admin/customers/${cifNumber}/verification-history`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const historyData = await response.json();
            displayVerificationHistory(historyData.history);
        } else {
            // Show mock history for development
            const mockHistory = [
                {
                    action: 'Profile Created',
                    comment: 'Customer registration completed',
                    employee_name: 'System',
                    timestamp: new Date(Date.now() - 86400000).toISOString()
                },
                {
                    action: 'Documents Uploaded',
                    comment: 'ID documents and supporting files uploaded',
                    employee_name: 'System',
                    timestamp: new Date(Date.now() - 43200000).toISOString()
                }
            ];
            displayVerificationHistory(mockHistory);
        }
    } catch (error) {
        console.error('Error loading verification history:', error);
        historyContainer.innerHTML = '<div class="history-loading"><p>Error loading verification history</p></div>';
    }
}

function displayVerificationHistory(history) {
    const historyContainer = document.getElementById('verification-history');
    
    if (!history || history.length === 0) {
        historyContainer.innerHTML = '<div class="history-loading"><p>No verification history available</p></div>';
        return;
    }
    
    historyContainer.innerHTML = '';
    
    history.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const timestamp = new Date(item.timestamp).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        historyItem.innerHTML = `
            <div class="history-content">
                <div class="history-action">${item.action}</div>
                <div class="history-comment">${item.comment}</div>
                <div class="history-details">By: ${item.employee_name}</div>
            </div>
            <div class="history-timestamp">${timestamp}</div>
        `;
        
        historyContainer.appendChild(historyItem);
    });
}

function setupEventHandlers(cifNumber) {
    // Back button
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.onclick = () => {
            window.location.href = 'admin-dashboard.html';
        };
    }
    
    // View documents button
    const viewDocsBtn = document.getElementById('view-documents-btn');
    if (viewDocsBtn) {
        viewDocsBtn.onclick = () => {
            window.location.href = `admin-customer-verification2.html?cif=${cifNumber}`;
        };
    }
    
    // Verification decision buttons
    const approveBtn = document.getElementById('approve-btn');
    const rejectBtn = document.getElementById('reject-btn');
    
    if (approveBtn) {
        approveBtn.onclick = () => showVerificationModal('approve', cifNumber);
    }
    
    if (rejectBtn) {
        rejectBtn.onclick = () => showVerificationModal('reject', cifNumber);
    }
}

function showVerificationModal(action, cifNumber) {
    const modal = document.getElementById('verification-modal');
    const modalTitle = document.getElementById('modal-title');
    const decisionSummary = document.getElementById('decision-summary');
    const confirmBtn = document.getElementById('confirm-verification-btn');
    
    if (!modal) return;
    
    // Set modal title
    modalTitle.textContent = action === 'approve' ? 'Approve Verification' : 'Reject Verification';
    
    // Generate decision summary
    const profileCompleteness = document.getElementById('completeness-text')?.textContent || 'Unknown';
    const docsVerified = Object.values(documentVerificationStatus).every(status => status === true);
    
    decisionSummary.innerHTML = `
        <div class="summary-item">
            <span class="summary-label">Customer:</span>
            <span class="summary-value">${currentCustomer?.customer_first_name} ${currentCustomer?.customer_last_name}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">CIF Number:</span>
            <span class="summary-value">${cifNumber}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Profile Completeness:</span>
            <span class="summary-value">${profileCompleteness}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Documents Verified:</span>
            <span class="summary-value">${docsVerified ? 'Yes' : 'No'}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Action:</span>
            <span class="summary-value">${action.toUpperCase()}</span>
        </div>
    `;
    
    // Set confirm button handler
    confirmBtn.onclick = () => confirmVerificationDecision(action, cifNumber);
    
    // Show modal
    modal.style.display = 'flex';
}

function closeVerificationModal() {
    const modal = document.getElementById('verification-modal');
    const commentTextarea = document.getElementById('verification-comment');
    
    if (modal) modal.style.display = 'none';
    if (commentTextarea) commentTextarea.value = '';
}

async function confirmVerificationDecision(action, cifNumber) {
    const comment = document.getElementById('verification-comment')?.value;
    const employeeId = localStorage.getItem('employee_id');
    
    try {
        showLoadingOverlay(true);
        
        const response = await fetch(`/api/admin/customers/${cifNumber}/verify`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: action,
                comment: comment,
                employee_id: employeeId,
                verification_details: {
                    profile_validation: validationResults,
                    document_verification: documentVerificationStatus
                }
            })
        });
        
        if (response.ok) {
            // Clear stored verification status
            localStorage.removeItem(`verification_status_${cifNumber}`);
            localStorage.removeItem(`documents_verified_${cifNumber}`);
            
            showNotification(`Customer verification ${action}d successfully!`, 'success');
            closeVerificationModal();
            
            setTimeout(() => {
                window.location.href = 'admin-dashboard.html';
            }, 2000);
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Verification failed');
        }
    } catch (error) {
        console.error('Error processing verification:', error);
        showNotification(`Error: ${error.message}`, 'error');
    } finally {
        showLoadingOverlay(false);
    }
}

// Utility Functions
function showLoadingOverlay(show) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}

function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const messageElement = document.createElement('div');
    messageElement.className = 'notification-message';
    messageElement.textContent = message;
    
    notification.appendChild(messageElement);
    container.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    const hideDelay = type === 'warning' ? 7000 : 5000;
    
    setTimeout(() => {
        hideNotification(notification);
    }, hideDelay);

    notification.addEventListener('click', () => {
        hideNotification(notification);
    });

    return notification;
}

function hideNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// Global function for logout
function logout() {
    localStorage.clear();
    window.location.href = 'admin-login.html';
}

// Listen for document verification updates from localStorage
window.addEventListener('storage', function(e) {
    if (e.key && e.key.includes('verification_status_')) {
        const cifNumber = new URLSearchParams(window.location.search).get('cif');
        if (cifNumber) {
            checkDocumentVerificationStatus(cifNumber);
        }
    }
});
