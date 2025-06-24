-- =============================================
-- COMPLETE SYSTEM VALIDATION SCRIPT
-- =============================================
-- Purpose: Comprehensive validation after database cleanup and backend fixes
-- Date: 2025-06-25
-- Run this after completing a registration to verify all data is stored

USE univault_schema;

-- =============================================
-- STEP 1: RUN DATABASE CLEANUP FIRST
-- =============================================
-- Make sure to run DATABASE_CLEANUP_AND_REALIGNMENT.sql first!

-- =============================================
-- STEP 2: VALIDATE LATEST CUSTOMER REGISTRATION
-- =============================================

-- Get the latest customer for testing
SET @latest_cif = (SELECT MAX(cif_number) FROM CUSTOMER);

SELECT 
    '=== LATEST CUSTOMER BASIC INFO ===' as section,
    @latest_cif as cif_number,
    customer_first_name,
    customer_last_name,
    customer_username,
    customer_status,
    created_at
FROM CUSTOMER 
WHERE cif_number = @latest_cif;

-- =============================================
-- STEP 3: VALIDATE ALL ADDRESS RECORDS
-- =============================================

SELECT 
    '=== ADDRESS VALIDATION ===' as section,
    'Home Address' as address_type,
    ca.address_barangay,
    ca.address_city,
    ca.address_province,
    ca.address_country,
    ca.address_zip_code
FROM CUSTOMER_ADDRESS ca
WHERE ca.cif_number = @latest_cif AND ca.address_type_code = 'AD01'

UNION ALL

SELECT 
    '=== ADDRESS VALIDATION ===' as section,
    'Work Address' as address_type,
    ca.address_barangay,
    ca.address_city,
    ca.address_province,
    ca.address_country,
    ca.address_zip_code
FROM CUSTOMER_ADDRESS ca
WHERE ca.cif_number = @latest_cif AND ca.address_type_code = 'AD03'

UNION ALL

SELECT 
    '=== ADDRESS VALIDATION ===' as section,
    'Alternate Address' as address_type,
    ca.address_barangay,
    ca.address_city,
    ca.address_province,
    ca.address_country,
    ca.address_zip_code
FROM CUSTOMER_ADDRESS ca
WHERE ca.cif_number = @latest_cif AND ca.address_type_code = 'AD02';

-- =============================================
-- STEP 4: VALIDATE ALL CONTACT RECORDS
-- =============================================

SELECT 
    '=== CONTACT VALIDATION ===' as section,
    ct.contact_type_description,
    ccd.contact_value,
    CASE 
        WHEN ct.contact_type_code = 'CT01' THEN 'Mobile Phone'
        WHEN ct.contact_type_code = 'CT02' THEN 'Landline'
        WHEN ct.contact_type_code = 'CT04' THEN 'Personal Email'
        ELSE 'Other'
    END as contact_category
FROM CUSTOMER_CONTACT_DETAILS ccd
JOIN CONTACT_TYPE ct ON ccd.contact_type_code = ct.contact_type_code
WHERE ccd.cif_number = @latest_cif
ORDER BY ct.contact_type_code;

-- =============================================
-- STEP 5: VALIDATE BOTH ID DOCUMENTS
-- =============================================

SELECT 
    '=== ID DOCUMENT VALIDATION ===' as section,
    CONCAT('ID ', ROW_NUMBER() OVER (ORDER BY ci.id_type_code)) as id_sequence,
    it.id_description,
    ci.id_number,
    ci.id_issue_date,
    ci.id_expiry_date,
    CASE 
        WHEN ci.id_storage IS NOT NULL THEN 'File Path Stored'
        ELSE 'No File Path'
    END as file_status
FROM CUSTOMER_ID ci
JOIN ID_TYPE it ON ci.id_type_code = it.id_type_code
WHERE ci.cif_number = @latest_cif
ORDER BY ci.id_type_code;

-- =============================================
-- STEP 6: VALIDATE EMPLOYMENT INFORMATION
-- =============================================

SELECT 
    '=== EMPLOYMENT VALIDATION ===' as section,
    cei.employer_business_name,
    ep.job_title,
    ep.employment_type,
    cei.employment_start_date,
    cei.income_monthly_gross,
    cei.employment_status
FROM CUSTOMER_EMPLOYMENT_INFORMATION cei
JOIN EMPLOYMENT_POSITION ep ON cei.position_code = ep.position_code
WHERE cei.cif_number = @latest_cif;

-- =============================================
-- STEP 7: VALIDATE FUND SOURCES
-- =============================================

SELECT 
    '=== FUND SOURCE VALIDATION ===' as section,
    fst.fund_source_code,
    fst.fund_source
FROM CUSTOMER_FUND_SOURCE cfs
JOIN FUND_SOURCE_TYPE fst ON cfs.fund_source_code = fst.fund_source_code
WHERE cfs.cif_number = @latest_cif;

-- =============================================
-- STEP 8: VALIDATE ALIAS INFORMATION (IF ANY)
-- =============================================

SELECT 
    '=== ALIAS VALIDATION ===' as section,
    ca.alias_first_name,
    ca.alias_last_name,
    ca.alias_middle_name,
    ca.alias_suffix_name,
    CASE 
        WHEN ad.alias_doc_id IS NOT NULL THEN 'Has Documentation'
        ELSE 'No Documentation'
    END as documentation_status
FROM CUSTOMER_ALIAS ca
LEFT JOIN ALIAS_DOCUMENTATION ad ON ca.customer_alias_id = ad.customer_alias_id
WHERE ca.cif_number = @latest_cif;

-- =============================================
-- STEP 9: COMPLETENESS ASSESSMENT
-- =============================================

SELECT 
    '=== REGISTRATION COMPLETENESS ASSESSMENT ===' as section,
    c.cif_number,
    c.customer_first_name,
    c.customer_last_name,
    
    -- Required records check
    CASE WHEN home_addr.address_count > 0 THEN '✅' ELSE '❌' END as has_home_address,
    CASE WHEN contact.contact_count >= 2 THEN '✅' ELSE '⚠️' END as has_contacts,
    CASE WHEN id_docs.id_count >= 2 THEN '✅' ELSE '❌' END as has_both_ids,
    CASE WHEN employment.emp_count > 0 THEN '✅' ELSE '⚠️' END as has_employment,
    CASE WHEN fund_source.fund_count > 0 THEN '✅' ELSE '❌' END as has_fund_source,
    
    -- Optional records check
    CASE WHEN work_addr.work_count > 0 THEN '✅' ELSE '-' END as has_work_address,
    CASE WHEN alias.alias_count > 0 THEN '✅' ELSE '-' END as has_alias,
    
    -- Overall status
    CASE 
        WHEN home_addr.address_count > 0 
         AND contact.contact_count >= 2 
         AND id_docs.id_count >= 2 
         AND fund_source.fund_count > 0 
        THEN '✅ COMPLETE'
        ELSE '⚠️ INCOMPLETE'
    END as overall_status

FROM CUSTOMER c
LEFT JOIN (
    SELECT cif_number, COUNT(*) as address_count 
    FROM CUSTOMER_ADDRESS 
    WHERE address_type_code = 'AD01' AND cif_number = @latest_cif
    GROUP BY cif_number
) home_addr ON c.cif_number = home_addr.cif_number
LEFT JOIN (
    SELECT cif_number, COUNT(*) as work_count 
    FROM CUSTOMER_ADDRESS 
    WHERE address_type_code = 'AD03' AND cif_number = @latest_cif
    GROUP BY cif_number
) work_addr ON c.cif_number = work_addr.cif_number
LEFT JOIN (
    SELECT cif_number, COUNT(*) as contact_count 
    FROM CUSTOMER_CONTACT_DETAILS 
    WHERE cif_number = @latest_cif
    GROUP BY cif_number
) contact ON c.cif_number = contact.cif_number
LEFT JOIN (
    SELECT cif_number, COUNT(*) as id_count 
    FROM CUSTOMER_ID 
    WHERE cif_number = @latest_cif
    GROUP BY cif_number
) id_docs ON c.cif_number = id_docs.cif_number
LEFT JOIN (
    SELECT cif_number, COUNT(*) as emp_count 
    FROM CUSTOMER_EMPLOYMENT_INFORMATION 
    WHERE cif_number = @latest_cif
    GROUP BY cif_number
) employment ON c.cif_number = employment.cif_number
LEFT JOIN (
    SELECT cif_number, COUNT(*) as fund_count 
    FROM CUSTOMER_FUND_SOURCE 
    WHERE cif_number = @latest_cif
    GROUP BY cif_number
) fund_source ON c.cif_number = fund_source.cif_number
LEFT JOIN (
    SELECT cif_number, COUNT(*) as alias_count 
    FROM CUSTOMER_ALIAS 
    WHERE cif_number = @latest_cif
    GROUP BY cif_number
) alias ON c.cif_number = alias.cif_number
WHERE c.cif_number = @latest_cif;

-- =============================================
-- STEP 10: RECORD COUNT SUMMARY
-- =============================================

SELECT 
    '=== RECORD COUNT SUMMARY ===' as section,
    'Customer Records' as record_type,
    COUNT(*) as total_count
FROM CUSTOMER
WHERE cif_number = @latest_cif

UNION ALL
SELECT 
    '=== RECORD COUNT SUMMARY ===' as section,
    'Address Records' as record_type,
    COUNT(*) as total_count
FROM CUSTOMER_ADDRESS
WHERE cif_number = @latest_cif

UNION ALL
SELECT 
    '=== RECORD COUNT SUMMARY ===' as section,
    'Contact Records' as record_type,
    COUNT(*) as total_count
FROM CUSTOMER_CONTACT_DETAILS
WHERE cif_number = @latest_cif

UNION ALL
SELECT 
    '=== RECORD COUNT SUMMARY ===' as section,
    'ID Document Records' as record_type,
    COUNT(*) as total_count
FROM CUSTOMER_ID
WHERE cif_number = @latest_cif

UNION ALL
SELECT 
    '=== RECORD COUNT SUMMARY ===' as section,
    'Employment Records' as record_type,
    COUNT(*) as total_count
FROM CUSTOMER_EMPLOYMENT_INFORMATION
WHERE cif_number = @latest_cif

UNION ALL
SELECT 
    '=== RECORD COUNT SUMMARY ===' as section,
    'Fund Source Records' as record_type,
    COUNT(*) as total_count
FROM CUSTOMER_FUND_SOURCE
WHERE cif_number = @latest_cif;

-- =============================================
-- STEP 11: ISSUES IDENTIFICATION
-- =============================================

SELECT 
    '=== POTENTIAL ISSUES ===' as section,
    CASE 
        WHEN (SELECT COUNT(*) FROM CUSTOMER_ADDRESS WHERE cif_number = @latest_cif AND address_type_code = 'AD01') = 0 
        THEN '❌ Missing home address'
        
        WHEN (SELECT COUNT(*) FROM CUSTOMER_CONTACT_DETAILS WHERE cif_number = @latest_cif) < 2 
        THEN '⚠️ Less than 2 contact methods'
        
        WHEN (SELECT COUNT(*) FROM CUSTOMER_ID WHERE cif_number = @latest_cif) < 2 
        THEN '❌ Less than 2 ID documents'
        
        WHEN (SELECT COUNT(*) FROM CUSTOMER_FUND_SOURCE WHERE cif_number = @latest_cif) = 0 
        THEN '❌ No fund source specified'
        
        ELSE '✅ No critical issues found'
    END as issue_description;

-- =============================================
-- STEP 12: SYSTEM SUMMARY
-- =============================================

SELECT 
    '=== FINAL SYSTEM VALIDATION SUMMARY ===' as section,
    NOW() as validation_time,
    @latest_cif as tested_cif,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM registration_completeness 
            WHERE cif_number = @latest_cif 
              AND has_home_address = 1 
              AND has_mobile = 1 
              AND has_email = 1 
              AND id_count >= 2 
              AND fund_source_count >= 1
        ) THEN '✅ REGISTRATION SYSTEM FULLY FUNCTIONAL'
        ELSE '⚠️ REGISTRATION SYSTEM NEEDS ATTENTION'
    END as system_status;
