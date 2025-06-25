-- UniVault Database Schema
-- Complete database schema with all tables, constraints, triggers, and procedures
-- Version: 1.0
-- Last Updated: 2025-06-24

CREATE DATABASE IF NOT EXISTS univault_schema;
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';
USE univault_schema;


-- ////////////////
-- REFERENCE_TABLES
-- ////////////////


-- 1. CIVIL_STATUS_TYPE
-- =====================
CREATE TABLE CIVIL_STATUS_TYPE (
    civil_status_code           CHAR(4) NOT NULL,
    civil_status_description    VARCHAR(50) NOT NULL,
    
    -- KEY CONSTRAINTS
    PRIMARY KEY (civil_status_code),
    
    -- CHECK CONSTRAINTS
    CONSTRAINT check_civil_status_code             CHECK (civil_status_code REGEXP '^CS[0-9]{2}$'),
    CONSTRAINT check_civil_status_description      CHECK (civil_status_description REGEXP '^[A-Za-z /(),&.''-]+$')
    );


-- 2. ADDRESS_TYPE
-- ================
CREATE TABLE ADDRESS_TYPE (
    address_type_code   CHAR(4) NOT NULL,
    address_type        VARCHAR(20) NOT NULL,
    
    -- KEY CONSTRAINTS
    PRIMARY KEY (address_type_code),
    
    -- CHECK CONSTRAINTS
    CONSTRAINT check_address_type_code         CHECK (address_type_code REGEXP '^AD[0-9]{2}$'),
    CONSTRAINT check_address_type              CHECK (address_type REGEXP '^[A-Za-z /(),&.''-]+$')
    );


-- 3. CONTACT_TYPE
-- ================
CREATE TABLE CONTACT_TYPE (
    contact_type_code            CHAR(4) NOT NULL,
    contact_type_description     VARCHAR(20) NOT NULL,
    
    -- KEY CONSTRAINTS
    PRIMARY KEY (contact_type_code),
    
    -- CHECK CONSTRAINTS
    CONSTRAINT check_contact_type_code                 CHECK (contact_type_code REGEXP '^CT[0-9]{2}$'),
    CONSTRAINT check_contact_type_description          CHECK (contact_type_description REGEXP '^[A-Za-z /(),&.''-]+$')
    );


-- 4. EMPLOYMENT_POSITION
-- ========================
CREATE TABLE EMPLOYMENT_POSITION (
    position_code       CHAR(4) NOT NULL,
    employment_type     VARCHAR(50) NOT NULL,
    job_title           VARCHAR(50) NOT NULL,
    
    -- KEY CONSTRAINTS
    PRIMARY KEY (position_code),
    
    -- CHECK CONSTRAINTS
    CONSTRAINT check_position_code       CHECK (position_code REGEXP '^EP[0-9]{2}$'),
    CONSTRAINT check_employment_type 	CHECK (employment_type REGEXP '^[A-Za-z /-]+$'),
    CONSTRAINT check_job_title           CHECK (job_title REGEXP '^[A-Za-z /(),&.''-]+$')
    );


-- 5. FUND_SOURCE_TYPE
-- ===================================
CREATE TABLE FUND_SOURCE_TYPE (
    fund_source_code            CHAR(5) NOT NULL,
    fund_source                 VARCHAR(100) NOT NULL,
    PRIMARY KEY (fund_source_code),
    CONSTRAINT check_fund_source_code              CHECK (fund_source_code REGEXP '^FS[0-9]{3}$'),
    CONSTRAINT check_fund_source                   CHECK (fund_source REGEXP '^[A-Za-z /(),&.''-]+$')
    );


-- 6. WORK_NATURE_TYPE
-- ===================
CREATE TABLE WORK_NATURE_TYPE (
    work_nature_code        CHAR(3) NOT NULL,
    nature_description      VARCHAR(150) NOT NULL,
    
    -- KEY CONSTRAINTS
    PRIMARY KEY (work_nature_code),
    
    -- CHECK CONSTRAINTS
    CONSTRAINT check_work_nature_code        CHECK (work_nature_code REGEXP '^[A-Z]{3}$'),
    CONSTRAINT check_nature_description     CHECK (nature_description REGEXP '^[A-Za-z /(),&.''-]+$')
    );


-- 7. BIOMETRIC_TYPE - REMOVED (Not required for current system)


-- 8. CUSTOMER_PRODUCT_TYPE
-- ========================
CREATE TABLE CUSTOMER_PRODUCT_TYPE (
    product_type_code      	CHAR(4) NOT NULL,
    product_type_name    	VARCHAR(30) NOT NULL,
    
    -- KEY CONSTRAINTS
    PRIMARY KEY (product_type_code),
    
    -- CHECK CONSTRAINTS
    CONSTRAINT check_product_type_code        	CHECK (product_type_code REGEXP '^PR[0-9]{2}$'),
    CONSTRAINT check_product_type_name       	CHECK (product_type_name REGEXP '^[A-Za-z /(),&.''-]+$')
    );


-- 9. ALIAS_DOCUMENTATION_TYPE
-- ===========================
-- Updated: 2025-06-25 - Changed to A## format to align with frontend
CREATE TABLE ALIAS_DOCUMENTATION_TYPE (
    alias_doc_type_code     CHAR(3) NOT NULL,
    alias_doc_description   VARCHAR(100) NOT NULL,
    
    -- KEY CONSTRAINTS
    PRIMARY KEY (alias_doc_type_code),
    
    -- CHECK CONSTRAINTS
    CONSTRAINT check_alias_doc_type_code     CHECK (alias_doc_type_code REGEXP '^A[0-9]{2}$'),
    CONSTRAINT check_alias_doc_description   CHECK (alias_doc_description REGEXP '^[A-Za-z0-9 /\\\\''-]+$')
    );


-- 10. ID_TYPE
-- ===========
CREATE TABLE ID_TYPE (
    id_type_code        CHAR(3) NOT NULL,
    id_description      VARCHAR(255) NOT NULL,
    
    -- KEY CONSTRAINTS
    PRIMARY KEY (id_type_code),
    
    -- CHECK CONSTRAINTS
    CONSTRAINT check_id_type_code       CHECK (id_type_code REGEXP '^[A-Z]{3}$'),
    CONSTRAINT check_id_description  	CHECK (id_description REGEXP '^[A-Za-z /(),&.''-]+$')
    );


-- ////////////////
--   MAIN_TABLES
-- ////////////////


-- 11. CUSTOMER
-- =============
CREATE TABLE CUSTOMER (
    cif_number                   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    customer_type                VARCHAR(50) NOT NULL,
    customer_last_name           VARCHAR(255) NOT NULL,
    customer_first_name          VARCHAR(255) NOT NULL,
    customer_middle_name         VARCHAR(255),
    customer_suffix_name         VARCHAR(255),
    customer_username            VARCHAR(50) NOT NULL UNIQUE,
    customer_password            VARCHAR(255) NOT NULL,
    birth_date                   DATE NOT NULL,
    gender                       VARCHAR(25) NOT NULL,
    civil_status_code            CHAR(4) NOT NULL,
    birth_country                VARCHAR(100) NOT NULL,
    residency_status             VARCHAR(25) NOT NULL,
    citizenship                  VARCHAR(100) NOT NULL,
    tax_identification_number    VARCHAR(25) NOT NULL,
    customer_status              ENUM('Pending Verification', 'Active', 'Inactive', 'Suspended', 'Dormant') NOT NULL DEFAULT 'Pending Verification',
    remittance_country           VARCHAR(100),
    remittance_purpose           VARCHAR(255),
    -- Additional regulatory columns
    reg_political_affiliation    VARCHAR(10),
    reg_fatca                    VARCHAR(10),
    reg_dnfbp                    VARCHAR(10),
    reg_online_gaming            VARCHAR(10),
    reg_beneficial_owner         VARCHAR(10),
    -- Audit columns
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by INT,
    
    -- KEY CONSTRAINTS
    PRIMARY KEY (cif_number),
    FOREIGN KEY (civil_status_code) REFERENCES CIVIL_STATUS_TYPE(civil_status_code) ON UPDATE CASCADE ON DELETE RESTRICT,
    
    -- CHECK CONSTRAINTS
    CONSTRAINT check_customer_type                	CHECK (customer_type IN ('Account Owner', 'Business Owner', 'Business Owner / Officer / Signatory', 'Individual', 'Corporate')),
    CONSTRAINT check_customer_last_name           	CHECK (customer_last_name REGEXP '^[A-Za-z \\-]+$'),
    CONSTRAINT check_customer_first_name           	CHECK (customer_first_name REGEXP '^[A-Za-z ]+$'),
    CONSTRAINT check_customer_middle_name          	CHECK (customer_middle_name IS NULL OR customer_middle_name REGEXP '^[A-Za-z ]+$'),
    CONSTRAINT check_customer_suffix_name          	CHECK (customer_suffix_name IS NULL OR customer_suffix_name REGEXP '^[A-Za-z\\.]+$'),
    CONSTRAINT check_customer_username             CHECK (customer_username REGEXP '^[A-Za-z0-9._-]+$'),
    CONSTRAINT check_customer_password             	CHECK (LENGTH(customer_password) > 8),
    CONSTRAINT check_gender                         CHECK (gender IN ('Male', 'Female', 'Non-Binary/Third Gender', 'Prefer not to say', 'Other')),
    CONSTRAINT check_birth_country                  CHECK (birth_country REGEXP '^[A-Za-z''\\- ]+$'),
    CONSTRAINT check_residency_status               CHECK (residency_status IN ('Resident', 'Non-Resident')),
    CONSTRAINT check_citizenship                    CHECK (citizenship REGEXP '^[A-Za-z''\\- ]+$'),
    CONSTRAINT check_remittance_conditional         CHECK (remittance_country IS NULL AND remittance_purpose IS NULL OR remittance_country REGEXP '^[A-Za-z ]+$' AND remittance_purpose REGEXP '^[A-Za-z0-9 ,\\.\\-]+$')
    ) AUTO_INCREMENT = 1000000000;


-- 12. CUSTOMER_ADDRESS
-- =====================
-- Updated: 2025-06-25 - Removed deprecated alternate address fields
-- Uses ADDRESS_TYPE_CODE to distinguish Home (AD01), Work (AD03), Alternative (AD02)
CREATE TABLE CUSTOMER_ADDRESS (
    cif_number              BIGINT UNSIGNED NOT NULL,
    address_type_code       CHAR(4) NOT NULL,
    address_unit            VARCHAR(255),
    address_building        VARCHAR(255),
    address_street          VARCHAR(255),
    address_subdivision     VARCHAR(255),
    address_barangay        VARCHAR(255) NOT NULL,
    address_city            VARCHAR(255) NOT NULL,
    address_province        VARCHAR(255) NOT NULL,
    address_country         VARCHAR(255) NOT NULL,
    address_zip_code        CHAR(4) NOT NULL,
    
    -- KEY CONSTRAINTS
    PRIMARY KEY (cif_number, address_type_code),
    FOREIGN KEY (cif_number) REFERENCES CUSTOMER(cif_number) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (address_type_code) REFERENCES ADDRESS_TYPE(address_type_code) ON UPDATE CASCADE ON DELETE RESTRICT,
    
    -- CHECK CONSTRAINTS
    CONSTRAINT check_address_complete         CHECK (address_unit IS NOT NULL OR address_street IS NOT NULL OR address_subdivision IS NOT NULL),
    CONSTRAINT check_address_barangay          CHECK (address_barangay REGEXP '^[A-Za-z0-9\\.\\-''/ ]+$'),
    CONSTRAINT check_address_city              CHECK (address_city REGEXP '^[A-Za-z0-9\\.\\-''/ ]+$'),
    CONSTRAINT check_address_province          CHECK (address_province REGEXP '^[A-Za-z0-9\\.\\-''/ ]+$'),
    CONSTRAINT check_address_country            CHECK (address_country REGEXP '^[A-Za-z0-9\\.\\-''/ ]+$'),
    CONSTRAINT check_address_zipcode            CHECK (address_zip_code REGEXP '^[A-Za-z0-9\\.\\-''/ ]+$')
    );


-- 13. CUSTOMER_CONTACT_DETAILS
-- ============================
CREATE TABLE CUSTOMER_CONTACT_DETAILS(
    cif_number          BIGINT UNSIGNED NOT NULL,
    contact_type_code   CHAR(4) NOT NULL,
    contact_value       VARCHAR(255) NOT NULL,
    
    -- KEY CONSTRAINTS
    PRIMARY KEY (cif_number, contact_type_code),
    FOREIGN KEY (cif_number) REFERENCES CUSTOMER(cif_number) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (contact_type_code) REFERENCES CONTACT_TYPE(contact_type_code) ON UPDATE CASCADE ON DELETE RESTRICT
    );


-- 14. CUSTOMER_EMPLOYMENT_INFORMATION
-- ===================================
CREATE TABLE CUSTOMER_EMPLOYMENT_INFORMATION (
    customer_employment_id      INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    cif_number                  BIGINT UNSIGNED NOT NULL,
    employer_business_name      VARCHAR(255) NOT NULL,
    employment_start_date       DATE NOT NULL,
    employment_end_date         DATE,
    employment_status           VARCHAR(20) NOT NULL DEFAULT 'Current',
    position_code               CHAR(4) NOT NULL,
    income_monthly_gross        DECIMAL(12, 2) NOT NULL,
    
    -- KEY CONSTRAINTS
    PRIMARY KEY (customer_employment_id),
    FOREIGN KEY (cif_number) REFERENCES CUSTOMER(cif_number) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (position_code) REFERENCES EMPLOYMENT_POSITION(position_code) ON UPDATE CASCADE ON DELETE RESTRICT,
    
    -- CHECK CONSTRAINTS
    CONSTRAINT check_employer_business_name     CHECK (employer_business_name REGEXP '^[A-Za-z0-9 .,&()''/-]+$'),
    CONSTRAINT check_employment_status          CHECK (employment_status IN ('Current', 'Previous')),
    CONSTRAINT check_employment_dates           CHECK (employment_end_date IS NULL OR employment_end_date >= employment_start_date),
    CONSTRAINT check_income_positive            CHECK (income_monthly_gross >= 0)
    );


-- 15. CUSTOMER_FUND_SOURCE
-- ========================
CREATE TABLE CUSTOMER_FUND_SOURCE (
    cif_number          BIGINT UNSIGNED NOT NULL,
    fund_source_code    CHAR(5) NOT NULL,
    
    -- KEY CONSTRAINTS
    PRIMARY KEY (cif_number, fund_source_code),
    FOREIGN KEY (cif_number) REFERENCES CUSTOMER(cif_number) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (fund_source_code) REFERENCES FUND_SOURCE_TYPE(fund_source_code) ON UPDATE CASCADE ON DELETE RESTRICT
    );


-- 16. CUSTOMER_WORK_NATURE
-- ========================
CREATE TABLE CUSTOMER_WORK_NATURE (
    customer_employment_id      INTEGER UNSIGNED NOT NULL,
    work_nature_code            CHAR(3) NOT NULL,
    
    -- KEY CONSTRAINTS
    PRIMARY KEY (customer_employment_id, work_nature_code),
    FOREIGN KEY (customer_employment_id) REFERENCES CUSTOMER_EMPLOYMENT_INFORMATION(customer_employment_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (work_nature_code) REFERENCES WORK_NATURE_TYPE(work_nature_code) ON UPDATE CASCADE ON DELETE RESTRICT
    );


-- 17. CUSTOMER_ALIAS
-- ==================
CREATE TABLE CUSTOMER_ALIAS (
   customer_alias_id        INT AUTO_INCREMENT PRIMARY KEY,
    cif_number              BIGINT UNSIGNED NOT NULL,
    alias_last_name         VARCHAR(255) NOT NULL,
    alias_first_name        VARCHAR(255) NOT NULL,
    alias_middle_name       VARCHAR(255),
    alias_suffix_name       VARCHAR(255),
    
    -- KEY CONSTRAINTS
    FOREIGN KEY (cif_number) REFERENCES CUSTOMER(cif_number) ON UPDATE CASCADE ON DELETE CASCADE,
    
    -- CHECK CONSTRAINTS
    CONSTRAINT check_alias_last_name              CHECK (alias_last_name REGEXP '^[A-Za-z \\-]+$'),
    CONSTRAINT check_alias_first_name             CHECK (alias_first_name REGEXP '^[A-Za-z ]+$'),
    CONSTRAINT check_alias_middle_name            CHECK (alias_middle_name IS NULL OR alias_middle_name REGEXP '^[A-Za-z ]+$'),
    CONSTRAINT check_alias_suffix_name            CHECK (alias_suffix_name IS NULL OR alias_suffix_name REGEXP '^[A-Za-z\\.]+$'),
    CONSTRAINT unique_alias_per_customer          UNIQUE (cif_number, alias_last_name(100), alias_first_name(100), alias_middle_name(100), alias_suffix_name(100))
    );


-- 18. ALIAS_DOCUMENTATION
-- =======================
-- Updated: 2025-06-25 - Restructured to align with registration frontend
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


-- 19. BANK_EMPLOYEE
-- ================
CREATE TABLE BANK_EMPLOYEE (
    employee_id    INT AUTO_INCREMENT PRIMARY KEY,
    employee_position      VARCHAR(50) NOT NULL,
    employee_last_name     VARCHAR(255) NOT NULL,
    employee_first_name    VARCHAR(255) NOT NULL,
    employee_middle_name   VARCHAR(255),
    employee_suffix_name   VARCHAR(255),
    employee_username      VARCHAR(50) NOT NULL UNIQUE,
    employee_password      VARCHAR(255) NOT NULL,
    created_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- CHECK CONSTRAINTS
    CONSTRAINT check_employee_position       CHECK (employee_position REGEXP '^[A-Za-z ]+$'),
    CONSTRAINT chk_employee_last_name        CHECK (employee_last_name REGEXP '^[A-Za-z \\-]+$'),
    CONSTRAINT chk_employee_first_name       CHECK (employee_first_name REGEXP '^[A-Za-z ]+$'),
    CONSTRAINT chk_employee_middle_name      CHECK (employee_middle_name IS NULL OR employee_middle_name REGEXP '^[A-Za-z ]+$'),
    CONSTRAINT chk_employee_suffix           CHECK (employee_suffix_name IS NULL OR employee_suffix_name REGEXP '^[A-Za-z\\.]+$'),
    CONSTRAINT check_employee_username      CHECK (employee_username REGEXP '^[A-Za-z0-9._-]+$'),
    CONSTRAINT check_employee_password        CHECK (employee_password REGEXP '^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$')
    );


-- 20. ACCOUNT_DETAILS
-- ===================
CREATE TABLE ACCOUNT_DETAILS (
    account_number          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    product_type_code       CHAR(4) NOT NULL,
    verified_by_employee    INT NOT NULL,

    account_open_date       DATE NOT NULL,
    account_close_date      DATE,
    account_status          VARCHAR(30) NOT NULL,
    
    -- KEY CONSTRAINTS
    PRIMARY KEY (account_number),
    FOREIGN KEY (product_type_code) REFERENCES CUSTOMER_PRODUCT_TYPE(product_type_code) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (verified_by_employee) REFERENCES BANK_EMPLOYEE(employee_id) ON UPDATE CASCADE ON DELETE RESTRICT,

    
    -- CHECK CONSTRAINTS
    CONSTRAINT check_account_status               CHECK (account_status IN ('Active', 'Dormant', 'Closed', 'Suspended', 'Pending Verification'))
    ) AUTO_INCREMENT = 100000000000;


-- 21. CUSTOMER_ACCOUNT
-- ====================
CREATE TABLE CUSTOMER_ACCOUNT (
    cif_number          BIGINT UNSIGNED NOT NULL,
    account_number      BIGINT UNSIGNED NOT NULL,
        
    -- KEY CONSTRAINTS
    PRIMARY KEY (cif_number, account_number),
    FOREIGN KEY (cif_number) REFERENCES CUSTOMER(cif_number) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (account_number) REFERENCES ACCOUNT_DETAILS(account_number) ON UPDATE CASCADE ON DELETE CASCADE
    );


-- 22. CUSTOMER_ID
-- ===============
CREATE TABLE CUSTOMER_ID (
    cif_number          BIGINT UNSIGNED NOT NULL,
    id_type_code        CHAR(3) NOT NULL,
    id_number           VARCHAR(20) NOT NULL,
    id_storage          VARCHAR(255),
    id_issue_date       DATE NOT NULL,
    id_expiry_date      DATE,
    
    -- KEY CONSTRAINTS
    PRIMARY KEY (cif_number, id_type_code),
    FOREIGN KEY (cif_number) REFERENCES CUSTOMER(cif_number) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_type_code) REFERENCES ID_TYPE(id_type_code) ON UPDATE CASCADE ON DELETE RESTRICT,
    
    -- CHECK CONSTRAINTS
    CONSTRAINT check_id_number         CHECK (id_number REGEXP '^[A-Za-z0-9\\-]+$'),
    CONSTRAINT check_id_storage        CHECK (id_storage IS NULL OR id_storage REGEXP '^(https?|ftp)://.+' OR id_storage REGEXP '^[A-Za-z]:(\\\\[A-Za-z0-9_\\\\/\\.-]+)+$' OR id_storage REGEXP '^/[A-Za-z0-9_\\/\\.-]+$'),
    CONSTRAINT check_id_date           CHECK (id_expiry_date IS NULL OR id_issue_date < id_expiry_date)
    );
    
-- 23. REVIEW_QUEUE
-- ===============
CREATE TABLE REVIEW_QUEUE (
    review_id                   INT AUTO_INCREMENT PRIMARY KEY,
    account_number              BIGINT UNSIGNED,
    cif_number                  BIGINT UNSIGNED,
    request_type                VARCHAR(50) NOT NULL,
    request_timestamp           DATETIME NOT NULL,
    request_details             TEXT,
    review_status               VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    reviewed_by_employee_id     INT,
    review_comment              TEXT,
    review_date                 DATE,

    -- KEY CONSTRAINTS
    FOREIGN KEY (account_number) REFERENCES ACCOUNT_DETAILS(account_number) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (cif_number) REFERENCES CUSTOMER(cif_number) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by_employee_id) REFERENCES BANK_EMPLOYEE(employee_id) ON UPDATE CASCADE ON DELETE SET NULL
);


-- ////////////////
--     TRIGGERS
-- ////////////////

-- Customer age validation
DELIMITER $$
CREATE TRIGGER check_customer_age_before_insert
BEFORE INSERT ON CUSTOMER
FOR EACH ROW
BEGIN
  IF NEW.birth_date > DATE_SUB(CURDATE(), INTERVAL 18 YEAR) THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Customer must be at least 18 years old.';
  END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER check_customer_age_before_update
BEFORE UPDATE ON CUSTOMER
FOR EACH ROW
BEGIN
  IF NEW.birth_date > DATE_SUB(CURDATE(), INTERVAL 18 YEAR) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Customer must be at least 18 years old.';
  END IF;
END$$
DELIMITER ;

-- Remittance fund source validation
DELIMITER $$
CREATE TRIGGER trg_remittance_required
AFTER INSERT ON CUSTOMER_FUND_SOURCE
FOR EACH ROW
BEGIN
    DECLARE src_desc VARCHAR(100);

    SELECT fund_source
      INTO src_desc
      FROM FUND_SOURCE_TYPE
      WHERE fund_source_code = NEW.fund_source_code;

    IF src_desc = 'Remittances' THEN
        IF (SELECT remittance_country 
              FROM CUSTOMER 
             WHERE cif_number = NEW.cif_number) IS NULL
           OR (SELECT remittance_purpose 
                 FROM CUSTOMER 
                WHERE cif_number = NEW.cif_number) IS NULL THEN
            SIGNAL SQLSTATE '45000'
              SET MESSAGE_TEXT = 'Remittances fund source requires remittance_country and remittance_purpose in CUSTOMER';
        END IF;
    END IF;
END$$
DELIMITER ;

-- Employment date validation
DELIMITER $$
CREATE TRIGGER trg_employment_date_insert_check
BEFORE INSERT ON CUSTOMER_EMPLOYMENT_INFORMATION
FOR EACH ROW
BEGIN
    IF NEW.employment_start_date > CURRENT_DATE() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Employment start date cannot be in the future';
    END IF;

    IF NEW.employment_end_date IS NOT NULL THEN
        IF NEW.employment_end_date > CURRENT_DATE() THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Employment end date cannot be in the future';
        END IF;

        IF NEW.employment_end_date < NEW.employment_start_date THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Employment end date cannot be before start date';
        END IF;
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER trg_employment_date_update_check
BEFORE UPDATE ON CUSTOMER_EMPLOYMENT_INFORMATION
FOR EACH ROW
BEGIN
    IF NEW.employment_start_date > CURRENT_DATE() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Employment start date cannot be in the future';
    END IF;

    IF NEW.employment_end_date IS NOT NULL THEN
        IF NEW.employment_end_date > CURRENT_DATE() THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Employment end date cannot be in the future';
        END IF;

        IF NEW.employment_end_date < NEW.employment_start_date THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Employment end date cannot be before start date';
        END IF;
    END IF;
END$$
DELIMITER ;

-- Prevent employment status changes
DELIMITER $$
CREATE TRIGGER trg_employment_status_immutability_on_update
BEFORE UPDATE ON CUSTOMER_EMPLOYMENT_INFORMATION
FOR EACH ROW
BEGIN
  IF OLD.employment_status <> NEW.employment_status
     OR OLD.employment_end_date <> NEW.employment_end_date THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'To change employment status, insert a new row—do not update existing record';
  END IF;
END$$
DELIMITER ;

-- Account creation validation
DELIMITER $$
CREATE TRIGGER trg_prevent_account_without_minimum_records
BEFORE INSERT ON CUSTOMER_ACCOUNT
FOR EACH ROW
BEGIN
  DECLARE cnt_address INT DEFAULT 0;
  DECLARE cnt_contact INT DEFAULT 0;
  DECLARE cnt_id INT DEFAULT 0;
  DECLARE cnt_fund INT DEFAULT 0;

  SELECT COUNT(*) INTO cnt_address 
  FROM CUSTOMER_ADDRESS 
  WHERE cif_number = NEW.cif_number;

  SELECT COUNT(*) INTO cnt_contact 
  FROM CUSTOMER_CONTACT_DETAILS 
  WHERE cif_number = NEW.cif_number;

  SELECT COUNT(*) INTO cnt_id 
  FROM CUSTOMER_ID 
  WHERE cif_number = NEW.cif_number;

  SELECT COUNT(*) INTO cnt_fund 
  FROM CUSTOMER_FUND_SOURCE 
  WHERE cif_number = NEW.cif_number;

  IF (cnt_address + cnt_contact + cnt_id + cnt_fund) = 0 THEN
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'Cannot create account: must have at least one of address, contact, ID, or fund source';
  END IF;
END$$
DELIMITER ;

-- Minimum fund source validation
DELIMITER $$
CREATE TRIGGER trg_cust_fund_source_delete_check
BEFORE DELETE ON CUSTOMER_FUND_SOURCE
FOR EACH ROW
BEGIN
  DECLARE cnt INT;
  SELECT COUNT(*) INTO cnt
    FROM CUSTOMER_FUND_SOURCE
    WHERE cif_number = OLD.cif_number;
  IF cnt <= 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Customer must have at least one fund source.';
  END IF;
END$$
DELIMITER ;

-- Alias documentation validation - UPDATED COLUMN NAMES
DELIMITER $$
CREATE TRIGGER trg_alias_doc_insert_validation
BEFORE INSERT ON ALIAS_DOCUMENTATION
FOR EACH ROW
BEGIN
    IF NEW.alias_doc_issue_date IS NOT NULL AND NEW.alias_doc_issue_date > CURDATE() THEN
        SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'Alias document issue date cannot be in the future';
    END IF;

    IF NEW.alias_doc_expiry_date IS NOT NULL
       AND NEW.alias_doc_expiry_date < CURDATE() THEN
        SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'Alias document expiry date cannot be in the past for new documents';
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER trg_alias_doc_update_validation
BEFORE UPDATE ON ALIAS_DOCUMENTATION
FOR EACH ROW
BEGIN
    IF NEW.alias_doc_issue_date IS NOT NULL AND NEW.alias_doc_issue_date > CURDATE() THEN
        SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'Alias document issue date cannot be in the future';
    END IF;

    IF NEW.alias_doc_expiry_date IS NOT NULL
       AND NEW.alias_doc_expiry_date < CURDATE() THEN
        SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'Alias document expiry date cannot be in the past on update';
    END IF;
END$$
DELIMITER ;

-- Account verification validation
DELIMITER $$
CREATE TRIGGER trg_account_details_verification
BEFORE INSERT ON ACCOUNT_DETAILS
FOR EACH ROW
BEGIN
-- Single employee verification process
IF NEW.verified_by_employee IS NULL THEN
SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Account must be verified by an employee';
    END IF;
END$$
DELIMITER ;

-- Account date validation
DELIMITER $$
CREATE TRIGGER trg_customer_account_insert_validation
    BEFORE INSERT ON ACCOUNT_DETAILS
    FOR EACH ROW
BEGIN
    IF NEW.account_open_date > CURDATE() THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Account open date cannot be in the future';
    END IF;
    
    IF NEW.account_open_date < DATE_SUB(CURDATE(), INTERVAL 10 YEAR) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Account open date cannot be more than 10 years in the past';
    END IF;
END$$
DELIMITER ;

-- Customer ID validation
DELIMITER $$
CREATE TRIGGER trg_customer_id_dates_insert
    BEFORE INSERT ON CUSTOMER_ID
    FOR EACH ROW
BEGIN
    IF NEW.id_issue_date > CURRENT_DATE THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'ID issue date cannot be in the future';
    END IF;
    
    IF NEW.id_expiry_date IS NOT NULL AND NEW.id_expiry_date <= CURRENT_DATE THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'ID expiry date must be in the future';
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER trg_customer_id_dates_update
    BEFORE UPDATE ON CUSTOMER_ID
    FOR EACH ROW
BEGIN
    IF NEW.id_issue_date > CURRENT_DATE THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'ID issue date cannot be in the future';
    END IF;
    
    IF NEW.id_expiry_date IS NOT NULL AND NEW.id_expiry_date <= CURRENT_DATE THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'ID expiry date must be in the future';
    END IF;
END$$
DELIMITER ;

-- Limit two IDs per customer
DELIMITER $$
CREATE TRIGGER trg_limit_two_ids
AFTER INSERT ON CUSTOMER_ID
FOR EACH ROW
BEGIN
  DECLARE cnt INT;
  SELECT COUNT(*) INTO cnt
    FROM CUSTOMER_ID
    WHERE cif_number = NEW.cif_number;
  IF cnt > 2 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'A customer may have at most two ID documents.';
  END IF;
END $$
DELIMITER ;

-- Address validation triggers
DELIMITER $$
CREATE TRIGGER trg_customer_address_insert_home
AFTER INSERT ON CUSTOMER_ADDRESS
FOR EACH ROW
BEGIN
	DECLARE home_count INT;
	IF NEW.address_type_code = 'AD01' THEN
		SELECT COUNT(*) INTO home_count
		FROM CUSTOMER_ADDRESS
		WHERE cif_number = NEW.cif_number
		AND address_type_code = 'AD01';
      
    IF home_count > 1 THEN
		SIGNAL SQLSTATE '45000' 
		SET MESSAGE_TEXT = 'Only one home address is allowed per customer';
    END IF;
END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER trg_customer_address_prevent_delete_last_home
BEFORE DELETE ON CUSTOMER_ADDRESS
FOR EACH ROW
BEGIN
  DECLARE home_count INT;

  IF OLD.address_type_code = 'AD01' THEN
    SELECT COUNT(*) 
      INTO home_count
      FROM CUSTOMER_ADDRESS
     WHERE cif_number = OLD.cif_number
       AND address_type_code = 'AD01';

    IF home_count = 1 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot delete: customer must have exactly one Home address';
    END IF;
  END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER trg_customer_address_prevent_update_last_home
BEFORE UPDATE ON CUSTOMER_ADDRESS
FOR EACH ROW
BEGIN
  DECLARE home_count INT;

  IF OLD.address_type_code = 'AD01' 
     AND NEW.address_type_code <> 'AD01' THEN

    SELECT COUNT(*) 
      INTO home_count
      FROM CUSTOMER_ADDRESS
     WHERE cif_number = OLD.cif_number
       AND address_type_code = 'AD01';

    IF home_count = 1 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot change: customer must have exactly one Home address';
    END IF;
  END IF;
END$$
DELIMITER ;

-- Minimum ID requirement
DELIMITER $$
CREATE TRIGGER trg_prevent_account_with_less_than_two_ids
BEFORE INSERT ON CUSTOMER_ACCOUNT
FOR EACH ROW
BEGIN
  DECLARE id_count INT;

  SELECT COUNT(*) INTO id_count
  FROM CUSTOMER_ID
  WHERE cif_number = NEW.cif_number;

  IF id_count < 2 THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Cannot create account: customer must submit at least two IDs';
  END IF;
END$$
DELIMITER ;

-- ////////////////
--   PROCEDURES
-- ////////////////

DELIMITER $$
CREATE PROCEDURE create_customer (
  IN p_customer_type                 VARCHAR(25),
  IN p_customer_last_name            CHAR(255),
  IN p_customer_first_name           CHAR(255),
  IN p_customer_middle_name          CHAR(255),
  IN p_customer_suffix_name          CHAR(255),
  IN p_customer_username             VARCHAR(50),
  IN p_customer_password             VARCHAR(255),
  IN p_birth_date                    DATE,
  IN p_gender                        VARCHAR(25),
  IN p_civil_status_code             CHAR(4),
  IN p_birth_country                 VARCHAR(100),
  IN p_residency_status              VARCHAR(25),
  IN p_citizenship                   VARCHAR(100),
  IN p_tax_identification_number     BIGINT UNSIGNED,
  IN p_remittance_country            VARCHAR(100),
  IN p_remittance_purpose            VARCHAR(255),
  IN p_fund_source_code              CHAR(5)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Failed to create customer and initial fund source (rolled back).';
  END;

  START TRANSACTION;

  INSERT INTO CUSTOMER (
    customer_type,
    customer_last_name,
    customer_first_name,
    customer_middle_name,
    customer_suffix_name,
    customer_username,
    customer_password,
    birth_date,
    gender,
    civil_status_code,
    birth_country,
    residency_status,
    citizenship,
    tax_identification_number,
    remittance_country,
    remittance_purpose,
    customer_status
  ) VALUES (
    p_customer_type,
    p_customer_last_name,
    p_customer_first_name,
    p_customer_middle_name,
    p_customer_suffix_name,
    p_customer_username,
    p_customer_password,
    p_birth_date,
    p_gender,
    p_civil_status_code,
    p_birth_country,
    p_residency_status,
    p_citizenship,
    p_tax_identification_number,
    p_remittance_country,
    p_remittance_purpose,
    DEFAULT
  );

  SET @new_cif := LAST_INSERT_ID();

  INSERT INTO CUSTOMER_FUND_SOURCE (
    cif_number,
    fund_source_code
  ) VALUES (
    @new_cif,
    p_fund_source_code
  );

  COMMIT;

  SELECT @new_cif AS new_cif_number;
END$$
DELIMITER ;

-- ////////////////
-- PERFORMANCE INDEXES
-- ////////////////
-- Added: 2025-06-25 - Performance indexes for frequently queried fields

CREATE INDEX idx_customer_address_type ON CUSTOMER_ADDRESS(address_type_code);
CREATE INDEX idx_customer_contact_type ON CUSTOMER_CONTACT_DETAILS(contact_type_code);
CREATE INDEX idx_customer_id_type ON CUSTOMER_ID(id_type_code);
CREATE INDEX idx_alias_doc_type ON ALIAS_DOCUMENTATION(alias_doc_type_code);
CREATE INDEX idx_customer_status ON CUSTOMER(customer_status);
CREATE INDEX idx_customer_created ON CUSTOMER(created_at);

-- ////////////////
-- VALIDATION VIEWS
-- ////////////////
-- Added: 2025-06-25 - Views for registration completeness monitoring

-- View to check registration completeness
CREATE OR REPLACE VIEW registration_completeness AS
SELECT 
    c.cif_number,
    c.customer_first_name,
    c.customer_last_name,
    c.customer_status,
    c.created_at,
    -- Address completeness
    COUNT(DISTINCT ca_home.address_type_code) as has_home_address,
    COUNT(DISTINCT ca_work.address_type_code) as has_work_address,
    COUNT(DISTINCT ca_alt.address_type_code) as has_alternate_address,
    -- Contact completeness  
    COUNT(DISTINCT ccd_mobile.contact_type_code) as has_mobile,
    COUNT(DISTINCT ccd_landline.contact_type_code) as has_landline,
    COUNT(DISTINCT ccd_email.contact_type_code) as has_email,
    -- ID completeness
    COUNT(DISTINCT ci.id_type_code) as id_count,
    -- Employment completeness
    COUNT(DISTINCT cei.customer_employment_id) as has_employment,
    -- Fund source completeness
    COUNT(DISTINCT cfs.fund_source_code) as fund_source_count,
    -- Alias completeness
    COUNT(DISTINCT ca_alias.customer_alias_id) as alias_count
FROM CUSTOMER c
LEFT JOIN CUSTOMER_ADDRESS ca_home ON c.cif_number = ca_home.cif_number AND ca_home.address_type_code = 'AD01'
LEFT JOIN CUSTOMER_ADDRESS ca_work ON c.cif_number = ca_work.cif_number AND ca_work.address_type_code = 'AD03'
LEFT JOIN CUSTOMER_ADDRESS ca_alt ON c.cif_number = ca_alt.cif_number AND ca_alt.address_type_code = 'AD02'
LEFT JOIN CUSTOMER_CONTACT_DETAILS ccd_mobile ON c.cif_number = ccd_mobile.cif_number AND ccd_mobile.contact_type_code = 'CT01'
LEFT JOIN CUSTOMER_CONTACT_DETAILS ccd_landline ON c.cif_number = ccd_landline.cif_number AND ccd_landline.contact_type_code = 'CT02'
LEFT JOIN CUSTOMER_CONTACT_DETAILS ccd_email ON c.cif_number = ccd_email.cif_number AND ccd_email.contact_type_code = 'CT04'
LEFT JOIN CUSTOMER_ID ci ON c.cif_number = ci.cif_number
LEFT JOIN CUSTOMER_EMPLOYMENT_INFORMATION cei ON c.cif_number = cei.cif_number
LEFT JOIN CUSTOMER_FUND_SOURCE cfs ON c.cif_number = cfs.cif_number
LEFT JOIN CUSTOMER_ALIAS ca_alias ON c.cif_number = ca_alias.cif_number
GROUP BY c.cif_number, c.customer_first_name, c.customer_last_name, c.customer_status, c.created_at;

-- ////////////////
-- ENHANCED TRIGGERS
-- ////////////////
-- Added: 2025-06-25 - Enhanced triggers for alias documentation validation

-- Trigger to ensure proper alias documentation integrity
DELIMITER $$
CREATE TRIGGER trg_alias_doc_integrity_validation
BEFORE INSERT ON ALIAS_DOCUMENTATION
FOR EACH ROW
BEGIN
    -- Verify alias exists
    IF NOT EXISTS (SELECT 1 FROM CUSTOMER_ALIAS WHERE customer_alias_id = NEW.customer_alias_id) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot add documentation for non-existent alias';
    END IF;
    
    -- Additional integrity checks
    IF NEW.alias_doc_number IS NULL OR TRIM(NEW.alias_doc_number) = '' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Alias document number cannot be empty';
    END IF;
END$$
DELIMITER ;