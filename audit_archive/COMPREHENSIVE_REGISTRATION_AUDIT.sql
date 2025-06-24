-- Comprehensive Customer Registration System Audit
-- This script verifies all entities, relationships, and data integrity

-- =================================================================
-- PART 1: ENTITY CREATION VERIFICATION
-- =================================================================

-- 1.1 CORE CUSTOMER ENTITY VERIFICATION
SELECT '1. CORE CUSTOMER ENTITIES' as audit_section;

SELECT 
    'CUSTOMER' as entity_type,
    COUNT(*) as total_records,
    COUNT(CASE WHEN customer_status = 'Pending Verification' THEN 1 END) as pending_records,
    COUNT(CASE WHEN customer_status = 'Active' THEN 1 END) as active_records,
    MIN(created_at) as oldest_record,
    MAX(created_at) as newest_record
FROM CUSTOMER

UNION ALL

SELECT 
    'CUSTOMER_ACCOUNT' as entity_type,
    COUNT(*) as total_records,
    COUNT(DISTINCT cif_number) as unique_customers,
    COUNT(DISTINCT account_number) as unique_accounts,
    NULL as oldest_record,
    NULL as newest_record
FROM CUSTOMER_ACCOUNT

UNION ALL

SELECT 
    'ACCOUNT_DETAILS' as entity_type,
    COUNT(*) as total_records,
    COUNT(CASE WHEN account_status = 'Active' THEN 1 END) as active_accounts,
    COUNT(CASE WHEN account_status = 'Pending Verification' THEN 1 END) as pending_accounts,
    MIN(account_open_date) as oldest_record,
    MAX(account_open_date) as newest_record
FROM ACCOUNT_DETAILS;

-- 1.2 CUSTOMER RELATIONSHIP ENTITIES
SELECT '2. CUSTOMER RELATIONSHIP ENTITIES' as audit_section;

SELECT 
    'CUSTOMER_ADDRESS' as entity_type,
    COUNT(*) as total_records,
    COUNT(DISTINCT cif_number) as customers_with_addresses,
    COUNT(DISTINCT address_type_code) as address_types_used,
    NULL, NULL
FROM CUSTOMER_ADDRESS

UNION ALL

SELECT 
    'CUSTOMER_CONTACT_DETAILS' as entity_type,
    COUNT(*) as total_records,
    COUNT(DISTINCT cif_number) as customers_with_contacts,
    COUNT(DISTINCT contact_type_code) as contact_types_used,
    NULL, NULL
FROM CUSTOMER_CONTACT_DETAILS

UNION ALL

SELECT 
    'CUSTOMER_ID' as entity_type,
    COUNT(*) as total_records,
    COUNT(DISTINCT cif_number) as customers_with_ids,
    COUNT(DISTINCT id_type_code) as id_types_used,
    NULL, NULL
FROM CUSTOMER_ID

UNION ALL

SELECT 
    'CUSTOMER_FUND_SOURCE' as entity_type,
    COUNT(*) as total_records,
    COUNT(DISTINCT cif_number) as customers_with_funds,
    COUNT(DISTINCT fund_source_code) as fund_types_used,
    NULL, NULL
FROM CUSTOMER_FUND_SOURCE

UNION ALL

SELECT 
    'CUSTOMER_EMPLOYMENT_INFORMATION' as entity_type,
    COUNT(*) as total_records,
    COUNT(DISTINCT cif_number) as customers_with_employment,
    COUNT(CASE WHEN employment_status = 'Current' THEN 1 END) as current_employment,
    NULL, NULL
FROM CUSTOMER_EMPLOYMENT_INFORMATION;

-- 1.3 OPTIONAL ENTITIES (Aliases, Work Nature)
SELECT '3. OPTIONAL ENTITIES' as audit_section;

SELECT 
    'CUSTOMER_ALIAS' as entity_type,
    COUNT(*) as total_records,
    COUNT(DISTINCT cif_number) as customers_with_aliases,
    NULL, NULL, NULL
FROM CUSTOMER_ALIAS

UNION ALL

SELECT 
    'ALIAS_DOCUMENTATION' as entity_type,
    COUNT(*) as total_records,
    COUNT(DISTINCT customer_alias_id) as aliases_with_docs,
    NULL, NULL, NULL
FROM ALIAS_DOCUMENTATION

UNION ALL

SELECT 
    'CUSTOMER_WORK_NATURE' as entity_type,
    COUNT(*) as total_records,
    COUNT(DISTINCT customer_employment_id) as employment_with_nature,
    NULL, NULL, NULL
FROM CUSTOMER_WORK_NATURE;

-- =================================================================
-- PART 2: RELATIONSHIP INTEGRITY VERIFICATION
-- =================================================================

SELECT '4. RELATIONSHIP INTEGRITY CHECK' as audit_section;

-- 2.1 Customer-Account Relationship Integrity
SELECT 
    'Customer-Account Integrity' as check_type,
    CASE 
        WHEN orphaned_customers + orphaned_accounts = 0 THEN 'PASS'
        ELSE 'FAIL'
    END as status,
    orphaned_customers,
    orphaned_accounts
FROM (
    SELECT 
        (SELECT COUNT(*) FROM CUSTOMER c WHERE c.cif_number NOT IN (SELECT cif_number FROM CUSTOMER_ACCOUNT)) as orphaned_customers,
        (SELECT COUNT(*) FROM ACCOUNT_DETAILS ad WHERE ad.account_number NOT IN (SELECT account_number FROM CUSTOMER_ACCOUNT)) as orphaned_accounts
) integrity_check

UNION ALL

-- 2.2 Customer Contact Details Integrity
SELECT 
    'Customer-Contact Integrity' as check_type,
    CASE 
        WHEN orphaned_contacts = 0 THEN 'PASS'
        ELSE 'FAIL'
    END as status,
    orphaned_contacts,
    NULL
FROM (
    SELECT COUNT(*) as orphaned_contacts
    FROM CUSTOMER_CONTACT_DETAILS ccd 
    WHERE ccd.cif_number NOT IN (SELECT cif_number FROM CUSTOMER)
) contact_check

UNION ALL

-- 2.3 Customer ID Documents Integrity
SELECT 
    'Customer-ID Integrity' as check_type,
    CASE 
        WHEN orphaned_ids = 0 THEN 'PASS'
        ELSE 'FAIL'
    END as status,
    orphaned_ids,
    NULL
FROM (
    SELECT COUNT(*) as orphaned_ids
    FROM CUSTOMER_ID ci 
    WHERE ci.cif_number NOT IN (SELECT cif_number FROM CUSTOMER)
) id_check

UNION ALL

-- 2.4 Customer Fund Sources Integrity
SELECT 
    'Customer-FundSource Integrity' as check_type,
    CASE 
        WHEN orphaned_funds = 0 THEN 'PASS'
        ELSE 'FAIL'
    END as status,
    orphaned_funds,
    NULL
FROM (
    SELECT COUNT(*) as orphaned_funds
    FROM CUSTOMER_FUND_SOURCE cfs 
    WHERE cfs.cif_number NOT IN (SELECT cif_number FROM CUSTOMER)
) fund_check;

-- =================================================================
-- PART 3: DATA COMPLETENESS ANALYSIS
-- =================================================================

SELECT '5. DATA COMPLETENESS ANALYSIS' as audit_section;

-- 3.1 Complete Registration Analysis
SELECT 
    c.cif_number,
    CONCAT(c.customer_first_name, ' ', c.customer_last_name) as customer_name,
    c.customer_status,
    -- Check data completeness
    CASE WHEN ca.account_number IS NOT NULL THEN 'YES' ELSE 'NO' END as has_account,
    CASE WHEN addr.cif_number IS NOT NULL THEN 'YES' ELSE 'NO' END as has_address,
    CASE WHEN contact.cif_number IS NOT NULL THEN 'YES' ELSE 'NO' END as has_contact,
    CASE WHEN ids.cif_number IS NOT NULL THEN 'YES' ELSE 'NO' END as has_ids,
    CASE WHEN funds.cif_number IS NOT NULL THEN 'YES' ELSE 'NO' END as has_funds,
    CASE WHEN emp.cif_number IS NOT NULL THEN 'YES' ELSE 'NO' END as has_employment,
    -- Calculate completeness score
    (
        (CASE WHEN ca.account_number IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN addr.cif_number IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN contact.cif_number IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN ids.cif_number IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN funds.cif_number IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN emp.cif_number IS NOT NULL THEN 1 ELSE 0 END)
    ) * 100 / 6 as completeness_percentage
FROM CUSTOMER c
LEFT JOIN CUSTOMER_ACCOUNT ca ON c.cif_number = ca.cif_number
LEFT JOIN (SELECT DISTINCT cif_number FROM CUSTOMER_ADDRESS) addr ON c.cif_number = addr.cif_number
LEFT JOIN (SELECT DISTINCT cif_number FROM CUSTOMER_CONTACT_DETAILS) contact ON c.cif_number = contact.cif_number
LEFT JOIN (SELECT DISTINCT cif_number FROM CUSTOMER_ID) ids ON c.cif_number = ids.cif_number
LEFT JOIN (SELECT DISTINCT cif_number FROM CUSTOMER_FUND_SOURCE) funds ON c.cif_number = funds.cif_number
LEFT JOIN (SELECT DISTINCT cif_number FROM CUSTOMER_EMPLOYMENT_INFORMATION) emp ON c.cif_number = emp.cif_number
ORDER BY c.cif_number DESC
LIMIT 10;

-- =================================================================
-- PART 4: CONSTRAINT VALIDATION
-- =================================================================

SELECT '6. CONSTRAINT VALIDATION' as audit_section;

-- 4.1 Customer Data Validation
SELECT 
    'Customer Username Duplicates' as validation_check,
    CASE WHEN duplicate_usernames = 0 THEN 'PASS' ELSE 'FAIL' END as status,
    duplicate_usernames as issue_count
FROM (
    SELECT COUNT(*) - COUNT(DISTINCT customer_username) as duplicate_usernames 
    FROM CUSTOMER
) username_check

UNION ALL

SELECT 
    'Customer Password Length' as validation_check,
    CASE WHEN short_passwords = 0 THEN 'PASS' ELSE 'FAIL' END as status,
    short_passwords as issue_count
FROM (
    SELECT COUNT(*) as short_passwords 
    FROM CUSTOMER 
    WHERE LENGTH(customer_password) <= 8
) password_check

UNION ALL

-- 4.2 Account Status Validation
SELECT 
    'Valid Account Statuses' as validation_check,
    CASE WHEN invalid_statuses = 0 THEN 'PASS' ELSE 'FAIL' END as status,
    invalid_statuses as issue_count
FROM (
    SELECT COUNT(*) as invalid_statuses 
    FROM ACCOUNT_DETAILS 
    WHERE account_status NOT IN ('Active', 'Dormant', 'Closed', 'Suspended', 'Pending Verification')
) status_check

UNION ALL

-- 4.3 Product Type Code Validation
SELECT 
    'Valid Product Type Codes' as validation_check,
    CASE WHEN invalid_products = 0 THEN 'PASS' ELSE 'FAIL' END as status,
    invalid_products as issue_count
FROM (
    SELECT COUNT(*) as invalid_products 
    FROM ACCOUNT_DETAILS ad
    WHERE ad.product_type_code NOT IN (SELECT product_type_code FROM CUSTOMER_PRODUCT_TYPE)
) product_check;

-- =================================================================
-- PART 5: SUMMARY STATISTICS
-- =================================================================

SELECT '7. SYSTEM STATISTICS SUMMARY' as audit_section;

SELECT 
    'Total Customers' as metric,
    COUNT(*) as value,
    NULL as percentage
FROM CUSTOMER

UNION ALL

SELECT 
    'Customers with Complete Profiles' as metric,
    COUNT(*) as value,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM CUSTOMER), 2) as percentage
FROM CUSTOMER c
WHERE EXISTS (SELECT 1 FROM CUSTOMER_ACCOUNT WHERE cif_number = c.cif_number)
  AND EXISTS (SELECT 1 FROM CUSTOMER_ADDRESS WHERE cif_number = c.cif_number)
  AND EXISTS (SELECT 1 FROM CUSTOMER_CONTACT_DETAILS WHERE cif_number = c.cif_number)
  AND EXISTS (SELECT 1 FROM CUSTOMER_ID WHERE cif_number = c.cif_number)
  AND EXISTS (SELECT 1 FROM CUSTOMER_FUND_SOURCE WHERE cif_number = c.cif_number)

UNION ALL

SELECT 
    'Active Accounts' as metric,
    COUNT(*) as value,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ACCOUNT_DETAILS), 2) as percentage
FROM ACCOUNT_DETAILS 
WHERE account_status = 'Active'

UNION ALL

SELECT 
    'Customers with Multiple IDs' as metric,
    COUNT(*) as value,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM CUSTOMER), 2) as percentage
FROM (
    SELECT cif_number 
    FROM CUSTOMER_ID 
    GROUP BY cif_number 
    HAVING COUNT(*) > 1
) multi_id_customers

UNION ALL

SELECT 
    'Customers with Aliases' as metric,
    COUNT(DISTINCT cif_number) as value,
    ROUND(COUNT(DISTINCT cif_number) * 100.0 / (SELECT COUNT(*) FROM CUSTOMER), 2) as percentage
FROM CUSTOMER_ALIAS;
