-- Comprehensive Registration Data Verification Script
-- This script verifies that ALL customer registration data flows properly from Frontend → Backend → Database

-- =================================================================
-- 1. CUSTOMER BASIC DATA VERIFICATION
-- =================================================================
SELECT 'CUSTOMER BASIC DATA' as verification_type;
SELECT 
    cif_number, 
    customer_type, 
    account_type,
    customer_last_name, 
    customer_first_name, 
    customer_username,
    birth_date,
    gender,
    civil_status_code,
    customer_status
FROM CUSTOMER 
WHERE cif_number = (SELECT MAX(cif_number) FROM CUSTOMER)
LIMIT 1;

-- =================================================================
-- 2. CUSTOMER CONTACT DETAILS VERIFICATION (Including Work Email)
-- =================================================================
SELECT 'CUSTOMER CONTACT DETAILS' as verification_type;
SELECT 
    ccd.cif_number,
    ct.contact_type_description,
    ccd.contact_value
FROM CUSTOMER_CONTACT_DETAILS ccd
JOIN CONTACT_TYPE ct ON ccd.contact_type_code = ct.contact_type_code
WHERE ccd.cif_number = (SELECT MAX(cif_number) FROM CUSTOMER)
ORDER BY ct.contact_type_code;

-- Expected: Personal Email (CT04), Work Email (CT05), Mobile (CT01), Landline (CT02)

-- =================================================================
-- 3. MULTIPLE CUSTOMER IDs VERIFICATION
-- =================================================================
SELECT 'CUSTOMER IDs' as verification_type;
SELECT 
    ci.cif_number,
    it.id_type_description,
    ci.id_number,
    ci.id_issue_date,
    ci.id_expiry_date,
    ci.id_storage
FROM CUSTOMER_ID ci
JOIN ID_TYPE it ON ci.id_type_code = it.id_type_code
WHERE ci.cif_number = (SELECT MAX(cif_number) FROM CUSTOMER)
ORDER BY ci.id_type_code;

-- Expected: Both ID1 and ID2 should be present

-- =================================================================
-- 4. MULTIPLE FUND SOURCES VERIFICATION
-- =================================================================
SELECT 'FUND SOURCES' as verification_type;
SELECT 
    cfs.cif_number,
    fst.fund_source_description,
    cfs.fund_source_code
FROM CUSTOMER_FUND_SOURCE cfs
JOIN FUND_SOURCE_TYPE fst ON cfs.fund_source_code = fst.fund_source_code
WHERE cfs.cif_number = (SELECT MAX(cif_number) FROM CUSTOMER)
ORDER BY cfs.fund_source_code;

-- Expected: Multiple rows if multiple fund sources selected

-- =================================================================
-- 5. ALIAS AND ALIAS DOCUMENTATION VERIFICATION
-- =================================================================
SELECT 'ALIAS DATA' as verification_type;
SELECT 
    ca.cif_number,
    ca.alias_first_name,
    ca.alias_last_name,
    ca.alias_middle_name,
    ca.alias_suffix_name,
    ca.customer_alias_id
FROM CUSTOMER_ALIAS ca
WHERE ca.cif_number = (SELECT MAX(cif_number) FROM CUSTOMER);

SELECT 'ALIAS DOCUMENTATION' as verification_type;
SELECT 
    ad.customer_alias_id,
    adt.alias_doc_description,
    ad.alias_doc_number,
    ad.alias_doc_issue_date,
    ad.alias_doc_expiry_date,
    ad.alias_doc_storage
FROM ALIAS_DOCUMENTATION ad
JOIN ALIAS_DOCUMENTATION_TYPE adt ON ad.alias_doc_type_code = adt.alias_doc_type_code
WHERE ad.customer_alias_id IN (
    SELECT customer_alias_id FROM CUSTOMER_ALIAS 
    WHERE cif_number = (SELECT MAX(cif_number) FROM CUSTOMER)
);

-- =================================================================
-- 6. CUSTOMER ACCOUNT AND ACCOUNT DETAILS VERIFICATION
-- =================================================================
SELECT 'CUSTOMER ACCOUNT RELATIONSHIP' as verification_type;
SELECT 
    ca.cif_number,
    ca.account_number
FROM CUSTOMER_ACCOUNT ca
WHERE ca.cif_number = (SELECT MAX(cif_number) FROM CUSTOMER);

SELECT 'ACCOUNT DETAILS' as verification_type;
SELECT 
    ad.account_number,
    cpt.product_type_name,
    ad.referral_type,
    ad.referral_source,
    ad.account_open_date,
    ad.account_status,
    ad.verified_by_employee,
    ad.approved_by_employee
FROM ACCOUNT_DETAILS ad
JOIN CUSTOMER_PRODUCT_TYPE cpt ON ad.product_type_code = cpt.product_type_code
WHERE ad.account_number IN (
    SELECT account_number FROM CUSTOMER_ACCOUNT 
    WHERE cif_number = (SELECT MAX(cif_number) FROM CUSTOMER)
);

-- =================================================================
-- 7. EMPLOYMENT INFORMATION VERIFICATION
-- =================================================================
SELECT 'EMPLOYMENT INFORMATION' as verification_type;
SELECT 
    cei.cif_number,
    cei.employer_business_name,
    cei.employment_start_date,
    cei.employment_status,
    ep.position_description,
    cei.income_monthly_gross
FROM CUSTOMER_EMPLOYMENT_INFORMATION cei
JOIN EMPLOYMENT_POSITION ep ON cei.position_code = ep.position_code
WHERE cei.cif_number = (SELECT MAX(cif_number) FROM CUSTOMER);

-- =================================================================
-- 8. WORK NATURE VERIFICATION
-- =================================================================
SELECT 'WORK NATURE' as verification_type;
SELECT 
    cwn.customer_employment_id,
    wnt.nature_description
FROM CUSTOMER_WORK_NATURE cwn
JOIN WORK_NATURE_TYPE wnt ON cwn.work_nature_code = wnt.work_nature_code
WHERE cwn.customer_employment_id IN (
    SELECT customer_employment_id FROM CUSTOMER_EMPLOYMENT_INFORMATION 
    WHERE cif_number = (SELECT MAX(cif_number) FROM CUSTOMER)
);

-- =================================================================
-- 9. ADDRESS INFORMATION VERIFICATION
-- =================================================================
SELECT 'CUSTOMER ADDRESSES' as verification_type;
SELECT 
    ca.cif_number,
    at.address_type_description,
    ca.address_unit,
    ca.address_building,
    ca.address_street,
    ca.address_barangay,
    ca.address_city,
    ca.address_province,
    ca.address_zip_code
FROM CUSTOMER_ADDRESS ca
JOIN ADDRESS_TYPE at ON ca.address_type_code = at.address_type_code
WHERE ca.cif_number = (SELECT MAX(cif_number) FROM CUSTOMER)
ORDER BY ca.address_type_code;

-- =================================================================
-- 10. DATA COMPLETENESS SUMMARY
-- =================================================================
SELECT 'DATA COMPLETENESS SUMMARY' as verification_type;

SELECT 
    'Total Customers' as metric,
    COUNT(*) as count
FROM CUSTOMER
UNION ALL
SELECT 
    'Customers with Work Email (CT05)' as metric,
    COUNT(DISTINCT cif_number) as count
FROM CUSTOMER_CONTACT_DETAILS 
WHERE contact_type_code = 'CT05'
UNION ALL
SELECT 
    'Customers with Multiple IDs' as metric,
    COUNT(*) as count
FROM (
    SELECT cif_number, COUNT(*) as id_count
    FROM CUSTOMER_ID 
    GROUP BY cif_number 
    HAVING COUNT(*) >= 2
) multi_ids
UNION ALL
SELECT 
    'Customers with Multiple Fund Sources' as metric,
    COUNT(*) as count
FROM (
    SELECT cif_number, COUNT(*) as fund_count
    FROM CUSTOMER_FUND_SOURCE 
    GROUP BY cif_number 
    HAVING COUNT(*) >= 2
) multi_funds
UNION ALL
SELECT 
    'Customers with Aliases' as metric,
    COUNT(DISTINCT cif_number) as count
FROM CUSTOMER_ALIAS
UNION ALL
SELECT 
    'Customers with Customer Accounts' as metric,
    COUNT(DISTINCT cif_number) as count
FROM CUSTOMER_ACCOUNT
UNION ALL
SELECT 
    'Total Account Details Records' as metric,
    COUNT(*) as count
FROM ACCOUNT_DETAILS;

-- =================================================================
-- Expected Results for a Complete Registration:
-- 1. Customer basic data: 1 record with all required fields
-- 2. Contact details: 2-4 records (personal email, work email, mobile, landline)
-- 3. Customer IDs: 2 records (ID1 and ID2)
-- 4. Fund sources: 1+ records (based on user selection)
-- 5. Alias: 0-1 record (if alias provided)
-- 6. Alias documentation: 0+ records (if alias provided)
-- 7. Customer account: 1 record linking customer to account
-- 8. Account details: 1 record with account information
-- 9. Employment: 1 record with job information
-- 10. Work nature: 0+ records (based on employment type)
-- 11. Addresses: 1+ records (home address, possibly work address)
-- =================================================================
