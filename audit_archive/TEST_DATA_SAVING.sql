-- =====================================================
-- UniVault Registration Data Verification Script
-- Use this after running a test registration
-- =====================================================

USE univault_schema;

-- Get the most recent customer registration
SET @latest_cif = (SELECT MAX(cif_number) FROM customer);

SELECT '=== LATEST CUSTOMER REGISTRATION ===' as Info;
SELECT CONCAT('Latest CIF Number: ', IFNULL(@latest_cif, 'No customers found')) as Info;

-- 1. Check Customer Basic Info
SELECT '=== 1. CUSTOMER BASIC INFO ===' as Section;
SELECT 
    cif_number,
    customer_type,
    CONCAT(customer_first_name, ' ', IFNULL(customer_middle_name, ''), ' ', customer_last_name) as full_name,
    customer_username,
    birth_date,
    gender,
    civil_status_code,
    birth_country,
    citizenship,
    residency_status,
    tax_identification_number,
    customer_status,
    customer_creation_timestamp
FROM customer 
WHERE cif_number = @latest_cif;

-- 2. Check Contact Details (Should have phone and email)
SELECT '=== 2. CONTACT DETAILS ===' as Section;
SELECT 
    cif_number,
    contact_type_code,
    contact_value,
    CASE 
        WHEN contact_type_code = 'CT01' THEN 'Mobile Phone'
        WHEN contact_type_code = 'CT02' THEN 'Landline'
        WHEN contact_type_code = 'CT03' THEN 'Email'
        ELSE 'Unknown'
    END as contact_type_desc
FROM customer_contact_details 
WHERE cif_number = @latest_cif
ORDER BY contact_type_code;

-- 3. Check Address Info
SELECT '=== 3. ADDRESS INFO ===' as Section;
SELECT 
    cif_number,
    address_type_code,
    CONCAT(
        IFNULL(address_unit, ''), ' ',
        IFNULL(address_building, ''), ' ',
        IFNULL(address_street, ''), ', ',
        IFNULL(address_barangay, ''), ', ',
        IFNULL(address_city, ''), ', ',
        IFNULL(address_province, ''), ' ',
        IFNULL(address_zip_code, '')
    ) as full_address,
    CASE 
        WHEN address_type_code = 'AD01' THEN 'Home Address'
        WHEN address_type_code = 'AD02' THEN 'Alternate Address'
        ELSE 'Unknown'
    END as address_type_desc
FROM customer_address 
WHERE cif_number = @latest_cif
ORDER BY address_type_code;

-- 4. Check Employment Information
SELECT '=== 4. EMPLOYMENT INFO ===' as Section;
SELECT 
    cif_number,
    customer_employment_id,
    employer_business_name,
    employment_status,
    position_code,
    income_monthly_gross,
    employment_start_date,
    employment_end_date
FROM customer_employment_information 
WHERE cif_number = @latest_cif;

-- 5. Check Fund Sources
SELECT '=== 5. FUND SOURCES ===' as Section;
SELECT 
    cfs.cif_number,
    cfs.fund_source_code,
    fst.fund_source as fund_source_description
FROM customer_fund_source cfs
LEFT JOIN fund_source_type fst ON cfs.fund_source_code = fst.fund_source_code
WHERE cfs.cif_number = @latest_cif
ORDER BY cfs.fund_source_code;

-- 6. Check Work Nature (if employment exists)
SELECT '=== 6. WORK NATURE ===' as Section;
SELECT 
    cwn.customer_employment_id,
    cwn.work_nature_code,
    wnt.nature_description
FROM customer_work_nature cwn
LEFT JOIN customer_employment_information cei ON cwn.customer_employment_id = cei.customer_employment_id
LEFT JOIN work_nature_type wnt ON cwn.work_nature_code = wnt.work_nature_code
WHERE cei.cif_number = @latest_cif;

-- 7. Check ID Information (Should have uploaded file paths)
SELECT '=== 7. ID INFORMATION ===' as Section;
SELECT 
    cif_number,
    id_type_code,
    id_number,
    id_storage as file_path,
    id_issue_date,
    id_expiry_date,
    id_creation_timestamp
FROM customer_id 
WHERE cif_number = @latest_cif
ORDER BY id_creation_timestamp;

-- 8. Check Alias Information (if provided)
SELECT '=== 8. ALIAS INFO ===' as Section;
SELECT 
    cif_number,
    alias_first_name,
    alias_middle_name,
    alias_last_name
FROM customer_alias 
WHERE cif_number = @latest_cif;

-- 9. Summary Check - Count records by table
SELECT '=== 9. RECORD COUNT SUMMARY ===' as Section;
SELECT 
    'customer' as table_name,
    COUNT(*) as record_count
FROM customer WHERE cif_number = @latest_cif
UNION ALL
SELECT 
    'customer_contact_details' as table_name,
    COUNT(*) as record_count
FROM customer_contact_details WHERE cif_number = @latest_cif
UNION ALL
SELECT 
    'customer_address' as table_name,
    COUNT(*) as record_count
FROM customer_address WHERE cif_number = @latest_cif
UNION ALL
SELECT 
    'customer_employment_information' as table_name,
    COUNT(*) as record_count
FROM customer_employment_information WHERE cif_number = @latest_cif
UNION ALL
SELECT 
    'customer_fund_source' as table_name,
    COUNT(*) as record_count
FROM customer_fund_source WHERE cif_number = @latest_cif
UNION ALL
SELECT 
    'customer_id' as table_name,
    COUNT(*) as record_count
FROM customer_id WHERE cif_number = @latest_cif
UNION ALL
SELECT 
    'customer_alias' as table_name,
    COUNT(*) as record_count
FROM customer_alias WHERE cif_number = @latest_cif;

-- 10. Check for Missing Data Issues
SELECT '=== 10. MISSING DATA ANALYSIS ===' as Section;

-- Check if contact details are missing
SELECT 
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM customer_contact_details WHERE cif_number = @latest_cif AND contact_type_code = 'CT01') 
        THEN '❌ MISSING: Phone number'
        ELSE '✅ OK: Phone number exists'
    END as phone_check
UNION ALL
SELECT 
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM customer_contact_details WHERE cif_number = @latest_cif AND contact_type_code = 'CT03') 
        THEN '❌ MISSING: Email address'
        ELSE '✅ OK: Email address exists'
    END as email_check
UNION ALL
SELECT 
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM customer_employment_information WHERE cif_number = @latest_cif) 
        THEN '⚠️  WARNING: No employment information'
        ELSE '✅ OK: Employment information exists'
    END as employment_check
UNION ALL
SELECT 
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM customer_fund_source WHERE cif_number = @latest_cif) 
        THEN '❌ MISSING: Fund source information'
        ELSE '✅ OK: Fund source exists'
    END as fund_source_check
UNION ALL
SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM customer_id WHERE cif_number = @latest_cif) < 4 
        THEN CONCAT('❌ MISSING: Expected 4 ID images, found ', (SELECT COUNT(*) FROM customer_id WHERE cif_number = @latest_cif))
        ELSE '✅ OK: All 4 ID images uploaded'
    END as id_images_check;

-- End of script
SELECT '=== END OF VERIFICATION ===' as Info;
