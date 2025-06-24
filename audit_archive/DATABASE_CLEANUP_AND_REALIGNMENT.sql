-- =============================================
-- UNIVAULT DATABASE CLEANUP & REALIGNMENT
-- =============================================
-- Purpose: Clean deprecated fields and align schema with frontend/backend
-- Date: 2025-06-25
-- Status: Production Ready

USE univault_schema;

-- =============================================
-- PHASE 1: REMOVE DEPRECATED ALTERNATE ADDRESS FIELDS
-- =============================================

-- These fields are deprecated because ADDRESS_TYPE_CODE now handles address contexts
ALTER TABLE CUSTOMER_ADDRESS
DROP COLUMN IF EXISTS is_alternate_address_same_as_home,
DROP COLUMN IF EXISTS alt_unit,
DROP COLUMN IF EXISTS alt_building,
DROP COLUMN IF EXISTS alt_street,
DROP COLUMN IF EXISTS alt_subdivision,
DROP COLUMN IF EXISTS alt_barangay,
DROP COLUMN IF EXISTS alt_city,
DROP COLUMN IF EXISTS alt_province,
DROP COLUMN IF EXISTS alt_country,
DROP COLUMN IF EXISTS alt_zip;

-- =============================================
-- PHASE 2: UPDATE ADDRESS_TYPE REFERENCE DATA
-- =============================================

-- Ensure we have proper address type codes
INSERT IGNORE INTO ADDRESS_TYPE (address_type_code, address_type) VALUES
('AD01', 'Home'),
('AD02', 'Alternative'), 
('AD03', 'Work'),
('AD04', 'Other');

-- =============================================
-- PHASE 3: UPDATE CONTACT_TYPE REFERENCE DATA
-- =============================================

-- Ensure we have proper contact type codes for all contact methods
INSERT IGNORE INTO CONTACT_TYPE (contact_type_code, contact_type_description) VALUES
('CT01', 'Mobile Number'),
('CT02', 'Telephone Number'),     -- For landline
('CT03', 'Work Number'),
('CT04', 'Personal Email'),
('CT05', 'Work Email'),
('CT06', 'Other');

-- =============================================
-- PHASE 4: CREATE ALIAS DOCUMENTATION SYSTEM
-- =============================================

-- Fix ALIAS_DOCUMENTATION_TYPE to align with frontend ID types
DROP TABLE IF EXISTS ALIAS_DOCUMENTATION;
DROP TABLE IF EXISTS ALIAS_DOCUMENTATION_TYPE;

-- Create proper alias documentation type table
CREATE TABLE ALIAS_DOCUMENTATION_TYPE (
    alias_doc_type_code     CHAR(3) NOT NULL,
    alias_doc_description   VARCHAR(100) NOT NULL,
    
    -- KEY CONSTRAINTS
    PRIMARY KEY (alias_doc_type_code),
    
    -- CHECK CONSTRAINTS
    CONSTRAINT check_alias_doc_type_code     CHECK (alias_doc_type_code REGEXP '^A[0-9]{2}$'),
    CONSTRAINT check_alias_doc_description   CHECK (alias_doc_description REGEXP '^[A-Za-z0-9 /\\\\''-]+$')
);

-- Insert alias document types that match ID types
INSERT INTO ALIAS_DOCUMENTATION_TYPE (alias_doc_type_code, alias_doc_description) VALUES
('A01', 'Driver\'s License'),
('A02', 'Passport'),
('A03', 'SSS ID'),
('A04', 'PhilHealth ID'),
('A05', 'TIN ID'),
('A06', 'Voter\'s ID'),
('A07', 'Senior Citizen ID'),
('A08', 'PWD ID'),
('A09', 'Postal ID'),
('A10', 'Professional ID'),
('A11', 'Company ID'),
('A12', 'School ID'),
('A13', 'Barangay ID'),
('A14', 'UMID'),
('A15', 'PRC ID');

-- Create updated alias documentation table
CREATE TABLE ALIAS_DOCUMENTATION (
    alias_doc_id           INT AUTO_INCREMENT PRIMARY KEY,
    customer_alias_id      INT NOT NULL,
    alias_doc_type_code    CHAR(3) NOT NULL,
    alias_doc_number       VARCHAR(50) NOT NULL,
    alias_doc_issue_date   DATE,
    alias_doc_expiry_date  DATE,
    alias_doc_storage      VARCHAR(255),
    
    -- KEY CONSTRAINTS
    FOREIGN KEY (customer_alias_id) REFERENCES CUSTOMER_ALIAS(customer_alias_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (alias_doc_type_code) REFERENCES ALIAS_DOCUMENTATION_TYPE(alias_doc_type_code) ON UPDATE CASCADE ON DELETE RESTRICT,
    
    -- CHECK CONSTRAINTS
    CONSTRAINT chk_alias_doc_number           CHECK (alias_doc_number REGEXP '^[A-Za-z0-9\\-]+$'),
    CONSTRAINT chk_alias_doc_storage          CHECK (alias_doc_storage IS NULL OR alias_doc_storage REGEXP '^(https?|ftp)://.+' OR alias_doc_storage REGEXP '^[A-Za-z]:(\\\\[A-Za-z0-9_\\\\/\\.-]+)+$' OR alias_doc_storage REGEXP '^/[A-Za-z0-9_\\/\\.-]+$'),
    CONSTRAINT chk_alias_doc_dates            CHECK (alias_doc_expiry_date IS NULL OR alias_doc_issue_date IS NULL OR alias_doc_expiry_date > alias_doc_issue_date)
);

-- =============================================
-- PHASE 5: VERIFY AND UPDATE ID_TYPE TABLE
-- =============================================

-- Ensure all ID types are properly set up
INSERT IGNORE INTO ID_TYPE (id_type_code, id_description) VALUES
('DRV', 'Driver\'s License'),
('PAS', 'Passport'),
('SSS', 'SSS ID'),
('PHI', 'PhilHealth ID'),
('TIN', 'TIN ID'),
('VOT', 'Voter\'s ID'),
('SEN', 'Senior Citizen ID'),
('PWD', 'PWD ID'),
('POS', 'Postal ID'),
('PRO', 'Professional ID'),
('COM', 'Company ID'),
('SCH', 'School ID'),
('BAR', 'Barangay ID'),
('UMI', 'UMID'),
('PRC', 'PRC ID');

-- =============================================
-- PHASE 6: ADD INDEXES FOR PERFORMANCE
-- =============================================

-- Add indexes for frequently queried fields
CREATE INDEX idx_customer_address_type ON CUSTOMER_ADDRESS(address_type_code);
CREATE INDEX idx_customer_contact_type ON CUSTOMER_CONTACT_DETAILS(contact_type_code);
CREATE INDEX idx_customer_id_type ON CUSTOMER_ID(id_type_code);
CREATE INDEX idx_alias_doc_type ON ALIAS_DOCUMENTATION(alias_doc_type_code);

-- =============================================
-- PHASE 7: CREATE VALIDATION VIEWS
-- =============================================

-- View to check registration completeness
CREATE OR REPLACE VIEW registration_completeness AS
SELECT 
    c.cif_number,
    c.customer_first_name,
    c.customer_last_name,
    c.customer_status,
    -- Address completeness
    COUNT(DISTINCT ca_home.address_type_code) as has_home_address,
    COUNT(DISTINCT ca_work.address_type_code) as has_work_address,
    -- Contact completeness  
    COUNT(DISTINCT ccd_mobile.contact_type_code) as has_mobile,
    COUNT(DISTINCT ccd_landline.contact_type_code) as has_landline,
    COUNT(DISTINCT ccd_email.contact_type_code) as has_email,
    -- ID completeness
    COUNT(DISTINCT ci.id_type_code) as id_count,
    -- Employment completeness
    COUNT(DISTINCT cei.customer_employment_id) as has_employment,
    -- Fund source completeness
    COUNT(DISTINCT cfs.fund_source_code) as fund_source_count
FROM CUSTOMER c
LEFT JOIN CUSTOMER_ADDRESS ca_home ON c.cif_number = ca_home.cif_number AND ca_home.address_type_code = 'AD01'
LEFT JOIN CUSTOMER_ADDRESS ca_work ON c.cif_number = ca_work.cif_number AND ca_work.address_type_code = 'AD03'
LEFT JOIN CUSTOMER_CONTACT_DETAILS ccd_mobile ON c.cif_number = ccd_mobile.cif_number AND ccd_mobile.contact_type_code = 'CT01'
LEFT JOIN CUSTOMER_CONTACT_DETAILS ccd_landline ON c.cif_number = ccd_landline.cif_number AND ccd_landline.contact_type_code = 'CT02'
LEFT JOIN CUSTOMER_CONTACT_DETAILS ccd_email ON c.cif_number = ccd_email.cif_number AND ccd_email.contact_type_code = 'CT04'
LEFT JOIN CUSTOMER_ID ci ON c.cif_number = ci.cif_number
LEFT JOIN CUSTOMER_EMPLOYMENT_INFORMATION cei ON c.cif_number = cei.cif_number
LEFT JOIN CUSTOMER_FUND_SOURCE cfs ON c.cif_number = cfs.cif_number
GROUP BY c.cif_number, c.customer_first_name, c.customer_last_name, c.customer_status;

-- =============================================
-- PHASE 8: CREATE TRIGGERS FOR DATA INTEGRITY
-- =============================================

-- Trigger to ensure proper alias documentation
DELIMITER $$
CREATE TRIGGER trg_alias_doc_validation
BEFORE INSERT ON ALIAS_DOCUMENTATION
FOR EACH ROW
BEGIN
    -- Verify alias exists
    IF NOT EXISTS (SELECT 1 FROM CUSTOMER_ALIAS WHERE customer_alias_id = NEW.customer_alias_id) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot add documentation for non-existent alias';
    END IF;
    
    -- Validate document dates
    IF NEW.alias_doc_issue_date > CURDATE() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Alias document issue date cannot be in the future';
    END IF;
    
    IF NEW.alias_doc_expiry_date IS NOT NULL AND NEW.alias_doc_expiry_date <= CURDATE() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Alias document expiry date must be in the future';
    END IF;
END$$
DELIMITER ;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Check that deprecated fields are removed
SELECT 
    'DEPRECATED_FIELDS_CHECK' as check_type,
    CASE 
        WHEN COUNT(*) = 0 THEN 'PASS: All deprecated fields removed'
        ELSE CONCAT('FAIL: ', COUNT(*), ' deprecated fields still exist')
    END as result
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'univault_schema' 
  AND TABLE_NAME = 'CUSTOMER_ADDRESS'
  AND COLUMN_NAME IN ('is_alternate_address_same_as_home', 'alt_unit', 'alt_building', 'alt_street', 'alt_subdivision', 'alt_barangay', 'alt_city', 'alt_province', 'alt_country', 'alt_zip');

-- Check reference data completeness
SELECT 
    'REFERENCE_DATA_CHECK' as check_type,
    CONCAT(
        'ADDRESS_TYPES: ', (SELECT COUNT(*) FROM ADDRESS_TYPE), ', ',
        'CONTACT_TYPES: ', (SELECT COUNT(*) FROM CONTACT_TYPE), ', ',
        'ID_TYPES: ', (SELECT COUNT(*) FROM ID_TYPE), ', ',
        'ALIAS_DOC_TYPES: ', (SELECT COUNT(*) FROM ALIAS_DOCUMENTATION_TYPE)
    ) as reference_counts;

-- Check table structure
SELECT 
    'TABLE_STRUCTURE_CHECK' as check_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'univault_schema' AND TABLE_NAME = 'ALIAS_DOCUMENTATION') 
        THEN 'PASS: Alias documentation table created'
        ELSE 'FAIL: Alias documentation table missing'
    END as result;

SELECT 'CLEANUP_COMPLETE' as status, NOW() as completion_time;
