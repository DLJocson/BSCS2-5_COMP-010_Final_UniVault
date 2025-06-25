/**
 * Admin Review Queue 2 - Request Approval Management
 * Handles customer service requests and transaction approvals
 */

class AdminReviewQueue2 {
  constructor() {
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.totalItems = 0;
    this.reviewItems = [];
    this.filteredItems = [];
    this.selectedItems = new Set();
    this.searchTerm = '';
    this.statusFilter = '';
    this.requestTypeFilter = '';
    this.assigneeFilter = '';
    this.isLoading = false;
    this.selectedReview = null;
    this.currentUser = null;
    
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
      
      this.currentUser = data.user;
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

    const requestTypeFilter = document.getElementById('requestTypeFilter');
    if (requestTypeFilter) {
      requestTypeFilter.addEventListener('change', (e) => {
        this.requestTypeFilter = e.target.value;
        this.applyFilters();
      });
    }

    const assigneeFilter = document.getElementById('assigneeFilter');
    if (assigneeFilter) {
      assigneeFilter.addEventListener('change', (e) => {
        this.assigneeFilter = e.target.value;
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

    // Select all checkbox
    const selectAll = document.getElementById('selectAll');
    if (selectAll) {
      selectAll.addEventListener('change', (e) => {
        this.handleSelectAll(e.target.checked);
      });
    }

    // Batch action buttons
    const batchApproveBtn = document.getElementById('batchApproveBtn');
    if (batchApproveBtn) {
      batchApproveBtn.addEventListener('click', () => {
        this.handleBatchApprove();
      });
    }

    const batchRejectBtn = document.getElementById('batchRejectBtn');
    if (batchRejectBtn) {
      batchRejectBtn.addEventListener('click', () => {
        this.handleBatchReject();
      });
    }

    const batchAssignBtn = document.getElementById('batchAssignBtn');
    if (batchAssignBtn) {
      batchAssignBtn.addEventListener('click', () => {
        this.handleBatchAssign();
      });
    }

    const clearSelectionBtn = document.getElementById('clearSelectionBtn');
    if (clearSelectionBtn) {
      clearSelectionBtn.addEventListener('click', () => {
        this.clearSelection();
      });
    }

    // Modal controls
    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
      closeModal.addEventListener('click', () => {
        this.closeModal();
      });
    }

    const assignToMeBtn = document.getElementById('assignToMeBtn');
    if (assignToMeBtn) {
      assignToMeBtn.addEventListener('click', () => {
        this.handleAssignToMe();
      });
    }

    const approveBtn = document.getElementById('approveBtn');
    if (approveBtn) {
      approveBtn.addEventListener('click', () => {
        this.showCommentsModal('APPROVED');
      });
    }

    const rejectBtn = document.getElementById('rejectBtn');
    if (rejectBtn) {
      rejectBtn.addEventListener('click', () => {
        this.showCommentsModal('REJECTED');
      });
    }

    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.closeModal();
      });
    }

    // Comments modal controls
    const closeCommentsModal = document.getElementById('closeCommentsModal');
    if (closeCommentsModal) {
      closeCommentsModal.addEventListener('click', () => {
        this.closeCommentsModal();
      });
    }

    const submitReviewBtn = document.getElementById('submitReviewBtn');
    if (submitReviewBtn) {
      submitReviewBtn.addEventListener('click', () => {
        this.handleSubmitReview();
      });
    }

    const cancelCommentsBtn = document.getElementById('cancelCommentsBtn');
    if (cancelCommentsBtn) {
      cancelCommentsBtn.addEventListener('click', () => {
        this.closeCommentsModal();
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

    // Close modals on background click
    const modal = document.getElementById('reviewModal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal();
        }
      });
    }

    const commentsModal = document.getElementById('commentsModal');
    if (commentsModal) {
      commentsModal.addEventListener('click', (e) => {
        if (e.target === commentsModal) {
          this.closeCommentsModal();
        }
      });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
        this.closeCommentsModal();
      }
    });
  }

  async loadReviewQueue() {
    this.showLoading(true);
    this.hideError();

    try {
      const response = await fetch('/api/admin/review-queue?type=requests', {
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
        item.customer_name?.toLowerCase().includes(searchLower) ||
        item.email?.toLowerCase().includes(searchLower) ||
        item.phone_number?.toLowerCase().includes(searchLower) ||
        item.cif_number?.toLowerCase().includes(searchLower) ||
        item.request_type?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (this.statusFilter) {
      filtered = filtered.filter(item => item.status === this.statusFilter);
    }

    // Apply request type filter
    if (this.requestTypeFilter) {
      filtered = filtered.filter(item => item.request_type === this.requestTypeFilter);
    }

    // Apply assignee filter
    if (this.assigneeFilter) {
      if (this.assigneeFilter === 'ME') {
        filtered = filtered.filter(item => item.assigned_to === this.currentUser?.employee_id);
      } else if (this.assigneeFilter === 'UNASSIGNED') {
        filtered = filtered.filter(item => !item.assigned_to);
      }
    }

    this.filteredItems = filtered;
    this.totalItems = filtered.length;
    this.currentPage = 1;
    this.clearSelection();
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
      <div class="account-info-card ${this.getStatusClass(item.status)} ${this.selectedItems.has(item.review_id) ? 'selected' : ''}" 
           data-review-id="${item.review_id}"
           onclick="adminReviewQueue2.showReviewDetails('${item.review_id}')"
           role="button"
           tabindex="0"
           aria-label="Review ${item.request_type} request from ${item.customer_name}">
        <div class="account">
          <div class="top-label-2">
            <div class="card-checkbox" onclick="event.stopPropagation();">
              <input type="checkbox" 
                     id="checkbox-${item.review_id}" 
                     ${this.selectedItems.has(item.review_id) ? 'checked' : ''}
                     onchange="adminReviewQueue2.handleItemSelection('${item.review_id}', this.checked)"
                     aria-label="Select request">
            </div>
            <label title="${item.cif_number || 'N/A'}">${item.cif_number || 'N/A'}</label>
            <label title="${this.formatDateTime(item.created_at)}">${this.formatDateTime(item.created_at)}</label>
            <label title="${this.formatRequestType(item.request_type)}">${this.formatRequestType(item.request_type)}</label>
            <label title="${item.customer_name || 'N/A'}">${item.customer_name || 'N/A'}</label>
            <label title="${item.email || 'N/A'}">${item.email || 'N/A'}</label>
            <label title="${item.phone_number || 'N/A'}">${item.phone_number || 'N/A'}</label>
            <label>
              <span class="assignee-badge ${item.assigned_to === this.currentUser?.employee_id ? 'me' : ''}">
                ${this.formatAssignee(item.assigned_to)}
              </span>
            </label>
            <label>
              <span class="priority-badge ${item.priority?.toLowerCase() || 'medium'}">
                ${item.priority || 'Medium'}
              </span>
            </label>
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
      const item = this.reviewItems.find(item => item.review_id === reviewId);
      
      if (!item) {
        throw new Error('Review item not found');
      }

      this.selectedReview = item;
      this.pendingReviewAction = null;
      
      const modalBody = document.getElementById('modalBody');
      if (!modalBody) return;

      modalBody.innerHTML = `
        <div class="review-details">
          <div class="detail-section">
            <h3>Request Information</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Request ID:</label>
                <span>${item.review_id}</span>
              </div>
              <div class="detail-item">
                <label>Request Type:</label>
                <span class="request-type-badge">${this.formatRequestType(item.request_type)}</span>
              </div>
              <div class="detail-item">
                <label>Priority:</label>
                <span class="priority-badge ${item.priority?.toLowerCase() || 'medium'}">
                  ${item.priority || 'Medium'}
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
              <div class="detail-item">
                <label>Status:</label>
                <span class="status-badge ${this.getStatusClass(item.status)}">
                  ${this.formatStatus(item.status)}
                </span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Customer Information</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>CIF Number:</label>
                <span>${item.cif_number || 'N/A'}</span>
              </div>
              <div class="detail-item">
                <label>Customer Name:</label>
                <span>${item.customer_name || 'N/A'}</span>
              </div>
              <div class="detail-item">
                <label>Email:</label>
                <span>${item.email || 'N/A'}</span>
              </div>
              <div class="detail-item">
                <label>Phone:</label>
                <span>${item.phone_number || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Assignment & Review</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Assigned To:</label>
                <span class="assignee-badge ${item.assigned_to === this.currentUser?.employee_id ? 'me' : ''}">
                  ${this.formatAssignee(item.assigned_to)}
                </span>
              </div>
              <div class="detail-item">
                <label>Assigned Date:</label>
                <span>${this.formatDateTime(item.assigned_at) || 'Not assigned'}</span>
              </div>
              <div class="detail-item">
                <label>Reviewed By:</label>
                <span>${item.reviewed_by || 'Not reviewed'}</span>
              </div>
              <div class="detail-item">
                <label>Review Date:</label>
                <span>${this.formatDateTime(item.reviewed_at) || 'Not reviewed'}</span>
              </div>
            </div>
          </div>

          ${item.request_description ? `
            <div class="detail-section">
              <h3>Request Description</h3>
              <div class="description-text">${item.request_description}</div>
            </div>
          ` : ''}

          ${item.supporting_documents && item.supporting_documents.length > 0 ? `
            <div class="detail-section">
              <h3>Supporting Documents</h3>
              <div class="documents-list">
                ${item.supporting_documents.map(doc => `
                  <div class="document-item">
                    <span class="document-name">${doc.name}</span>
                    <span class="document-type">${doc.type}</span>
                    <button onclick="adminReviewQueue2.viewDocument('${doc.url}')" class="view-doc-btn">
                      View Document
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${item.review_history && item.review_history.length > 0 ? `
            <div class="detail-section">
              <h3>Review History</h3>
              <div class="history-list">
                ${item.review_history.map(history => `
                  <div class="history-item">
                    <div class="history-header">
                      <span class="history-action">${history.action}</span>
                      <span class="history-date">${this.formatDateTime(history.created_at)}</span>
                    </div>
                    <div class="history-user">By: ${history.user_name}</div>
                    ${history.comments ? `<div class="history-comments">${history.comments}</div>` : ''}
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
          .request-type-badge {
            padding: 4px 8px;
            background: #e3f2fd;
            color: var(--info-color);
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
          }
          .description-text { 
            padding: 15px; 
            background: #f8f9fa; 
            border-radius: 8px; 
            white-space: pre-wrap; 
            line-height: 1.6;
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
          .history-list {
            display: flex;
            flex-direction: column;
            gap: 15px;
          }
          .history-item {
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid var(--tertiary-color);
          }
          .history-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          }
          .history-action {
            font-weight: 600;
            color: var(--secondary-color);
            text-transform: uppercase;
            font-size: 14px;
          }
          .history-date {
            font-size: 12px;
            color: #666;
          }
          .history-user {
            font-size: 13px;
            color: #666;
            margin-bottom: 8px;
          }
          .history-comments {
            font-size: 14px;
            line-height: 1.5;
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

  async handleAssignToMe() {
    if (!this.selectedReview) return;

    this.showLoadingOverlay(true);

    try {
      const response = await fetch(`/api/admin/review-queue/${this.selectedReview.review_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'ASSIGN',
          assigned_to: this.currentUser.employee_id
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        this.showSuccess('Request assigned to you successfully');
        this.closeModal();
        await this.loadReviewQueue();
      } else {
        throw new Error(data.message || 'Failed to assign request');
      }
    } catch (error) {
      console.error('Error assigning request:', error);
      this.showError(`Failed to assign request: ${error.message}`);
    } finally {
      this.showLoadingOverlay(false);
    }
  }

  showCommentsModal(action) {
    this.pendingReviewAction = action;
    const commentsModal = document.getElementById('commentsModal');
    const commentsModalTitle = document.getElementById('commentsModalTitle');
    
    if (commentsModal && commentsModalTitle) {
      commentsModalTitle.textContent = `${action === 'APPROVED' ? 'Approve' : 'Reject'} Request`;
      commentsModal.style.display = 'flex';
      commentsModal.setAttribute('aria-hidden', 'false');
    }
  }

  closeCommentsModal() {
    const commentsModal = document.getElementById('commentsModal');
    const commentsTextarea = document.getElementById('reviewComments');
    
    if (commentsModal) {
      commentsModal.style.display = 'none';
      commentsModal.setAttribute('aria-hidden', 'true');
    }
    
    if (commentsTextarea) {
      commentsTextarea.value = '';
    }
    
    this.pendingReviewAction = null;
  }

  async handleSubmitReview() {
    if (!this.selectedReview || !this.pendingReviewAction) return;

    const comments = document.getElementById('reviewComments')?.value || '';

    this.showLoadingOverlay(true);

    try {
      const response = await fetch(`/api/admin/review-queue/${this.selectedReview.review_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: this.pendingReviewAction,
          comments: comments,
          reviewed_by: this.currentUser.employee_id
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const actionText = this.pendingReviewAction === 'APPROVED' ? 'approved' : 'rejected';
        this.showSuccess(`Request ${actionText} successfully`);
        this.closeCommentsModal();
        this.closeModal();
        await this.loadReviewQueue();
      } else {
        throw new Error(data.message || 'Failed to process review');
      }
    } catch (error) {
      console.error('Error processing review:', error);
      this.showError(`Failed to process review: ${error.message}`);
    } finally {
      this.showLoadingOverlay(false);
    }
  }

  // Batch operations
  handleSelectAll(checked) {
    if (checked) {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      const pageItems = this.filteredItems.slice(startIndex, endIndex);
      
      pageItems.forEach(item => {
        this.selectedItems.add(item.review_id);
      });
    } else {
      this.selectedItems.clear();
    }
    
    this.updateSelection();
  }

  handleItemSelection(reviewId, checked) {
    if (checked) {
      this.selectedItems.add(reviewId);
    } else {
      this.selectedItems.delete(reviewId);
    }
    
    this.updateSelection();
  }

  updateSelection() {
    // Update individual checkboxes
    this.selectedItems.forEach(reviewId => {
      const checkbox = document.getElementById(`checkbox-${reviewId}`);
      if (checkbox) checkbox.checked = true;
      
      const card = document.querySelector(`[data-review-id="${reviewId}"]`);
      if (card) card.classList.add('selected');
    });

    // Update select all checkbox
    const selectAll = document.getElementById('selectAll');
    if (selectAll) {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      const pageItems = this.filteredItems.slice(startIndex, endIndex);
      const pageItemIds = pageItems.map(item => item.review_id);
      
      const allPageItemsSelected = pageItemIds.length > 0 && 
        pageItemIds.every(id => this.selectedItems.has(id));
      
      selectAll.checked = allPageItemsSelected;
      selectAll.indeterminate = !allPageItemsSelected && 
        pageItemIds.some(id => this.selectedItems.has(id));
    }

    // Update batch actions visibility
    const batchActions = document.getElementById('batchActions');
    const selectedCount = document.getElementById('selectedCount');
    
    if (batchActions && selectedCount) {
      if (this.selectedItems.size > 0) {
        batchActions.style.display = 'flex';
        selectedCount.textContent = this.selectedItems.size;
      } else {
        batchActions.style.display = 'none';
      }
    }
  }

  clearSelection() {
    this.selectedItems.clear();
    
    // Clear all checkboxes
    document.querySelectorAll('input[type="checkbox"][id^="checkbox-"]').forEach(checkbox => {
      checkbox.checked = false;
    });
    
    // Remove selected class from cards
    document.querySelectorAll('.account-info-card.selected').forEach(card => {
      card.classList.remove('selected');
    });
    
    this.updateSelection();
  }

  async handleBatchApprove() {
    if (this.selectedItems.size === 0) return;

    const confirmed = confirm(`Are you sure you want to approve ${this.selectedItems.size} selected items?`);
    if (!confirmed) return;

    await this.processBatchAction('APPROVED', 'Bulk approval by admin');
  }

  async handleBatchReject() {
    if (this.selectedItems.size === 0) return;

    const reason = prompt('Please provide a reason for bulk rejection:');
    if (!reason) return;

    await this.processBatchAction('REJECTED', reason);
  }

  async handleBatchAssign() {
    if (this.selectedItems.size === 0) return;

    const confirmed = confirm(`Are you sure you want to assign ${this.selectedItems.size} selected items to yourself?`);
    if (!confirmed) return;

    await this.processBatchAction('ASSIGN', 'Bulk assignment');
  }

  async processBatchAction(action, comments) {
    this.showLoadingOverlay(true);
    
    try {
      const promises = Array.from(this.selectedItems).map(reviewId => {
        const payload = { comments };
        
        if (action === 'ASSIGN') {
          payload.action = 'ASSIGN';
          payload.assigned_to = this.currentUser.employee_id;
        } else {
          payload.status = action;
          payload.reviewed_by = this.currentUser.employee_id;
        }

        return fetch(`/api/admin/review-queue/${reviewId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
      });

      const results = await Promise.allSettled(promises);
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.length - successful;

      if (successful > 0) {
        this.showSuccess(`${successful} items processed successfully${failed > 0 ? `, ${failed} failed` : ''}`);
        this.clearSelection();
        await this.loadReviewQueue();
      } else {
        throw new Error('All batch operations failed');
      }
    } catch (error) {
      console.error('Batch operation error:', error);
      this.showError(`Batch operation failed: ${error.message}`);
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
        <div class="search-result-item" onclick="adminReviewQueue2.selectSearchResult('${customer.customer_id}')">
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
    // Find review item for this customer
    const customerReview = this.reviewItems.find(item => item.customer_id === customerId);
    if (customerReview) {
      this.showReviewDetails(customerReview.review_id);
    }
    this.hideSearchResults();
  }

  // Utility methods
  getStatusClass(status) {
    const statusMap = {
      'PENDING': 'pending',
      'UNDER_REVIEW': 'under-review',
      'APPROVED': 'approved',
      'REJECTED': 'rejected',
      'COMPLETED': 'completed'
    };
    return statusMap[status] || 'pending';
  }

  formatStatus(status) {
    const statusMap = {
      'PENDING': 'Pending',
      'UNDER_REVIEW': 'Under Review',
      'APPROVED': 'Approved',
      'REJECTED': 'Rejected',
      'COMPLETED': 'Completed'
    };
    return statusMap[status] || status;
  }

  formatRequestType(type) {
    const typeMap = {
      'ACCOUNT_DEACTIVATION': 'Account Deactivation',
      'PROFILE_UPDATE': 'Profile Update',
      'TRANSACTION_REVIEW': 'Transaction Review',
      'DOCUMENT_UPDATE': 'Document Update'
    };
    return typeMap[type] || type;
  }

  formatAssignee(assigneeId) {
    if (!assigneeId) return 'Unassigned';
    if (assigneeId === this.currentUser?.employee_id) return 'Me';
    return `Employee ${assigneeId}`;
  }

  formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Invalid Date';
    }
  }

  updateStats() {
    const totalCount = document.getElementById('totalCount');
    const pendingCount = document.getElementById('pendingCount');
    const myReviewsCount = document.getElementById('myReviewsCount');

    if (totalCount) {
      totalCount.textContent = this.reviewItems.length;
    }

    if (pendingCount) {
      const pending = this.reviewItems.filter(item => item.status === 'PENDING').length;
      pendingCount.textContent = pending;
    }

    if (myReviewsCount) {
      const myReviews = this.reviewItems.filter(item => 
        item.assigned_to === this.currentUser?.employee_id
      ).length;
      myReviewsCount.textContent = myReviews;
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
    this.clearSelection();
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
let adminReviewQueue2;

document.addEventListener('DOMContentLoaded', () => {
  adminReviewQueue2 = new AdminReviewQueue2();
});
