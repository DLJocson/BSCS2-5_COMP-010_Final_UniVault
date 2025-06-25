// Enhanced logout functionality with debugging and multiple fallback methods
function setupLogoutFunctionality() {
    console.log('Setting up logout functionality...');
    
    // Method 1: Direct click on the image element
    const logoutImg = document.getElementById('log-out');
    if (logoutImg) {
        console.log('Found logout image element');
        logoutImg.addEventListener('click', handleLogout);
        logoutImg.style.cursor = 'pointer';
    } else {
        console.error('Logout image element not found');
    }
    
    // Method 2: Click on the logout container
    const logoutContainer = document.querySelector('.logout-container');
    if (logoutContainer) {
        console.log('Found logout container element');
        logoutContainer.addEventListener('click', handleLogout);
        logoutContainer.style.cursor = 'pointer';
    } else {
        console.error('Logout container element not found');
    }
    
    // Method 3: Click on the logout text
    const logoutText = document.querySelector('.logout-text');
    if (logoutText) {
        console.log('Found logout text element');
        logoutText.addEventListener('click', handleLogout);
        logoutText.style.cursor = 'pointer';
    } else {
        console.error('Logout text element not found');
    }
    
    // Add debugging to detect hover state
    if (logoutContainer) {
        logoutContainer.addEventListener('mouseenter', () => {
            console.log('Mouse entered logout area');
        });
        
        logoutContainer.addEventListener('mouseleave', () => {
            console.log('Mouse left logout area');
        });
    }
}

function handleLogout(event) {
    console.log('Logout clicked!', event.target);
    
    // Prevent any default behavior
    event.preventDefault();
    event.stopPropagation();
    
    console.log('Logging out user...');
    
    // Clear all admin session data
    localStorage.removeItem('employee_id');
    localStorage.removeItem('employee_username');
    localStorage.removeItem('employee_position');
    localStorage.removeItem('admin_session');
    
    // Clear any other potential session storage
    sessionStorage.clear();
    
    console.log('Session data cleared, redirecting...');
    
    // Redirect to login page
    window.location.href = 'admin-login.html';
}

// Test function to manually trigger logout
function testLogout() {
    console.log('Testing logout functionality...');
    handleLogout({ preventDefault: () => {}, stopPropagation: () => {}, target: 'test' });
}

// Enhanced DOMContentLoaded setup
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up logout...');
    
    // Small delay to ensure all elements are rendered
    setTimeout(() => {
        setupLogoutFunctionality();
    }, 100);
});

// Backup setup after page load
window.addEventListener('load', function() {
    console.log('Page fully loaded, backup logout setup...');
    setTimeout(() => {
        setupLogoutFunctionality();
    }, 100);
});

// Make testLogout available globally for debugging
window.testLogout = testLogout;
window.setupLogoutFunctionality = setupLogoutFunctionality;
