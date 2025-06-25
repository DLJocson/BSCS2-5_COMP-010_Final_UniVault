document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const employeeId = localStorage.getItem('employee_id');
    const employeeUsername = localStorage.getItem('employee_username');
    
    if (!employeeId || !employeeUsername) {
        window.location.href = 'admin-login.html';
        return;
    }

    // Load closed accounts
    loadClosedAccounts();
    
    // Initialize search functionality
    initializeClosedSearch();
    
    // Logout functionality is handled by logout-fix.js
});

async function loadClosedAccounts() {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const container = document.getElementById('accountInfoContainer');
    
    try {
        // Show loading state
        loadingState.style.display = 'block';
        errorState.style.display = 'none';
        
        const response = await fetch('/api/admin/closed-accounts');
        const data = await response.json();
        
        if (response.ok) {
            allClosedAccountsData = data.customers; // Store for search functionality
            displayClosedAccounts(data.customers);
            loadingState.style.display = 'none';
        } else {
            throw new Error(data.message || 'Failed to load closed accounts');
        }
    } catch (error) {
        console.error('Error loading closed accounts:', error);
        loadingState.style.display = 'none';
        errorState.style.display = 'block';
        errorState.innerHTML = `<p>Error loading closed accounts: ${error.message}</p>`;
    }
}

function displayClosedAccounts(accounts) {
    const container = document.getElementById('accountInfoContainer');
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    if (accounts.length === 0) {
        showNoClosedAccountsFound();
        return;
    }
    
    accounts.forEach(account => {
        const accountCard = createClosedAccountCard(account);
        container.appendChild(accountCard);
    });
}

function createClosedAccountCard(customer) {
    const card = document.createElement('div');
    card.className = 'account';
    
    // Format the status change date
    const statusDate = customer.status_changed_date ? 
        new Date(customer.status_changed_date).toLocaleString() : 
        new Date(customer.created_at).toLocaleString();
    
    // Determine customer type (this would need to be added to the database query)
    const customerType = 'Individual'; // Default for now
    
    // Format status with proper styling
    const statusClass = customer.customer_status === 'Inactive' ? 'inactive-status' : 
                       customer.customer_status === 'Suspended' ? 'suspended-status' : 
                       'dormant-status';
    
    card.innerHTML = `
        <div class="top-label-2">
            <label>${customer.cif_number}</label>
            <label>${statusDate}</label>
            <label>${customerType}</label>
            <label>${customer.customer_last_name}</label>
            <label>${customer.customer_first_name}</label>
            <label>${customer.customer_middle_name || 'N/A'}</label>
            <label>${customer.customer_suffix || 'N/A'}</label>
            <label class="${statusClass}">${customer.customer_status}</label>
        </div>
    `;
    
    // Add click handler to show more details
    card.addEventListener('click', () => {
        showCustomerDetails(customer);
    });
    
    card.style.cursor = 'pointer';
    card.style.transition = 'all 0.3s ease';
    
    // Add hover effects
    card.addEventListener('mouseenter', () => {
        card.style.backgroundColor = '#f8faff';
        card.style.transform = 'translateX(4px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.backgroundColor = '';
        card.style.transform = '';
    });
    
    return card;
}

async function showCustomerDetails(customer) {
    try {
        // Fetch detailed customer information
        const response = await fetch(`/api/admin/customers/${customer.cif_number}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch customer details');
        }
        
        const customerDetails = data.customer;
        const accounts = data.accounts || [];
        
        const modal = document.createElement('div');
        modal.className = 'customer-details-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease;
        `;
        
        const accountsList = accounts.length > 0 ? 
            accounts.map(acc => `
                <div class="account-detail" style="
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                    border-left: 4px solid var(--primary-color);
                ">
                    <strong>${acc.product_type || 'Unknown Type'}</strong><br>
                    Account: ${acc.account_number}<br>
                    Status: ${acc.account_status}<br>
                    Balance: ₱${parseFloat(acc.balance || 0).toLocaleString()}<br>
                    Created: ${new Date(acc.account_created_at).toLocaleDateString()}
                </div>
            `).join('') :
            '<p style="color: #6c757d; font-style: italic;">No accounts found for this customer.</p>';
        
        modal.innerHTML = `
            <div class="modal-content" style="
                background: white;
                padding: 30px;
                border-radius: 20px;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                animation: slideIn 0.3s ease;
            ">
                <div class="modal-header" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    border-bottom: 2px solid #eee;
                    padding-bottom: 15px;
                ">
                    <h3 style="margin: 0; color: var(--primary-color); font-size: 24px;">
                        ${customerDetails.customer_last_name}, ${customerDetails.customer_first_name}
                    </h3>
                    <button class="close-modal" style="
                        background: none;
                        border: none;
                        font-size: 28px;
                        cursor: pointer;
                        color: #999;
                        padding: 5px;
                        border-radius: 50%;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.backgroundColor='#f0f0f0'; this.style.color='#333';" 
                       onmouseout="this.style.backgroundColor=''; this.style.color='#999';">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="display: grid; gap: 15px; margin-bottom: 25px;">
                        <div><strong>CIF Number:</strong> ${customerDetails.cif_number}</div>
                        <div><strong>Username:</strong> ${customerDetails.customer_username}</div>
                        <div><strong>Status:</strong> <span style="color: ${getStatusColor(customerDetails.customer_status)}; font-weight: 600;">${customerDetails.customer_status}</span></div>
                        <div><strong>Email:</strong> ${customerDetails.email_address || 'Not provided'}</div>
                        <div><strong>Phone:</strong> ${customerDetails.phone_number || 'Not provided'}</div>
                        <div><strong>Address:</strong> ${formatAddress(customerDetails)}</div>
                        <div><strong>Date of Birth:</strong> ${customerDetails.birth_date ? new Date(customerDetails.birth_date).toLocaleDateString() : 'Not provided'}</div>
                        <div><strong>Gender:</strong> ${customerDetails.gender || 'Not specified'}</div>
                        <div><strong>Citizenship:</strong> ${customerDetails.citizenship || 'Not specified'}</div>
                        <div><strong>Registration Date:</strong> ${new Date(customerDetails.created_at).toLocaleDateString()}</div>
                        <div><strong>Last Updated:</strong> ${new Date(customerDetails.updated_at).toLocaleDateString()}</div>
                    </div>
                    <h4 style="margin-top: 25px; margin-bottom: 15px; color: var(--primary-color); border-bottom: 1px solid #eee; padding-bottom: 8px;">Associated Accounts:</h4>
                    <div class="accounts-list" style="
                        display: grid;
                        gap: 15px;
                    ">
                        ${accountsList}
                    </div>
                </div>
            </div>
        `;
        
        // Add CSS animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideIn {
                from { transform: translateY(-30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        // Close modal functionality
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('close-modal')) {
                modal.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => {
                    document.body.removeChild(modal);
                    document.head.removeChild(style);
                }, 300);
            }
        });
        
        // Add fade out animation
        style.textContent += `
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        
        document.body.appendChild(modal);
        
    } catch (error) {
        console.error('Error fetching customer details:', error);
        alert('Failed to load customer details. Please try again.');
    }
}

function getStatusColor(status) {
    switch (status) {
        case 'Active': return '#28a745';
        case 'Inactive': return '#dc3545';
        case 'Suspended': return '#fd7e14';
        case 'Dormant': return '#6c757d';
        default: return '#6c757d';
    }
}

function formatAddress(customer) {
    const addressParts = [
        customer.street_address,
        customer.barangay,
        customer.city,
        customer.province_or_state,
        customer.postal_code,
        customer.country
    ].filter(part => part && part.trim() !== '');
    
    return addressParts.length > 0 ? addressParts.join(', ') : 'Not provided';
}

let allClosedAccountsData = [];
let closedSearchDebounceTimer;

function initializeClosedSearch() {
    const searchInput = document.getElementById('closedSearchBar');
    if (!searchInput) {
        console.error('Closed search input not found');
        return;
    }
    
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.trim();
        
        // Clear previous timer
        clearTimeout(closedSearchDebounceTimer);
        
        // Debounce the search
        closedSearchDebounceTimer = setTimeout(() => {
            if (searchTerm.length === 0) {
                // Show all closed accounts when search is empty
                displayClosedAccounts(allClosedAccountsData);
            } else if (searchTerm.length >= 2) {
                // Perform search
                performClosedSearch(searchTerm);
            }
        }, 300);
    });
    
    // Clear search when input is cleared
    searchInput.addEventListener('keyup', function(e) {
        if (e.target.value === '') {
            displayClosedAccounts(allClosedAccountsData);
        }
    });
}

function performClosedSearch(searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    
    const filteredAccounts = allClosedAccountsData.filter(account => {
        return (
            (account.cif_number && account.cif_number.toString().includes(searchLower)) ||
            (account.customer_first_name && account.customer_first_name.toLowerCase().includes(searchLower)) ||
            (account.customer_last_name && account.customer_last_name.toLowerCase().includes(searchLower)) ||
            (account.customer_middle_name && account.customer_middle_name.toLowerCase().includes(searchLower)) ||
            (account.customer_suffix && account.customer_suffix.toLowerCase().includes(searchLower)) ||
            (account.customer_username && account.customer_username.toLowerCase().includes(searchLower))
        );
    });
    
    displayClosedAccounts(filteredAccounts);
    
    // Show no results message if needed
    if (filteredAccounts.length === 0) {
        showNoClosedAccountsFound();
    }
}

function showNoClosedAccountsFound() {
    const container = document.getElementById('accountInfoContainer');
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // Add no results message
    const noResultsCard = document.createElement('div');
    noResultsCard.className = 'no-results-card';
    noResultsCard.style.cssText = `
        padding: 60px 20px;
        text-align: center;
        background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
        border: 2px dashed #dee2e6;
        border-radius: 15px;
        margin: 20px 0;
    `;
    noResultsCard.innerHTML = `
        <div style="color: #6c757d; font-size: 20px; font-weight: 500; margin-bottom: 10px;">
            🔍 No closed accounts found
        </div>
        <div style="color: #adb5bd; font-size: 16px;">
            Try adjusting your search terms or check if there are any closed accounts in the system
        </div>
    `;
    container.appendChild(noResultsCard);
}

// CSS for status styling
const statusStyles = document.createElement('style');
statusStyles.textContent = `
    .inactive-status {
        color: #dc3545 !important;
        font-weight: 600;
    }
    .suspended-status {
        color: #fd7e14 !important;
        font-weight: 600;
    }
    .dormant-status {
        color: #6c757d !important;
        font-weight: 600;
    }
    .loading-state, .error-state {
        padding: 40px 20px;
        text-align: center;
        font-size: 16px;
        color: #6c757d;
    }
    .error-state {
        color: #dc3545;
        background-color: #f8d7da;
        border: 1px solid #f5c6cb;
        border-radius: 8px;
    }
`;
document.head.appendChild(statusStyles);
