const validator = require('validator');

// Validation utility functions
class ValidationUtils {
    
    // Validate required fields
    static validateRequired(data, requiredFields) {
        const missing = [];
        for (const field of requiredFields) {
            if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
                missing.push(field);
            }
        }
        return missing;
    }

    // Validate email format
    static validateEmail(email) {
        if (!email) return false;
        return validator.isEmail(email);
    }

    // Validate phone number (basic format)
    static validatePhone(phone) {
        if (!phone) return true; // Optional field
        // Allow international format with + and digits
        return /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    // Validate date format (YYYY-MM-DD)
    static validateDate(date) {
        if (!date) return false;
        return validator.isDate(date, { format: 'YYYY-MM-DD', strictMode: true });
    }

    // Validate reference codes with specific patterns
    static validateReferenceCode(code, pattern, fieldName) {
        if (!code) return { isValid: false, error: `${fieldName} is required` };
        
        if (!code.match(pattern)) {
            return { 
                isValid: false, 
                error: `Invalid ${fieldName} format: ${code}. Expected pattern: ${pattern}` 
            };
        }
        
        return { isValid: true };
    }

    // Validate civil status code
    static validateCivilStatusCode(code) {
        return this.validateReferenceCode(code, /^CS\d{2}$/, 'civil status code');
    }

    // Validate position code
    static validatePositionCode(code) {
        return this.validateReferenceCode(code, /^EP\d{2}$/, 'position code');
    }

    // Validate fund source code
    static validateFundSourceCode(code) {
        return this.validateReferenceCode(code, /^FS\d{3}$/, 'fund source code');
    }

    // Validate work nature code
    static validateWorkNatureCode(code) {
        return this.validateReferenceCode(code, /^[A-Z]{3}$/, 'work nature code');
    }

    // Validate contact type code
    static validateContactTypeCode(code) {
        return this.validateReferenceCode(code, /^CT\d{2}$/, 'contact type code');
    }

    // Validate address type code
    static validateAddressTypeCode(code) {
        return this.validateReferenceCode(code, /^AD\d{2}$/, 'address type code');
    }

    // Sanitize string input (remove dangerous characters)
    static sanitizeString(str) {
        if (!str) return str;
        return str.toString().trim().replace(/[<>'"]/g, '');
    }

    // Validate customer type against allowed values
    static validateCustomerType(type) {
        const validTypes = ['Account Owner', 'Business Owner', 'Business Owner / Officer / Signatory', 'Individual', 'Corporate'];
        return validTypes.includes(type);
    }

    // Validate product type against allowed values from CUSTOMER_PRODUCT_TYPE table
    static validateProductType(type) {
        const validTypes = ['Deposits', 'Cards', 'Loans', 'Wealth Management', 'Insurance'];
        return validTypes.includes(type);
    }
    
    // Validate product type code against allowed values from CUSTOMER_PRODUCT_TYPE table
    static validateProductTypeCode(code) {
        const validCodes = ['PR01', 'PR02', 'PR03', 'PR04', 'PR05'];
        return validCodes.includes(code);
    }

    // Validate gender
    static validateGender(gender) {
        const validGenders = ['Male', 'Female', 'Other'];
        return validGenders.includes(gender);
    }

    // Validate file upload
    static validateFileUpload(file, allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'], maxSize = 5 * 1024 * 1024) {
        if (!file) return { isValid: false, error: 'File is required' };
        
        if (!allowedTypes.includes(file.mimetype)) {
            return { isValid: false, error: 'Invalid file type' };
        }
        
        if (file.size > maxSize) {
            return { isValid: false, error: 'File size too large' };
        }
        
        return { isValid: true };
    }

    // Comprehensive registration data validation
    static validateRegistrationData(data) {
        const errors = [];
        
        // Required fields validation
        const requiredFields = [
            'customer_type', 'product_type', 'customer_last_name', 
            'customer_first_name', 'customer_username', 'customer_password',
            'birth_date', 'gender', 'birth_country', 'citizenship'
        ];
        
        const missing = this.validateRequired(data, requiredFields);
        if (missing.length > 0) {
            errors.push(`Missing required fields: ${missing.join(', ')}`);
        }

        // Email validation if provided
        if (data.emailAddress && !this.validateEmail(data.emailAddress)) {
            errors.push('Invalid email format');
        }

        // Date validation
        if (data.birth_date && !this.validateDate(data.birth_date)) {
            errors.push('Invalid birth date format');
        }

        // Customer type validation
        if (data.customer_type && !this.validateCustomerType(data.customer_type)) {
            errors.push('Invalid customer type');
        }

        // Product type validation
        if (data.product_type && !this.validateProductType(data.product_type)) {
            errors.push('Invalid product type');
        }
        
        // Product type code validation
        if (data.product_type_code && !this.validateProductTypeCode(data.product_type_code)) {
            errors.push('Invalid product type code');
        }

        // Gender validation
        if (data.gender && !this.validateGender(data.gender)) {
            errors.push('Invalid gender');
        }

        return errors;
    }
}

module.exports = ValidationUtils;
