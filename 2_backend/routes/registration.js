const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const { getField, customerTypeMap, residencyStatusMap, civilStatusMap, fundSourceMap, workNatureMap } = require('../utils/fieldMapper');

const router = express.Router();

// Reference code validation function
function validateReferenceCode(code, pattern, fieldName) {
    if (!code) {
        throw new Error(`${fieldName} is required`);
    }
    
    if (!code.match(pattern)) {
        throw new Error(`Invalid ${fieldName} format: ${code}. Expected pattern: ${pattern}`);
    }
    
    return true;
}

// Enhanced validation for all reference codes and NOT NULL fields
function validateRegistrationReferenceData(data) {
    const errors = [];
    
    // Validate civil status code if provided
    if (data.civil_status_code && !data.civil_status_code.match(/^CS\d{2}$/)) {
        errors.push(`Invalid civil status code format: ${data.civil_status_code}`);
    }
    
    // Validate position code if provided
    if (data.position_code && !data.position_code.match(/^EP\d{2}$/)) {
        errors.push(`Invalid position code format: ${data.position_code}`);
    }
    
    // Validate fund source codes if provided
    if (data.fund_source_code && !data.fund_source_code.match(/^FS\d{3}$/)) {
        errors.push(`Invalid fund source code format: ${data.fund_source_code}`);
    }
    
    // Validate work nature codes if provided
    if (data.work_nature_code && !data.work_nature_code.match(/^[A-Z]{3}$/)) {
        errors.push(`Invalid work nature code format: ${data.work_nature_code}`);
    }
    
    // Validate contact type codes if provided
    if (data.contact_type_code && !data.contact_type_code.match(/^CT\d{2}$/)) {
        errors.push(`Invalid contact type code format: ${data.contact_type_code}`);
    }
    
    // Validate address type codes if provided
    if (data.address_type_code && !data.address_type_code.match(/^AD\d{2}$/)) {
        errors.push(`Invalid address type code format: ${data.address_type_code}`);
    }
    
    if (errors.length > 0) {
        throw new Error(`Reference code validation failed: ${errors.join(', ')}`);
    }
    
    return true;
}

// Validate and prepare NOT NULL fields before database insertion
function validateAndPrepareRequiredFields(data) {
    const preparedData = { ...data };
    const warnings = [];
    
    // Ensure tax_identification_number is not null (NOT NULL field) - check multiple possible field names
    const tinRaw = preparedData.tax_identification_number || preparedData.tin || preparedData.TIN;
    if (!tinRaw || tinRaw.trim() === '') {
        preparedData.tax_identification_number = 'N/A';
        warnings.push('TIN not provided, defaulting to N/A');
    } else {
        preparedData.tax_identification_number = tinRaw.trim();
    }
    
    // Ensure birth_country has a value (NOT NULL field)
    if (!preparedData.birth_country || preparedData.birth_country.trim() === '') {
        preparedData.birth_country = 'Philippines';
        warnings.push('Birth country not provided, defaulting to Philippines');
    }
    
    // Ensure citizenship has a value (NOT NULL field)
    if (!preparedData.citizenship || preparedData.citizenship.trim() === '') {
        preparedData.citizenship = 'Filipino';
        warnings.push('Citizenship not provided, defaulting to Filipino');
    }
    
    // Log warnings if any defaults were applied
    if (warnings.length > 0 && process.env.NODE_ENV === 'development') {
        console.log('Applied default values for missing fields:', warnings);
    }
    
    return preparedData;
}

// Registration POST route (returns cif_number)
router.post('/register', async (req, res, next) => {
    try {
        if (process.env.NODE_ENV === 'development') {
            console.log('=== Registration Request Received ===');
            console.log('Request body keys:', Object.keys(req.body));
        }
        
        const data = req.body;
        
        // Map remittance fields from all possible key variants
        const remittance_country = getField(data, ['remittance_country', 'remittance-country', 'remittanceCountry']);
        const remittance_purpose = getField(data, ['remittance_purpose', 'remittance-purpose', 'remittancePurpose']);
        
        // Robust mapping for all required fields
        const customer_type = getField(data, ['customer_type', 'customerType']);
        const account_type_raw = getField(data, ['account_type', 'accountType']);
        
        // Map old short account type values to proper database values for backward compatibility
        const accountTypeMap = {
            'deposit': 'Deposit Account',
            'card': 'Card Account', 
            'loan': 'Loan Account',
            'wealth-management': 'Wealth Management Account',
            'insurance': 'Insurance Account',
            // Pass through new correct values
            'Deposit Account': 'Deposit Account',
            'Card Account': 'Card Account',
            'Loan Account': 'Loan Account', 
            'Wealth Management Account': 'Wealth Management Account',
            'Insurance Account': 'Insurance Account'
        };
        const account_type = accountTypeMap[account_type_raw] || account_type_raw;
        
        if (process.env.NODE_ENV === 'development') {
            console.log('Account type processing:', { 
                raw: account_type_raw, 
                mapped: account_type
            });
        }
        const customer_last_name = getField(data, ['customer_last_name', 'customerLastName', 'last_name', 'lastName']);
        const customer_first_name = getField(data, ['customer_first_name', 'customerFirstName', 'first_name', 'firstName']);
        const customer_middle_name = getField(data, ['customer_middle_name', 'customerMiddleName', 'middle_name', 'middleName']);
        const customer_suffix_name = getField(data, ['customer_suffix_name', 'customerSuffixName', 'suffix_name', 'suffixName']);
        const customer_username = getField(data, ['customer_username', 'customerUsername', 'username']);
        const customer_password = getField(data, ['customer_password', 'customerPassword', 'password']);
        const birth_date = getField(data, ['birth_date', 'birthDate', 'dob']);
        const gender = getField(data, ['gender']);
        const civil_status_code = getField(data, ['civil_status_code', 'civilStatusCode', 'civil_status']);
        const birth_country = getField(data, ['birth_country', 'birthCountry']);
        const citizenship = getField(data, ['citizenship']);
        const reg_political_affiliation = getField(data, ['reg_political_affiliation', 'political_affiliation']);
        const reg_fatca = getField(data, ['reg_fatca', 'fatca']);
        const reg_dnfbp = getField(data, ['reg_dnfbp', 'dnfbp']);
        const reg_online_gaming = getField(data, ['reg_online_gaming', 'online_gaming']);
        const reg_beneficial_owner = getField(data, ['reg_beneficial_owner', 'beneficial_owner']);
        
        // Address fields (home)
        const address_unit = getField(data, ['address_unit', 'addressUnit']);
        const address_building = getField(data, ['address_building', 'addressBuilding']);
        const address_street = getField(data, ['address_street', 'addressStreet']);
        const address_subdivision = getField(data, ['address_subdivision', 'addressSubdivision']);
        const address_barangay = getField(data, ['address_barangay', 'addressBarangay']);
        const address_city = getField(data, ['address_city', 'addressCity']);
        const address_province = getField(data, ['address_province', 'addressProvince']);
        const address_country = getField(data, ['address_country', 'addressCountry']);
        const address_zip_code = getField(data, ['address_zip_code', 'addressZipCode', 'address_zip']);
        
        // Alternate address fields
        const altUnit = getField(data, ['altUnit', 'alt_unit']);
        const altBuilding = getField(data, ['altBuilding', 'alt_building']);
        const altStreet = getField(data, ['altStreet', 'alt_street']);
        const altSubdivision = getField(data, ['altSubdivision', 'alt_subdivision']);
        const altBarangay = getField(data, ['altBarangay', 'alt_barangay']);
        const altCity = getField(data, ['altCity', 'alt_city']);
        const altProvince = getField(data, ['altProvince', 'alt_province']);
        const altCountry = getField(data, ['altCountry', 'alt_country']);
        const altZip = getField(data, ['altZip', 'alt_zip']);
        
        // New fields for registration
        const data_privacy_consent = getField(data, ['data_privacy_consent', 'dataPrivacyConsent']);
        const issuance_consent = getField(data, ['issuance_consent', 'issuanceConsent']);
        const customer_undertaking = getField(data, ['customer_undertaking', 'customerUndertaking']);
        
        // Validate required fields with detailed error messages
        const missingFields = [];
        if (!customer_type) missingFields.push('customer_type');
        if (!account_type) missingFields.push('account_type');
        if (!customer_last_name) missingFields.push('customer_last_name');
        if (!customer_first_name) missingFields.push('customer_first_name');
        if (!customer_username) missingFields.push('customer_username');
        if (!customer_password) missingFields.push('customer_password');
        if (!birth_date) missingFields.push('birth_date');
        if (!gender) missingFields.push('gender');
        if (!birth_country) missingFields.push('birth_country');
        if (!citizenship) missingFields.push('citizenship');
        
        // Validate account type against database constraint
        const validAccountTypes = ['Deposit Account', 'Card Account', 'Loan Account', 'Wealth Management Account', 'Insurance Account'];
        if (account_type && !validAccountTypes.includes(account_type)) {
            return res.status(400).json({ 
                message: `Invalid account type: ${account_type}. Must be one of: ${validAccountTypes.join(', ')}`,
                invalidField: 'account_type',
                receivedValue: account_type,
                allowedValues: validAccountTypes
            });
        }
        
        // Validate customer type against database constraint
        const validCustomerTypes = ['Account Owner', 'Business Owner', 'Business Owner / Officer / Signatory', 'Individual', 'Corporate'];
        if (customer_type && !validCustomerTypes.includes(customer_type)) {
            return res.status(400).json({ 
                message: `Invalid customer type: ${customer_type}. Must be one of: ${validCustomerTypes.join(', ')}`,
                invalidField: 'customer_type',
                receivedValue: customer_type,
                allowedValues: validCustomerTypes
            });
        }
        
        if (missingFields.length > 0) {
            console.error('Missing required fields:', missingFields);
            return res.status(400).json({ 
                message: `Missing required fields: ${missingFields.join(', ')}`,
                missingFields: missingFields
            });
        }
        
        // Validate reference codes before processing
        try {
            validateRegistrationReferenceData(data);
        } catch (validationError) {
            console.error('Reference code validation failed:', validationError.message);
            return res.status(400).json({ 
                message: validationError.message,
                error: 'REFERENCE_CODE_VALIDATION_FAILED'
            });
        }
        
        // Validate and prepare required fields (apply defaults for NOT NULL fields)
        const preparedData = validateAndPrepareRequiredFields(data);
        console.log('Data prepared with required field defaults applied');
        
        // Validate required address fields (use mapped variables)
        if (!address_barangay || !address_city || !address_province || !address_country || !address_zip_code) {
            return res.status(400).json({ message: 'All address fields must be filled.' });
        }

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();
            
            // Hash the password before saving
            const password_hash = await bcrypt.hash(customer_password, 10);
            
            const mappedCustomerType = customerTypeMap[(customer_type || '').toLowerCase()] || customer_type;
            
            // Residency status mapping
            const residency_status_raw = getField(data, ['residency_status', 'residencyStatus', 'residency-status']);
            let residency_status = residencyStatusMap[(residency_status_raw || '').toLowerCase().trim()];
            if (residency_status === undefined) residency_status = residency_status_raw;
            
            // Civil status mapping (ensure it's a valid 4-character code)
            const civil_status_raw = civil_status_code;
            const mapped_civil_status = civilStatusMap[(civil_status_raw || '').toLowerCase().trim()] || 'CS01';
            
            console.log('Civil status mapping:', { 
                raw: civil_status_raw, 
                mapped: mapped_civil_status 
            });
            
            // Robust mapping for TIN (use prepared data which ensures NOT NULL)
            const tax_identification_number_raw = getField(preparedData, ['tax_identification_number', 'tin', 'TIN', 'TaxIdentificationNumber']);
            const tax_identification_number = (tax_identification_number_raw || 'N/A').substring(0, 20);
            
            // Insert into CUSTOMER table (only fields that exist in schema)
            const [result] = await conn.execute(
                `INSERT INTO CUSTOMER (
                    customer_type, customer_last_name, customer_first_name, customer_middle_name, customer_suffix_name,
                    customer_username, customer_password, birth_date, gender, civil_status_code,
                    birth_country, residency_status, citizenship, tax_identification_number, customer_status,
                    remittance_country, remittance_purpose,
                    reg_political_affiliation, reg_fatca, reg_dnfbp, reg_online_gaming, reg_beneficial_owner
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    mappedCustomerType,
                    customer_last_name,
                    customer_first_name,
                    customer_middle_name || null,
                    customer_suffix_name || null,
                    customer_username,
                    password_hash,
                    birth_date,
                    gender,
                    mapped_civil_status, // Use mapped civil status code
                    preparedData.birth_country, // Use prepared data to ensure NOT NULL
                    residency_status || 'Resident',
                    preparedData.citizenship, // Use prepared data to ensure NOT NULL
                    tax_identification_number, // Already processed above
                    'Pending Verification', // Use schema default
                    remittance_country || null,
                    remittance_purpose || null,
                    reg_political_affiliation || null,
                    reg_fatca || null,
                    reg_dnfbp || null,
                    reg_online_gaming || null,
                    reg_beneficial_owner || null
                ]
            );
            
            const cif_number = result.insertId;

            // Insert address (home address) - use mapped variables
            await conn.execute(
                `INSERT INTO CUSTOMER_ADDRESS (
                    cif_number, address_type_code, address_unit, address_building, address_street, address_subdivision, address_barangay, address_city, address_province, address_country, address_zip_code
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    cif_number,
                    'AD01',
                    address_unit || null,
                    address_building || null,
                    address_street || null,
                    address_subdivision || null,
                    address_barangay,
                    address_city,
                    address_province,
                    address_country,
                    address_zip_code
                ]
            );
            
            // Insert alternate address if provided - use mapped variables
            if (altUnit || altBuilding || altStreet || altSubdivision || altBarangay || altCity || altProvince || altCountry || altZip) {
                await conn.execute(
                    `INSERT INTO CUSTOMER_ADDRESS (
                        cif_number, address_type_code, address_unit, address_building, address_street, address_subdivision, address_barangay, address_city, address_province, address_country, address_zip_code
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        cif_number,
                        'AD02',
                        altUnit || null,
                        altBuilding || null,
                        altStreet || null,
                        altSubdivision || null,
                        altBarangay || null,
                        altCity || null,
                        altProvince || null,
                        altCountry || null,
                        altZip || null
                    ]
                );
                console.log('Alternate address inserted');
            }

            // Insert work address if provided
            const workUnit = getField(data, ['work_unit', 'workUnit', 'work-unit']);
            const workBuilding = getField(data, ['work_building', 'workBuilding', 'work-building']);
            const workStreet = getField(data, ['work_street', 'workStreet', 'work-street']);
            const workSubdivision = getField(data, ['work_subdivision', 'workSubdivision', 'work-subdivision']);
            const workBarangay = getField(data, ['work_barangay', 'workBarangay', 'work-barangay']);
            const workCity = getField(data, ['work_city', 'workCity', 'work-city']);
            const workProvince = getField(data, ['work_province', 'workProvince', 'work-province']);
            const workCountry = getField(data, ['work_country', 'workCountry', 'work-country']);
            const workZip = getField(data, ['work_zip', 'workZip', 'work-zip', 'work-zip-code']);

            if (workBarangay || workCity || workProvince) { // At least basic work address info
                await conn.execute(
                    `INSERT INTO CUSTOMER_ADDRESS (
                        cif_number, address_type_code, address_unit, address_building, address_street, address_subdivision, address_barangay, address_city, address_province, address_country, address_zip_code
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        cif_number,
                        'AD03', // Work address
                        workUnit || null,
                        workBuilding || null,
                        workStreet || null,
                        workSubdivision || null,
                        workBarangay || 'N/A',
                        workCity || 'N/A',
                        workProvince || 'N/A',
                        workCountry || 'Philippines',
                        workZip || '0000'
                    ]
                );
                console.log('Work address inserted');
            }

            // Helper function to normalize file paths for database constraint
            function normalizeFilePath(filePath) {
                if (!filePath || filePath === 'null' || filePath === '') {
                    return null;
                }
                
                // If it's already a URL, return as-is
                if (filePath.match(/^(https?|ftp):\/\/.+/)) {
                    return filePath;
                }
                
                // Convert relative paths to absolute Windows paths (for local development)
                if (filePath.startsWith('uploads/')) {
                    return `C:\\Users\\louie\\Documents\\Github\\COMP010_BSCS25_G4_UniVault\\2_backend\\${filePath.replace(/\//g, '\\\\')}`;
                }
                
                // If it looks like a Windows path, ensure proper format
                if (filePath.includes('\\') || filePath.match(/^[A-Za-z]:/)) {
                    return filePath.replace(/\//g, '\\\\');
                }
                
                // If it looks like a Unix path, ensure proper format
                if (filePath.startsWith('/')) {
                    return filePath;
                }
                
                // Default: treat as relative and make it a Windows absolute path
                return `C:\\Users\\louie\\Documents\\Github\\COMP010_BSCS25_G4_UniVault\\2_backend\\uploads\\${filePath}`;
            }

            // Insert IDs - Skip for now if no proper file paths
            console.log('ID insertion data check:', {
                id1Type: data.id1Type,
                id1Number: data.id1Number,
                id1Front: data['id1FrontImagePath'] || data['front-id-1_path'],
                id1Back: data['id1BackImagePath'] || data['back-id-1_path']
            });
            
            if (data.id1Type && data.id1Number) {
                const id1Front = data['id1FrontImagePath'] || data['front-id-1_path'];
                const normalizedId1Front = normalizeFilePath(id1Front);
                
                console.log('ID1 path normalization:', { original: id1Front, normalized: normalizedId1Front });
                
                // Only insert if we have valid file path or skip with null
                if (normalizedId1Front || true) { // Allow null for testing
                    try {
                        await conn.execute(
                            `INSERT INTO CUSTOMER_ID (cif_number, id_type_code, id_number, id_storage, id_issue_date, id_expiry_date)
                             VALUES (?, ?, ?, ?, ?, ?)`,
                            [
                                cif_number,
                                data.id1Type,
                                data.id1Number,
                                normalizedId1Front, // Can be null
                                data.id1IssueYear && data.id1IssueMonth && data.id1IssueDay 
                                    ? `${data.id1IssueYear}-${data.id1IssueMonth.padStart(2, '0')}-${data.id1IssueDay.padStart(2, '0')}`
                                    : (() => {
                                        // Default to 5 years ago for government IDs (reasonable default)
                                        const fiveYearsAgo = new Date();
                                        fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
                                        const defaultDate = fiveYearsAgo.toISOString().split('T')[0];
                                        console.log('ID1 issue date not provided, defaulting to:', defaultDate);
                                        return defaultDate;
                                    })(),
                                data.id1ExpiryYear && data.id1ExpiryMonth && data.id1ExpiryDay
                                    ? `${data.id1ExpiryYear}-${data.id1ExpiryMonth.padStart(2, '0')}-${data.id1ExpiryDay.padStart(2, '0')}`
                                    : null // Expiry can be null
                            ]
                        );
                        console.log('ID1 insertion successful');
                    } catch (idError) {
                        console.error('ID1 insertion failed:', idError.message);
                        throw new Error(`Failed to save primary ID document: ${idError.message}. Please verify your ID information and try again.`);
                    }
                }
            }
            
            // Insert ID2 if provided
            if (data.id2Type && data.id2Number) {
                const id2Front = data['id2FrontImagePath'] || data['front-id-2_path'];
                const normalizedId2Front = normalizeFilePath(id2Front);
                
                console.log('ID2 insertion data check:', {
                    id2Type: data.id2Type,
                    id2Number: data.id2Number,
                    id2Front: id2Front,
                    normalized: normalizedId2Front
                });
                
                try {
                    await conn.execute(
                        `INSERT INTO CUSTOMER_ID (cif_number, id_type_code, id_number, id_storage, id_issue_date, id_expiry_date)
                         VALUES (?, ?, ?, ?, ?, ?)`,
                        [
                            cif_number,
                            data.id2Type,
                            data.id2Number,
                            normalizedId2Front, // Can be null
                            data.id2IssueYear && data.id2IssueMonth && data.id2IssueDay 
                                ? `${data.id2IssueYear}-${data.id2IssueMonth.padStart(2, '0')}-${data.id2IssueDay.padStart(2, '0')}`
                                : (() => {
                                    // Default to 3 years ago for second ID (reasonable default)
                                    const threeYearsAgo = new Date();
                                    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
                                    const defaultDate = threeYearsAgo.toISOString().split('T')[0];
                                    console.log('ID2 issue date not provided, defaulting to:', defaultDate);
                                    return defaultDate;
                                })(),
                            data.id2ExpiryYear && data.id2ExpiryMonth && data.id2ExpiryDay
                                ? `${data.id2ExpiryYear}-${data.id2ExpiryMonth.padStart(2, '0')}-${data.id2ExpiryDay.padStart(2, '0')}`
                                : null // Expiry can be null
                        ]
                    );
                    console.log('ID2 insertion successful');
                } catch (idError) {
                    console.error('ID2 insertion failed:', idError.message);
                    throw new Error(`Failed to save secondary ID document: ${idError.message}. Please verify your ID information and try again.`);
                }
            }

            // Insert contact details
            const phoneCountryCode = getField(data, ['phoneCountryCode', 'phone_country_code', 'personalCode']);
            const phoneNumber = getField(data, ['phoneNumber', 'phone_number', 'contact_value_phone']);
            const homeCode = getField(data, ['homeCode', 'home_code']);
            const landlineNumber = getField(data, ['landlineNumber', 'landline_number', 'landline']);
            const emailAddress = getField(data, ['emailAddress', 'email_address', 'contact_value_email']);
            const workEmail = getField(data, ['work-email', 'workEmail', 'work_email', 'workBusinessEmail']);
            
            // Insert mobile phone number if provided (combine country code + number)
            if (phoneNumber) {
                const fullPhoneNumber = phoneCountryCode ? `+${phoneCountryCode}${phoneNumber}` : phoneNumber;
                await conn.execute(
                    `INSERT INTO CUSTOMER_CONTACT_DETAILS (cif_number, contact_type_code, contact_value)
                     VALUES (?, ?, ?)`,
                    [cif_number, 'CT01', fullPhoneNumber] // CT01 = Mobile Number
                );
                console.log('Mobile phone inserted:', fullPhoneNumber);
            }
            
            // Insert landline number if provided (combine home code + landline)
            if (landlineNumber) {
                const fullLandlineNumber = homeCode ? `${homeCode}-${landlineNumber}` : landlineNumber;
                await conn.execute(
                    `INSERT INTO CUSTOMER_CONTACT_DETAILS (cif_number, contact_type_code, contact_value)
                     VALUES (?, ?, ?)`,
                    [cif_number, 'CT02', fullLandlineNumber] // CT02 = Telephone Number (Landline)
                );
                console.log('Landline phone inserted:', fullLandlineNumber);
            }
            
            // Insert email address if provided  
            if (emailAddress) {
                await conn.execute(
                    `INSERT INTO CUSTOMER_CONTACT_DETAILS (cif_number, contact_type_code, contact_value)
                     VALUES (?, ?, ?)`,
                    [cif_number, 'CT04', emailAddress] // CT04 = Personal Email
                );
                console.log('Email address inserted:', emailAddress);
            }

            // Insert work email if provided
            if (workEmail) {
                await conn.execute(
                    `INSERT INTO CUSTOMER_CONTACT_DETAILS (cif_number, contact_type_code, contact_value)
                     VALUES (?, ?, ?)`,
                    [cif_number, 'CT05', workEmail] // CT05 = Work Email
                );
                console.log('Work email inserted:', workEmail);
            }
            
            // Legacy support for direct contact_type_code and contact_value
            if (data.contact_type_code && data.contact_value) {
                await conn.execute(
                    `INSERT INTO CUSTOMER_CONTACT_DETAILS (cif_number, contact_type_code, contact_value)
                     VALUES (?, ?, ?)`,
                    [cif_number, data.contact_type_code, data.contact_value]
                );
            }

            // Position mapping function with enhanced validation
            function mapPositionToCode(position) {
                const positionMap = {
                    'Owner / Director / Officer': 'EP01',
                    'Owner/Director/Officer': 'EP01',
                    'Non-Officer / Employee': 'EP02',
                    'Non-Officer/Employee': 'EP02',
                    'Contractual / Part-Time': 'EP03',
                    'Contractual/Part-Time': 'EP03',
                    'Elected / Appointee': 'EP04',
                    'Elected/Appointee': 'EP04',
                    'Employee': 'EP05',
                    'Government Employee': 'EP05',
                    'Government Contractual / Part-Time': 'EP06',
                    // Case insensitive mappings
                    'owner/director/officer': 'EP01',
                    'non-officer/employee': 'EP02',
                    'contractual/part-time': 'EP03',
                    'elected/appointee': 'EP04',
                    'employee': 'EP05',
                    'government employee': 'EP05',
                    'government contractual/part-time': 'EP06',
                    // Handle codes passed directly
                    'ep01': 'EP01',
                    'ep02': 'EP02',
                    'ep03': 'EP03',
                    'ep04': 'EP04',
                    'ep05': 'EP05',
                    'ep06': 'EP06'
                };
                
                const mapped = positionMap[(position || '').toLowerCase().trim()] || positionMap[position];
                if (!mapped) {
                    console.warn(`Unknown position code: ${position}, defaulting to EP02`);
                    return 'EP02'; // Default to Non-Officer/Employee
                }
                
                // Validate the code format
                if (!mapped.match(/^EP\d{2}$/)) {
                    console.error(`Invalid position code format: ${mapped}`);
                    return 'EP02';
                }
                
                return mapped;
            }

            // Insert employment info
            const primaryEmployer = getField(data, ['primary-employer', 'primaryEmployer', 'employer_business_name']);
            const positionRaw = getField(data, ['position', 'position_code']);
            const position = mapPositionToCode(positionRaw);
            const grossIncome = getField(data, ['gross-income', 'grossIncome', 'income_monthly_gross']);
            const currentlyEmployed = getField(data, ['currentlyEmployed', 'currently_employed']);
            const frontendEmploymentStartDate = getField(data, ['employment-start-date', 'employmentStartDate', 'employment_start_date']);
            
            let employmentId = null;
            if (primaryEmployer && position && currentlyEmployed === 'Yes') {
                // Handle employment start date - prioritize frontend input, then fallback
                let employmentStartDate = frontendEmploymentStartDate || data.employment_start_date;
                if (!employmentStartDate) {
                    // If no start date provided, default to 1 year ago (reasonable assumption for current employment)
                    const oneYearAgo = new Date();
                    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                    employmentStartDate = oneYearAgo.toISOString().split('T')[0]; // YYYY-MM-DD format
                    console.log('Employment start date not provided, defaulting to:', employmentStartDate);
                }
                
                const [empResult] = await conn.execute(
                    `INSERT INTO CUSTOMER_EMPLOYMENT_INFORMATION (cif_number, employer_business_name, employment_start_date, employment_end_date, employment_status, position_code, income_monthly_gross)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        cif_number,
                        primaryEmployer,
                        employmentStartDate, // Now guaranteed to have a value
                        data.employment_end_date || null,
                        data.employment_status || 'Current',
                        position,
                        parseFloat(grossIncome) || 0
                    ]
                );
                employmentId = empResult.insertId;
                console.log('Employment information inserted successfully with start date:', employmentStartDate);
            }
            
            // Legacy support for direct field names
            if (data.employer_business_name && data.position_code) {
                // Handle employment start date for legacy path too
                let legacyEmploymentStartDate = data.employment_start_date;
                if (!legacyEmploymentStartDate) {
                    const oneYearAgo = new Date();
                    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                    legacyEmploymentStartDate = oneYearAgo.toISOString().split('T')[0];
                    console.log('Legacy employment start date not provided, defaulting to:', legacyEmploymentStartDate);
                }
                
                await conn.execute(
                    `INSERT INTO CUSTOMER_EMPLOYMENT_INFORMATION (cif_number, employer_business_name, employment_start_date, employment_end_date, employment_status, position_code, income_monthly_gross)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        cif_number,
                        data.employer_business_name,
                        legacyEmploymentStartDate, // Now guaranteed to have a value
                        data.employment_end_date || null,
                        data.employment_status || 'Current',
                        mapPositionToCode(data.position_code),
                        data.income_monthly_gross || 0
                    ]
                );
                console.log('Legacy employment information inserted successfully with start date:', legacyEmploymentStartDate);
            }

            // Fund source mapping - handle multiple sources
            const fund_source_multi = getField(data, ['source-of-funds-multi', 'fundSourceMulti']);
            const fund_source_single = getField(data, ['fund_source_code', 'fundSourceCode', 'fund-source-code', 'fundSource', 'source-of-funds']);
            
            // Business nature mapping
            const work_nature_code = getField(data, ['work_nature_code', 'workNatureCode', 'work-nature-code', 'business-nature', 'business-nature-multi']);

            // Insert fund sources (handle comma-separated values and map to codes)
            const fundSources = fund_source_multi || fund_source_single;
            console.log('Fund source data:', { fundSources, fund_source_multi, fund_source_single });
            
            if (fundSources) {
                const sourceList = fundSources.split(',').map(s => s.trim()).filter(s => s);
                for (const source of sourceList) {
                    // Map fund source text to database code
                    const mapped_fund_source = fundSourceMap[(source || '').toLowerCase().trim()] || 'FS001';
                    console.log('Fund source mapping:', { original: source, mapped: mapped_fund_source });
                    
                    try {
                        await conn.execute(
                            `INSERT INTO CUSTOMER_FUND_SOURCE (cif_number, fund_source_code)
                             VALUES (?, ?)`,
                            [cif_number, mapped_fund_source]
                        );
                        console.log('Fund source insertion successful:', mapped_fund_source);
                    } catch (fundError) {
                        console.error('Fund source insertion failed:', fundError.message);
                        throw new Error(`Failed to save source of funds "${source}": ${fundError.message}. Please verify your fund source information.`);
                    }
                }
            } else {
                // Insert default fund source if none provided
                try {
                    await conn.execute(
                        `INSERT INTO CUSTOMER_FUND_SOURCE (cif_number, fund_source_code)
                         VALUES (?, ?)`,
                        [cif_number, 'FS001'] // Default to Employed - Fixed Income
                    );
                    console.log('Default fund source inserted: FS001');
                } catch (fundError) {
                    console.error('Default fund source insertion failed:', fundError.message);
                    throw new Error(`Failed to save default fund source: ${fundError.message}. This is a system error, please contact support.`);
                }
            }

            // Insert work nature
            if (employmentId && work_nature_code) {
                const workNatureList = work_nature_code.split(',').map(s => s.trim()).filter(s => s);
                for (const workNature of workNatureList) {
                    // Map work nature text to database code
                    const mapped_work_nature = workNatureMap[(workNature || '').toLowerCase().trim()] || 'ICT';
                    console.log('Work nature mapping:', { original: workNature, mapped: mapped_work_nature });
                    
                    try {
                        await conn.execute(
                            `INSERT INTO CUSTOMER_WORK_NATURE (customer_employment_id, work_nature_code)
                             VALUES (?, ?)`,
                            [employmentId, mapped_work_nature]
                        );
                        console.log('Work nature insertion successful:', mapped_work_nature);
                    } catch (workError) {
                        console.error('Work nature insertion failed:', workError.message);
                        // Continue without failing registration
                    }
                }
            }
            
            // Legacy support
            if (data.customer_employment_id && work_nature_code) {
                await conn.execute(
                    `INSERT INTO CUSTOMER_WORK_NATURE (customer_employment_id, work_nature_code)
                     VALUES (?, ?)`,
                    [data.customer_employment_id, work_nature_code]
                );
            }

            // Insert alias if provided
            const alias_first_name = getField(data, ['alias_first_name', 'aliasFirstName', 'alias-first-name']);
            const alias_last_name = getField(data, ['alias_last_name', 'aliasLastName', 'alias-last-name']);
            const alias_middle_name = getField(data, ['alias_middle_name', 'aliasMiddleName', 'alias-middle-name']);
            const alias_suffix_name = getField(data, ['alias_suffix_name', 'aliasSuffixName', 'alias-suffix-name']);
            
            console.log('Alias data:', { alias_first_name, alias_last_name, alias_middle_name, alias_suffix_name });
            
            let aliasId = null;
            if (alias_first_name && alias_last_name) {
                try {
                    const [aliasResult] = await conn.execute(
                        `INSERT INTO CUSTOMER_ALIAS (cif_number, alias_first_name, alias_last_name, alias_middle_name, alias_suffix_name) 
                         VALUES (?, ?, ?, ?, ?)`,
                        [cif_number, alias_first_name, alias_last_name, alias_middle_name || null, alias_suffix_name || null]
                    );
                    aliasId = aliasResult.insertId;
                    console.log('Alias insertion successful, ID:', aliasId);
                    
                    // Insert alias documentation if provided (support for multiple docs)
                    const aliasDocuments = [
                        {
                            type: getField(data, ['alias_id1_type', 'alias_doc_type', 'aliasDocType', 'alias-doc-type']),
                            number: getField(data, ['alias_id1_number', 'alias_doc_number', 'aliasDocNumber', 'alias-doc-number']),
                            issueMonth: getField(data, ['alias_id1_issue_month']),
                            issueYear: getField(data, ['alias_id1_issue_year']),
                            storage: getField(data, ['alias_doc_storage', 'aliasDocStorage', 'alias-doc-path', 'supportingDocPath', 'supporting-doc_path'])
                        },
                        {
                            type: getField(data, ['alias_id2_type']),
                            number: getField(data, ['alias_id2_number']),
                            issueMonth: getField(data, ['alias_id2_issue_month']),
                            issueYear: getField(data, ['alias_id2_issue_year']),
                            storage: null // ID2 doesn't have separate storage
                        }
                    ];
                    
                    for (const doc of aliasDocuments) {
                        if (doc.type && doc.number && aliasId) {
                            // Format issue date
                            let issueDate = null;
                            if (doc.issueMonth && doc.issueYear) {
                                issueDate = `${doc.issueYear}-${doc.issueMonth.toString().padStart(2, '0')}-01`;
                            }
                            
                            try {
                                await conn.execute(
                                    `INSERT INTO ALIAS_DOCUMENTATION (customer_alias_id, alias_doc_type_code, alias_doc_number, alias_doc_issue_date, alias_doc_expiry_date, alias_doc_storage)
                                     VALUES (?, ?, ?, ?, ?, ?)`,
                                    [
                                        aliasId,
                                        doc.type, // Should already be in A01-A20 format from frontend
                                        doc.number,
                                        issueDate,
                                        null, // No expiry date collection currently
                                        normalizeFilePath(doc.storage)
                                    ]
                                );
                                console.log('Alias documentation inserted successfully for type:', doc.type);
                            } catch (aliasDocError) {
                                console.error('Alias documentation insertion failed:', aliasDocError.message);
                                throw new Error(`Failed to save alias documentation: ${aliasDocError.message}. Alias documentation is required when an alias is provided.`);
                            }
                        }
                    }
                    
                    // Fallback: if alias exists but no specific doc type/number, use supporting document with defaults
                    const aliasDocStorage = getField(data, ['alias_doc_storage', 'aliasDocStorage', 'alias-doc-path', 'supportingDocPath', 'supporting-doc_path']);
                    if (aliasId && aliasDocStorage) {
                        // If alias exists but no specific doc type/number, use supporting document with defaults
                        try {
                            await conn.execute(
                                `INSERT INTO ALIAS_DOCUMENTATION (customer_alias_id, alias_doc_type_code, alias_doc_number, alias_doc_issue_date, alias_doc_expiry_date, alias_doc_storage)
                                 VALUES (?, ?, ?, ?, ?, ?)`,
                                [
                                    aliasId,
                                    'A01', // Default alias document type
                                    'ALIAS-DOC-' + cif_number, // Generate a default doc number
                                    null, // No issue date
                                    null, // No expiry date
                                    normalizeFilePath(aliasDocStorage)
                                ]
                            );
                            console.log('Default alias documentation inserted with supporting document');
                        } catch (aliasDocError) {
                            console.error('Default alias documentation insertion failed:', aliasDocError.message);
                            throw new Error(`Failed to save alias supporting documentation: ${aliasDocError.message}. Supporting documentation is required when an alias is provided.`);
                        }
                    }
                    
                } catch (aliasError) {
                    console.error('Alias insertion failed:', aliasError.message);
                    // Continue without failing registration - aliases are optional
                }
            } else {
                console.log('No alias data provided, skipping alias insertion');
            }

            // Create customer account and account details
            console.log('Creating customer account and account details...');
            
            // Use account_type directly for account creation
            // Map account_type to product_type_code for ACCOUNT_DETAILS table
            const accountTypeToProductCodeMap = {
                'Deposit Account': 'PR01',
                'Card Account': 'PR02', 
                'Loan Account': 'PR03',
                'Wealth Management Account': 'PR04',
                'Insurance Account': 'PR05'
            };
            
            // Map the user-selected account_type to the database product_type_code
            const product_type_code = accountTypeToProductCodeMap[account_type] || 'PR01';
            
            console.log('Account creation data:', { 
                user_selected_account_type: account_type,
                database_product_type_code: product_type_code
            });
            
            console.log('Account creation mapping:', { 
                account_type, 
                mapped_product_type: product_type_code
            });
            
            // Default employee IDs for testing - in production these should come from login session
            const verified_by_employee = 1; // Default verified by employee 1
            // Single employee verification process (approved_by_employee removed)
            
            try {
                // Create ACCOUNT_DETAILS first
                const [accountResult] = await conn.execute(
                    `INSERT INTO ACCOUNT_DETAILS (product_type_code, verified_by_employee, account_open_date, account_status)
                     VALUES (?, ?, CURDATE(), 'Pending Verification')`,
                    [product_type_code, verified_by_employee]
                );
                
                const account_number = accountResult.insertId;
                console.log('Account details created with account number:', account_number);
                
                // Link customer to account in CUSTOMER_ACCOUNT
                await conn.execute(
                    `INSERT INTO CUSTOMER_ACCOUNT (cif_number, account_number)
                     VALUES (?, ?)`,
                    [cif_number, account_number]
                );
                console.log('Customer account relationship created successfully');
                
            } catch (accountError) {
                console.error('Account creation failed:', accountError.message);
                throw new Error(`Failed to create customer account: ${accountError.message}. Account creation is required for registration.`);
            }

            await conn.commit();
            console.log('=== Registration completed successfully ===');
            console.log('Generated CIF number:', cif_number);
            
            res.status(201).json({ 
                message: 'Registration successful! Welcome to UniVault!', 
                redirect: '/Registration-Customer/registration13.html', 
                cif_number 
            });
        } catch (error) {
            await conn.rollback();
            
            // Handle specific NOT NULL constraint errors
            if (error.code === 'ER_BAD_NULL_ERROR') {
                console.error('NOT NULL constraint violation:', error.message);
                return res.status(400).json({
                    message: 'Required field is missing or null',
                    error: 'NOT_NULL_CONSTRAINT_VIOLATION',
                    details: error.message,
                    sqlState: error.sqlState
                });
            }
            
            // Handle check constraint violations
            if (error.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
                console.error('Check constraint violation:', error.message);
                let friendlyMessage = 'Invalid value provided for one of the fields';
                
                // Provide more specific error messages based on constraint name
                if (error.message.includes('check_account_type')) {
                    friendlyMessage = 'Invalid account type. Please select a valid account type.';
                } else if (error.message.includes('check_customer_type')) {
                    friendlyMessage = 'Invalid customer type. Please select a valid customer type.';
                } else if (error.message.includes('check_gender')) {
                    friendlyMessage = 'Invalid gender value. Please select a valid gender option.';
                } else if (error.message.includes('check_civil_status')) {
                    friendlyMessage = 'Invalid civil status. Please select a valid civil status option.';
                }
                
                return res.status(400).json({
                    message: friendlyMessage,
                    error: 'CHECK_CONSTRAINT_VIOLATION',
                    details: error.message,
                    sqlState: error.sqlState
                });
            }
            
            // Handle other SQL constraint errors
            if (error.code && error.code.startsWith('ER_')) {
                console.error('Database constraint error:', error.message);
                return res.status(400).json({
                    message: 'Database constraint violation',
                    error: 'DATABASE_CONSTRAINT_ERROR',
                    details: error.message
                });
            }
            
            throw error;
        } finally {
            conn.release();
        }
    } catch (error) {
        console.error('Registration error:', error);
        
        // Return appropriate error response
        if (!res.headersSent) {
            res.status(500).json({
                message: 'Registration failed due to server error',
                error: 'INTERNAL_SERVER_ERROR',
                details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
            });
        }
    }
});

module.exports = router;
