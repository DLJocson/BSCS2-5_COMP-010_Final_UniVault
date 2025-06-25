document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Admin login page loaded');
    
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const customerLoginBtn = document.getElementById('customer-login-btn');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');
    const loginForm = document.getElementById('admin-login-form');
    
    // Debug: Check if elements exist
    console.log('🔍 Elements found:', {
        adminLoginBtn: !!adminLoginBtn,
        customerLoginBtn: !!customerLoginBtn,
        usernameInput: !!usernameInput,
        passwordInput: !!passwordInput,
        loginForm: !!loginForm
    });
    
    // Clear any existing session when visiting login page
    // This allows users to log in as different users or re-login
    console.log('🧹 Clearing any existing login session...');
    localStorage.removeItem('employee_id');
    localStorage.removeItem('employee_username');
    localStorage.removeItem('employee_position');
    localStorage.removeItem('employee_first_name');
    localStorage.removeItem('employee_last_name');
    
    // Form submission handler (primary)
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        console.log('✅ Form submit handler attached');
    }
    
    // Admin login button handler (backup)
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', handleLogin);
        console.log('✅ Button click handler attached');
    }
    
    // Customer login button handler
    if (customerLoginBtn) {
        customerLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🔄 Redirecting to customer login...');
            window.location.href = '../Registration-Customer/login.html';
        });
    }
    
    // Enter key support
    if (usernameInput) {
        usernameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                passwordInput.focus();
            }
        });
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleLogin(e);
            }
        });
    }
    
    console.log('🚀 Admin login initialization complete');
});

async function handleLogin(event) {
    event.preventDefault();
    console.log('🔐 Login attempt started');
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('admin-login-btn');
    
    console.log('📝 Form data:', { username: username, hasPassword: !!password });
    
    // Reset error message
    hideError();
    
    // Validate inputs
    if (!username || !password) {
        console.log('❌ Validation failed: Missing username or password');
        showError('Please enter both username and password');
        return;
    }
    
    // Show loading state
    const originalText = loginBtn.textContent;
    loginBtn.textContent = 'Logging in...';
    loginBtn.disabled = true;
    
    try {
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        const response = await fetch('/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password }),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Store employee information in localStorage
            localStorage.setItem('employee_id', data.employee.employee_id);
            localStorage.setItem('employee_username', data.employee.employee_username);
            localStorage.setItem('employee_position', data.employee.employee_position);
            localStorage.setItem('employee_first_name', data.employee.employee_first_name);
            localStorage.setItem('employee_last_name', data.employee.employee_last_name);
            
            // Show success and redirect immediately
            loginBtn.textContent = 'Success!';
            loginBtn.style.backgroundColor = '#28a745';
            
            // Immediate redirect for better performance
            window.location.href = 'admin-dashboard.html';
            
        } else {
            console.error('Login failed:', data.message);
            showError(data.message || 'Invalid username or password. Please try again.');
            resetButton();
        }
        
    } catch (error) {
        console.error('Login error:', error);
        
        if (error.name === 'AbortError') {
            showError('Login request timed out. Please check your connection and try again.');
        } else {
            showError('Unable to connect to server. Please check your connection and try again.');
        }
        resetButton();
    }
    
    function resetButton() {
        loginBtn.textContent = originalText;
        loginBtn.disabled = false;
        loginBtn.style.backgroundColor = '';
    }
}

function showError(message) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    
    // Auto-hide error after 5 seconds
    setTimeout(() => {
        hideError();
    }, 5000);
}

function hideError() {
    const errorMessage = document.getElementById('error-message');
    errorMessage.style.display = 'none';
}

// Demo credentials auto-fill (for development)
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 'd') {
        event.preventDefault();
        document.getElementById('username').value = 'jrizal';
        document.getElementById('password').value = 'admin123';
        showError('Demo credentials filled! Press Enter or click Admin Login.');
    }
});

// Test real employee credentials button (for development)
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.shiftKey && event.key === 'T') {
        event.preventDefault();
        testRealEmployeeCredentials();
    }
});

async function testRealEmployeeCredentials() {
    const credentials = [
        {username: 'jrizal', password: 'admin123'},
        {username: 'abonifacio', password: 'admin123'},
        {username: 'gdelpilar', password: 'admin123'},
        {username: 'gsilang', password: 'admin123'}
    ];
    
    console.log('🔧 Testing real employee credentials...');
    
    for (const cred of credentials) {
        try {
            const response = await fetch('/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cred)
            });
            const data = await response.json();
            console.log(`${cred.username}: ${response.ok ? '✅' : '❌'}`, data);
        } catch (error) {
            console.log(`${cred.username}: ❌ Error`, error.message);
        }
    }
}
