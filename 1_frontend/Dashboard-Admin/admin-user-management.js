// Admin User Management - Full Integration with Backend APIs
class UserManagement {
    constructor() {
        this.customers = [];
        this.filteredCustomers = [];
        this.selectedCustomers = new Set();
        this.currentPage = 1;
        this.pageSize = 25;
        this.totalCustomers = 0;
        this.currentStatusFilter = 'all';
        this.currentSearchTerm = '';
        this.searchInstance = null;
        
        this.init();
    }
    
    async init() {
        console.log('🚀 User Management initializing...');
        
        // Check authentication
        if (!this.checkAuth()) return;
        
        // Run connectivity test first
        if (window.ConnectivityTest) {
            await ConnectivityTest.runFullDiagnostic();
        }
        
        // Initialize event listeners
        this.initializeEventListeners();
        
        // Initialize search functionality
        this.initializeSearch();
        
        // Load initial data
        await this.loadCustomers();
        
        console.log('✅ User Management initialized successfully');
    }
    
    checkAuth() {
        const employeeId = localStorage.getItem('employee_id');
        const employeeUsername = localStorage.getItem('employee_username');
        
        if (!employeeId || !employeeUsername) {
            console.log('No valid session found, redirecting to login');
            window.location.href = 'admin-login.html';
            return false;
        }
        
        return true;
    }
    
    initializeEventListeners() {
        // Status filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.currentStatusFilter = e.target.value;
                this.currentPage = 1;
                this.loadCustomers();
            });
        }
        
        // Page size selector
        const pageSize = document.getElementById('pageSize');
        if (pageSize) {
            pageSize.addEventListener('change', (e) => {
                this.pageSize = parseInt(e.target.value);
                this.currentPage = 1;
                this.loadCustomers();
            });
        }
        
        // Pagination controls
        const prevBtn = document.getElementById('prevPageBtn');
        const nextBtn = document.getElementById('nextPageBtn');
        
        if (prevBtn) prevBtn.addEventListener('click', () => this.previousPage());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextPage());
        
        // Bulk actions
        const selectAllBtn = document.getElementById('selectAllBtn');
        const selectAllCheck = document.getElementById('selectAllCheckbox');
        const bulkStatusBtn = document.getElementById('bulkStatusBtn');
        
        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => {
                const selectAllCheck = document.getElementById('selectAllCheckbox');
                if (selectAllCheck) {
                    selectAllCheck.checked = !selectAllCheck.checked;
                    this.toggleSelectAll();
                }
            });
        }
        if (selectAllCheck) {
            selectAllCheck.addEventListener('change', () => this.toggleSelectAll());
        }
        if (bulkStatusBtn) bulkStatusBtn.addEventListener('click', () => this.showBulkStatusModal());
        
        // Modal controls
        this.initializeModals();
    }
    
    initializeModals() {
        // Status update modal
        const statusModal = document.getElementById('statusModal');
        const closeModal = document.getElementById('closeModal');
        const cancelStatusUpdate = document.getElementById('cancelStatusUpdate');
        const confirmStatusUpdate = document.getElementById('confirmStatusUpdate');
        
        if (closeModal) closeModal.addEventListener('click', () => this.hideStatusModal());
        if (cancelStatusUpdate) cancelStatusUpdate.addEventListener('click', () => this.hideStatusModal());
        if (confirmStatusUpdate) confirmStatusUpdate.addEventListener('click', () => this.updateCustomerStatus());
        
        // Profile modal
        const profileModal = document.getElementById('profileModal');
        const closeProfileModal = document.getElementById('closeProfileModal');
        const closeProfileBtn = document.getElementById('closeProfileBtn');
        const viewFullProfile = document.getElementById('viewFullProfile');
        
        if (closeProfileModal) closeProfileModal.addEventListener('click', () => this.hideProfileModal());
        if (closeProfileBtn) closeProfileBtn.addEventListener('click', () => this.hideProfileModal());
        if (viewFullProfile) viewFullProfile.addEventListener('click', () => this.viewFullProfile());
        
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === statusModal) this.hideStatusModal();
            if (e.target === profileModal) this.hideProfileModal();
        });
    }
    
    initializeSearch() {
        try {
            this.searchInstance = new AdminSearch(
                'customerSearchBar',
                'searchResults',
                (results) => this.displayCustomers(results),
                'customers'
            );
            
            // Handle search input directly for immediate filtering
            const searchInput = document.getElementById('customerSearchBar');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.currentSearchTerm = e.target.value.trim();
                    this.currentPage = 1;
                    
                    // Debounce the search
                    clearTimeout(this.searchTimeout);
                    this.searchTimeout = setTimeout(() => {
                        this.loadCustomers();
                    }, 300);
                });
            }
        } catch (error) {
            console.error('Search initialization failed:', error);
        }
    }
    
    async loadCustomers() {
        console.log('🔄 Loading customers...');
        
        try {
            this.showLoadingState();
            
            const params = new URLSearchParams({
                page: this.currentPage.toString(),
                limit: this.pageSize.toString()
            });
            
            if (this.currentStatusFilter && this.currentStatusFilter !== 'all') {
                params.append('status', this.currentStatusFilter);
            }
            
            if (this.currentSearchTerm) {
                params.append('search', this.currentSearchTerm);
            }
            
            // Add timeout to prevent hanging requests
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
                console.log('⏰ Customer request timed out');
            }, 10000); // 10 second timeout
            
            const response = await fetch(`/api/customers?${params.toString()}`, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            clearTimeout(timeoutId);
            console.log('📡 Customer response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('👥 Customer data received:', data);
            
            this.customers = data.customers || data || [];
            this.totalCustomers = data.total || this.customers.length;
            this.filteredCustomers = [...this.customers];
            
            // Update search instance with data
            if (this.searchInstance) {
                this.searchInstance.setOriginalData(this.customers);
            }
            
            this.displayCustomers(this.customers);
            this.updatePagination();
            this.hideLoadingState();
            
            console.log(`✅ Loaded ${this.customers.length} customers successfully`);
            
        } catch (error) {
            console.error('❌ Error loading customers:', error);
            
            let errorMessage = 'Unable to connect to server. Please try again later.';
            
            if (error.name === 'AbortError') {
                errorMessage = 'Request timed out. Please check your connection and try again.';
            } else if (error.message.includes('HTTP')) {
                errorMessage = `Server error: ${error.message}`;
            } else if (error.message.includes('JSON')) {
                errorMessage = 'Server returned invalid data. Please try again.';
            }
            
            this.showErrorState(errorMessage);
        }
    }
    
    displayCustomers(customers) {
        const container = document.getElementById('customerList');
        if (!container) return;
        
        // Clear existing content
        container.innerHTML = '';
        
        if (!customers || customers.length === 0) {
            this.showNoResultsState();
            return;
        }
        
        customers.forEach((customer, index) => {
            const customerCard = this.createCustomerCard(customer, index);
            container.appendChild(customerCard);
        });
        
        this.updateBulkActionButtons();
    }
    
    createCustomerCard(customer, index) {
        const card = document.createElement('div');
        card.className = 'account-info-card new';
        card.setAttribute('data-cif', customer.cif_number);
        
        const statusClass = this.getStatusClass(customer.customer_status);
        const isSelected = this.selectedCustomers.has(customer.cif_number);
        
        card.innerHTML = `
            <div class="account">
                <div class="top-label-2">
                    <label>
                        <input type="checkbox" class="customer-checkbox" data-cif="${customer.cif_number}" ${isSelected ? 'checked' : ''}>
                    </label>
                    <label>${customer.cif_number}</label>
                    <label>${customer.customer_username || 'N/A'}</label>
                    <label>${customer.customer_last_name || 'N/A'}</label>
                    <label>${customer.customer_first_name || 'N/A'}</label>
                    <label>${customer.gender || 'N/A'}</label>
                    <label>${customer.citizenship || 'N/A'}</label>
                    <label class="${statusClass}">${customer.customer_status}</label>
                    <label>${customer.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A'}</label>
                    <label>
                        <div class="action-buttons">
                            <button class="action-btn btn-view" onclick="userManagement.showCustomerProfile('${customer.cif_number}')">
                                👁️ View
                            </button>
                            <button class="action-btn btn-status" onclick="userManagement.showStatusModal('${customer.cif_number}')">
                                ⚙️ Status
                            </button>
                        </div>
                    </label>
                </div>
            </div>
        `;
        
        // Add checkbox event listener
        const checkbox = card.querySelector('.customer-checkbox');
        if (checkbox) {
            checkbox.addEventListener('change', (e) => {
                this.handleCustomerSelection(customer.cif_number, e.target.checked);
            });
        }
        
        // Add click handler for the card (excluding buttons and checkbox)
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.action-buttons') && !e.target.closest('.customer-checkbox')) {
                this.showCustomerProfile(customer.cif_number);
            }
        });
        
        return card;
    }
    
    getStatusClass(status) {
        const statusMap = {
            'Active': 'status-active',
            'Inactive': 'status-inactive',
            'Suspended': 'status-suspended',
            'Pending Verification': 'status-pending',
            'Dormant': 'status-dormant'
        };
        
        return statusMap[status] || '';
    }
    
    handleCustomerSelection(cifNumber, isSelected) {
        if (isSelected) {
            this.selectedCustomers.add(cifNumber);
        } else {
            this.selectedCustomers.delete(cifNumber);
        }
        
        this.updateSelectAllCheckbox();
        this.updateBulkActionButtons();
    }
    
    toggleSelectAll() {
        const selectAllCheck = document.getElementById('selectAllCheckbox');
        const checkboxes = document.querySelectorAll('.customer-checkbox');
        
        console.log('🔄 Toggle Select All clicked, current state:', selectAllCheck?.checked);
        console.log('📋 Found checkboxes:', checkboxes.length);
        
        if (selectAllCheck && selectAllCheck.checked) {
            // Select all visible customers
            this.customers.forEach(customer => {
                this.selectedCustomers.add(customer.cif_number);
            });
            checkboxes.forEach(cb => {
                cb.checked = true;
            });
            console.log('✅ Selected all customers:', this.selectedCustomers.size);
        } else {
            // Deselect all
            this.selectedCustomers.clear();
            checkboxes.forEach(cb => {
                cb.checked = false;
            });
            console.log('❌ Deselected all customers');
        }
        
        this.updateBulkActionButtons();
        this.updateSelectAllCheckbox();
    }
    
    updateSelectAllCheckbox() {
        const selectAllCheck = document.getElementById('selectAllCheckbox');
        if (!selectAllCheck) return;
        
        const totalVisible = this.customers.length;
        const selectedVisible = this.customers.filter(c => this.selectedCustomers.has(c.cif_number)).length;
        
        selectAllCheck.checked = totalVisible > 0 && selectedVisible === totalVisible;
        selectAllCheck.indeterminate = selectedVisible > 0 && selectedVisible < totalVisible;
    }
    
    updateBulkActionButtons() {
        const bulkStatusBtn = document.getElementById('bulkStatusBtn');
        const selectedCount = this.selectedCustomers.size;
        
        if (bulkStatusBtn) {
            bulkStatusBtn.disabled = selectedCount === 0;
            bulkStatusBtn.textContent = selectedCount > 0 ? `Update Status (${selectedCount})` : 'Update Status';
        }
    }
    
    // Pagination methods
    nextPage() {
        if (this.currentPage < this.getTotalPages()) {
            this.currentPage++;
            this.loadCustomers();
        }
    }
    
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadCustomers();
        }
    }
    
    goToPage(page) {
        if (page >= 1 && page <= this.getTotalPages()) {
            this.currentPage = page;
            this.loadCustomers();
        }
    }
    
    getTotalPages() {
        return Math.ceil(this.totalCustomers / this.pageSize);
    }
    
    updatePagination() {
        const paginationContainer = document.getElementById('paginationContainer');
        const paginationInfo = document.getElementById('paginationInfo');
        const prevBtn = document.getElementById('prevPageBtn');
        const nextBtn = document.getElementById('nextPageBtn');
        const pageNumbers = document.getElementById('pageNumbers');
        
        if (!paginationContainer || this.totalCustomers === 0) {
            if (paginationContainer) paginationContainer.style.display = 'none';
            return;
        }
        
        paginationContainer.style.display = 'flex';
        
        // Update info
        const start = (this.currentPage - 1) * this.pageSize + 1;
        const end = Math.min(this.currentPage * this.pageSize, this.totalCustomers);
        if (paginationInfo) {
            paginationInfo.textContent = `Showing ${start} - ${end} of ${this.totalCustomers} customers`;
        }
        
        // Update buttons
        if (prevBtn) prevBtn.disabled = this.currentPage <= 1;
        if (nextBtn) nextBtn.disabled = this.currentPage >= this.getTotalPages();
        
        // Update page numbers
        if (pageNumbers) {
            const totalPages = this.getTotalPages();
            const maxVisible = 5;
            let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
            let endPage = Math.min(totalPages, startPage + maxVisible - 1);
            
            if (endPage - startPage + 1 < maxVisible) {
                startPage = Math.max(1, endPage - maxVisible + 1);
            }
            
            pageNumbers.innerHTML = '';
            
            for (let i = startPage; i <= endPage; i++) {
                const pageBtn = document.createElement('button');
                pageBtn.className = `page-number ${i === this.currentPage ? 'active' : ''}`;
                pageBtn.textContent = i;
                pageBtn.addEventListener('click', () => this.goToPage(i));
                pageNumbers.appendChild(pageBtn);
            }
        }
    }
    
    // Status management
    showStatusModal(cifNumber) {
        const modal = document.getElementById('statusModal');
        const modalText = document.getElementById('statusModalText');
        
        if (cifNumber) {
            // Single customer
            this.selectedCustomers.clear();
            this.selectedCustomers.add(cifNumber);
            if (modalText) {
                modalText.textContent = `Update status for customer ${cifNumber}?`;
            }
        } else {
            // Bulk update
            if (modalText) {
                modalText.textContent = `Update status for ${this.selectedCustomers.size} selected customer(s)?`;
            }
        }
        
        if (modal) modal.style.display = 'flex';
    }
    
    showBulkStatusModal() {
        if (this.selectedCustomers.size === 0) return;
        this.showStatusModal();
    }
    
    hideStatusModal() {
        const modal = document.getElementById('statusModal');
        if (modal) modal.style.display = 'none';
    }
    
    async updateCustomerStatus() {
        const newStatus = document.getElementById('newStatus').value;
        const reason = document.getElementById('statusReason').value.trim();
        
        if (!newStatus) {
            alert('Please select a status');
            return;
        }
        
        try {
            const promises = Array.from(this.selectedCustomers).map(async (cifNumber) => {
                const response = await fetch(`/admin/customers/${cifNumber}/status`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        status: newStatus,
                        reason: reason,
                        employee_id: localStorage.getItem('employee_id')
                    })
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(`Failed to update ${cifNumber}: ${error.message}`);
                }
                
                return response.json();
            });
            
            await Promise.all(promises);
            
            this.hideStatusModal();
            this.selectedCustomers.clear();
            await this.loadCustomers(); // Reload to show updated statuses
            
            // Show success message
            this.showNotification(`Successfully updated status for ${promises.length} customer(s)`, 'success');
            
        } catch (error) {
            console.error('Error updating customer status:', error);
            this.showNotification(`Error updating status: ${error.message}`, 'error');
        }
    }
    
    // Profile viewing
    async showCustomerProfile(cifNumber) {
        try {
            const response = await fetch(`/admin/customers/${cifNumber}`);
            const customer = await response.json();
            
            if (response.ok) {
                this.displayProfileInModal(customer);
            } else {
                throw new Error(customer.message || 'Failed to load customer profile');
            }
        } catch (error) {
            console.error('Error loading customer profile:', error);
            this.showNotification(`Error loading profile: ${error.message}`, 'error');
        }
    }
    
    displayProfileInModal(customer) {
        const profileContent = document.getElementById('profileContent');
        const viewFullProfile = document.getElementById('viewFullProfile');
        
        if (profileContent) {
            profileContent.innerHTML = `
                <div class="profile-content">
                    <div class="profile-section">
                        <h4>Personal Information</h4>
                        <div class="profile-field">
                            <span>CIF Number:</span>
                            <strong>${customer.cif_number}</strong>
                        </div>
                        <div class="profile-field">
                            <span>Full Name:</span>
                            <strong>${[customer.customer_first_name, customer.customer_last_name].filter(n => n && n !== 'N/A').join(' ')}</strong>
                        </div>
                        <div class="profile-field">
                            <span>Username:</span>
                            <strong>${customer.customer_username || 'N/A'}</strong>
                        </div>
                        <div class="profile-field">
                            <span>Status:</span>
                            <strong class="${this.getStatusClass(customer.customer_status)}">${customer.customer_status}</strong>
                        </div>
                    </div>
                    
                    <div class="profile-section">
                        <h4>Personal Information</h4>
                        <div class="profile-field">
                            <span>Gender:</span>
                            <strong>${customer.gender || 'N/A'}</strong>
                        </div>
                        <div class="profile-field">
                            <span>Citizenship:</span>
                            <strong>${customer.citizenship || 'N/A'}</strong>
                        </div>
                        <div class="profile-field">
                            <span>Date of Birth:</span>
                            <strong>${customer.birth_date ? new Date(customer.birth_date).toLocaleDateString() : 'N/A'}</strong>
                        </div>
                    </div>
                    
                    <div class="profile-section">
                        <h4>Account Information</h4>
                        <div class="profile-field">
                            <span>Date Created:</span>
                            <strong>${customer.date_created ? new Date(customer.date_created).toLocaleDateString() : 'N/A'}</strong>
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (viewFullProfile) {
            viewFullProfile.onclick = () => {
                window.location.href = `admin-customer-profile.html?cif=${customer.cif_number}`;
            };
        }
        
        const modal = document.getElementById('profileModal');
        if (modal) modal.style.display = 'flex';
    }
    
    hideProfileModal() {
        const modal = document.getElementById('profileModal');
        if (modal) modal.style.display = 'none';
    }
    
    viewFullProfile() {
        const selectedCif = Array.from(this.selectedCustomers)[0];
        if (selectedCif) {
            window.location.href = `admin-customer-profile.html?cif=${selectedCif}`;
        }
    }
    

    
    // Loading states
    showLoadingState() {
        const container = document.getElementById('customerList');
        if (container) {
            container.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Loading customers...</p>
                </div>
            `;
        }
    }
    
    hideLoadingState() {
        // Loading state is automatically hidden when displayCustomers is called
    }
    
    showErrorState(message) {
        const container = document.getElementById('customerList');
        if (container) {
            container.innerHTML = `
                <div class="no-results">
                    <h3>Error Loading Customers</h3>
                    <p>${message}</p>
                    <button class="btn-primary" onclick="userManagement.loadCustomers()">Retry</button>
                </div>
            `;
        }
    }
    
    showNoResultsState() {
        const container = document.getElementById('customerList');
        if (container) {
            container.innerHTML = `
                <div class="no-results">
                    <h3>No Customers Found</h3>
                    <p>No customers match your current search and filter criteria.</p>
                    <button class="btn-secondary" onclick="userManagement.clearFilters()">Clear Filters</button>
                </div>
            `;
        }
    }
    
    clearFilters() {
        // Reset filters
        this.currentStatusFilter = 'all';
        this.currentSearchTerm = '';
        this.currentPage = 1;
        
        // Update UI
        const statusFilter = document.getElementById('statusFilter');
        const searchInput = document.getElementById('customerSearchBar');
        
        if (statusFilter) statusFilter.value = 'all';
        if (searchInput) searchInput.value = '';
        
        // Reload data
        this.loadCustomers();
    }
    
    // Notification system
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;
        
        // Add styles
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
        
        // Set colors based on type
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
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.userManagement = new UserManagement();
});

// Add CSS for notifications
const notificationCSS = `
@keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

.notification button {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    padding: 0;
    color: inherit;
    opacity: 0.7;
}

.notification button:hover {
    opacity: 1;
}
`;

// Inject notification CSS
const style = document.createElement('style');
style.textContent = notificationCSS;
document.head.appendChild(style);
