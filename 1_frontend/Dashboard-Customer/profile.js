// Profile Page JavaScript
// Handles fetching and displaying customer profile data from the backend

class ProfileManager {
    constructor() {
        this.apiBaseUrl = 'http://localhost:3000';
        this.customerData = null;
        this.init();
    }

    async init() {
        try {
            // Get CIF number from URL parameters or localStorage
            const cifNumber = this.getCifNumber();
            if (!cifNumber) {
                this.showError('CIF number not found. Please login again.');
                return;
            }

            // Fetch customer data
            await this.fetchCustomerData(cifNumber);
            
            // Display the data
            this.displayCustomerData();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Setup edit profile button logic
            this.setupEditProfileUI();
            
        } catch (error) {
            console.error('Profile initialization error:', error);
            this.showError('Failed to load profile data. Please try again.');
        }
    }

    getCifNumber() {
        // Try to get CIF from URL parameters first
        const urlParams = new URLSearchParams(window.location.search);
        let cifNumber = urlParams.get('cif');
        
        // If not in URL, try localStorage
        if (!cifNumber) {
            cifNumber = localStorage.getItem('cif_number');
        }
        
        // If still not found, try sessionStorage
        if (!cifNumber) {
            cifNumber = sessionStorage.getItem('cif_number');
        }
        
        return cifNumber;
    }

    async fetchCustomerData(cifNumber) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/customer/all/${cifNumber}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.customerData = await response.json();
            console.log('Customer data fetched:', this.customerData);
            
        } catch (error) {
            console.error('Error fetching customer data:', error);
            throw error;
        }
    }

    displayCustomerData() {
        if (!this.customerData) {
            console.error('No customer data to display');
            return;
        }

        const { customer, addresses, contacts, employment, fundSources, workNatures, aliases } = this.customerData;

        // Update welcome message
        this.updateWelcomeMessage(customer);

        // Display personal information
        this.displayPersonalInfo(customer);

        // Display contact details
        this.displayContactDetails(contacts, addresses);

        // Display employment data
        this.displayEmploymentData(employment, workNatures);

        // Display fund sources
        this.displayFundSources(fundSources);

        // Display aliases
        this.displayAliases(aliases);
    }

    updateWelcomeMessage(customer) {
        const welcomeElement = document.querySelector('.welcome .blue-text');
        if (welcomeElement && customer.customer_first_name) {
            welcomeElement.textContent = `${customer.customer_first_name}'s`;
        }
    }

    displayPersonalInfo(customer) {
        // Personal Information - Full Name
        this.setInputValue('first-name', customer.customer_first_name || '');
        this.setInputValue('middle-name', customer.customer_middle_name || '');
        this.setInputValue('last-name', customer.customer_last_name || '');
        this.setInputValue('suffix-name', customer.customer_suffix_name || '');

        // Biographical Information
        // For date, always set as YYYY-MM-DD for <input type='date'>
        let birthDate = customer.birth_date ? customer.birth_date.slice(0, 10) : '';
        this.setInputValue('date', birthDate);
        this.setInputValue('country-of-birth', customer.birth_country || '');
        this.setInputValue('citizenship', customer.citizenship || '');
        this.setInputValue('gender', customer.gender || '');
        this.setInputValue('civil-status', this.getCivilStatusDescription(customer.civil_status_code) || '');
        this.setInputValue('residency', customer.residency_status || '');
    }

    displayContactDetails(contacts, addresses) {
        // Contact Details
        if (contacts && contacts.length > 0) {
            // Map contact_type_code to field
            let mobile = '';
            let landline = '';
            let email = '';
            contacts.forEach(c => {
                if (c.contact_type_code === 'CT01') mobile = c.contact_value;
                if (c.contact_type_code === 'CT02') landline = c.contact_value;
                if (c.contact_type_code === 'CT04') email = c.contact_value;
            });
            this.setInputValue('mobile-number', mobile);
            this.setInputValue('landline-number', landline);
            this.setInputValue('email-address', email);
        }

        // Addresses
        if (addresses && addresses.length > 0) {
            // Home address (assuming first address is home)
            const homeAddress = addresses.find(addr => addr.address_type_code === 'AD01') || addresses[0];
            if (homeAddress) {
                this.setInputValue('unit', homeAddress.address_unit || '');
                this.setInputValue('building', homeAddress.address_building || '');
                this.setInputValue('street', homeAddress.address_street || '');
                this.setInputValue('subdivision', homeAddress.address_subdivision || '');
                this.setInputValue('barangay', homeAddress.address_barangay || '');
                this.setInputValue('city', homeAddress.address_city || '');
                this.setInputValue('province', homeAddress.address_province || '');
                this.setInputValue('country', homeAddress.address_country || '');
                this.setInputValue('zip-code', homeAddress.address_zip_code || '');
            }

            // Work address (assuming second address is work)
            const workAddress = addresses.find(addr => addr.address_type_code === 'AD02') || addresses[1];
            if (workAddress) {
                this.setInputValue('work-unit', workAddress.address_unit || '');
                this.setInputValue('work-building', workAddress.address_building || '');
                this.setInputValue('work-street', workAddress.address_street || '');
                this.setInputValue('work-subdivision', workAddress.address_subdivision || '');
                this.setInputValue('work-barangay', workAddress.address_barangay || '');
                this.setInputValue('work-city', workAddress.address_city || '');
                this.setInputValue('work-province', workAddress.address_province || '');
                this.setInputValue('work-country', workAddress.address_country || '');
                this.setInputValue('work-zip-code', workAddress.address_zip_code || '');
            }

            // Alternate address (assuming third address is alternate)
            const altAddress = addresses.find(addr => addr.address_type_code === 'AD03') || addresses[2];
            if (altAddress) {
                this.setInputValue('alt-unit', altAddress.address_unit || '');
                this.setInputValue('alt-building', altAddress.address_building || '');
                this.setInputValue('alt-street', altAddress.address_street || '');
                this.setInputValue('alt-subdivision', altAddress.address_subdivision || '');
                this.setInputValue('alt-barangay', altAddress.address_barangay || '');
                this.setInputValue('alt-city', altAddress.address_city || '');
                this.setInputValue('alt-province', altAddress.address_province || '');
                this.setInputValue('alt-country', altAddress.address_country || '');
                this.setInputValue('alt-zip-code', altAddress.address_zip_code || '');
            }
        }
    }

    displayEmploymentData(employment, workNatures) {
        // Get contacts from this.customerData.contacts
        const contacts = this.customerData.contacts || [];
        let workEmail = '';
        let workLandline = '';
        contacts.forEach(c => {
            if (c.contact_type_code === 'CT05') workEmail = c.contact_value;
            if (c.contact_type_code === 'CT03') workLandline = c.contact_value;
        });
        this.setInputValue('work-email-address', workEmail);
        this.setInputValue('work-landline-number', workLandline);

        // TIN: try customer.tax_identification_number, then employment[0].tin_number
        let tin = '';
        if (this.customerData.customer && this.customerData.customer.tax_identification_number) {
            tin = this.customerData.customer.tax_identification_number;
        } else if (employment && employment.length > 0 && employment[0].tin_number) {
            tin = employment[0].tin_number;
        }
        this.setInputValue('tin-number', tin);

        if (employment && employment.length > 0) {
            const emp = employment[0]; // Get first employment record
            this.setInputValue('primary-employer', emp.employer_business_name || '');
            this.setInputValue('position', emp.job_title || '');
            this.setInputValue('monthly-income', this.formatCurrency(emp.income_monthly_gross) || '');
        }

        // Display work natures
        this.displayWorkNatures(workNatures);
    }

    displayWorkNatures(workNatures) {
        const container = document.querySelector('.work-nature-container');
        // Remove all existing work-business-nature-container elements
        container.querySelectorAll('.work-business-nature-container').forEach(el => el.remove());
        if (!workNatures || workNatures.length === 0) return;
        workNatures.forEach((workNature) => {
            const div = document.createElement('div');
            div.className = 'work-business-nature-container';
            div.innerHTML = `
                <div class="container">
                  <label>Work/Business Nature</label>
                  <input type="text" value="${workNature.nature_description || ''}" readonly />
                </div>
            `;
            container.appendChild(div);
        });
    }

    displayFundSources(fundSources) {
        const container = document.querySelector('.fund-source-container');
        // Remove all existing source-of-fund-container elements
        container.querySelectorAll('.source-of-fund-container').forEach(el => el.remove());
        if (!fundSources || fundSources.length === 0) return;
        fundSources.forEach((fundSource) => {
            const code = fundSource.fund_source_code || '';
            const desc = fundSource.fund_source_description || '';
            const displayText = code && desc ? `${code} - ${desc}` : (desc || code);
            const div = document.createElement('div');
            div.className = 'source-of-fund-container';
            div.innerHTML = `
                <div class="container">
                  <label>Source of Funds</label>
                  <input type="text" value="${displayText}" readonly />
                </div>
            `;
            container.appendChild(div);
        });
    }

    displayAliases(aliases) {
        const container = document.querySelector('.alias-full-name-container');
        // Remove all existing alias fields except the checkbox
        container.querySelectorAll('.container').forEach(el => el.remove());
        const noAliasCheckbox = document.getElementById('no-alias-checkbox');
        if (!aliases || aliases.length === 0) {
            if (noAliasCheckbox) noAliasCheckbox.checked = true;
            return;
        }
        if (noAliasCheckbox) noAliasCheckbox.checked = false;
        // Show all alias details
        aliases.forEach(alias => {
            const div = document.createElement('div');
            div.className = 'container';
            div.innerHTML = `
                <label>First Name</label>
                <input type="text" value="${alias.alias_first_name || ''}" readonly />
                <label>Middle Name</label>
                <input type="text" value="${alias.alias_middle_name || ''}" readonly />
                <label>Last Name</label>
                <input type="text" value="${alias.alias_last_name || ''}" readonly />
            `;
            container.appendChild(div);
        });
    }

    setInputValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.value = value;
        }
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    formatCurrency(amount) {
        if (!amount) return '';
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    }

    getCivilStatusDescription(code) {
        const civilStatusMap = {
            'CS01': 'Single',
            'CS02': 'Married',
            'CS03': 'Widowed',
            'CS04': 'Divorced',
            'CS05': 'Separated'
        };
        return civilStatusMap[code] || code;
    }

    setupEventListeners() {
        // Log out functionality
        const logoutBtn = document.getElementById('log-out');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Search functionality
        const searchInput = document.getElementById('search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }
    }

    handleSearch(searchTerm) {
        // Implement search functionality if needed
        console.log('Searching for:', searchTerm);
    }

    logout() {
        // Clear stored data
        localStorage.removeItem('cif_number');
        sessionStorage.removeItem('cif_number');
        
        // Redirect to login page
        window.location.href = '../Registration-Customer/login.html';
    }

    showError(message) {
        // Create and show error message
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 1000;
            max-width: 300px;
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    showSuccess(message) {
        // Create and show success message
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #44ff44;
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 1000;
            max-width: 300px;
        `;
        successDiv.textContent = message;
        
        document.body.appendChild(successDiv);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 5000);
    }

    setupEditProfileUI() {
        const editBtn = document.getElementById('edit-profile-btn');
        const btnsDiv = document.getElementById('profile-edit-btns');
        // Collect all input fields to be editable
        const editableIds = [
            // Personal Info
            'first-name','middle-name','last-name','suffix-name',
            'date','country-of-birth','citizenship','gender','civil-status','residency',
            // Employment
            'work-email-address','tin-number','primary-employer','position','monthly-income',
            // Work Address
            'work-unit','work-building','work-street','work-subdivision','work-barangay','work-city','work-province','work-country','work-zip-code',
            // Work Nature
            ...Array.from(document.querySelectorAll('.work-nature-container input')).map(i => i.id),
            // Fund Source
            ...Array.from(document.querySelectorAll('.fund-source-container input')).map(i => i.id),
            // Aliases
            ...Array.from(document.querySelectorAll('.alias-full-name-container input')).map(i => i.id)
        ];
        const editableInputs = editableIds.map(id => document.getElementById(id)).filter(Boolean);

        function setEditable(editable) {
            editableInputs.forEach(input => {
                if (input) input.readOnly = !editable;
            });
        }
        setEditable(false);

        editBtn.addEventListener('click', () => {
            setEditable(true);
            btnsDiv.innerHTML = `
                <button id="save-profile-btn" type="button">Save</button>
                <button id="cancel-profile-btn" type="button">Cancel</button>
            `;
            document.getElementById('save-profile-btn').onclick = async () => {
                // Gather all edited data (personal, employment, etc.)
                // For brevity, only personal info is shown here; expand as needed
                let birthDateInput = document.getElementById('date').value;
                function toISODate(str) {
                    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
                    const d = new Date(str);
                    if (!isNaN(d)) {
                        const yyyy = d.getFullYear();
                        const mm = String(d.getMonth() + 1).padStart(2, '0');
                        const dd = String(d.getDate()).padStart(2, '0');
                        return `${yyyy}-${mm}-${dd}`;
                    }
                    return str;
                }
                const editedData = {
                    customer_first_name: document.getElementById('first-name').value,
                    customer_middle_name: document.getElementById('middle-name').value,
                    customer_last_name: document.getElementById('last-name').value,
                    customer_suffix_name: document.getElementById('suffix-name').value.trim() === '' ? null : document.getElementById('suffix-name').value,
                    birth_date: toISODate(birthDateInput),
                    birth_country: document.getElementById('country-of-birth').value,
                    citizenship: document.getElementById('citizenship').value,
                    gender: document.getElementById('gender').value,
                    civil_status: document.getElementById('civil-status').value,
                    residency_status: document.getElementById('residency').value,
                    // Employment
                    work_email: document.getElementById('work-email-address').value,
                    tin_number: document.getElementById('tin-number').value,
                    employer_business_name: document.getElementById('primary-employer').value,
                    job_title: document.getElementById('position').value,
                    income_monthly_gross: document.getElementById('monthly-income').value
                    // Add more as needed
                };
                // TODO: Add logic to compare and send only changed fields for all sections
                // For now, send all fields
                const orig = this.customerData.customer;
                const changed = { ...editedData };
                try {
                    const cif = orig.cif_number;
                    const response = await fetch(`${this.apiBaseUrl}/api/customer/${cif}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(changed)
                    });
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    this.showSuccess('Profile updated successfully!');
                    window.location.href = 'update-profile4.html';
                } catch (error) {
                    console.error('Error updating profile:', error);
                    this.showError('Failed to update profile. Please try again.');
                    setEditable(false);
                    btnsDiv.innerHTML = `<button id='edit-profile-btn' type='button'>Edit Profile</button>`;
                    this.setupEditProfileUI();
                }
            };
            document.getElementById('cancel-profile-btn').onclick = () => {
                this.displayCustomerData();
                setEditable(false);
                btnsDiv.innerHTML = `<button id='edit-profile-btn' type='button'>Edit Profile</button>`;
                this.setupEditProfileUI();
            };
        });
    }
}

// Initialize the profile manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ProfileManager();
}); 