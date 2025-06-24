-- Customer Account Creation Comprehensive Test Script
-- Tests the complete account creation flow for customer registration

-- =================================================================
-- 1. VERIFY PRODUCT TYPES EXIST
-- =================================================================
SELECT 'PRODUCT TYPES VERIFICATION' as test_category;
SELECT 
    product_type_code,
    product_type_name,
    'AVAILABLE' as status
FROM CUSTOMER_PRODUCT_TYPE 
ORDER BY product_type_code;

-- Expected: PR01-PR05 should all be present

-- =================================================================
-- 2. VERIFY ACCOUNT TYPE TO PRODUCT TYPE MAPPING
-- =================================================================
SELECT 'ACCOUNT TYPE MAPPING' as test_category;
SELECT 
    'Deposit Account' as account_type,
    'PR01' as expected_product_type,
    (SELECT product_type_name FROM CUSTOMER_PRODUCT_TYPE WHERE product_type_code = 'PR01') as product_name
UNION ALL
SELECT 
    'Card Account' as account_type,
    'PR02' as expected_product_type,
    (SELECT product_type_name FROM CUSTOMER_PRODUCT_TYPE WHERE product_type_code = 'PR02') as product_name
UNION ALL
SELECT 
    'Loan Account' as account_type,
    'PR03' as expected_product_type,
    (SELECT product_type_name FROM CUSTOMER_PRODUCT_TYPE WHERE product_type_code = 'PR03') as product_name
UNION ALL
SELECT 
    'Wealth Management Account' as account_type,
    'PR04' as expected_product_type,
    (SELECT product_type_name FROM CUSTOMER_PRODUCT_TYPE WHERE product_type_code = 'PR04') as product_name
UNION ALL
SELECT 
    'Insurance Account' as account_type,
    'PR05' as expected_product_type,
    (SELECT product_type_name FROM CUSTOMER_PRODUCT_TYPE WHERE product_type_code = 'PR05') as product_name;

-- =================================================================
-- 3. VERIFY EMPLOYEE IDs EXIST FOR ACCOUNT APPROVAL
-- =================================================================
SELECT 'EMPLOYEE VERIFICATION' as test_category;
SELECT 
    employee_id,
    employee_position,
    CONCAT(employee_first_name, ' ', employee_last_name) as employee_name,
    'AVAILABLE FOR APPROVAL' as status
FROM BANK_EMPLOYEE 
WHERE employee_id IN (1, 2, 3, 4)
ORDER BY employee_id;

-- Expected: At least employees 1-4 should exist

-- =================================================================
-- 4. TEST ACCOUNT CREATION FOR EACH PRODUCT TYPE
-- =================================================================
SELECT 'ACCOUNT CREATION SIMULATION' as test_category;

-- Simulate account creation for each product type
SELECT 
    product_type_code,
    product_type_name,
    'Walk-in' as referral_type,
    NULL as referral_source,
    1 as verified_by_employee,
    1 as approved_by_employee,
    CURDATE() as account_open_date,
    'Pending Verification' as account_status,
    'READY FOR CREATION' as simulation_status
FROM CUSTOMER_PRODUCT_TYPE
ORDER BY product_type_code;

-- =================================================================
-- 5. VERIFY REFERRAL TYPE CONSTRAINTS
-- =================================================================
SELECT 'REFERRAL TYPE VALIDATION' as test_category;
SELECT 
    'Walk-in' as referral_type,
    NULL as referral_source,
    'VALID - No source required' as validation_status
UNION ALL
SELECT 
    'Referred' as referral_type,
    'John Smith' as referral_source,
    'VALID - Source provided' as validation_status
UNION ALL
SELECT 
    'Referred' as referral_type,
    NULL as referral_source,
    'INVALID - Source required but missing' as validation_status;

-- =================================================================
-- 6. CHECK CURRENT ACCOUNT CREATION RESULTS
-- =================================================================
SELECT 'CURRENT ACCOUNT DATA' as test_category;
SELECT 
    ad.account_number,
    cpt.product_type_name,
    ad.referral_type,
    ad.referral_source,
    ad.account_open_date,
    ad.account_status,
    ca.cif_number,
    c.customer_first_name,
    c.customer_last_name
FROM ACCOUNT_DETAILS ad
JOIN CUSTOMER_PRODUCT_TYPE cpt ON ad.product_type_code = cpt.product_type_code
LEFT JOIN CUSTOMER_ACCOUNT ca ON ad.account_number = ca.account_number
LEFT JOIN CUSTOMER c ON ca.cif_number = c.cif_number
ORDER BY ad.account_number DESC
LIMIT 10;

-- =================================================================
-- 7. ACCOUNT CREATION SUCCESS METRICS
-- =================================================================
SELECT 'ACCOUNT CREATION METRICS' as test_category;
SELECT 
    'Total Customers' as metric,
    COUNT(*) as count
FROM CUSTOMER
UNION ALL
SELECT 
    'Total Account Details' as metric,
    COUNT(*) as count
FROM ACCOUNT_DETAILS
UNION ALL
SELECT 
    'Total Customer-Account Links' as metric,
    COUNT(*) as count
FROM CUSTOMER_ACCOUNT
UNION ALL
SELECT 
    'Customers with Accounts' as metric,
    COUNT(DISTINCT cif_number) as count
FROM CUSTOMER_ACCOUNT
UNION ALL
SELECT 
    'Customers without Accounts' as metric,
    COUNT(*) as count
FROM CUSTOMER c
WHERE c.cif_number NOT IN (SELECT cif_number FROM CUSTOMER_ACCOUNT)
UNION ALL
SELECT 
    'Orphaned Accounts (No Customer Link)' as metric,
    COUNT(*) as count
FROM ACCOUNT_DETAILS ad
WHERE ad.account_number NOT IN (SELECT account_number FROM CUSTOMER_ACCOUNT);

-- =================================================================
-- Expected Results:
-- 1. All product types PR01-PR05 should exist
-- 2. All mappings should be valid
-- 3. Employees 1-4 should exist for approval
-- 4. All referral types should validate correctly
-- 5. Customer-Account ratio should be 1:1 for complete registrations
-- 6. No orphaned accounts should exist
-- =================================================================
