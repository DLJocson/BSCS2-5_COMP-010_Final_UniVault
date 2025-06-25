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
        loadProfileValidation(cifNumber);
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
        const response = await fetch(`/admin/customers/${cifNumber}`);
        if (!response.ok) {
            throw new Error('Customer not found');
        }
        
        const data = await response.json();
        currentCustomerData = data.customer;
        
        displayCustomerProfile(data.customer);
        populateStatusDropdown(data.customer.customer_status);
        
    } catch (error) {
        console.error('Error loading customer profile:', error);
        alert('Failed to load customer profile');
        window.location.href = 'admin-user-management.html';
    }
}

// Display customer profile information
function displayCustomerProfile(customer) {
    // Update customer name in header
    const nameElement = document.getElementById('customer-name');
    nameElement.textContent = `${customer.customer_last_name}, ${customer.customer_first_name} ${customer.customer_middle_name || ''}`.trim();
    
    // Populate account information
    document.getElementById('cif-number').value = customer.cif_number || '';
    document.getElementById('customer-type').value = 'Individual'; // Default for now
    document.getElementById('account-type').value = 'Savings'; // Default for now
    
    // Populate personal information
    document.getElementById('first-name').value = customer.customer_first_name || '';
    document.getElementById('middle-name').value = customer.customer_middle_name || '';
    document.getElementById('last-name').value = customer.customer_last_name || '';
    document.getElementById('suffix-name').value = customer.customer_suffix || '';
    
    // Biographical information
    document.getElementById('date').value = customer.birth_date ? formatDate(customer.birth_date) : '';
    document.getElementById('country-of-birth').value = customer.birth_country || '';
    document.getElementById('citizenship').value = customer.citizenship || '';
    document.getElementById('gender').value = customer.gender || '';
    document.getElementById('civil-status').value = customer.civil_status || '';
    document.getElementById('residency').value = customer.residency_status || '';
    
    // Contact details
    document.getElementById('mobile-number').value = customer.phone_number || '';
    document.getElementById('landline-number').value = customer.landline_number || '';
    document.getElementById('email-address').value = customer.email_address || '';
    
    // Address information
    populateAddress(customer, 'home');
    populateAddress(customer, 'work');
    
    // Employment data
    document.getElementById('work-email-address').value = customer.work_email || '';
    document.getElementById('work-landline-number').value = customer.work_phone || '';
    document.getElementById('tin-number').value = customer.tin_number || '';
    document.getElementById('primary-employer').value = customer.employer_name || '';
    document.getElementById('position').value = customer.job_title || '';
    document.getElementById('monthly-income').value = customer.monthly_income || '';
    
    // Work nature and fund source
    document.getElementById('work-business-nature').value = customer.business_nature || '';
    document.getElementById('source-of-fund').value = customer.fund_source || '';
    
    // Aliases
    document.getElementById('alias-first-name').value = customer.alias_first_name || '';
    document.getElementById('alias-middle-name').value = customer.alias_middle_name || '';
    document.getElementById('alias-last-name').value = customer.alias_last_name || '';
    
    // Make all inputs readonly except status
    const inputs = document.querySelectorAll('input[type="text"]');
    inputs.forEach(input => {
        input.readOnly = true;
        input.style.backgroundColor = '#f9f9f9';
        input.style.color = '#666';
    });
}

// Populate address fields
function populateAddress(customer, type) {
    const prefix = type === 'home' ? '' : type + '-';
    
    document.getElementById(prefix + 'unit').value = customer[`${type}_unit`] || '';
    document.getElementById(prefix + 'building').value = customer[`${type}_building`] || '';
    document.getElementById(prefix + 'street').value = customer.street_address || '';
    document.getElementById(prefix + 'subdivision').value = customer[`${type}_subdivision`] || '';
    document.getElementById(prefix + 'barangay').value = customer.barangay || '';
    document.getElementById(prefix + 'city').value = customer.city || '';
    document.getElementById(prefix + 'province').value = customer.province_or_state || '';
    document.getElementById(prefix + 'country').value = customer.country || '';
    document.getElementById(prefix + 'zip-code').value = customer.postal_code || '';
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

// Load profile validation
async function loadProfileValidation(cifNumber) {
    try {
        document.getElementById('validation-loading').style.display = 'block';
        
        // Calculate profile completeness based on available data
        const validationData = calculateProfileCompleteness(currentCustomerData);
        
        document.getElementById('validation-loading').style.display = 'none';
        displayProfileValidation(validationData);
        document.getElementById('validation-content').style.display = 'block';
        
    } catch (error) {
        console.error('Error loading profile validation:', error);
        document.getElementById('validation-loading').style.display = 'none';
    }
}

// Calculate profile completeness
function calculateProfileCompleteness(customer) {
    if (!customer) return null;
    
    const sections = {
        personal: {
            name: 'Personal Information',
            fields: [
                'customer_first_name', 'customer_last_name', 'birth_date', 
                'gender', 'citizenship', 'civil_status'
            ]
        },
        contact: {
            name: 'Contact Information',
            fields: [
                'phone_number', 'email_address', 'street_address', 
                'city', 'province_or_state', 'country'
            ]
        },
        employment: {
            name: 'Employment Information',
            fields: [
                'employer_name', 'job_title', 'monthly_income', 'tin_number'
            ]
        },
        verification: {
            name: 'Identity Verification',
            fields: [
                'customer_username', 'customer_status'
            ]
        }
    };
    
    let totalFields = 0;
    let completedFields = 0;
    let sectionResults = {};
    
    Object.keys(sections).forEach(sectionKey => {
        const section = sections[sectionKey];
        let sectionCompleted = 0;
        let sectionTotal = section.fields.length;
        
        const fieldResults = section.fields.map(field => {
            const isComplete = customer[field] && customer[field].toString().trim() !== '';
            if (isComplete) {
                sectionCompleted++;
                completedFields++;
            }
            totalFields++;
            
            return {
                name: formatFieldName(field),
                complete: isComplete
            };
        });
        
        sectionResults[sectionKey] = {
            name: section.name,
            completed: sectionCompleted,
            total: sectionTotal,
            percentage: Math.round((sectionCompleted / sectionTotal) * 100),
            fields: fieldResults,
            status: sectionCompleted === sectionTotal ? 'complete' : 
                    sectionCompleted > 0 ? 'partial' : 'incomplete'
        };
    });
    
    const overallPercentage = Math.round((completedFields / totalFields) * 100);
    
    return {
        overall: {
            completed: completedFields,
            total: totalFields,
            percentage: overallPercentage,
            status: overallPercentage === 100 ? 'complete' : 
                    overallPercentage > 50 ? 'partial' : 'incomplete'
        },
        sections: sectionResults
    };
}

// Display profile validation
function displayProfileValidation(validation) {
    if (!validation) return;
    
    const validationContent = document.getElementById('validation-content');
    
    validationContent.innerHTML = `
        <div class="validation-summary">
            <div class="validation-metric ${validation.overall.status}">
                <div class="validation-metric-value">${validation.overall.percentage}%</div>
                <div class="validation-metric-label">Overall Complete</div>
            </div>
            <div class="validation-metric ${validation.overall.completed === validation.overall.total ? 'complete' : 'incomplete'}">
                <div class="validation-metric-value">${validation.overall.completed}/${validation.overall.total}</div>
                <div class="validation-metric-label">Fields Complete</div>
            </div>
        </div>
        
        <div class="validation-details">
            ${Object.keys(validation.sections).map(sectionKey => {
                const section = validation.sections[sectionKey];
                return `
                    <div class="validation-section ${section.status}">
                        <div class="validation-section-title">
                            ${section.name} (${section.completed}/${section.total} - ${section.percentage}%)
                        </div>
                        <div class="validation-fields">
                            ${section.fields.map(field => `
                                <div class="validation-field ${field.complete ? 'complete' : 'incomplete'}">
                                    <div class="validation-field-icon"></div>
                                    <div class="validation-field-name">${field.name}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
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
    
    if (newStatus === currentCustomerData.customer_status) {
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
        currentCustomerData.customer_status = newStatus;
        
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
