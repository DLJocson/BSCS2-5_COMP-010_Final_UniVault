const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const ValidationUtils = require('../utils/validation');
const PathUtils = require('../utils/pathUtils');
const { getField, customerTypeMap, residencyStatusMap, civilStatusMap, fundSourceMap, workNatureMap } = require('../utils/fieldMapper');

class RegistrationService {
    
    // Main registration orchestrator
    static async registerCustomer(data) {
        // Validate input data
        const validationErrors = ValidationUtils.validateRegistrationData(data);
        if (validationErrors.length > 0) {
            throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
        }

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();
            
            // Process registration in steps
            const customerData = this.prepareCustomerData(data);
            const cif_number = await this.createCustomer(conn, customerData);
            
            await this.createAddresses(conn, cif_number, data);
            await this.createContactDetails(conn, cif_number, data);
            await this.createEmploymentInfo(conn, cif_number, data);
            await this.createFundSources(conn, cif_number, data);
            await this.createCustomerAccount(conn, cif_number, data.account_type);
            
            // Optional data
            if (this.hasIDData(data)) {
                await this.createIDDocuments(conn, cif_number, data);
            }
            
            if (this.hasAliasData(data)) {
                await this.createAlias(conn, cif_number, data);
            }
            
            await conn.commit();
            return cif_number;
            
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }

    // Prepare customer data with proper mappings and defaults
    static prepareCustomerData(data) {
        const customer = {};
        
        // Required fields
        customer.customer_type = customerTypeMap[(data.customer_type || '').toLowerCase()] || data.customer_type;
        customer.customer_last_name = data.customer_last_name;
        customer.customer_first_name = data.customer_first_name;
        customer.customer_middle_name = data.customer_middle_name || null;
        customer.customer_suffix_name = data.customer_suffix_name || null;
        customer.customer_username = data.customer_username;
        customer.customer_password = data.customer_password;
        customer.birth_date = data.birth_date;
        customer.gender = data.gender;
        
        // Civil status mapping
        const civil_status_raw = getField(data, ['civil_status_code', 'civilStatusCode', 'civil_status']);
        customer.civil_status_code = civilStatusMap[(civil_status_raw || '').toLowerCase().trim()] || 'CS01';
        
        // Required fields with defaults
        customer.birth_country = data.birth_country || 'Philippines';
        customer.citizenship = data.citizenship || 'Filipino';
        customer.tax_identification_number = (data.tax_identification_number || 'N/A').substring(0, 20);
        
        // Optional fields
        customer.residency_status = residencyStatusMap[(data.residency_status || '').toLowerCase().trim()] || 'Resident';
        customer.remittance_country = data.remittance_country || null;
        customer.remittance_purpose = data.remittance_purpose || null;
        
        // Registration flags
        customer.reg_political_affiliation = data.reg_political_affiliation || null;
        customer.reg_fatca = data.reg_fatca || null;
        customer.reg_dnfbp = data.reg_dnfbp || null;
        customer.reg_online_gaming = data.reg_online_gaming || null;
        customer.reg_beneficial_owner = data.reg_beneficial_owner || null;
        
        customer.customer_status = 'Pending Verification';
        
        return customer;
    }

    // Create customer record
    static async createCustomer(conn, customerData) {
        const password_hash = await bcrypt.hash(customerData.customer_password, 10);
        
        const [result] = await conn.execute(
            `INSERT INTO CUSTOMER (
                customer_type, customer_last_name, customer_first_name, 
                customer_middle_name, customer_suffix_name, customer_username, customer_password, 
                birth_date, gender, civil_status_code, birth_country, residency_status, 
                citizenship, tax_identification_number, customer_status, remittance_country, 
                remittance_purpose, reg_political_affiliation, reg_fatca, reg_dnfbp, 
                reg_online_gaming, reg_beneficial_owner
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                customerData.customer_type,
                customerData.customer_last_name, customerData.customer_first_name,
                customerData.customer_middle_name, customerData.customer_suffix_name,
                customerData.customer_username, password_hash,
                customerData.birth_date, customerData.gender, customerData.civil_status_code,
                customerData.birth_country, customerData.residency_status,
                customerData.citizenship, customerData.tax_identification_number,
                customerData.customer_status, customerData.remittance_country,
                customerData.remittance_purpose, customerData.reg_political_affiliation,
                customerData.reg_fatca, customerData.reg_dnfbp,
                customerData.reg_online_gaming, customerData.reg_beneficial_owner
            ]
        );
        
        return result.insertId;
    }

    // Create customer addresses
    static async createAddresses(conn, cif_number, data) {
        // Home address (required)
        const homeAddress = {
            cif_number,
            address_type_code: 'AD01',
            address_unit: getField(data, ['address_unit', 'addressUnit']) || null,
            address_building: getField(data, ['address_building', 'addressBuilding']) || null,
            address_street: getField(data, ['address_street', 'addressStreet']) || null,
            address_subdivision: getField(data, ['address_subdivision', 'addressSubdivision']) || null,
            address_barangay: getField(data, ['address_barangay', 'addressBarangay']),
            address_city: getField(data, ['address_city', 'addressCity']),
            address_province: getField(data, ['address_province', 'addressProvince']),
            address_country: getField(data, ['address_country', 'addressCountry']),
            address_zip_code: getField(data, ['address_zip_code', 'addressZipCode'])
        };

        await conn.execute(
            `INSERT INTO CUSTOMER_ADDRESS (
                cif_number, address_type_code, address_unit, address_building, address_street, 
                address_subdivision, address_barangay, address_city, address_province, 
                address_country, address_zip_code
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            Object.values(homeAddress)
        );

        // Alternate address (optional)
        const altAddress = this.getAlternateAddress(data);
        if (altAddress) {
            altAddress.cif_number = cif_number;
            altAddress.address_type_code = 'AD02';
            
            await conn.execute(
                `INSERT INTO CUSTOMER_ADDRESS (
                    cif_number, address_type_code, address_unit, address_building, address_street, 
                    address_subdivision, address_barangay, address_city, address_province, 
                    address_country, address_zip_code
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                Object.values(altAddress)
            );
        }

        // Work address (optional)
        const workAddress = this.getWorkAddress(data);
        if (workAddress) {
            workAddress.cif_number = cif_number;
            workAddress.address_type_code = 'AD03';
            
            await conn.execute(
                `INSERT INTO CUSTOMER_ADDRESS (
                    cif_number, address_type_code, address_unit, address_building, address_street, 
                    address_subdivision, address_barangay, address_city, address_province, 
                    address_country, address_zip_code
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                Object.values(workAddress)
            );
        }
    }

    // Get alternate address if provided
    static getAlternateAddress(data) {
        const altUnit = getField(data, ['altUnit', 'alt_unit']);
        const altBarangay = getField(data, ['altBarangay', 'alt_barangay']);
        const altCity = getField(data, ['altCity', 'alt_city']);
        
        if (!altUnit && !altBarangay && !altCity) return null;
        
        return {
            address_unit: altUnit || null,
            address_building: getField(data, ['altBuilding', 'alt_building']) || null,
            address_street: getField(data, ['altStreet', 'alt_street']) || null,
            address_subdivision: getField(data, ['altSubdivision', 'alt_subdivision']) || null,
            address_barangay: altBarangay || null,
            address_city: altCity || null,
            address_province: getField(data, ['altProvince', 'alt_province']) || null,
            address_country: getField(data, ['altCountry', 'alt_country']) || null,
            address_zip_code: getField(data, ['altZip', 'alt_zip']) || null
        };
    }

    // Get work address if provided
    static getWorkAddress(data) {
        const workBarangay = getField(data, ['work_barangay', 'workBarangay']);
        const workCity = getField(data, ['work_city', 'workCity']);
        
        if (!workBarangay && !workCity) return null;
        
        return {
            address_unit: getField(data, ['work_unit', 'workUnit']) || null,
            address_building: getField(data, ['work_building', 'workBuilding']) || null,
            address_street: getField(data, ['work_street', 'workStreet']) || null,
            address_subdivision: getField(data, ['work_subdivision', 'workSubdivision']) || null,
            address_barangay: workBarangay || 'N/A',
            address_city: workCity || 'N/A',
            address_province: getField(data, ['work_province', 'workProvince']) || 'N/A',
            address_country: getField(data, ['work_country', 'workCountry']) || 'Philippines',
            address_zip_code: getField(data, ['work_zip', 'workZip']) || '0000'
        };
    }

    // Create contact details
    static async createContactDetails(conn, cif_number, data) {
        const contacts = [];
        
        // Mobile phone
        const phoneNumber = getField(data, ['phoneNumber', 'phone_number']);
        if (phoneNumber) {
            const phoneCountryCode = getField(data, ['phoneCountryCode', 'phone_country_code']);
            const fullPhoneNumber = phoneCountryCode ? `+${phoneCountryCode}${phoneNumber}` : phoneNumber;
            contacts.push([cif_number, 'CT01', fullPhoneNumber]);
        }
        
        // Landline
        const landlineNumber = getField(data, ['landlineNumber', 'landline_number']);
        if (landlineNumber) {
            const homeCode = getField(data, ['homeCode', 'home_code']);
            const fullLandlineNumber = homeCode ? `${homeCode}-${landlineNumber}` : landlineNumber;
            contacts.push([cif_number, 'CT02', fullLandlineNumber]);
        }
        
        // Personal email
        const emailAddress = getField(data, ['emailAddress', 'email_address']);
        if (emailAddress) {
            contacts.push([cif_number, 'CT04', emailAddress]);
        }
        
        // Work email
        const workEmail = getField(data, ['work-email', 'workEmail']);
        if (workEmail) {
            contacts.push([cif_number, 'CT05', workEmail]);
        }
        
        // Insert all contacts
        for (const contact of contacts) {
            await conn.execute(
                `INSERT INTO CUSTOMER_CONTACT_DETAILS (cif_number, contact_type_code, contact_value) 
                 VALUES (?, ?, ?)`,
                contact
            );
        }
    }

    // Create employment information
    static async createEmploymentInfo(conn, cif_number, data) {
        const primaryEmployer = getField(data, ['primary-employer', 'primaryEmployer', 'employer_business_name']);
        const currentlyEmployed = getField(data, ['currentlyEmployed', 'currently_employed']);
        
        if (!primaryEmployer || currentlyEmployed !== 'Yes') return null;
        
        const positionRaw = getField(data, ['position', 'position_code']);
        const position = this.mapPositionToCode(positionRaw);
        const grossIncome = parseFloat(getField(data, ['gross-income', 'grossIncome', 'income_monthly_gross'])) || 0;
        
        // Handle employment start date
        let employmentStartDate = getField(data, ['employment-start-date', 'employmentStartDate', 'employment_start_date']);
        if (!employmentStartDate) {
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            employmentStartDate = oneYearAgo.toISOString().split('T')[0];
        }
        
        const [empResult] = await conn.execute(
            `INSERT INTO CUSTOMER_EMPLOYMENT_INFORMATION (
                cif_number, employer_business_name, employment_start_date, employment_end_date, 
                employment_status, position_code, income_monthly_gross
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                cif_number, primaryEmployer, employmentStartDate, 
                data.employment_end_date || null, data.employment_status || 'Current', 
                position, grossIncome
            ]
        );
        
        return empResult.insertId;
    }

    // Map position text to code
    static mapPositionToCode(position) {
        const positionMap = {
            'Owner / Director / Officer': 'EP01',
            'Non-Officer / Employee': 'EP02',
            'Contractual / Part-Time': 'EP03',
            'Elected / Appointee': 'EP04',
            'Employee': 'EP05',
            'Government Employee': 'EP05',
            'Government Contractual / Part-Time': 'EP06'
        };
        
        const mapped = positionMap[(position || '').trim()] || positionMap[(position || '').toLowerCase().trim()];
        return mapped || 'EP02'; // Default to Non-Officer/Employee
    }

    // Create fund sources
    static async createFundSources(conn, cif_number, data) {
        const fundSources = getField(data, ['source-of-funds-multi', 'fundSourceMulti', 'fund_source_code']);
        
        if (fundSources) {
            const sourceList = fundSources.split(',').map(s => s.trim()).filter(s => s);
            for (const source of sourceList) {
                const mapped_fund_source = fundSourceMap[(source || '').toLowerCase().trim()] || 'FS001';
                await conn.execute(
                    `INSERT INTO CUSTOMER_FUND_SOURCE (cif_number, fund_source_code) VALUES (?, ?)`,
                    [cif_number, mapped_fund_source]
                );
            }
        } else {
            // Default fund source
            await conn.execute(
                `INSERT INTO CUSTOMER_FUND_SOURCE (cif_number, fund_source_code) VALUES (?, ?)`,
                [cif_number, 'FS001']
            );
        }
    }

    // Create customer account
    static async createCustomerAccount(conn, cif_number, account_type) {
        const accountTypeToProductCodeMap = {
            'Deposit Account': 'PR01',
            'Card Account': 'PR02',
            'Loan Account': 'PR03',
            'Wealth Management Account': 'PR04',
            'Insurance Account': 'PR05'
        };
        
        const product_type_code = accountTypeToProductCodeMap[account_type] || 'PR01';
        
        const [accountResult] = await conn.execute(
            `INSERT INTO ACCOUNT_DETAILS (product_type_code, verified_by_employee, account_open_date, account_status)
             VALUES (?, ?, CURDATE(), 'Pending Verification')`,
            [product_type_code, 1] // Default employee ID
        );
        
        const account_number = accountResult.insertId;
        
        await conn.execute(
            `INSERT INTO CUSTOMER_ACCOUNT (cif_number, account_number) VALUES (?, ?)`,
            [cif_number, account_number]
        );
        
        return account_number;
    }

    // Check if ID data is provided
    static hasIDData(data) {
        return data.id1Type && data.id1Number;
    }

    // Check if alias data is provided
    static hasAliasData(data) {
        const alias_first_name = getField(data, ['alias_first_name', 'aliasFirstName']);
        const alias_last_name = getField(data, ['alias_last_name', 'aliasLastName']);
        return alias_first_name && alias_last_name;
    }

    // Create ID documents (simplified version)
    static async createIDDocuments(conn, cif_number, data) {
        if (data.id1Type && data.id1Number) {
            const id1Front = PathUtils.normalizeFilePath(data['id1FrontImagePath'] || data['front-id-1_path']);
            
            const issueDate = this.formatIDDate(data.id1IssueYear, data.id1IssueMonth, data.id1IssueDay) || 
                             this.getDefaultIssueDate(5); // 5 years ago
            const expiryDate = this.formatIDDate(data.id1ExpiryYear, data.id1ExpiryMonth, data.id1ExpiryDay);
            
            await conn.execute(
                `INSERT INTO CUSTOMER_ID (cif_number, id_type_code, id_number, id_storage, id_issue_date, id_expiry_date)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [cif_number, data.id1Type, data.id1Number, id1Front, issueDate, expiryDate]
            );
        }
    }

    // Create alias information (simplified version)
    static async createAlias(conn, cif_number, data) {
        const alias_first_name = getField(data, ['alias_first_name', 'aliasFirstName']);
        const alias_last_name = getField(data, ['alias_last_name', 'aliasLastName']);
        const alias_middle_name = getField(data, ['alias_middle_name', 'aliasMiddleName']);
        const alias_suffix_name = getField(data, ['alias_suffix_name', 'aliasSuffixName']);
        
        const [aliasResult] = await conn.execute(
            `INSERT INTO CUSTOMER_ALIAS (cif_number, alias_first_name, alias_last_name, alias_middle_name, alias_suffix_name) 
             VALUES (?, ?, ?, ?, ?)`,
            [cif_number, alias_first_name, alias_last_name, alias_middle_name || null, alias_suffix_name || null]
        );
        
        return aliasResult.insertId;
    }

    // Format ID date from components
    static formatIDDate(year, month, day) {
        if (!year || !month || !day) return null;
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }

    // Get default issue date (years ago)
    static getDefaultIssueDate(yearsAgo) {
        const date = new Date();
        date.setFullYear(date.getFullYear() - yearsAgo);
        return date.toISOString().split('T')[0];
    }
}

module.exports = RegistrationService;
