-- QUICK DATABASE VERIFICATION SCRIPT
-- Run this after completing a registration to verify data storage

USE univault_schema;

-- 1. Get the most recent customer registration
SELECT 
    'LATEST CUSTOMER' as Check_Type,
    cif_number,
    customer_first_name,
    customer_last_name,
    customer_username,
    customer_status,
    created_at
FROM CUSTOMER 
ORDER BY cif_number DESC 
LIMIT 1;

-- 2. Set the CIF number for subsequent queries (replace with actual CIF)
SET @latest_cif = (SELECT MAX(cif_number) FROM CUSTOMER);

-- 3. Check address records
SELECT 
    'ADDRESS CHECK' as Check_Type,
    ca.address_type_code,
    at.address_type,
    ca.address_barangay,
    ca.address_city,
    ca.address_province,
    ca.address_country
FROM CUSTOMER_ADDRESS ca
JOIN ADDRESS_TYPE at ON ca.address_type_code = at.address_type_code
WHERE ca.cif_number = @latest_cif;

-- 4. Check contact details
SELECT 
    'CONTACT CHECK' as Check_Type,
    ccd.contact_type_code,
    ct.contact_type_description,
    ccd.contact_value
FROM CUSTOMER_CONTACT_DETAILS ccd
JOIN CONTACT_TYPE ct ON ccd.contact_type_code = ct.contact_type_code
WHERE ccd.cif_number = @latest_cif;

-- 5. Check employment information
SELECT 
    'EMPLOYMENT CHECK' as Check_Type,
    cei.employer_business_name,
    ep.job_title,
    cei.employment_start_date,
    cei.income_monthly_gross
FROM CUSTOMER_EMPLOYMENT_INFORMATION cei
JOIN EMPLOYMENT_POSITION ep ON cei.position_code = ep.position_code
WHERE cei.cif_number = @latest_cif;

-- 6. Check fund sources
SELECT 
    'FUND SOURCE CHECK' as Check_Type,
    cfs.fund_source_code,
    fst.fund_source
FROM CUSTOMER_FUND_SOURCE cfs
JOIN FUND_SOURCE_TYPE fst ON cfs.fund_source_code = fst.fund_source_code
WHERE cfs.cif_number = @latest_cif;

-- 7. Check ID documents
SELECT 
    'ID DOCUMENT CHECK' as Check_Type,
    ci.id_type_code,
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
WHERE ci.cif_number = @latest_cif;

-- 8. Count all related records
SELECT 
    'RECORD COUNT SUMMARY' as Check_Type,
    COUNT(DISTINCT ca.cif_number) as address_records,
    COUNT(DISTINCT ccd.cif_number) as contact_records,
    COUNT(DISTINCT cei.cif_number) as employment_records,
    COUNT(DISTINCT cfs.cif_number) as fund_source_records,
    COUNT(DISTINCT ci.cif_number) as id_records
FROM CUSTOMER c
LEFT JOIN CUSTOMER_ADDRESS ca ON c.cif_number = ca.cif_number
LEFT JOIN CUSTOMER_CONTACT_DETAILS ccd ON c.cif_number = ccd.cif_number
LEFT JOIN CUSTOMER_EMPLOYMENT_INFORMATION cei ON c.cif_number = cei.cif_number
LEFT JOIN CUSTOMER_FUND_SOURCE cfs ON c.cif_number = cfs.cif_number
LEFT JOIN CUSTOMER_ID ci ON c.cif_number = ci.cif_number
WHERE c.cif_number = @latest_cif;

-- 9. Check for any constraint violations or missing data
SELECT 
    'DATA INTEGRITY CHECK' as Check_Type,
    CASE 
        WHEN c.customer_first_name IS NULL OR c.customer_first_name = '' THEN 'FAIL: Missing first name'
        WHEN c.customer_last_name IS NULL OR c.customer_last_name = '' THEN 'FAIL: Missing last name'
        WHEN c.birth_date IS NULL THEN 'FAIL: Missing birth date'
        WHEN c.customer_username IS NULL OR c.customer_username = '' THEN 'FAIL: Missing username'
        WHEN c.customer_password IS NULL OR c.customer_password = '' THEN 'FAIL: Missing password'
        WHEN NOT EXISTS (SELECT 1 FROM CUSTOMER_ADDRESS WHERE cif_number = c.cif_number) THEN 'FAIL: No address records'
        WHEN NOT EXISTS (SELECT 1 FROM CUSTOMER_FUND_SOURCE WHERE cif_number = c.cif_number) THEN 'FAIL: No fund source'
        ELSE 'PASS: All required data present'
    END as integrity_status
FROM CUSTOMER c
WHERE c.cif_number = @latest_cif;

SELECT cif_number, customer_first_name, customer_last_name, customer_username, customer_status
FROM CUSTOMER 
ORDER BY cif_number DESC

SELECT ca.*, at.address_type 
FROM CUSTOMER_ADDRESS ca
JOIN ADDRESS_TYPE at ON ca.address_type_code = at.address_type_code
WHERE ca.cif_number = (SELECT MAX(cif_number) FROM CUSTOMER);

SELECT ccd.*, ct.contact_type_description
FROM CUSTOMER_CONTACT_DETAILS ccd
JOIN CONTACT_TYPE ct ON ccd.contact_type_code = ct.contact_type_code
WHERE ccd.cif_number = (SELECT MAX(cif_number) FROM CUSTOMER);

SELECT cei.*, ep.job_title, ep.employment_type
FROM CUSTOMER_EMPLOYMENT_INFORMATION cei
JOIN EMPLOYMENT_POSITION ep ON cei.position_code = ep.position_code
WHERE cei.cif_number = (SELECT MAX(cif_number) FROM CUSTOMER);

SELECT cfs.*, fst.fund_source
FROM CUSTOMER_FUND_SOURCE cfs
JOIN FUND_SOURCE_TYPE fst ON cfs.fund_source_code = fst.fund_source_code
WHERE cfs.cif_number = (SELECT MAX(cif_number) FROM CUSTOMER);

SELECT ci.*, it.id_description
FROM CUSTOMER_ID ci
JOIN ID_TYPE it ON ci.id_type_code = it.id_type_code
WHERE ci.cif_number = (SELECT MAX(cif_number) FROM CUSTOMER);

SELECT * FROM CUSTOMER_ALIAS;
SELECT * FROM ALIAS_DOCUMENTATION;
SELECT * FROM CUSTOMER;
SELECT * FROM ACCOUNT_DETAILS;
SELECT * FROM CUSTOMER_CONTACT_DETAILS;