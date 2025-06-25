/**
 * Admin Review Queue - Account Verification Management
 * Handles customer account verification queue operations
 */

class AdminReviewQueue {
  constructor() {
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.totalItems = 0;
    this.reviewItems = [];
    this.filteredItems = [];
    this.searchTerm = '';
    this.statusFilter = '';
    this.customerTypeFilter = '';
    this.isLoading = false;
    this.selectedReview = null;
    
    this.init();
  }

  async init() {
    try {
      await this.checkAuthentication();
      this.setupEventListeners();
      await this.loadReviewQueue();
      this.updateStats();
    } catch (error) {
      console.error('Initialization error:', error);
      this.showError('Failed to initialize review queue');
    }
  }

  async checkAuthentication() {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      if (data.user.role !== 'admin') {
        throw new Error('Insufficient permissions');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      window.location.href = '../login.html';
    }
  }

  setupEventListeners() {
    // Search functionality
    const searchBar = document.getElementById('queueSearchBar');
    if (searchBar) {
      searchBar.addEventListener('input', this.debounce((e) => {
        this.handleSearch(e.target.value);
      }, 300));
    }

    // Filter controls
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this.statusFilter = e.target.value;
        this.applyFilters();
      });
    }

    const customerTypeFilter = document.getElementById('customerTypeFilter');
    if (customerTypeFilter) {
      customerTypeFilter.addEventListener('change', (e) => {
        this.customerTypeFilter = e.target.value;
        this.applyFilters();
      });
    }

    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.loadReviewQueue();
      });
    }

    // Retry button
    const retryBtn = document.getElementById('retryBtn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.loadReviewQueue();
      });
    }

    // Modal controls
    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
      closeModal.addEventListener('click', () => {
        this.closeModal();
      });
    }

    const approveBtn = document.getElementById('approveBtn');
    if (approveBtn) {
      approveBtn.addEventListener('click', () => {
        this.handleApproveReview();
      });
    }

    const rejectBtn = document.getElementById('rejectBtn');
    if (rejectBtn) {
      rejectBtn.addEventListener('click', () => {
        this.handleRejectReview();
      });
    }

    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.closeModal();
      });
    }

    // Pagination
    const prevPageBtn = document.getElementById('prevPageBtn');
    if (prevPageBtn) {
      prevPageBtn.addEventListener('click', () => {
        this.goToPage(this.currentPage - 1);
      });
    }

    const nextPageBtn = document.getElementById('nextPageBtn');
    if (nextPageBtn) {
      nextPageBtn.addEventListener('click', () => {
        this.goToPage(this.currentPage + 1);
      });
    }

    // Close modal on background click
    const modal = document.getElementById('reviewModal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal();
        }
      });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    });
  }

  async loadReviewQueue() {
    this.showLoading(true);
    this.hideError();

    try {
      const response = await fetch('/api/admin/review-queue?type=verification', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        this.reviewItems = data.data || [];
        this.applyFilters();
        this.updateStats();
        this.renderPagination();
      } else {
        throw new Error(data.message || 'Failed to load review queue');
      }
    } catch (error) {
      console.error('Error loading review queue:', error);
      this.showError(`Failed to load review queue: ${error.message}`);
      this.reviewItems = [];
      this.renderEmptyState();
    } finally {
      this.showLoading(false);
    }
  }

  applyFilters() {
    let filtered = [...this.reviewItems];

    // Apply search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.first_name?.toLowerCase().includes(searchLower) ||
        item.last_name?.toLowerCase().includes(searchLower) ||
        item.email?.toLowerCase().includes(searchLower) ||
        item.phone_number?.toLowerCase().includes(searchLower) ||
        item.cif_number?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (this.statusFilter) {
      filtered = filtered.filter(item => item.status === this.statusFilter);
    }

    // Apply customer type filter
    if (this.customerTypeFilter) {
      filtered = filtered.filter(item => item.customer_type === this.customerTypeFilter);
    }

    this.filteredItems = filtered;
    this.totalItems = filtered.length;
    this.currentPage = 1;
    this.renderReviewQueue();
    this.renderPagination();
  }

  renderReviewQueue() {
    const container = document.getElementById('reviewQueueItems');
    const emptyState = document.getElementById('emptyState');
    
    if (!container) return;

    // Calculate pagination
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const pageItems = this.filteredItems.slice(startIndex, endIndex);

    if (pageItems.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    container.innerHTML = pageItems.map(item => `
      <div class="account-info-card ${this.getStatusClass(item.status)}" 
           onclick="adminReviewQueue.showReviewDetails('${item.review_id || item.customer_id}')"
           role="button"
           tabindex="0"
           aria-label="Review ${item.first_name} ${item.last_name}'s account">
        <div class="account">
          <div class="top-label-2">
            <label title="${item.cif_number || 'N/A'}">${item.cif_number || 'N/A'}</label>
            <label title="${this.formatDateTime(item.created_at)}">${this.formatDateTime(item.created_at)}</label>
            <label title="${item.customer_type || 'N/A'}">${item.customer_type || 'N/A'}</label>
            <label title="${item.last_name || 'N/A'}">${item.last_name || 'N/A'}</label>
            <label title="${item.first_name || 'N/A'}">${item.first_name || 'N/A'}</label>
            <label title="${item.middle_name || 'N/A'}">${item.middle_name || 'N/A'}</label>
            <label title="${item.suffix || 'N/A'}">${item.suffix || 'N/A'}</label>
            <label title="${item.email || 'N/A'}">${item.email || 'N/A'}</label>
            <label title="${item.phone_number || 'N/A'}">${item.phone_number || 'N/A'}</label>
            <label>
              <span class="status-badge ${this.getStatusClass(item.status)}">
                ${this.formatStatus(item.status)}
              </span>
            </label>
          </div>
        </div>
      </div>
    `).join('');

    // Add keyboard navigation
    container.querySelectorAll('.account-info-card').forEach(card => {
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });
  }

  async showReviewDetails(reviewId) {
    try {
      const item = this.reviewItems.find(item => 
        item.review_id === reviewId || item.customer_id === reviewId
      );
      
      if (!item) {
        throw new Error('Review item not found');
      }

      this.selectedReview = item;
      
      const modalBody = document.getElementById('modalBody');
      if (!modalBody) return;

      modalBody.innerHTML = `
        <div class="review-details">
          <div class="detail-section">
            <h3>Customer Information</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>CIF Number:</label>
                <span>${item.cif_number || 'N/A'}</span>
              </div>
              <div class="detail-item">
                <label>Full Name:</label>
                <span>${this.getFullName(item)}</span>
              </div>
              <div class="detail-item">
                <label>Customer Type:</label>
                <span>${item.customer_type || 'N/A'}</span>
              </div>
              <div class="detail-item">
                <label>Email:</label>
                <span>${item.email || 'N/A'}</span>
              </div>
              <div class="detail-item">
                <label>Phone:</label>
                <span>${item.phone_number || 'N/A'}</span>
              </div>
              <div class="detail-item">
                <label>Date of Birth:</label>
                <span>${this.formatDate(item.date_of_birth) || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Address Information</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Street Address:</label>
                <span>${item.street_address || 'N/A'}</span>
              </div>
              <div class="detail-item">
                <label>City:</label>
                <span>${item.city || 'N/A'}</span>
              </div>
              <div class="detail-item">
                <label>State/Province:</label>
                <span>${item.state_province || 'N/A'}</span>
              </div>
              <div class="detail-item">
                <label>Country:</label>
                <span>${item.country || 'N/A'}</span>
              </div>
              <div class="detail-item">
                <label>ZIP Code:</label>
                <span>${item.zip_code || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Verification Status</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Current Status:</label>
                <span class="status-badge ${this.getStatusClass(item.status)}">
                  ${this.formatStatus(item.status)}
                </span>
              </div>
              <div class="detail-item">
                <label>Submitted:</label>
                <span>${this.formatDateTime(item.created_at)}</span>
              </div>
              <div class="detail-item">
                <label>Last Updated:</label>
                <span>${this.formatDateTime(item.updated_at)}</span>
              </div>
            </div>
          </div>

          ${item.documents && item.documents.length > 0 ? `
            <div class="detail-section">
              <h3>Submitted Documents</h3>
              <div class="documents-list">
                ${item.documents.map(doc => `
                  <div class="document-item">
                    <span class="document-name">${doc.name}</span>
                    <span class="document-type">${doc.type}</span>
                    <button onclick="adminReviewQueue.viewDocument('${doc.url}')" class="view-doc-btn">
                      View Document
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${item.comments ? `
            <div class="detail-section">
              <h3>Comments</h3>
              <div class="comments-text">${item.comments}</div>
            </div>
          ` : ''}
        </div>

        <style>
          .review-details { padding: 20px 0; }
          .detail-section { margin-bottom: 30px; }
          .detail-section h3 { 
            color: var(--secondary-color); 
            margin-bottom: 15px; 
            padding-bottom: 8px;
            border-bottom: 2px solid #f1f3f5;
          }
          .detail-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 15px; 
          }
          .detail-item { 
            display: flex; 
            flex-direction: column; 
            gap: 5px; 
          }
          .detail-item label { 
            font-weight: 600; 
            color: #666; 
            font-size: 14px;
          }
          .detail-item span { 
            font-size: 16px; 
            color: #333; 
          }
          .documents-list { 
            display: flex; 
            flex-direction: column; 
            gap: 12px; 
          }
          .document-item { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            padding: 12px; 
            background: #f8f9fa; 
            border-radius: 8px; 
          }
          .view-doc-btn { 
            padding: 6px 12px; 
            background: var(--tertiary-color); 
            color: white; 
            border: none; 
            border-radius: 4px; 
            cursor: pointer; 
          }
          .comments-text { 
            padding: 15px; 
            background: #f8f9fa; 
            border-radius: 8px; 
            white-space: pre-wrap; 
          }
        </style>
      `;

      this.showModal();
    } catch (error) {
      console.error('Error showing review details:', error);
      this.showError('Failed to load review details');
    }
  }

  async handleApproveReview() {
    if (!this.selectedReview) return;

    const confirmed = confirm('Are you sure you want to approve this account verification?');
    if (!confirmed) return;

    this.showLoadingOverlay(true);

    try {
      const response = await fetch(`/api/admin/review-queue/${this.selectedReview.review_id || this.selectedReview.customer_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'APPROVED',
          comments: 'Account verification approved by admin'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        this.showSuccess('Account verification approved successfully');
        this.closeModal();
        await this.loadReviewQueue();
      } else {
        throw new Error(data.message || 'Failed to approve review');
      }
    } catch (error) {
      console.error('Error approving review:', error);
      this.showError(`Failed to approve review: ${error.message}`);
    } finally {
      this.showLoadingOverlay(false);
    }
  }

  async handleRejectReview() {
    if (!this.selectedReview) return;

    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    this.showLoadingOverlay(true);

    try {
      const response = await fetch(`/api/admin/review-queue/${this.selectedReview.review_id || this.selectedReview.customer_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'REJECTED',
          comments: reason
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        this.showSuccess('Account verification rejected');
        this.closeModal();
        await this.loadReviewQueue();
      } else {
        throw new Error(data.message || 'Failed to reject review');
      }
    } catch (error) {
      console.error('Error rejecting review:', error);
      this.showError(`Failed to reject review: ${error.message}`);
    } finally {
      this.showLoadingOverlay(false);
    }
  }

  async handleSearch(searchTerm) {
    this.searchTerm = searchTerm.trim();

    if (this.searchTerm.length === 0) {
      this.hideSearchResults();
      this.applyFilters();
      return;
    }

    if (this.searchTerm.length < 2) {
      return;
    }

    this.showSearchLoading(true);

    try {
      const response = await fetch(`/api/admin/customers/search/${encodeURIComponent(this.searchTerm)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          this.showSearchResults(data.data || []);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      this.showSearchLoading(false);
    }

    // Also apply local filter
    this.applyFilters();
  }

  showSearchResults(results) {
    const searchResults = document.getElementById('searchResults');
    if (!searchResults) return;

    if (results.length === 0) {
      searchResults.innerHTML = '<div class="no-results">No customers found</div>';
    } else {
      searchResults.innerHTML = results.map(customer => `
        <div class="search-result-item" onclick="adminReviewQueue.selectSearchResult('${customer.customer_id}')">
          <div class="search-result-name">${customer.first_name} ${customer.last_name}</div>
          <div class="search-result-details">
            CIF: ${customer.cif_number} | ${customer.email} | ${customer.phone_number}
          </div>
        </div>
      `).join('');
    }

    searchResults.style.display = 'block';
  }

  hideSearchResults() {
    const searchResults = document.getElementById('searchResults');
    if (searchResults) {
      searchResults.style.display = 'none';
    }
  }

  selectSearchResult(customerId) {
    const customer = this.reviewItems.find(item => item.customer_id === customerId);
    if (customer) {
      this.showReviewDetails(customerId);
    }
    this.hideSearchResults();
  }

  // Utility methods
  getFullName(item) {
    const parts = [
      item.first_name,
      item.middle_name,
      item.last_name,
      item.suffix
    ].filter(Boolean);
    return parts.join(' ') || 'N/A';
  }

  getStatusClass(status) {
    const statusMap = {
      'PENDING': 'pending',
      'UNDER_REVIEW': 'under-review',
      'APPROVED': 'approved',
      'REJECTED': 'rejected'
    };
    return statusMap[status] || 'pending';
  }

  formatStatus(status) {
    const statusMap = {
      'PENDING': 'Pending Verification',
      'UNDER_REVIEW': 'Under Review',
      'APPROVED': 'Approved',
      'REJECTED': 'Rejected'
    };
    return statusMap[status] || status;
  }

  formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Invalid Date';
    }
  }

  formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  }

  updateStats() {
    const totalCount = document.getElementById('totalCount');
    const pendingCount = document.getElementById('pendingCount');

    if (totalCount) {
      totalCount.textContent = this.reviewItems.length;
    }

    if (pendingCount) {
      const pending = this.reviewItems.filter(item => item.status === 'PENDING').length;
      pendingCount.textContent = pending;
    }
  }

  renderPagination() {
    const container = document.getElementById('paginationContainer');
    const pageInfo = document.getElementById('pageInfo');
    const pageNumbers = document.getElementById('pageNumbers');
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');

    if (!container) return;

    const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    
    if (totalPages <= 1) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'flex';

    // Update page info
    if (pageInfo) {
      const start = (this.currentPage - 1) * this.itemsPerPage + 1;
      const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
      pageInfo.textContent = `Showing ${start}-${end} of ${this.totalItems} items`;
    }

    // Update navigation buttons
    if (prevBtn) {
      prevBtn.disabled = this.currentPage <= 1;
    }
    if (nextBtn) {
      nextBtn.disabled = this.currentPage >= totalPages;
    }

    // Update page numbers
    if (pageNumbers) {
      pageNumbers.innerHTML = '';
      const maxVisible = 5;
      let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
      let endPage = Math.min(totalPages, startPage + maxVisible - 1);

      if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-number ${i === this.currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => this.goToPage(i));
        pageNumbers.appendChild(pageBtn);
      }
    }
  }

  goToPage(page) {
    const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    if (page < 1 || page > totalPages) return;

    this.currentPage = page;
    this.renderReviewQueue();
    this.renderPagination();
  }

  // UI helper methods
  showModal() {
    const modal = document.getElementById('reviewModal');
    if (modal) {
      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  closeModal() {
    const modal = document.getElementById('reviewModal');
    if (modal) {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = 'auto';
    }
    this.selectedReview = null;
  }

  showLoading(show) {
    const loadingContainer = document.getElementById('loadingContainer');
    const tableContainer = document.getElementById('reviewQueueTable');
    
    if (loadingContainer) {
      loadingContainer.style.display = show ? 'flex' : 'none';
    }
    if (tableContainer) {
      tableContainer.style.display = show ? 'none' : 'block';
    }
  }

  showLoadingOverlay(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.style.display = show ? 'flex' : 'none';
    }
  }

  showSearchLoading(show) {
    const searchInput = document.getElementById('queueSearchBar');
    if (searchInput) {
      if (show) {
        searchInput.classList.add('loading');
      } else {
        searchInput.classList.remove('loading');
      }
    }
  }

  showError(message) {
    const errorContainer = document.getElementById('errorContainer');
    const errorMessage = document.getElementById('errorMessage');
    const tableContainer = document.getElementById('reviewQueueTable');

    if (errorContainer && errorMessage) {
      errorMessage.textContent = message;
      errorContainer.style.display = 'flex';
    }
    if (tableContainer) {
      tableContainer.style.display = 'none';
    }
  }

  hideError() {
    const errorContainer = document.getElementById('errorContainer');
    if (errorContainer) {
      errorContainer.style.display = 'none';
    }
  }

  showSuccess(message) {
    // Create a temporary success notification
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--success-color);
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 3001;
      animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  renderEmptyState() {
    const container = document.getElementById('reviewQueueItems');
    const emptyState = document.getElementById('emptyState');
    
    if (container) {
      container.innerHTML = '';
    }
    if (emptyState) {
      emptyState.style.display = 'block';
    }
  }

  viewDocument(url) {
    window.open(url, '_blank');
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Initialize the review queue when the page loads
let adminReviewQueue;

document.addEventListener('DOMContentLoaded', () => {
  adminReviewQueue = new AdminReviewQueue();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;
document.head.appendChild(style);
