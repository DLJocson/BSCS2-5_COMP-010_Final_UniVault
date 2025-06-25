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
        // Handle timezone issues to prevent date from decrementing
        let birthDate = '';
        if (customer.birth_date) {
            // Extract date part directly without timezone conversion
            if (customer.birth_date.includes('T')) {
                birthDate = customer.birth_date.split('T')[0];
            } else {
                birthDate = customer.birth_date.slice(0, 10);
            }
        }
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
        
        // Work nature mapping for display
        const workNatureDisplayMap = {
            'ACT': 'Accounting/Auditing/Tax Practice Services',
            'LEG': 'Legal Services',
            'ANE': 'Architecture/Engineering',
            'SVC': 'Other Professional Services / Consultancy / Coaching',
            'PWN': 'Pawnshop',
            'LDG': 'Lending',
            'MSE': 'Money Service Business - Electronic Money Issuer',
            'MSV': 'Money Service Business - Virtual Currency Exchange',
            'MSR': 'Money Service Business - Remittance Transfer Company',
            'MSF': 'Money Service Business - Foreign Exchange Dealer / Money Changer',
            'BAN': 'Banking',
            'INS': 'Insurance',
            'SBD': 'Securities Broker / Dealer',
            'CON': 'Construction and Civil Engineering',
            'REL': 'Real Estate Brokerage and Sales',
            'MED': 'Media',
            'ENT': 'Arts/Entertainment/Recreation',
            'SPO': 'Sports/eSports',
            'GAM': 'Gambling/Casino/eGames',
            'HEA': 'Healthcare (Doctor, Dentist, Nurse, Psychiatrist and others)',
            'SOC': 'Social Work / Non-Government and Non-Profit Organizations',
            'EDU': 'Education / Online Education',
            'COM': 'Information/Communication/Telecommunication',
            'PUB': 'Publishing/Printing',
            'ADV': 'Advertising/Marketing',
            'ICT': 'Robotics/AI/Cloud/Data Engineering/Software Development/Cybersecurity',
            'MFG': 'Manufacturing/Packaging',
            'MFF': 'Manufacturing/Trading of Firearms and Ammunition',
            'ART': 'Art / Antiques Dealership',
            'CAR': 'Car/Boat/Plane Dealership',
            'JEW': 'Jewelry / Precious Metals / Precious Stones Dealership',
            'WRT': 'Wholesale / Retail Trade / E-Commerce / Online Selling',
            'REP': 'Repair Services',
            'TRN': 'Transportation (Land, Sea and Air)',
            'SHP': 'Shipping/Cargo / Storage',
            'SEA': 'Seaman / Seafarer',
            'AGR': 'Agriculture / Fishing',
            'FOR': 'Forestry',
            'MIN': 'Mining/Quarrying',
            'ELE': 'Electric Utilities',
            'OIL': 'Oil/Gasoline',
            'WAT': 'Water Supply/Sewerage/Waste Management',
            'GOV': 'Public Administration / Government',
            'PEA': 'Peace and Order (Military, Police, Fireman, Jail Warden and Others)',
            'HOT': 'Hotel/Accommodation/Restaurant/Food Services',
            'DIP': 'Embassies/Diplomatic Services / Attached Offices',
            'TRA': 'Travel / Travel Agencies',
            'EMP': 'Employment Agency / Human Resources',
            'SEC': 'Security Agency / Services',
            'OTH': 'Other Service Activities (Hairdresser, Manicurist, Masseuse and others)',
            'HOU': 'Private Household / Household Employee / Household Staff',
            'RELG': 'Religious Organization',
            'DNF': 'Designated Non Financial Business And Professions (DNFBP)',
            'POG': 'Direct OGB/POGO Licensee and Authorized Gaming Agent',
            'POI': 'Indirect OGB/POGO Allied Service Provider'
        };

        // Frontend to code mapping for localStorage fallback
        const frontendToCodeMap = {
            'accounting': 'ACT',
            'legal': 'LEG',
            'architecture': 'ANE',
            'consultancy': 'SVC',
            'pawnshop': 'PWN',
            'lending': 'LDG',
            'msb_emi': 'MSE',
            'msb_virtual_currency': 'MSV',
            'msb_remittance': 'MSR',
            'msb_forex_dealer': 'MSF',
            'banking': 'BAN',
            'insurance': 'INS',
            'securities': 'SBD',
            'construction': 'CON',
            'real_estate': 'REL',
            'media': 'MED',
            'arts': 'ENT',
            'sports': 'SPO',
            'gambling': 'GAM',
            'healthcare': 'HEA',
            'social_work': 'SOC',
            'education': 'EDU',
            'ict': 'COM',
            'publishing': 'PUB',
            'advertising': 'ADV',
            'tech': 'ICT',
            'manufacturing': 'MFG',
            'firearms': 'MFF',
            'antiques': 'ART',
            'vehicle_dealership': 'CAR',
            'jewelry': 'JEW',
            'retail': 'WRT',
            'repair': 'REP',
            'transport': 'TRN',
            'shipping': 'SHP',
            'seafarer': 'SEA',
            'agriculture': 'AGR',
            'forestry': 'FOR',
            'mining': 'MIN',
            'electric': 'ELE',
            'oil': 'OIL',
            'water': 'WAT',
            'government': 'GOV',
            'peace_order': 'PEA',
            'hospitality': 'HOT',
            'diplomatic': 'DIP',
            'travel': 'TRA',
            'employment_agency': 'EMP',
            'security_agency': 'SEC',
            'other_services': 'OTH',
            'household': 'HOU',
            'religious': 'RELG',
            'designated_non_financial_business_professions': 'DNF',
            'pogo_direct': 'POG',
            'pogo_indirect': 'POI'
        };
        
        if (!workNatures || workNatures.length === 0) {
            // Fallback: check localStorage for work nature data
            const localStorageWorkNature = localStorage.getItem('business-nature-multi');
            if (localStorageWorkNature) {
                const workNatureValues = localStorageWorkNature.split(',').map(w => w.trim());
                workNatureValues.forEach(value => {
                    const code = frontendToCodeMap[value] || value.toUpperCase();
                    const displayName = workNatureDisplayMap[code] || value;
                    const div = document.createElement('div');
                    div.className = 'work-business-nature-container';
                    div.innerHTML = `
                        <div class="container">
                          <label>Work/Business Nature</label>
                          <input type="text" value="${displayName}" readonly />
                          <small style="color: #666; font-size: 0.9em;">From registration data</small>
                        </div>
                    `;
                    container.appendChild(div);
                });
                return;
            }
            
            // Show a message if no work nature is found
            const div = document.createElement('div');
            div.className = 'work-business-nature-container';
            div.innerHTML = `
                <div class="container">
                  <label>Work/Business Nature</label>
                  <input type="text" value="Not specified" readonly />
                </div>
            `;
            container.appendChild(div);
            return;
        }
        
        workNatures.forEach((workNature) => {
            const displayName = workNature.nature_description || 
                              workNatureDisplayMap[workNature.work_nature_code] || 
                              workNature.work_nature_code || 
                              'Not specified';
            const div = document.createElement('div');
            div.className = 'work-business-nature-container';
            div.innerHTML = `
                <div class="container">
                  <label>Work/Business Nature</label>
                  <input type="text" value="${displayName}" readonly />
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
        // Remove all existing alias fields except the checkbox container
        container.querySelectorAll('.alias-info-container').forEach(el => el.remove());
        
        const noAliasCheckbox = document.getElementById('no-alias-checkbox');
        
        if (!aliases || aliases.length === 0) {
            if (noAliasCheckbox) noAliasCheckbox.checked = true;
            // Add a message when no aliases
            const div = document.createElement('div');
            div.className = 'alias-info-container';
            div.innerHTML = `
                <div class="alias-message">
                    <p>No aliases on record</p>
                </div>
            `;
            container.appendChild(div);
            return;
        }
        
        if (noAliasCheckbox) noAliasCheckbox.checked = false;
        
        // Show all alias details with improved styling
        aliases.forEach((alias, index) => {
            const div = document.createElement('div');
            div.className = 'alias-info-container';
            div.innerHTML = `
                <div class="alias-header">
                    <h3>Alias ${index + 1}</h3>
                </div>
                <div class="alias-fields">
                    <div class="alias-field">
                        <label>First Name</label>
                        <input type="text" value="${alias.alias_first_name || 'Not provided'}" readonly />
                    </div>
                    <div class="alias-field">
                        <label>Middle Name</label>
                        <input type="text" value="${alias.alias_middle_name || 'Not provided'}" readonly />
                    </div>
                    <div class="alias-field">
                        <label>Last Name</label>
                        <input type="text" value="${alias.alias_last_name || 'Not provided'}" readonly />
                    </div>
                </div>
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

    getCivilStatusCode(description) {
        const civilStatusCodeMap = {
            'Single': 'CS01',
            'Married': 'CS02',
            'Widowed': 'CS03',
            'Divorced': 'CS04',
            'Separated': 'CS05'
        };
        return civilStatusCodeMap[description] || description;
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
        
        // Function to get all currently editable inputs
        function getAllEditableInputs() {
            const staticIds = [
                // Personal Info
                'first-name','middle-name','last-name','suffix-name',
                'date','country-of-birth','citizenship','gender','civil-status','residency',
                // Contact Details
                'mobile-number','landline-number','email-address',
                // Home Address
                'unit','building','street','subdivision','barangay','city','province','country','zip-code',
                // Alternate Address
                'alt-unit','alt-building','alt-street','alt-subdivision','alt-barangay','alt-city','alt-province','alt-country','alt-zip-code',
                // Employment
                'work-email-address','tin-number','primary-employer','position','monthly-income',
                // Work Address
                'work-unit','work-building','work-street','work-subdivision','work-barangay','work-city','work-province','work-country','work-zip-code'
            ];
            
            // Get static inputs
            const staticInputs = staticIds.map(id => document.getElementById(id)).filter(Boolean);
            
            // Get dynamic inputs (work nature, fund source, aliases)
            const dynamicInputs = [
                ...Array.from(document.querySelectorAll('.work-nature-container input[type="text"]')),
                ...Array.from(document.querySelectorAll('.fund-source-container input[type="text"]')),
                ...Array.from(document.querySelectorAll('.alias-full-name-container input[type="text"]'))
            ];
            
            return [...staticInputs, ...dynamicInputs];
        }

        function setEditable(editable) {
            const allInputs = getAllEditableInputs();
            allInputs.forEach(input => {
                if (input) {
                    input.readOnly = !editable;
                    // Add visual feedback for editable state
                    if (editable) {
                        input.style.backgroundColor = '#fff';
                        input.style.borderColor = '#2a4d8f';
                    } else {
                        input.style.backgroundColor = '#f8f9fa';
                        input.style.borderColor = '#c8daf0';
                    }
                }
            });
        }
        
        // Initially set all fields to read-only
        setEditable(false);

        editBtn.addEventListener('click', () => {
            setEditable(true);
            btnsDiv.innerHTML = `
                <button id="save-profile-btn" type="button">Save</button>
                <button id="cancel-profile-btn" type="button">Cancel</button>
            `;
            document.getElementById('save-profile-btn').onclick = async () => {
                try {
                    // Get changes by comparing current form values with original data
                    const changes = this.getChangedFields();
                    
                    // If no changes, show message and return
                    if (Object.keys(changes).length === 0) {
                        this.showSuccess('No changes detected.');
                        setEditable(false);
                        btnsDiv.innerHTML = `<button id='edit-profile-btn' type='button'>Edit Profile</button>`;
                        this.setupEditProfileUI();
                        return;
                    }
                    
                    console.log('Changes detected:', changes);
                    
                    // Store changes temporarily in localStorage for the confirmation flow
                    localStorage.setItem('pendingProfileChanges', JSON.stringify(changes));
                    localStorage.setItem('originalCustomerData', JSON.stringify(this.customerData));
                    
                    // Start the confirmation flow
                    // update-profile4.html → update-profile7.html → success page
                    window.location.href = 'update-profile4.html';
                    
                } catch (error) {
                    console.error('Error preparing profile update:', error);
                    this.showError(`Failed to prepare profile update: ${error.message}`);
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

    getChangedFields() {
        const changes = {};
        
        // Helper function to normalize date values
        function normalizeDate(dateValue) {
            if (!dateValue) return null;
            // Extract just the YYYY-MM-DD part
            if (dateValue.includes('T')) {
                return dateValue.split('T')[0];
            }
            return dateValue.slice(0, 10);
        }
        
        // Helper function to normalize empty strings to null
        function normalizeValue(value) {
            if (value === '' || value === undefined) return null;
            return value;
        }
        
        // Get original data
        const { customer, contacts, addresses, employment } = this.customerData;
        
        // Map contacts for easy lookup
        const contactMap = {};
        if (contacts) {
            contacts.forEach(c => {
                if (c.contact_type_code === 'CT01') contactMap.mobile_number = c.contact_value;
                if (c.contact_type_code === 'CT02') contactMap.landline_number = c.contact_value;
                if (c.contact_type_code === 'CT04') contactMap.email_address = c.contact_value;
                if (c.contact_type_code === 'CT05') contactMap.work_email = c.contact_value;
                if (c.contact_type_code === 'CT03') contactMap.work_landline = c.contact_value;
            });
        }
        
        // Get home address (first address or AD01)
        const homeAddress = addresses && addresses.length > 0 ? 
            (addresses.find(addr => addr.address_type_code === 'AD01') || addresses[0]) : null;
        
        // Get work address (second address or AD02)
        const workAddress = addresses && addresses.length > 1 ? 
            (addresses.find(addr => addr.address_type_code === 'AD02') || addresses[1]) : null;
        
        // Get alternate address (third address or AD03)
        const altAddress = addresses && addresses.length > 2 ? 
            (addresses.find(addr => addr.address_type_code === 'AD03') || addresses[2]) : null;
        
        // Get employment data
        const emp = employment && employment.length > 0 ? employment[0] : null;
        
        // Check customer fields
        const customerFieldMap = {
            'first-name': 'customer_first_name',
            'middle-name': 'customer_middle_name', 
            'last-name': 'customer_last_name',
            'suffix-name': 'customer_suffix_name',
            'country-of-birth': 'birth_country',
            'citizenship': 'citizenship',
            'gender': 'gender',
            'residency': 'residency_status'
        };
        
        Object.keys(customerFieldMap).forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                const currentValue = normalizeValue(element.value.trim());
                const originalValue = normalizeValue(customer[customerFieldMap[fieldId]]);
                if (currentValue !== originalValue) {
                    changes[customerFieldMap[fieldId]] = currentValue;
                }
            }
        });
        
        // Check birth date separately due to special handling
        const birthDateElement = document.getElementById('date');
        if (birthDateElement) {
            const currentDate = normalizeDate(birthDateElement.value);
            const originalDate = normalizeDate(customer.birth_date);
            if (currentDate !== originalDate) {
                changes.birth_date = currentDate;
            }
        }
        
        // Check civil status - map display value back to code
        const civilStatusElement = document.getElementById('civil-status');
        if (civilStatusElement) {
            const currentDisplayValue = civilStatusElement.value;
            const currentCode = this.getCivilStatusCode(currentDisplayValue);
            const originalCode = customer.civil_status_code;
            if (currentCode !== originalCode) {
                changes.civil_status_code = currentCode;
            }
        }
        
        // Check contact fields
        const contactFieldMap = {
            'mobile-number': 'mobile_number',
            'landline-number': 'landline_number',
            'email-address': 'email_address',
            'work-email-address': 'work_email',
            'work-landline-number': 'work_landline'
        };
        
        Object.keys(contactFieldMap).forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                const currentValue = normalizeValue(element.value.trim());
                const originalValue = normalizeValue(contactMap[contactFieldMap[fieldId]]);
                if (currentValue !== originalValue) {
                    changes[contactFieldMap[fieldId]] = currentValue;
                }
            }
        });
        
        // Check address fields - home address (send as flat fields)
        const homeAddressFieldMap = {
            'unit': 'address_unit',
            'building': 'address_building',
            'street': 'address_street',
            'subdivision': 'address_subdivision',
            'barangay': 'address_barangay',
            'city': 'address_city',
            'province': 'address_province',
            'country': 'address_country',
            'zip-code': 'address_zip_code'
        };
        
        Object.keys(homeAddressFieldMap).forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                const currentValue = normalizeValue(element.value.trim());
                const originalValue = normalizeValue(homeAddress ? homeAddress[homeAddressFieldMap[fieldId]] : null);
                if (currentValue !== originalValue) {
                    changes[homeAddressFieldMap[fieldId]] = currentValue;
                }
            }
        });
        
        // Check employment fields (send as flat fields)
        const employmentFieldMap = {
            'tin-number': 'tin_number',
            'primary-employer': 'employer_business_name',
            'position': 'job_title'
        };
        
        Object.keys(employmentFieldMap).forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                const currentValue = normalizeValue(element.value.trim());
                let originalValue = null;
                
                // Handle TIN specially - check both customer and employment tables
                if (fieldId === 'tin-number') {
                    originalValue = normalizeValue(customer.tax_identification_number || (emp ? emp.tin_number : null));
                } else if (emp) {
                    originalValue = normalizeValue(emp[employmentFieldMap[fieldId]]);
                }
                
                if (currentValue !== originalValue) {
                    changes[employmentFieldMap[fieldId]] = currentValue;
                }
            }
        });
        
        // Check monthly income separately due to currency formatting
        const incomeElement = document.getElementById('monthly-income');
        if (incomeElement && emp) {
            const currentValue = incomeElement.value.replace(/[₱,\s]/g, ''); // Remove currency symbols
            const originalValue = emp.income_monthly_gross ? emp.income_monthly_gross.toString() : '';
            if (currentValue !== originalValue) {
                changes.income_monthly_gross = parseFloat(currentValue) || null;
            }
        }
        
        return changes;
    }
}

// Initialize the profile manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ProfileManager();
});