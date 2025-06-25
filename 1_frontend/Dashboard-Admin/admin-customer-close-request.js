// Enhanced admin customer request processing with dual functionality
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
        loadCustomerBasicInfo(cifNumber);
        loadProfileUpdateRequest(cifNumber);
        loadCustomerAccounts(cifNumber);
        setupEventListeners();
    } else {
        console.error('No CIF number provided');
        window.location.href = 'admin-review-queue2.html';
    }
});

// Global variables
let selectedAccounts = new Set();
let currentCustomerData = null;
let profileUpdateData = null;

// Tab switching functionality
function switchTab(tabType) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${tabType}-tab`).classList.add('active');
    
    // Update panels
    document.querySelectorAll('.request-panel').forEach(panel => panel.classList.remove('active'));
    document.getElementById(`${tabType}-panel`).classList.add('active');
}

// Event listeners setup
function setupEventListeners() {
    // Documents modal
    const modal = document.getElementById('documents-modal');
    const closeBtn = document.querySelector('.documents-modal .close');
    
    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
    
    // Action buttons
    document.getElementById('view-documents-btn').onclick = viewDocuments;
    document.getElementById('approve-profile-update-btn').onclick = () => processProfileUpdate('approve');
    document.getElementById('reject-profile-update-btn').onclick = () => processProfileUpdate('reject');
    document.getElementById('approve-account-closure-btn').onclick = () => processAccountClosure('approve');
    document.getElementById('reject-account-closure-btn').onclick = () => processAccountClosure('reject');
}

// Load basic customer information
async function loadCustomerBasicInfo(cifNumber) {
    try {
        const response = await fetch(`/api/customer/${cifNumber}`);
        if (!response.ok) throw new Error('Customer not found');
        
        const customerData = await response.json();
        currentCustomerData = customerData;
        
        // Update customer name in header
        const nameElement = document.getElementById('customer-name');
        nameElement.textContent = `${customerData.customer_last_name}, ${customerData.customer_first_name} ${customerData.customer_middle_name || ''}`.trim();
        
        // Populate basic account information
        document.getElementById('cif-number').value = customerData.cif_number || '';
        document.getElementById('customer-type').value = customerData.customer_type || '';
        document.getElementById('status').value = customerData.customer_status || '';
        
        // Make inputs readonly
        const inputs = document.querySelectorAll('input[type="text"]');
        inputs.forEach(input => {
            input.readOnly = true;
            input.disabled = true;
        });
        
    } catch (error) {
        console.error('Error loading customer info:', error);
        alert('Customer not found');
        window.location.href = 'admin-review-queue2.html';
    }
}

// Load profile update request data
async function loadProfileUpdateRequest(cifNumber) {
    try {
        // First get current profile data
        const currentResponse = await fetch(`/api/customer/${cifNumber}/profile`);
        if (!currentResponse.ok) throw new Error('Failed to load current profile');
        
        const currentData = await currentResponse.json();
        
        // Then get pending update requests
        const updateResponse = await fetch(`/api/customer/${cifNumber}/profile-update-requests`);
        if (!updateResponse.ok) {
            displayProfileComparison(currentData, null);
            return;
        }
        
        const updateRequests = await updateResponse.json();
        profileUpdateData = updateRequests.length > 0 ? updateRequests[0] : null;
        
        displayProfileComparison(currentData, profileUpdateData);
        
    } catch (error) {
        console.error('Error loading profile update request:', error);
        document.getElementById('current-profile-data').innerHTML = '<p>Error loading profile data</p>';
        document.getElementById('updated-profile-data').innerHTML = '<p>No pending update requests</p>';
    }
}

// Display profile comparison
function displayProfileComparison(currentData, updateData) {
    const currentContainer = document.getElementById('current-profile-data');
    const updatedContainer = document.getElementById('updated-profile-data');
    
    // Display current data
    currentContainer.innerHTML = formatProfileData(currentData);
    
    // Display update data or no requests message
    if (updateData && updateData.requested_changes) {
        try {
            const changes = JSON.parse(updateData.requested_changes);
            updatedContainer.innerHTML = formatProfileChanges(currentData, changes);
            
            // Enable action buttons
            document.getElementById('approve-profile-update-btn').disabled = false;
            document.getElementById('reject-profile-update-btn').disabled = false;
            document.getElementById('view-documents-btn').disabled = false;
        } catch (error) {
            updatedContainer.innerHTML = '<p>Error parsing update request data</p>';
        }
    } else {
        updatedContainer.innerHTML = '<p>No pending profile update requests</p>';
        document.getElementById('approve-profile-update-btn').disabled = true;
        document.getElementById('reject-profile-update-btn').disabled = true;
        document.getElementById('view-documents-btn').disabled = true;
    }
}

// Format profile data for display
function formatProfileData(data) {
    return `
        <div class="profile-section">
            <h4>Personal Information</h4>
            <p><strong>Name:</strong> ${data.customer_first_name} ${data.customer_middle_name || ''} ${data.customer_last_name}</p>
            <p><strong>Date of Birth:</strong> ${data.customer_date_of_birth || 'N/A'}</p>
            <p><strong>Gender:</strong> ${data.customer_gender || 'N/A'}</p>
            <p><strong>Civil Status:</strong> ${data.customer_civil_status || 'N/A'}</p>
            <p><strong>Citizenship:</strong> ${data.customer_citizenship || 'N/A'}</p>
        </div>
        <div class="profile-section">
            <h4>Contact Information</h4>
            <p><strong>Email:</strong> ${data.customer_personal_email_address || 'N/A'}</p>
            <p><strong>Mobile:</strong> ${data.customer_personal_mobile_number || 'N/A'}</p>
            <p><strong>Landline:</strong> ${data.customer_home_landline_number || 'N/A'}</p>
        </div>
        <div class="profile-section">
            <h4>Address</h4>
            <p><strong>Home:</strong> ${formatAddress(data, 'home')}</p>
            <p><strong>Work:</strong> ${formatAddress(data, 'work')}</p>
        </div>
        <div class="profile-section">
            <h4>Employment</h4>
            <p><strong>Employer:</strong> ${data.customer_name_of_primary_employer || 'N/A'}</p>
            <p><strong>Position:</strong> ${data.customer_position_job_title || 'N/A'}</p>
            <p><strong>Monthly Income:</strong> ${data.customer_monthly_income || 'N/A'}</p>
        </div>
    `;
}

// Format profile changes for comparison
function formatProfileChanges(currentData, changes) {
    let html = '';
    
    Object.keys(changes).forEach(field => {
        const currentValue = currentData[field] || 'N/A';
        const newValue = changes[field] || 'N/A';
        
        if (currentValue !== newValue) {
            html += `
                <div class="change-item">
                    <p><strong>${formatFieldName(field)}:</strong></p>
                    <p class="old-value">Current: ${currentValue}</p>
                    <p class="new-value">New: ${newValue}</p>
                </div>
            `;
        }
    });
    
    return html || '<p>No changes detected</p>';
}

// Format field names for display
function formatFieldName(field) {
    return field.replace(/_/g, ' ')
               .replace(/customer /g, '')
               .replace(/\b\w/g, l => l.toUpperCase());
}

// Format address for display
function formatAddress(data, type) {
    const prefix = type === 'home' ? 'customer_home_' : 'customer_work_';
    const parts = [
        data[`${prefix}unit`],
        data[`${prefix}building`],
        data[`${prefix}street`],
        data[`${prefix}subdivision`],
        data[`${prefix}barangay`],
        data[`${prefix}city`],
        data[`${prefix}province`],
        data[`${prefix}country`],
        data[`${prefix}zip_code`]
    ].filter(part => part && part.trim());
    
    return parts.length > 0 ? parts.join(', ') : 'N/A';
}

// Load customer accounts for closure
async function loadCustomerAccounts(cifNumber) {
    try {
        const response = await fetch(`/api/customer/${cifNumber}/accounts`);
        
        const loadingElement = document.getElementById('accounts-loading');
        const accountsListElement = document.getElementById('customer-accounts-list');
        const noAccountsElement = document.getElementById('no-accounts-message');
        
        loadingElement.style.display = 'none';
        
        if (!response.ok) {
            noAccountsElement.style.display = 'block';
            return;
        }
        
        const accounts = await response.json();
        
        if (!accounts || accounts.length === 0) {
            noAccountsElement.style.display = 'block';
            return;
        }
        
        displayCustomerAccounts(accounts);
        accountsListElement.style.display = 'block';
        
    } catch (error) {
        console.error('Error loading customer accounts:', error);
        document.getElementById('accounts-loading').style.display = 'none';
        document.getElementById('no-accounts-message').style.display = 'block';
    }
}

// Display customer accounts
function displayCustomerAccounts(accounts) {
    const accountsListElement = document.getElementById('customer-accounts-list');
    
    accountsListElement.innerHTML = accounts.map(account => `
        <div class="account-item" data-account-id="${account.account_id}">
            <input type="checkbox" class="account-checkbox" id="account-${account.account_id}" 
                   onchange="toggleAccountSelection('${account.account_id}')">
            <div class="account-details">
                <div class="account-number">${account.account_number}</div>
                <div class="account-info">
                    ${account.account_type} | Balance: ₱${parseFloat(account.account_balance || 0).toLocaleString()}
                    | Status: ${account.account_status}
                </div>
            </div>
        </div>
    `).join('');
}

// Toggle account selection
function toggleAccountSelection(accountId) {
    const checkbox = document.getElementById(`account-${accountId}`);
    const accountItem = checkbox.closest('.account-item');
    
    if (checkbox.checked) {
        selectedAccounts.add(accountId);
        accountItem.classList.add('selected');
    } else {
        selectedAccounts.delete(accountId);
        accountItem.classList.remove('selected');
    }
    
    // Update action button states
    const hasSelection = selectedAccounts.size > 0;
    document.getElementById('approve-account-closure-btn').disabled = !hasSelection;
    document.getElementById('reject-account-closure-btn').disabled = !hasSelection;
}

// View customer documents
async function viewDocuments() {
    try {
        const cifNumber = new URLSearchParams(window.location.search).get('cif');
        const response = await fetch(`/api/customer/${cifNumber}/documents`);
        
        const modal = document.getElementById('documents-modal');
        const documentsList = document.getElementById('documents-list');
        
        if (!response.ok) {
            documentsList.innerHTML = '<p>No documents found</p>';
            modal.style.display = 'block';
            return;
        }
        
        const documents = await response.json();
        
        if (!documents || documents.length === 0) {
            documentsList.innerHTML = '<p>No documents found</p>';
        } else {
            documentsList.innerHTML = documents.map(doc => `
                <div class="document-item">
                    <div class="document-info">
                        <div class="document-name">${doc.document_name}</div>
                        <div class="document-meta">
                            Type: ${doc.document_type} | 
                            Uploaded: ${new Date(doc.upload_date).toLocaleDateString()}
                        </div>
                    </div>
                    <div class="document-actions">
                        <button class="view-doc-btn" onclick="viewDocument('${doc.document_id}')">View</button>
                        <button class="download-doc-btn" onclick="downloadDocument('${doc.document_id}')">Download</button>
                    </div>
                </div>
            `).join('');
        }
        
        modal.style.display = 'block';
        
    } catch (error) {
        console.error('Error loading documents:', error);
        document.getElementById('documents-list').innerHTML = '<p>Error loading documents</p>';
        document.getElementById('documents-modal').style.display = 'block';
    }
}

// View specific document
function viewDocument(documentId) {
    window.open(`/api/documents/${documentId}/view`, '_blank');
}

// Download specific document
function downloadDocument(documentId) {
    window.open(`/api/documents/${documentId}/download`, '_blank');
}

// Process profile update request
async function processProfileUpdate(action) {
    if (!profileUpdateData) {
        alert('No profile update request to process');
        return;
    }
    
    const confirmation = confirm(`Are you sure you want to ${action} this profile update request?`);
    if (!confirmation) return;
    
    try {
        const response = await fetch(`/api/profile-update-requests/${profileUpdateData.request_id}/${action}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                employee_id: localStorage.getItem('employee_id'),
                admin_notes: prompt('Add any notes (optional):') || ''
            })
        });
        
        if (!response.ok) throw new Error(`Failed to ${action} profile update`);
        
        alert(`Profile update request ${action}d successfully`);
        window.location.href = 'admin-review-queue2.html';
        
    } catch (error) {
        console.error(`Error ${action}ing profile update:`, error);
        alert(`Failed to ${action} profile update request`);
    }
}

// Process account closure request
async function processAccountClosure(action) {
    if (selectedAccounts.size === 0) {
        alert('Please select at least one account');
        return;
    }
    
    const accountIds = Array.from(selectedAccounts);
    const confirmation = confirm(`Are you sure you want to ${action} closure for ${accountIds.length} account(s)?`);
    if (!confirmation) return;
    
    try {
        const response = await fetch(`/api/account-closure-requests/${action}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                account_ids: accountIds,
                employee_id: localStorage.getItem('employee_id'),
                admin_notes: prompt('Add any notes (optional):') || ''
            })
        });
        
        if (!response.ok) throw new Error(`Failed to ${action} account closure`);
        
        alert(`Account closure request(s) ${action}d successfully`);
        window.location.href = 'admin-review-queue2.html';
        
    } catch (error) {
        console.error(`Error ${action}ing account closure:`, error);
        alert(`Failed to ${action} account closure request(s)`);
    }
}

// Utility function to handle logout
function handleLogout() {
    localStorage.removeItem('employee_id');
    localStorage.removeItem('employee_username');
    window.location.href = 'admin-login.html';
}

// Make functions globally available
window.switchTab = switchTab;
window.toggleAccountSelection = toggleAccountSelection;
window.viewDocument = viewDocument;
window.downloadDocument = downloadDocument;
