document.addEventListener('DOMContentLoaded', function() {
    // Load account details from localStorage
    const accountToClose = localStorage.getItem('accountToClose');
    
    if (!accountToClose) {
        alert('No account selected for closure. Redirecting back to accounts page.');
        window.location.href = 'close-account.html';
        return;
    }
    
    const accountData = JSON.parse(accountToClose);
    
    // Display account details
    document.getElementById('account-number').textContent = '*'.repeat(8) + accountData.accountNumber.slice(-4);
    document.getElementById('account-type').textContent = accountData.accountType;
    document.getElementById('account-balance').textContent = accountData.accountBalance;
    
    // Get form elements
    const checkboxes = document.querySelectorAll('.checklist-item input[type="checkbox"]');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const closeAccountBtn = document.getElementById('close-account-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    
    // Validation functions
    function validateCheckboxes() {
        return Array.from(checkboxes).every(cb => cb.checked);
    }
    
    function validateCredentials() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        return username !== '' && password !== '';
    }
    
    function updateCloseButtonState() {
        const checkboxesValid = validateCheckboxes();
        const credentialsValid = validateCredentials();
        closeAccountBtn.disabled = !(checkboxesValid && credentialsValid);
    }
    
    // Add event listeners
    checkboxes.forEach(cb => {
        cb.addEventListener('change', updateCloseButtonState);
    });
    
    usernameInput.addEventListener('input', updateCloseButtonState);
    passwordInput.addEventListener('input', updateCloseButtonState);
    
    // Cancel button
    cancelBtn.addEventListener('click', function() {
        // Clear temporary data
        localStorage.removeItem('accountToClose');
        // Redirect back to close account page
        window.location.href = 'close-account.html';
    });
    
    // Close account button
    closeAccountBtn.addEventListener('click', async function() {
        // Disable button to prevent double-clicks
        closeAccountBtn.disabled = true;
        closeAccountBtn.textContent = 'Processing...';
        
        try {
            // Validate credentials first (in a real app, this would be done server-side)
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();
            
            if (!username || !password) {
                throw new Error('Please enter both username and password');
            }
            
            // Call the backend to close the account
            const response = await fetch(`/api/account/${accountData.accountNumber}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    confirmClosure: true
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}: Account closure failed`);
            }
            
            const result = await response.json();
            
            // Store details for success page
            localStorage.setItem('lastClosedAccount', accountData.accountNumber);
            localStorage.setItem('lastClosedAccountType', accountData.accountType);
            
            // Clear temporary data
            localStorage.removeItem('accountToClose');
            
            // Redirect to success page
            window.location.href = `account-closure-success.html?account=${accountData.accountNumber}&type=${encodeURIComponent(accountData.accountType)}`;
            
        } catch (error) {
            console.error('Error closing account:', error);
            
            // Show error message
            alert(`Failed to close account: ${error.message}`);
            
            // Re-enable button
            closeAccountBtn.disabled = false;
            closeAccountBtn.textContent = 'Close Account';
            
            // Update button state based on current form validity
            updateCloseButtonState();
        }
    });
    
    // Logout functionality
    const logoutBtn = document.getElementById('log-out');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Clear all data
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '../Registration-Customer/login.html';
        });
    }
    
    // Navigation links with CIF parameter
    const cifNumber = accountData.cifNumber || localStorage.getItem('cif_number');
    if (cifNumber) {
        const navLinks = {
            'accounts-option': 'accounts_display.html',
            'profile-option': 'profile.html'
        };
        
        Object.keys(navLinks).forEach(id => {
            const link = document.getElementById(id);
            if (link) {
                link.href = `${navLinks[id]}?cif=${cifNumber}`;
            }
        });
    }
    
    // Initial button state
    updateCloseButtonState();
});

// Warning before leaving page if account closure is in progress
window.addEventListener('beforeunload', function(e) {
    const accountToClose = localStorage.getItem('accountToClose');
    if (accountToClose) {
        e.preventDefault();
        e.returnValue = 'You have an account closure in progress. Are you sure you want to leave?';
    }
});
