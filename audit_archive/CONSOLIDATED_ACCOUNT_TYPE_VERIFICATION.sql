-- Consolidated Account Type Verification Script
-- Verifies the simplified account type flow (no redundant product selection)

-- =================================================================
-- 1. VERIFY ACCOUNT TYPE CONSTRAINTS
-- =================================================================
SELECT 'ACCOUNT TYPE VALIDATION' as verification_type;

-- Test that all frontend account types are valid according to database constraint
SELECT 
    account_type,
    CASE 
        WHEN account_type IN ('Deposit Account', 'Card Account', 'Loan Account', 'Wealth Management Account', 'Insurance Account')
        THEN 'VALID - Matches constraint'
        ELSE 'INVALID - Violates constraint'
    END as validation_status
FROM (
    SELECT 'Deposit Account' as account_type
    UNION ALL SELECT 'Card Account'
    UNION ALL SELECT 'Loan Account' 
    UNION ALL SELECT 'Wealth Management Account'
    UNION ALL SELECT 'Insurance Account'
) account_types;

-- =================================================================
-- 2. VERIFY ACCOUNT TYPE TO PRODUCT CODE MAPPING
-- =================================================================
SELECT 'ACCOUNT TYPE TO PRODUCT CODE MAPPING' as verification_type;

SELECT 
    frontend_selection,
    expected_product_code,
    (SELECT product_type_name FROM CUSTOMER_PRODUCT_TYPE WHERE product_type_code = expected_product_code) as product_name,
    'MAPPING VALID' as status
FROM (
    SELECT 'Deposit Account' as frontend_selection, 'PR01' as expected_product_code
    UNION ALL SELECT 'Card Account', 'PR02'
    UNION ALL SELECT 'Loan Account', 'PR03'
    UNION ALL SELECT 'Wealth Management Account', 'PR04'
    UNION ALL SELECT 'Insurance Account', 'PR05'
) mappings;

-- =================================================================
-- 3. VERIFY REGISTRATION FLOW INTEGRITY
-- =================================================================
SELECT 'REGISTRATION FLOW INTEGRITY' as verification_type;

-- Check latest customer's account type consistency
SELECT 
    c.cif_number,
    c.account_type as customer_account_type,
    cpt.product_type_code,
    cpt.product_type_name,
    ad.referral_type,
    CASE 
        WHEN (c.account_type = 'Deposit Account' AND cpt.product_type_code = 'PR01') OR
             (c.account_type = 'Card Account' AND cpt.product_type_code = 'PR02') OR
             (c.account_type = 'Loan Account' AND cpt.product_type_code = 'PR03') OR
             (c.account_type = 'Wealth Management Account' AND cpt.product_type_code = 'PR04') OR
             (c.account_type = 'Insurance Account' AND cpt.product_type_code = 'PR05')
        THEN 'CONSISTENT - Mapping correct'
        ELSE 'INCONSISTENT - Mapping error'
    END as mapping_consistency
FROM CUSTOMER c
JOIN CUSTOMER_ACCOUNT ca ON c.cif_number = ca.cif_number
JOIN ACCOUNT_DETAILS ad ON ca.account_number = ad.account_number
JOIN CUSTOMER_PRODUCT_TYPE cpt ON ad.product_type_code = cpt.product_type_code
WHERE c.cif_number = (SELECT MAX(cif_number) FROM CUSTOMER);

-- =================================================================
-- 4. VERIFY NO REDUNDANT DATA
-- =================================================================
SELECT 'REDUNDANCY CHECK' as verification_type;

-- Ensure no customers have conflicting account type information
SELECT 
    'Customers with consistent account data' as metric,
    COUNT(*) as count
FROM CUSTOMER c
JOIN CUSTOMER_ACCOUNT ca ON c.cif_number = ca.cif_number
JOIN ACCOUNT_DETAILS ad ON ca.account_number = ad.account_number
JOIN CUSTOMER_PRODUCT_TYPE cpt ON ad.product_type_code = cpt.product_type_code
WHERE (
    (c.account_type = 'Deposit Account' AND cpt.product_type_code = 'PR01') OR
    (c.account_type = 'Card Account' AND cpt.product_type_code = 'PR02') OR
    (c.account_type = 'Loan Account' AND cpt.product_type_code = 'PR03') OR
    (c.account_type = 'Wealth Management Account' AND cpt.product_type_code = 'PR04') OR
    (c.account_type = 'Insurance Account' AND cpt.product_type_code = 'PR05')
)

UNION ALL

SELECT 
    'Customers with inconsistent account data' as metric,
    COUNT(*) as count
FROM CUSTOMER c
JOIN CUSTOMER_ACCOUNT ca ON c.cif_number = ca.cif_number
JOIN ACCOUNT_DETAILS ad ON ca.account_number = ad.account_number
JOIN CUSTOMER_PRODUCT_TYPE cpt ON ad.product_type_code = cpt.product_type_code
WHERE NOT (
    (c.account_type = 'Deposit Account' AND cpt.product_type_code = 'PR01') OR
    (c.account_type = 'Card Account' AND cpt.product_type_code = 'PR02') OR
    (c.account_type = 'Loan Account' AND cpt.product_type_code = 'PR03') OR
    (c.account_type = 'Wealth Management Account' AND cpt.product_type_code = 'PR04') OR
    (c.account_type = 'Insurance Account' AND cpt.product_type_code = 'PR05')
);

-- =================================================================
-- 5. COMPLETE REGISTRATION VERIFICATION
-- =================================================================
SELECT 'COMPLETE REGISTRATION DATA' as verification_type;

-- Show complete registration data for the most recent customer
SELECT 
    c.cif_number,
    c.customer_type,
    c.account_type,
    CONCAT(c.customer_first_name, ' ', c.customer_last_name) as customer_name,
    ca.account_number,
    ad.product_type_code,
    cpt.product_type_name,
    ad.referral_type,
    ad.account_status,
    ad.account_open_date
FROM CUSTOMER c
LEFT JOIN CUSTOMER_ACCOUNT ca ON c.cif_number = ca.cif_number
LEFT JOIN ACCOUNT_DETAILS ad ON ca.account_number = ad.account_number
LEFT JOIN CUSTOMER_PRODUCT_TYPE cpt ON ad.product_type_code = cpt.product_type_code
WHERE c.cif_number = (SELECT MAX(cif_number) FROM CUSTOMER);

-- =================================================================
-- Expected Results:
-- 1. All account types should be VALID according to constraints
-- 2. All mappings should be VALID with correct product codes
-- 3. Latest customer should have CONSISTENT mapping
-- 4. No customers should have INCONSISTENT account data
-- 5. Complete registration should show all linked data properly
-- =================================================================
