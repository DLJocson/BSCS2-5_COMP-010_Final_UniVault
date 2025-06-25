// Reusable search functionality for admin pages
class AdminSearch {
    constructor(searchInputId, resultsContainerId, displayFunction, pageType = 'customers') {
        this.searchInput = document.getElementById(searchInputId);
        this.resultsContainer = document.getElementById(resultsContainerId);
        this.displayFunction = displayFunction;
        this.pageType = pageType;
        this.debounceTimer = null;
        this.currentResults = [];
        this.originalData = [];
        
        this.init();
    }
    
    init() {
        if (!this.searchInput || !this.resultsContainer) {
            console.error('Search elements not found');
            return;
        }
        
        this.searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });
        
        this.searchInput.addEventListener('focus', () => {
            this.searchInput.classList.add('typing');
            if (this.currentResults.length > 0) {
                this.resultsContainer.style.display = 'block';
            }
        });
        
        this.searchInput.addEventListener('blur', () => {
            this.searchInput.classList.remove('typing');
        });
        
        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.searchInput.contains(e.target) && !this.resultsContainer.contains(e.target)) {
                this.resultsContainer.style.display = 'none';
            }
        });
    }
    
    debounce(func, delay) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(func, delay);
    }
    
    handleSearch(searchTerm) {
        searchTerm = searchTerm.trim();
        
        if (searchTerm.length < 2) {
            this.hideResults();
            // Reset to original data when search is cleared
            if (searchTerm.length === 0 && this.originalData.length > 0 && this.displayFunction) {
                this.displayFunction(this.originalData);
            }
            return;
        }
        
        this.debounce(() => {
            this.performSearch(searchTerm);
        }, 300);
    }
    
    async performSearch(searchTerm) {
        try {
            this.showLoading();
            
            // First try backend search
            try {
                const response = await fetch(`/api/admin/customers/search/${encodeURIComponent(searchTerm)}`);
                const data = await response.json();
                
                if (response.ok) {
                    this.currentResults = data;
                    this.hideLoading();
                    this.displayResults(data);
                    
                    // Also update the main display with filtered results
                    if (this.displayFunction) {
                        this.displayFunction(data);
                    }
                    return;
                }
            } catch (backendError) {
                console.log('Backend search failed, using local search:', backendError);
            }
            
            // Fallback to local search
            this.hideLoading();
            this.performLocalSearch(searchTerm);
            
        } catch (error) {
            console.error('Search error:', error);
            this.hideLoading();
            this.performLocalSearch(searchTerm);
        }
    }
    
    // Method to set original data for local filtering fallback
    setOriginalData(data) {
        this.originalData = data;
    }
    
    // Local search fallback if backend search fails
    performLocalSearch(searchTerm) {
        if (!this.originalData || this.originalData.length === 0) {
            this.showNoResults();
            return;
        }
        
        const filtered = this.originalData.filter(item => {
            const searchLower = searchTerm.toLowerCase();
            return (
                // Customer fields
                (item.cif_number && item.cif_number.toString().includes(searchLower)) ||
                (item.customer_first_name && item.customer_first_name.toLowerCase().includes(searchLower)) ||
                (item.customer_last_name && item.customer_last_name.toLowerCase().includes(searchLower)) ||
                (item.customer_middle_name && item.customer_middle_name.toLowerCase().includes(searchLower)) ||
                (item.customer_suffix_name && item.customer_suffix_name.toLowerCase().includes(searchLower)) ||
                (item.email && item.email.toLowerCase().includes(searchLower)) ||
                (item.phone && item.phone.includes(searchLower)) ||
                (item.customer_type && item.customer_type.toLowerCase().includes(searchLower)) ||
                // Employee fields
                (item.employee_id && item.employee_id.toString().includes(searchLower)) ||
                (item.employee_first_name && item.employee_first_name.toLowerCase().includes(searchLower)) ||
                (item.employee_last_name && item.employee_last_name.toLowerCase().includes(searchLower)) ||
                (item.employee_middle_name && item.employee_middle_name.toLowerCase().includes(searchLower)) ||
                (item.employee_suffix_name && item.employee_suffix_name.toLowerCase().includes(searchLower)) ||
                (item.employee_position && item.employee_position.toLowerCase().includes(searchLower)) ||
                (item.employee_username && item.employee_username.toLowerCase().includes(searchLower))
            );
        });
        
        this.currentResults = filtered;
        this.displayResults(filtered);
        
        if (this.displayFunction) {
            this.displayFunction(filtered);
        }
    }
    
    displayResults(results) {
        if (results.length === 0) {
            this.showNoResults();
            return;
        }
        
        const resultsHTML = results.map(result => this.createResultItem(result)).join('');
        this.resultsContainer.innerHTML = resultsHTML;
        this.resultsContainer.style.display = 'block';
        
        // Add click handlers for result items
        this.resultsContainer.querySelectorAll('.search-result-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                this.selectResult(results[index]);
            });
        });
    }
    
    createResultItem(result) {
        const fullName = [result.customer_first_name, result.customer_middle_name, result.customer_last_name]
            .filter(name => name && name !== 'N/A')
            .join(' ');
            
        const details = [
            `CIF: ${result.cif_number}`,
            result.email ? `Email: ${result.email}` : '',
            result.phone ? `Phone: ${result.phone}` : '',
            result.customer_type ? `Type: ${result.customer_type}` : ''
        ].filter(detail => detail).join(' • ');
        
        return `
            <div class="search-result-item" data-cif="${result.cif_number}">
                <div class="search-result-name">${fullName}</div>
                <div class="search-result-details">${details}</div>
            </div>
        `;
    }
    
    selectResult(result) {
        this.hideResults();
        this.searchInput.value = '';
        
        // Display the selected result using the provided display function
        if (this.displayFunction) {
            this.displayFunction([result]);
        }
        
        // Optionally navigate to customer profile
        if (result.cif_number) {
            // Uncomment the line below if you want to navigate to customer profile on selection
            // window.location.href = `admin-customer-profile.html?cif=${result.cif_number}`;
        }
    }
    
    showLoading() {
        this.searchInput.classList.add('loading');
        this.resultsContainer.innerHTML = '<div class="no-results">Searching...</div>';
        this.resultsContainer.style.display = 'block';
    }
    
    hideLoading() {
        this.searchInput.classList.remove('loading');
    }
    
    showNoResults() {
        this.resultsContainer.innerHTML = '<div class="no-results">No results found</div>';
        this.resultsContainer.style.display = 'block';
    }
    
    showError(message) {
        this.resultsContainer.innerHTML = `<div class="search-error">${message}</div>`;
        this.resultsContainer.style.display = 'block';
    }
    
    hideResults() {
        this.resultsContainer.style.display = 'none';
        this.currentResults = [];
        this.hideLoading();
    }
}

// Utility function to format dates
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminSearch;
}
