// Enhanced admin customer profile management
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const employeeId = localStorage.getItem('employee_id');
    const employeeUsername = localStorage.getItem('employee_username');
    
    if (!employeeId || !employeeUsername) {
        window.location.href = 'admin-login.html';
        return;
    }

    // Get CIF number from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const cifNumber = urlParams.get('cif');
    
    if (cifNumber) {
        loadCustomerProfile(cifNumber);
        loadCustomerAccounts(cifNumber);
        setupEventListeners();
    } else {
        console.error('No CIF number provided');
        window.location.href = 'admin-user-management.html';
    }
});

// Global variables
let currentCustomerData = null;
let customerAccounts = [];

// Setup event listeners
function setupEventListeners() {
    // Status update functionality
    const statusDropdown = document.getElementById('status-dropdown');
    const updateStatusBtn = document.getElementById('update-status-btn');
    
    statusDropdown.addEventListener('change', function() {
        updateStatusBtn.disabled = false;
    });
    
    updateStatusBtn.addEventListener('click', updateCustomerStatus);
    
    // Setup logout functionality
    const logoutBtn = document.getElementById('log-out');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('employee_id');
            localStorage.removeItem('employee_username');
            window.location.href = 'admin-login.html';
        });
    }
}

// Load customer profile data
async function loadCustomerProfile(cifNumber) {
    try {
        // Use the detailed endpoint
        const response = await fetch(`/api/customer/all/${cifNumber}`);
        if (!response.ok) {
            throw new Error('Customer not found');
        }
        const data = await response.json();
        currentCustomerData = data;
        displayCustomerProfile(data);
        populateStatusDropdown(data.customer.customer_status);
    } catch (error) {
        console.error('Error loading customer profile:', error);
        alert('Failed to load customer profile');
        window.location.href = 'admin-user-management.html';
    }
}

// Helper to display N/A for null/empty
function displayValue(val) {
    if (val === null || val === undefined || val === '') return 'N/A';
    return val;
}

// Display customer profile information
function displayCustomerProfile(data) {
    const customer = data.customer || {};
    const addresses = data.addresses || [];
    const contacts = data.contacts || [];
    const employment = data.employment && data.employment[0] ? data.employment[0] : {};
    const fundSources = data.fundSources && data.fundSources[0] ? data.fundSources[0] : {};
    const aliases = data.aliases && data.aliases[0] ? data.aliases[0] : {};

    // Update customer name in header
    const nameElement = document.getElementById('customer-name');
    nameElement.textContent = `${displayValue(customer.customer_last_name)}, ${displayValue(customer.customer_first_name)} ${displayValue(customer.customer_middle_name)}`.trim();

    // Account info
    document.getElementById('cif-number').value = displayValue(customer.cif_number);
    document.getElementById('customer-type').value = displayValue(customer.customer_type);
    document.getElementById('account-type').value = displayValue((data.accounts && data.accounts[0] && data.accounts[0].product_type_name));

    // Personal info
    document.getElementById('first-name').value = displayValue(customer.customer_first_name);
    document.getElementById('middle-name').value = displayValue(customer.customer_middle_name);
    document.getElementById('last-name').value = displayValue(customer.customer_last_name);
    document.getElementById('suffix-name').value = displayValue(customer.customer_suffix_name);

    // Biographical info
    document.getElementById('date').value = customer.birth_date ? formatDate(customer.birth_date) : 'N/A';
    document.getElementById('country-of-birth').value = displayValue(customer.birth_country);
    document.getElementById('citizenship').value = displayValue(customer.citizenship);
    document.getElementById('gender').value = displayValue(customer.gender);
    document.getElementById('civil-status').value = displayValue(customer.civil_status_code);
    document.getElementById('residency').value = displayValue(customer.residency_status);

    // Contact details
    const getContact = (type) => {
        const found = contacts.find(c => c.contact_type_code === type);
        return displayValue(found ? found.contact_value : null);
    };
    document.getElementById('mobile-number').value = getContact('CT01');
    document.getElementById('landline-number').value = getContact('CT02');
    document.getElementById('email-address').value = getContact('CT04');
    document.getElementById('work-email-address').value = getContact('CT05');
    document.getElementById('work-landline-number').value = getContact('CT03');

    // Address info
    const getAddress = (type) => addresses.find(a => a.address_type_code === type) || {};
    const home = getAddress('AD01');
    const alt = getAddress('AD02');
    // Home address
    document.getElementById('unit').value = displayValue(home.address_unit);
    document.getElementById('building').value = displayValue(home.address_building);
    document.getElementById('street').value = displayValue(home.address_street);
    document.getElementById('subdivision').value = displayValue(home.address_subdivision);
    document.getElementById('barangay').value = displayValue(home.address_barangay);
    document.getElementById('city').value = displayValue(home.address_city);
    document.getElementById('province').value = displayValue(home.address_province);
    document.getElementById('country').value = displayValue(home.address_country);
    document.getElementById('zip-code').value = displayValue(home.address_zip_code);
    // Alternate address
    document.getElementById('alt-unit').value = displayValue(alt.address_unit);
    document.getElementById('alt-building').value = displayValue(alt.address_building);
    document.getElementById('alt-street').value = displayValue(alt.address_street);
    document.getElementById('alt-subdivision').value = displayValue(alt.address_subdivision);
    document.getElementById('alt-barangay').value = displayValue(alt.address_barangay);
    document.getElementById('alt-city').value = displayValue(alt.address_city);
    document.getElementById('alt-province').value = displayValue(alt.address_province);
    document.getElementById('alt-country').value = displayValue(alt.address_country);
    document.getElementById('alt-zip-code').value = displayValue(alt.address_zip_code);

    // ACCOUNTS SECTION: Only show the accounts list, never a no-accounts message
    const accounts = data.accounts || [];
    const accountsList = document.getElementById('accounts-list');
    if (accounts.length > 0) {
        accountsList.style.display = 'block';
        accountsList.innerHTML = accounts.map(acc => `
            <div class="account-card">
                <div class="account-header">
                    <div class="account-number">${displayValue(acc.account_number)}</div>
                    <div class="account-status ${displayValue(acc.account_status).toLowerCase().replace(' ', '-')}">
                        ${displayValue(acc.account_status)}
                    </div>
                </div>
                <div class="account-details">
                    <div class="account-detail">
                        <div class="account-detail-label">Account Type</div>
                        <div class="account-detail-value">${displayValue(acc.product_type_name)}</div>
                    </div>
                    <div class="account-detail">
                        <div class="account-detail-label">Opening Date</div>
                        <div class="account-detail-value">${acc.account_open_date ? formatDate(acc.account_open_date) : 'N/A'}</div>
                    </div>
                    <div class="account-detail">
                        <div class="account-detail-label">Status</div>
                        <div class="account-detail-value">${displayValue(acc.account_status)}</div>
                    </div>
                </div>
            </div>
        `).join('');
    } else {
        accountsList.style.display = 'none';
    }

    // EMPLOYMENT & FINANCIAL DATA: Revert to text-based fields
    // (Assume you have containers/fields in HTML for these, e.g. with IDs: employmentType, companyName, occupation, monthlyIncome, fundSource)
    const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.value = displayValue(value);
    };
    setText('employmentType', employment.employment_type);
    setText('companyName', employment.employer_business_name);
    setText('occupation', employment.job_title);
    setText('monthlyIncome', employment.income_monthly_gross !== undefined && employment.income_monthly_gross !== null ? '₱' + parseFloat(employment.income_monthly_gross).toLocaleString() : 'N/A');
    setText('fundSource', fundSources.fund_source);

    // Work nature and fund source
    document.getElementById('work-business-nature').value = displayValue((data.workNaturesDescriptions && data.workNaturesDescriptions[0]));
    document.getElementById('source-of-fund').value = displayValue(fundSources.fund_source_code);

    // Aliases
    document.getElementById('alias-first-name').value = displayValue(aliases.alias_first_name);
    document.getElementById('alias-middle-name').value = displayValue(aliases.alias_middle_name);
    document.getElementById('alias-last-name').value = displayValue(aliases.alias_last_name);

    // Uploaded Valid ID Image
    const validIdContainer = document.getElementById('valid-id-image-container');
    if (validIdContainer) {
        validIdContainer.innerHTML = '';
        const validIdPath = data.valid_id_path;
        if (validIdPath) {
            const img = document.createElement('img');
            img.src = validIdPath;
            img.alt = 'Uploaded Valid ID';
            img.style.maxWidth = '350px';
            img.style.maxHeight = '220px';
            img.style.display = 'block';
            img.style.margin = '16px 0';
            img.style.borderRadius = '8px';
            img.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
            validIdContainer.appendChild(img);
        } else {
            validIdContainer.innerHTML = '<div style="color:#888; font-size:16px; margin:12px 0;">No image uploaded.</div>';
        }
    }

    // Uploaded Alias Documentation Image
    const aliasDocContainer = document.getElementById('alias-doc-image-container');
    if (aliasDocContainer) {
        aliasDocContainer.innerHTML = '';
        const aliasDocPath = data.alias_doc_path;
        if (aliasDocPath) {
            const img = document.createElement('img');
            img.src = aliasDocPath;
            img.alt = 'Uploaded Alias Documentation';
            img.style.maxWidth = '350px';
            img.style.maxHeight = '220px';
            img.style.display = 'block';
            img.style.margin = '16px 0';
            img.style.borderRadius = '8px';
            img.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
            aliasDocContainer.appendChild(img);
        } else {
            aliasDocContainer.innerHTML = '<div style="color:#888; font-size:16px; margin:12px 0;">No image uploaded.</div>';
        }
    }

    // Make all inputs readonly except status
    const inputs = document.querySelectorAll('input[type="text"]');
    inputs.forEach(input => {
        input.readOnly = true;
        input.style.backgroundColor = '#f9f9f9';
        input.style.color = '#666';
    });
}

// Populate status dropdown with available options
function populateStatusDropdown(currentStatus) {
    const statusDropdown = document.getElementById('status-dropdown');
    const statusOptions = [
        'Pending Verification',
        'Active',
        'Inactive',
        'Suspended',
        'Dormant'
    ];
    
    statusDropdown.innerHTML = '';
    
    statusOptions.forEach(status => {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = status;
        option.selected = status === currentStatus;
        statusDropdown.appendChild(option);
    });
}

// Load customer accounts
async function loadCustomerAccounts(cifNumber) {
    try {
        document.getElementById('accounts-loading').style.display = 'block';
        
        const response = await fetch(`/admin/customers/${cifNumber}`);
        if (!response.ok) {
            throw new Error('Failed to load customer accounts');
        }
        
        const data = await response.json();
        customerAccounts = data.accounts || [];
        
        document.getElementById('accounts-loading').style.display = 'none';
        
        if (customerAccounts.length > 0) {
            displayCustomerAccounts(customerAccounts);
            document.getElementById('accounts-list').style.display = 'block';
        } else {
            document.getElementById('no-accounts-message').style.display = 'block';
        }
        
    } catch (error) {
        console.error('Error loading customer accounts:', error);
        document.getElementById('accounts-loading').style.display = 'none';
        document.getElementById('no-accounts-message').style.display = 'block';
    }
}

// Display customer accounts
function displayCustomerAccounts(accounts) {
    const accountsList = document.getElementById('accounts-list');
    
    accountsList.innerHTML = accounts.map(account => `
        <div class="account-card">
            <div class="account-header">
                <div class="account-number">${account.account_number}</div>
                <div class="account-status ${account.account_status.toLowerCase().replace(' ', '-')}">
                    ${account.account_status}
                </div>
            </div>
            <div class="account-details">
                <div class="account-detail">
                    <div class="account-detail-label">Account Type</div>
                    <div class="account-detail-value">${account.product_type}</div>
                </div>
                <div class="account-detail">
                    <div class="account-detail-label">Opening Date</div>
                    <div class="account-detail-value">${formatDate(account.account_created_at)}</div>
                </div>
                <div class="account-detail">
                    <div class="account-detail-label">Status</div>
                    <div class="account-detail-value">${account.account_status}</div>
                </div>
                <div class="account-detail">
                    <div class="account-detail-label">Balance</div>
                    <div class="account-detail-value account-balance">₱${parseFloat(account.balance || 0).toLocaleString()}</div>
                </div>
            </div>
            <div class="account-actions">
                <button class="account-action-btn view-transactions-btn" onclick="viewAccountTransactions('${account.account_number}')">
                    View Transactions
                </button>
                <button class="account-action-btn account-details-btn" onclick="viewAccountDetails('${account.account_number}')">
                    Account Details
                </button>
            </div>
        </div>
    `).join('');
}

// Update customer status
async function updateCustomerStatus() {
    const statusDropdown = document.getElementById('status-dropdown');
    const newStatus = statusDropdown.value;
    const employeeId = localStorage.getItem('employee_id');
    const cifNumber = new URLSearchParams(window.location.search).get('cif');
    
    if (!newStatus || !employeeId || !cifNumber) {
        alert('Missing required information for status update');
        return;
    }
    
    if (newStatus === currentCustomerData.customer.customer_status) {
        alert('No change in status');
        return;
    }
    
    const confirmation = confirm(`Are you sure you want to change customer status to "${newStatus}"?`);
    if (!confirmation) return;
    
    try {
        const response = await fetch(`/admin/customers/${cifNumber}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: newStatus,
                employee_id: employeeId
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update customer status');
        }
        
        const result = await response.json();
        
        // Show success message
        const messageElement = document.getElementById('status-update-message');
        messageElement.textContent = result.message;
        messageElement.className = 'status-message success';
        messageElement.style.display = 'block';
        
        // Update current customer data
        currentCustomerData.customer.customer_status = newStatus;
        
        // Disable update button
        document.getElementById('update-status-btn').disabled = true;
        
        // Hide message after 5 seconds
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 5000);
        
    } catch (error) {
        console.error('Error updating customer status:', error);
        
        const messageElement = document.getElementById('status-update-message');
        messageElement.textContent = 'Failed to update customer status';
        messageElement.className = 'status-message error';
        messageElement.style.display = 'block';
        
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 5000);
    }
}

// View account transactions
function viewAccountTransactions(accountNumber) {
    // Placeholder for transaction viewing functionality
    alert(`View transactions for account: ${accountNumber}\n\nThis feature will be implemented to show transaction history.`);
}

// View account details
function viewAccountDetails(accountNumber) {
    // Placeholder for account details functionality
    alert(`View details for account: ${accountNumber}\n\nThis feature will be implemented to show detailed account information.`);
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatFieldName(field) {
    return field.replace(/_/g, ' ')
               .replace(/customer /g, '')
               .replace(/\b\w/g, l => l.toUpperCase());
}

// Make functions globally available
window.viewAccountTransactions = viewAccountTransactions;
window.viewAccountDetails = viewAccountDetails;
