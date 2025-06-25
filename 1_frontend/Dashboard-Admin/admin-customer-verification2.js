// Global variables for verification tracking
let documentVerificationStatus = {
    id1: false,
    id2: false,
    documents: false
};

let currentCustomer = null;
let currentDocuments = [];
let currentZoomLevel = 1;

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const employeeId = localStorage.getItem('employee_id');
    const employeeUsername = localStorage.getItem('employee_username');
    
    if (!employeeId || !employeeUsername) {
        window.location.href = 'admin-login.html';
        return;
    }

    // Get CIF number from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const cifNumber = urlParams.get('cif');
    
    if (!cifNumber) {
        showNotification('No customer CIF number provided', 'error');
        setTimeout(() => {
            window.location.href = 'admin-dashboard.html';
        }, 2000);
        return;
    }
    
    // Initialize page
    initializePage(cifNumber);
});

async function initializePage(cifNumber) {
    try {
        showLoadingOverlay(true);
        
        // Load saved verification status
        const savedStatus = localStorage.getItem(`verification_status_${cifNumber}`);
        if (savedStatus) {
            documentVerificationStatus = JSON.parse(savedStatus);
        }
        
        // Load customer data and documents
        await loadCustomerInfo(cifNumber);
        await loadCustomerIDs(cifNumber);
        await loadSupportingDocuments(cifNumber);
        
        // Setup event handlers
        setupEventHandlers(cifNumber);
        
        // Update UI based on saved status
        updateVerificationUI();
        updateProgressIndicators();
        updateSummary();
        
    } catch (error) {
        console.error('Error initializing page:', error);
        showNotification('Error loading document verification page', 'error');
    } finally {
        showLoadingOverlay(false);
    }
}

async function loadCustomerInfo(cifNumber) {
    try {
        // Try to load from backend
        const response = await fetch(`/api/admin/customers/${cifNumber}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const customerData = await response.json();
            currentCustomer = customerData.customer;
            updateCustomerName(customerData.customer);
        } else {
            // Fallback to mock data
            const mockCustomer = {
                customer_first_name: 'Chryshella Grace',
                customer_middle_name: 'P.',
                customer_last_name: 'Bautista',
                cif_number: cifNumber
            };
            currentCustomer = mockCustomer;
            updateCustomerName(mockCustomer);
        }
    } catch (error) {
        console.error('Error loading customer info:', error);
        // Use mock data as fallback
        const mockCustomer = {
            customer_first_name: 'Chryshella Grace',
            customer_middle_name: 'P.',
            customer_last_name: 'Bautista',
            cif_number: cifNumber
        };
        currentCustomer = mockCustomer;
        updateCustomerName(mockCustomer);
    }
}

function updateCustomerName(customer) {
    const customerNameEl = document.getElementById('customer-name');
    if (customerNameEl && customer) {
        const fullName = `${customer.customer_last_name}, ${customer.customer_first_name} ${customer.customer_middle_name || ''}`.trim();
        customerNameEl.textContent = fullName;
    }
}

async function loadCustomerIDs(cifNumber) {
    try {
        // Try to load from backend
        const response = await fetch(`/api/admin/customers/${cifNumber}/ids`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const idsData = await response.json();
            if (idsData.ids && idsData.ids.length > 0) {
                populateIDForms(idsData.ids);
            } else {
                loadMockIDData();
            }
        } else {
            loadMockIDData();
        }
    } catch (error) {
        console.error('Error loading customer IDs:', error);
        loadMockIDData();
    }
}

function loadMockIDData() {
    // Mock ID data for demonstration
    const mockIds = [
        {
            id_type_description: 'Passport',
            id_type_code: 'passport',
            id_number: '0914X3X567',
            id_expiry_date: '2030-05-10',
            front_image_url: '../../4_assets/front-id.png',
            back_image_url: '../../4_assets/back-d.png'
        },
        {
            id_type_description: 'National ID',
            id_type_code: 'national_id',
            id_number: '1234-5678-9101-1213',
            id_expiry_date: null,
            front_image_url: '../../4_assets/front-id.png',
            back_image_url: '../../4_assets/back-d.png'
        }
    ];
    populateIDForms(mockIds);
}

function populateIDForms(ids) {
    // ID 1
    if (ids.length > 0) {
        const id1 = ids[0];
        populateIDForm('1', id1);
        updateIDImages('1', id1);
    } else {
        showNoIDMessage('1');
    }
    
    // ID 2
    if (ids.length > 1) {
        const id2 = ids[1];
        populateIDForm('2', id2);
        updateIDImages('2', id2);
    } else {
        showNoIDMessage('2');
    }
}

function populateIDForm(idNumber, idData) {
    const typeSelect = document.getElementById(`id${idNumber}-type`);
    const numberInput = document.getElementById(`id${idNumber}-number`);
    const expiryInput = document.getElementById(`id${idNumber}-expiry`);
    
    if (typeSelect && idData.id_type_code) {
        typeSelect.value = idData.id_type_code;
        typeSelect.disabled = false;
    }
    
    if (numberInput && idData.id_number) {
        numberInput.value = idData.id_number;
        numberInput.placeholder = '';
    }
    
    if (expiryInput) {
        if (idData.id_expiry_date) {
            expiryInput.value = formatDate(idData.id_expiry_date);
        } else {
            expiryInput.value = 'No expiry date';
        }
        expiryInput.placeholder = '';
    }
}

function updateIDImages(idNumber, idData) {
    const frontImg = document.getElementById(`id${idNumber}-front`);
    const backImg = document.getElementById(`id${idNumber}-back`);
    
    if (frontImg && idData.front_image_url) {
        frontImg.src = idData.front_image_url;
        frontImg.alt = `${idData.id_type_description} Front`;
    }
    
    if (backImg && idData.back_image_url) {
        backImg.src = idData.back_image_url;
        backImg.alt = `${idData.id_type_description} Back`;
    }
}

function showNoIDMessage(idNumber) {
    const numberInput = document.getElementById(`id${idNumber}-number`);
    const expiryInput = document.getElementById(`id${idNumber}-expiry`);
    
    if (numberInput) numberInput.placeholder = 'No ID data available';
    if (expiryInput) expiryInput.placeholder = 'No expiry data available';
}

async function loadSupportingDocuments(cifNumber) {
    const loadingEl = document.getElementById('documents-loading');
    const tableEl = document.getElementById('documents-table');
    const noDocsEl = document.getElementById('no-documents');
    
    try {
        // Try to load from backend
        const response = await fetch(`/api/admin/customers/${cifNumber}/documents`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const documentsData = await response.json();
            currentDocuments = documentsData.documents || [];
            displaySupportingDocuments(currentDocuments);
        } else {
            // Load mock documents
            const mockDocuments = createMockDocuments(cifNumber);
            currentDocuments = mockDocuments;
            displaySupportingDocuments(mockDocuments);
        }
    } catch (error) {
        console.error('Error loading supporting documents:', error);
        // Load mock documents as fallback
        const mockDocuments = createMockDocuments(cifNumber);
        currentDocuments = mockDocuments;
        displaySupportingDocuments(mockDocuments);
    } finally {
        if (loadingEl) loadingEl.style.display = 'none';
    }
}

function createMockDocuments(cifNumber) {
    return [
        {
            id: 1,
            filename: 'PSA_Birth_Certificate.pdf',
            document_type: 'Birth Certificate',
            file_type: 'PDF',
            file_size: '245 KB',
            upload_date: new Date(Date.now() - 86400000).toISOString(),
            file_url: `/uploads/documents/${cifNumber}/psa_birth_cert.pdf`,
            status: 'pending'
        },
        {
            id: 2,
            filename: 'PSA_Marriage_Certificate.pdf',
            document_type: 'Marriage Certificate',
            file_type: 'PDF',
            file_size: '189 KB',
            upload_date: new Date(Date.now() - 172800000).toISOString(),
            file_url: `/uploads/documents/${cifNumber}/psa_marriage_cert.pdf`,
            status: 'pending'
        },
        {
            id: 3,
            filename: 'Certificate_of_Employment.pdf',
            document_type: 'Employment Certificate',
            file_type: 'PDF',
            file_size: '156 KB',
            upload_date: new Date(Date.now() - 259200000).toISOString(),
            file_url: `/uploads/documents/${cifNumber}/employment_cert.pdf`,
            status: 'pending'
        },
        {
            id: 4,
            filename: 'ITR_2023.pdf',
            document_type: 'Income Tax Return',
            file_type: 'PDF',
            file_size: '342 KB',
            upload_date: new Date(Date.now() - 345600000).toISOString(),
            file_url: `/uploads/documents/${cifNumber}/itr_2023.pdf`,
            status: 'pending'
        }
    ];
}

function displaySupportingDocuments(documents) {
    const tableEl = document.getElementById('documents-table');
    const noDocsEl = document.getElementById('no-documents');
    const documentsListEl = document.getElementById('documents-list');
    
    if (!documents || documents.length === 0) {
        if (tableEl) tableEl.style.display = 'none';
        if (noDocsEl) noDocsEl.style.display = 'block';
        return;
    }
    
    if (documentsListEl) {
        documentsListEl.innerHTML = '';
        
        documents.forEach((doc, index) => {
            const docRow = createDocumentRow(doc, index);
            documentsListEl.appendChild(docRow);
        });
    }
    
    if (tableEl) tableEl.style.display = 'block';
    if (noDocsEl) noDocsEl.style.display = 'none';
}

function createDocumentRow(document, index) {
    const row = document.createElement('div');
    row.className = 'document-row';
    row.setAttribute('data-doc-id', document.id || index);
    
    const uploadDate = new Date(document.upload_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    const status = documentVerificationStatus.documents ? 'verified' : (document.status || 'pending');
    
    row.innerHTML = `
        <div class="table-cell">
            <span class="document-name" title="${document.filename}">${document.filename.length > 30 ? document.filename.substring(0, 30) + '...' : document.filename}</span>
        </div>
        <div class="table-cell">${document.file_type || 'Unknown'}</div>
        <div class="table-cell">${document.file_size || 'Unknown'}</div>
        <div class="table-cell">${uploadDate}</div>
        <div class="table-cell">
            <div class="document-actions">
                <button class="view-btn" onclick="viewDocument('${document.file_url}', '${document.filename}', '${document.file_type}')">
                    👁 View
                </button>
                <button class="download-doc-btn" onclick="downloadDocument('${document.file_url}', '${document.filename}')">
                    ⬇ Download
                </button>
            </div>
        </div>
        <div class="table-cell">
            <span class="document-status ${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>
        </div>
    `;
    
    return row;
}

function setupEventHandlers(cifNumber) {
    // Back button
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.onclick = () => {
            window.location.href = `admin-customer-verification.html?cif=${cifNumber}`;
        };
    }
    
    // Verify buttons
    const verifyButtons = document.querySelectorAll('.verify-btn');
    verifyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const section = button.getAttribute('data-section');
            handleSectionVerification(section, cifNumber);
        });
    });
    
    // Complete verification button
    const completeBtn = document.getElementById('complete-verification-btn');
    if (completeBtn) {
        completeBtn.onclick = () => completeDocumentVerification(cifNumber);
    }
    
    // Setup image modal handlers
    setupImageModal();
    
    // Setup checklist handlers
    setupChecklistHandlers();
}

function handleSectionVerification(section, cifNumber) {
    // Check if section requirements are met
    if (!validateSectionRequirements(section)) {
        showNotification('Please complete all verification requirements for this section', 'warning');
        return;
    }
    
    // Toggle verification state
    documentVerificationStatus[section] = !documentVerificationStatus[section];
    
    // Update UI
    updateVerificationButton(section);
    updateProgressIndicators();
    updateSummary();
    
    // Save verification state
    saveVerificationState(cifNumber);
    
    // Show notification
    const actionText = documentVerificationStatus[section] ? 'verified' : 'unverified';
    showNotification(`${getSectionDisplayName(section)} ${actionText} successfully`, 'success');
}

function validateSectionRequirements(section) {
    switch (section) {
        case 'id1':
            return validateIDChecklist('id1');
        case 'id2':
            return validateIDChecklist('id2');
        case 'documents':
            return currentDocuments.length > 0; // At least one document
        default:
            return true;
    }
}

function validateIDChecklist(idNumber) {
    const checkboxes = document.querySelectorAll(`#${idNumber}-checklist input[type="checkbox"]`);
    return Array.from(checkboxes).every(checkbox => checkbox.checked);
}

function updateVerificationButton(section) {
    const button = document.querySelector(`[data-section="${section}"]`);
    if (!button) return;
    
    const btnText = button.querySelector('.btn-text');
    const btnIcon = button.querySelector('.btn-icon');
    
    if (documentVerificationStatus[section]) {
        button.classList.add('verified');
        button.style.background = '#27ae60';
        if (btnText) btnText.textContent = 'Verified';
        if (btnIcon) btnIcon.textContent = '✓';
    } else {
        button.classList.remove('verified');
        button.style.background = '#27ae60';
        if (btnText) btnText.textContent = 'Verify';
        if (btnIcon) btnIcon.textContent = '✓';
    }
}

function updateProgressIndicators() {
    // Update header progress indicators
    const sections = ['id1', 'id2', 'documents'];
    
    sections.forEach(section => {
        const progressItem = document.getElementById(`${section === 'documents' ? 'docs' : section}-progress`);
        const statusEl = progressItem?.querySelector('.progress-status');
        
        if (statusEl) {
            if (documentVerificationStatus[section]) {
                statusEl.className = 'progress-status verified';
                statusEl.textContent = 'Verified';
            } else {
                statusEl.className = 'progress-status pending';
                statusEl.textContent = 'Pending';
            }
        }
    });
}

function updateSummary() {
    // Update overall status
    const overallStatusEl = document.getElementById('overall-status');
    const idsVerifiedEl = document.getElementById('ids-verified-count');
    const docsVerifiedEl = document.getElementById('docs-verified-count');
    const completeBtn = document.getElementById('complete-verification-btn');
    
    // Count verified items
    const idsVerified = (documentVerificationStatus.id1 ? 1 : 0) + (documentVerificationStatus.id2 ? 1 : 0);
    const docsVerified = documentVerificationStatus.documents ? currentDocuments.length : 0;
    const allVerified = Object.values(documentVerificationStatus).every(status => status === true);
    
    // Update counts
    if (idsVerifiedEl) idsVerifiedEl.textContent = `${idsVerified}/2`;
    if (docsVerifiedEl) docsVerifiedEl.textContent = `${docsVerified}/${currentDocuments.length}`;
    
    // Update overall status
    if (overallStatusEl) {
        if (allVerified) {
            overallStatusEl.className = 'summary-status completed';
            overallStatusEl.innerHTML = '<span class="status-icon">✓</span><span class="status-text">All Verified</span>';
        } else {
            overallStatusEl.className = 'summary-status pending';
            overallStatusEl.innerHTML = '<span class="status-icon">⏳</span><span class="status-text">In Progress</span>';
        }
    }
    
    // Update action list
    updateActionList();
    
    // Enable/disable complete button
    if (completeBtn) {
        completeBtn.disabled = !allVerified;
        if (allVerified) {
            completeBtn.style.background = '#27ae60';
            completeBtn.style.cursor = 'pointer';
        } else {
            completeBtn.style.background = '#6c757d';
            completeBtn.style.cursor = 'not-allowed';
        }
    }
}

function updateActionList() {
    const actionList = document.getElementById('action-list');
    if (!actionList) return;
    
    const actions = [
        { key: 'id1', text: 'Review Primary ID' },
        { key: 'id2', text: 'Review Secondary ID' },
        { key: 'documents', text: 'Review Supporting Documents' }
    ];
    
    actionList.innerHTML = '';
    
    actions.forEach(action => {
        const actionItem = document.createElement('div');
        actionItem.className = `action-item ${documentVerificationStatus[action.key] ? 'completed' : 'pending'}`;
        actionItem.textContent = action.text;
        actionList.appendChild(actionItem);
    });
}

function updateVerificationUI() {
    // Update all verification buttons based on saved status
    Object.keys(documentVerificationStatus).forEach(section => {
        updateVerificationButton(section);
    });
    
    // Update progress indicators
    updateProgressIndicators();
    
    // Update summary
    updateSummary();
    
    // Update document statuses
    updateDocumentStatuses();
}

function updateDocumentStatuses() {
    if (documentVerificationStatus.documents) {
        const statusElements = document.querySelectorAll('.document-status');
        statusElements.forEach(statusEl => {
            statusEl.className = 'document-status verified';
            statusEl.textContent = 'Verified';
        });
    }
}

function saveVerificationState(cifNumber) {
    // Save to localStorage
    localStorage.setItem(`verification_status_${cifNumber}`, JSON.stringify(documentVerificationStatus));
    
    // Update main verification page status
    const allVerified = Object.values(documentVerificationStatus).every(status => status === true);
    localStorage.setItem(`documents_verified_${cifNumber}`, allVerified.toString());
    
    // Send to backend
    saveVerificationStateToBackend(cifNumber);
}

async function saveVerificationStateToBackend(cifNumber) {
    try {
        const response = await fetch(`/api/admin/customers/${cifNumber}/verification-status`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                employee_id: localStorage.getItem('employee_id'),
                verification_status: documentVerificationStatus,
                all_documents_verified: Object.values(documentVerificationStatus).every(status => status === true)
            })
        });
        
        if (!response.ok) {
            console.error('Failed to save verification state to backend');
        }
    } catch (error) {
        console.error('Error saving verification state to backend:', error);
    }
}

function setupChecklistHandlers() {
    const checkboxes = document.querySelectorAll('.checklist-item input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateChecklistProgress();
        });
    });
}

function updateChecklistProgress() {
    // Update verification button states based on checklist completion
    ['id1', 'id2'].forEach(idSection => {
        const checkboxes = document.querySelectorAll(`#${idSection}-checklist input[type="checkbox"]`);
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        const verifyBtn = document.querySelector(`[data-section="${idSection}"]`);
        
        if (verifyBtn) {
            if (allChecked) {
                verifyBtn.style.opacity = '1';
                verifyBtn.disabled = false;
            } else {
                verifyBtn.style.opacity = '0.6';
                // Don't disable, just visual feedback
            }
        }
    });
}

async function completeDocumentVerification(cifNumber) {
    const allVerified = Object.values(documentVerificationStatus).every(status => status === true);
    
    if (!allVerified) {
        showNotification('Please verify all sections before completing', 'warning');
        return;
    }
    
    try {
        showLoadingOverlay(true);
        
        // Send completion notification to backend
        const response = await fetch(`/api/admin/customers/${cifNumber}/complete-document-verification`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                employee_id: localStorage.getItem('employee_id'),
                verification_details: documentVerificationStatus,
                completion_timestamp: new Date().toISOString()
            })
        });
        
        if (response.ok) {
            showNotification('Document verification completed successfully!', 'success');
            
            // Redirect back to main verification page after a delay
            setTimeout(() => {
                window.location.href = `admin-customer-verification.html?cif=${cifNumber}`;
            }, 2000);
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to complete verification');
        }
    } catch (error) {
        console.error('Error completing document verification:', error);
        showNotification('Document verification marked as complete locally', 'success');
        
        // Still redirect back even if backend fails
        setTimeout(() => {
            window.location.href = `admin-customer-verification.html?cif=${cifNumber}`;
        }, 2000);
    } finally {
        showLoadingOverlay(false);
    }
}

// Document viewing functions
function viewDocument(fileUrl, filename, fileType) {
    if (!fileUrl || fileUrl === '#') {
        showNotification('Document preview not available', 'warning');
        return;
    }
    
    if (fileType && fileType.toUpperCase() === 'PDF') {
        openDocumentModal(fileUrl, filename);
    } else {
        // For images and other files, try to open in new tab
        window.open(fileUrl, '_blank');
    }
}

function downloadDocument(fileUrl, filename) {
    if (!fileUrl || fileUrl === '#') {
        showNotification('Document download not available', 'warning');
        return;
    }
    
    // Create temporary link for download
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function downloadImage(imageId) {
    const img = document.getElementById(imageId);
    if (!img) return;
    
    downloadDocument(img.src, `${imageId}.png`);
}

// Modal functions
function setupImageModal() {
    const modal = document.getElementById('imageModal');
    
    // Close modal when clicking outside
    modal?.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeImageModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeImageModal();
            closeDocumentModal();
        }
    });
}

function openImageModal(imgElement) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modal-title');
    
    if (modal && modalImg) {
        modal.style.display = 'flex';
        modalImg.src = imgElement.src;
        modalImg.alt = imgElement.alt;
        
        if (modalTitle) {
            modalTitle.textContent = imgElement.alt || 'Document Preview';
        }
        
        // Reset zoom
        currentZoomLevel = 1;
        modalImg.style.transform = 'scale(1)';
        
        // Prevent body scrolling
        document.body.style.overflow = 'hidden';
    }
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function openDocumentModal(fileUrl, filename) {
    const modal = document.getElementById('documentModal');
    const iframe = document.getElementById('documentFrame');
    const modalTitle = document.getElementById('doc-modal-title');
    
    if (modal && iframe) {
        modal.style.display = 'flex';
        iframe.src = fileUrl;
        
        if (modalTitle) {
            modalTitle.textContent = filename || 'Document Viewer';
        }
        
        // Prevent body scrolling
        document.body.style.overflow = 'hidden';
    }
}

function closeDocumentModal() {
    const modal = document.getElementById('documentModal');
    const iframe = document.getElementById('documentFrame');
    
    if (modal) {
        modal.style.display = 'none';
        if (iframe) iframe.src = '';
        document.body.style.overflow = 'auto';
    }
}

// Zoom functions for image modal
function zoomIn() {
    const modalImg = document.getElementById('modalImage');
    if (modalImg && currentZoomLevel < 3) {
        currentZoomLevel += 0.5;
        modalImg.style.transform = `scale(${currentZoomLevel})`;
    }
}

function zoomOut() {
    const modalImg = document.getElementById('modalImage');
    if (modalImg && currentZoomLevel > 0.5) {
        currentZoomLevel -= 0.5;
        modalImg.style.transform = `scale(${currentZoomLevel})`;
    }
}

function resetZoom() {
    const modalImg = document.getElementById('modalImage');
    if (modalImg) {
        currentZoomLevel = 1;
        modalImg.style.transform = 'scale(1)';
    }
}

// Utility functions
function getSectionDisplayName(section) {
    switch (section) {
        case 'id1': return 'Primary ID';
        case 'id2': return 'Secondary ID';
        case 'documents': return 'Supporting Documents';
        default: return section;
    }
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

function showLoadingOverlay(show) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}

function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const messageElement = document.createElement('div');
    messageElement.className = 'notification-message';
    messageElement.textContent = message;
    
    notification.appendChild(messageElement);
    container.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    const hideDelay = type === 'warning' ? 7000 : 5000;
    
    setTimeout(() => {
        hideNotification(notification);
    }, hideDelay);

    notification.addEventListener('click', () => {
        hideNotification(notification);
    });

    return notification;
}

function hideNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// Global function for logout
function logout() {
    localStorage.clear();
    window.location.href = 'admin-login.html';
}

// Listen for storage changes from other tabs
window.addEventListener('storage', function(e) {
    if (e.key && e.key.includes('verification_status_')) {
        const cifNumber = new URLSearchParams(window.location.search).get('cif');
        if (cifNumber && e.key === `verification_status_${cifNumber}`) {
            try {
                documentVerificationStatus = JSON.parse(e.newValue);
                updateVerificationUI();
            } catch (error) {
                console.error('Error parsing stored verification status:', error);
            }
        }
    }
});
