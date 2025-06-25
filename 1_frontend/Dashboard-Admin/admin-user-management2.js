// Enhanced admin employee management system
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Employee Management initializing...');
    
    // Check if user is logged in
    const employeeId = localStorage.getItem('employee_id');
    const employeeUsername = localStorage.getItem('employee_username');
    
    if (!employeeId || !employeeUsername) {
        console.log('❌ No valid session found, redirecting to login');
        window.location.href = 'admin-login.html';
        return;
    }

    console.log(`✅ Valid session found for ${employeeUsername}`);

    // Run connectivity test first
    if (window.ConnectivityTest) {
        await ConnectivityTest.runFullDiagnostic();
    }

    // Initialize page
    loadEmployees();
    setupEventListeners();
    setupSearchAndFilters();
    
    console.log('✅ Employee Management initialized successfully');
});

// Global variables
let employees = [];
let filteredEmployees = [];
let currentEditingEmployee = null;

// Setup event listeners
function setupEventListeners() {
    // Modal functionality
    const modal = document.getElementById('employeeModal');
    const closeBtn = document.querySelector('.employee-modal .close');
    const cancelBtn = document.getElementById('cancelBtn');
    const addEmployeeBtn = document.getElementById('addEmployeeBtn');
    const exportBtn = document.getElementById('exportEmployeesBtn');
    const employeeForm = document.getElementById('employeeForm');
    
    // Modal controls
    closeBtn.onclick = () => closeModal();
    cancelBtn.onclick = () => closeModal();
    addEmployeeBtn.onclick = () => openAddEmployeeModal();
    exportBtn.onclick = () => exportEmployeeList();
    
    window.onclick = (event) => {
        if (event.target === modal) {
            closeModal();
        }
    };
    
    // Form submission
    employeeForm.addEventListener('submit', handleEmployeeFormSubmit);
    
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

// Setup search and filter functionality
function setupSearchAndFilters() {
    const searchBar = document.getElementById('employeeSearchBar');
    const statusFilter = document.getElementById('statusFilter');
    
    let searchTimeout;
    
    searchBar.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const searchIcon = document.querySelector('.search-icon');
        const loadingSpinner = document.querySelector('.search-loading-spinner');
        
        if (this.value.length >= 2) {
            searchIcon.style.display = 'none';
            loadingSpinner.style.display = 'block';
            
            searchTimeout = setTimeout(() => {
                performSearch();
                searchIcon.style.display = 'block';
                loadingSpinner.style.display = 'none';
            }, 500);
        } else if (this.value.length === 0) {
            loadingSpinner.style.display = 'none';
            searchIcon.style.display = 'block';
            filteredEmployees = [...employees];
            displayEmployees(filteredEmployees);
        }
    });
    
    statusFilter.addEventListener('change', performSearch);
}

// Load employees from backend
async function loadEmployees() {
    console.log('🔄 Loading employees...');
    
    try {
        document.getElementById('employees-loading').style.display = 'block';
        document.getElementById('employee-cards').style.display = 'none';
        document.getElementById('no-employees-message').style.display = 'none';
        
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
            console.log('⏰ Employee request timed out');
        }, 10000); // 10 second timeout
        
        const response = await fetch('/api/employees', {
            signal: controller.signal,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        clearTimeout(timeoutId);
        console.log('📡 Employee response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('👨‍💼 Employee data received:', data);
        
        employees = data.employees || data || [];
        filteredEmployees = [...employees];
        
        document.getElementById('employees-loading').style.display = 'none';
        
        if (employees.length > 0) {
            displayEmployees(filteredEmployees);
            document.getElementById('employee-cards').style.display = 'block';
            console.log(`✅ Loaded ${employees.length} employees successfully`);
        } else {
            document.getElementById('no-employees-message').innerHTML = '<p>No employees found in the system.</p>';
            document.getElementById('no-employees-message').style.display = 'block';
            console.log('ℹ️ No employees found');
        }
        
    } catch (error) {
        console.error('❌ Error loading employees:', error);
        document.getElementById('employees-loading').style.display = 'none';
        
        let errorMessage = 'Unable to connect to server. Please check your connection and try again.';
        
        if (error.name === 'AbortError') {
            errorMessage = 'Request timed out. Please check your connection and try again.';
        } else if (error.message.includes('HTTP')) {
            errorMessage = `Server error: ${error.message}`;
        } else if (error.message.includes('JSON')) {
            errorMessage = 'Server returned invalid data. Please try again.';
        }
        
        // Show user-friendly error message
        const noEmployeesDiv = document.getElementById('no-employees-message');
        noEmployeesDiv.innerHTML = `
            <h3>Failed to load employees</h3>
            <p>${errorMessage}</p>
            <button onclick="loadEmployees()" class="retry-button">Retry</button>
        `;
        noEmployeesDiv.style.display = 'block';
    }
}

// Display employees list
function displayEmployees(employeeList) {
    const employeeContainer = document.getElementById('employee-cards');
    
    if (!employeeList || employeeList.length === 0) {
        document.getElementById('no-employees-message').style.display = 'block';
        employeeContainer.style.display = 'none';
        return;
    }
    
    document.getElementById('no-employees-message').style.display = 'none';
    employeeContainer.innerHTML = employeeList.map(employee => `
        <div class="employee-row" data-employee-id="${employee.employee_id}">
            <div class="employee-cell employee-id" data-label="Employee ID">
                <span class="employee-id-badge">${employee.employee_id}</span>
            </div>
            <div class="employee-cell employee-name" data-label="Full Name">
                <div class="name-container">
                    <span class="full-name">${employee.employee_first_name} ${employee.employee_last_name}</span>
                </div>
            </div>
            <div class="employee-cell employee-username" data-label="Username">
                <span class="username-text">${employee.employee_username || 'N/A'}</span>
            </div>
            <div class="employee-cell employee-position" data-label="Position">
                <span class="position-badge">${employee.employee_position || 'N/A'}</span>
            </div>
            <div class="employee-cell employee-status" data-label="Status">
                <span class="status-badge status-active">Active</span>
            </div>
            <div class="employee-cell employee-date" data-label="Created Date">
                <span class="date-text">${formatDate(employee.created_at) || 'N/A'}</span>
            </div>
            <div class="employee-cell employee-actions" data-label="Actions">
                <div class="action-buttons">
                    <button class="action-btn btn-edit" onclick="editEmployee('${employee.employee_id}')" title="Edit Employee">
                        <span class="btn-icon">✏️</span>
                        <span class="btn-text">Edit</span>
                    </button>
                    <button class="action-btn btn-delete" onclick="deleteEmployee('${employee.employee_id}')" title="Delete Employee">
                        <span class="btn-icon">🗑️</span>
                        <span class="btn-text">Delete</span>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    employeeContainer.style.display = 'block';
}

// Perform search and filtering
function performSearch() {
    const searchQuery = document.getElementById('employeeSearchBar').value.toLowerCase().trim();
    const statusFilter = document.getElementById('statusFilter').value;
    
    // Show loading spinner
    const loadingSpinner = document.querySelector('.search-loading-spinner');
    if (loadingSpinner) {
        loadingSpinner.style.display = 'block';
    }
    
    // Debounced search for better performance
    setTimeout(() => {
        filteredEmployees = employees.filter(employee => {
            // Search filter
            const matchesSearch = !searchQuery || 
                employee.employee_id.toString().includes(searchQuery) ||
                `${employee.employee_first_name} ${employee.employee_last_name}`.toLowerCase().includes(searchQuery) ||
                employee.employee_username.toLowerCase().includes(searchQuery) ||
            (employee.employee_position && employee.employee_position.toLowerCase().includes(searchQuery));
        
        // Status filter
        const matchesStatus = statusFilter === 'all' || 
            (employee.employee_status || 'Active') === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
        displayEmployees(filteredEmployees);
        
        // Hide loading spinner
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }
        
        // Show search results summary if searching
        if (searchQuery || statusFilter !== 'all') {
            showSearchResults(filteredEmployees.length, employees.length);
        } else {
            hideSearchResults();
        }
    }, 300); // 300ms debounce
}

// Show search results summary
function showSearchResults(filteredCount, totalCount) {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = `
        <p>Showing ${filteredCount} of ${totalCount} employees</p>
    `;
    searchResults.style.display = 'block';
}

// Hide search results summary
function hideSearchResults() {
    document.getElementById('searchResults').style.display = 'none';
}

// Open add employee modal
function openAddEmployeeModal() {
    currentEditingEmployee = null;
    document.getElementById('modalTitle').textContent = 'Add New Employee';
    document.getElementById('employeeForm').reset();
    document.getElementById('employeePassword').required = true;
    document.getElementById('employeeModal').style.display = 'block';
}

// Edit employee
function editEmployee(employeeId) {
    const employee = employees.find(emp => emp.employee_id.toString() === employeeId.toString());
    
    if (!employee) {
        alert('Employee not found');
        return;
    }
    
    console.log('🔧 Editing employee:', employee);
    currentEditingEmployee = employee;
    document.getElementById('modalTitle').textContent = 'Edit Employee';
    
    // Populate form with available fields
    document.getElementById('employeeUsername').value = employee.employee_username || '';
    document.getElementById('employeePassword').value = '';
    document.getElementById('employeePassword').required = false; // Password is optional for edits
    document.getElementById('employeeFirstName').value = employee.employee_first_name || '';
    document.getElementById('employeeLastName').value = employee.employee_last_name || '';
    document.getElementById('employeePosition').value = employee.employee_position || '';
    document.getElementById('employeeStatus').value = 'Active'; // Default since status not in DB
    
    // Show modal
    document.getElementById('employeeModal').style.display = 'block';
}

// Handle employee form submission
async function handleEmployeeFormSubmit(event) {
    event.preventDefault();
    
    const formData = {
        username: document.getElementById('employeeUsername').value,
        password: document.getElementById('employeePassword').value,
        firstName: document.getElementById('employeeFirstName').value,
        lastName: document.getElementById('employeeLastName').value,
        position: document.getElementById('employeePosition').value,
        status: document.getElementById('employeeStatus').value
    };
    
    try {
        let response;
        
        if (currentEditingEmployee) {
            // Update existing employee
            response = await fetch(`/admin/employees/${currentEditingEmployee.employee_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    employee_id: localStorage.getItem('employee_id')
                })
            });
        } else {
            // Create new employee
            response = await fetch('/admin/employees', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    created_by: localStorage.getItem('employee_id')
                })
            });
        }
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save employee');
        }
        
        const result = await response.json();
        
        closeModal();
        await loadEmployees(); // Reload the employee list
        
        showNotification(currentEditingEmployee ? 'Employee updated successfully!' : 'Employee created successfully!', 'success');
        
    } catch (error) {
        console.error('Error saving employee:', error);
        showNotification(`Failed to save employee: ${error.message}`, 'error');
    }
}



// Delete employee
async function deleteEmployee(employeeId) {
    const employee = employees.find(emp => emp.employee_id.toString() === employeeId.toString());
    
    if (!employee) {
        alert('Employee not found');
        return;
    }
    
    const confirmation = confirm(`Are you sure you want to delete ${employee.employee_first_name} ${employee.employee_last_name}?\n\nThis action cannot be undone.`);
    if (!confirmation) return;
    
    try {
        const response = await fetch(`/admin/employees/${employeeId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                deleted_by: localStorage.getItem('employee_id')
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete employee');
        }
        
        await loadEmployees(); // Reload the employee list
        showNotification('Employee deleted successfully!', 'success');
        
    } catch (error) {
        console.error('Error deleting employee:', error);
        showNotification('Failed to delete employee. Please try again.', 'error');
    }
}

// Close modal
function closeModal() {
    document.getElementById('employeeModal').style.display = 'none';
    document.getElementById('employeeForm').reset();
    currentEditingEmployee = null;
}

// Export employee list
function exportEmployeeList() {
    if (filteredEmployees.length === 0) {
        showNotification('No employees to export', 'warning');
        return;
    }
    
    // Create CSV content
    const headers = ['Employee ID', 'Full Name', 'Email', 'Department', 'Role', 'Status', 'Created Date'];
    const csvContent = [
        headers.join(','),
        ...filteredEmployees.map(employee => [
            employee.employee_id,
            `"${employee.employee_first_name} ${employee.employee_middle_name || ''} ${employee.employee_last_name}".trim()`,
            `"${employee.employee_email || 'N/A'}"`,
            `"${employee.employee_department || 'N/A'}"`,
            `"${employee.employee_position || 'N/A'}"`,
            `"${employee.employee_status || 'Active'}"`,
            `"${formatDate(employee.created_at)}"`
        ].join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `employees_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 15px;
    `;
    
    const colors = {
        success: { bg: '#d4edda', border: '#c3e6cb', text: '#155724' },
        error: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' },
        warning: { bg: '#fff3cd', border: '#ffeaa7', text: '#856404' },
        info: { bg: '#d1ecf1', border: '#bee5eb', text: '#0c5460' }
    };
    
    const color = colors[type] || colors.info;
    notification.style.backgroundColor = color.bg;
    notification.style.borderLeft = `4px solid ${color.border}`;
    notification.style.color = color.text;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Make functions globally available
window.editEmployee = editEmployee;
// Reset password functionality removed
window.resetEmployeePassword = resetEmployeePassword;
window.deleteEmployee = deleteEmployee;
