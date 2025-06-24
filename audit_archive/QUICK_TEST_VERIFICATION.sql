-- =====================================================
-- QUICK VERIFICATION SCRIPT FOR UNIVAULT REGISTRATION
-- Run this after completing a test registration
-- =====================================================

USE univault_schema;

-- Quick System Status Check
SELECT '🏠 LOCALHOST SYSTEM VERIFICATION' as status;
SELECT CURRENT_TIMESTAMP as test_time;

-- 1. Check if any customers exist
SELECT 
    '📊 CUSTOMER COUNT' as info,
    COUNT(*) as total_customers,
    MAX(cif_number) as latest_cif_number
FROM customer;

-- 2. Get latest customer details
SELECT '👤 LATEST CUSTOMER REGISTRATION' as info;
SELECT 
    cif_number,
    customer_type,
    CONCAT(customer_first_name, ' ', 
           IFNULL(customer_middle_name, ''), ' ', 
           customer_last_name) as full_name,
    customer_username,
    birth_date,
    gender,
    customer_creation_timestamp
FROM customer 
ORDER BY customer_creation_timestamp DESC 
LIMIT 1;

-- 3. Verify data completeness for latest customer
SET @latest = (SELECT MAX(cif_number) FROM customer);

SELECT '📋 DATA COMPLETENESS CHECK' as info;
SELECT 
    CONCAT('Customer CIF: ', @latest) as customer_info,
    CASE WHEN EXISTS (SELECT 1 FROM customer_address WHERE cif_number = @latest) 
         THEN '✅ Address Saved' 
         ELSE '❌ No Address' END as address_status,
    CASE WHEN EXISTS (SELECT 1 FROM customer_contact_details WHERE cif_number = @latest) 
         THEN '✅ Contact Saved' 
         ELSE '❌ No Contact' END as contact_status,
    CASE WHEN EXISTS (SELECT 1 FROM customer_id WHERE cif_number = @latest) 
         THEN CONCAT('✅ ', (SELECT COUNT(*) FROM customer_id WHERE cif_number = @latest), ' ID(s) Saved')
         ELSE '❌ No IDs' END as id_status,
    CASE WHEN EXISTS (SELECT 1 FROM customer_employment_information WHERE cif_number = @latest) 
         THEN '✅ Employment Saved' 
         ELSE '⚠️ No Employment' END as employment_status;

-- 4. Show contact details (phone & email)
SELECT '📞 CONTACT INFORMATION' as info;
SELECT 
    cd.contact_type_code,
    cd.contact_value,
    CASE cd.contact_type_code 
        WHEN 'CT01' THEN 'Mobile Phone'
        WHEN 'CT02' THEN 'Landline'
        WHEN 'CT03' THEN 'Email Address'
        ELSE 'Other Contact'
    END as contact_type_description
FROM customer_contact_details cd
WHERE cd.cif_number = @latest;

-- 5. Show uploaded files
SELECT '📁 UPLOADED FILES' as info;
SELECT 
    id_type_code,
    id_number,
    id_storage as file_path,
    CASE 
        WHEN id_storage IS NOT NULL AND id_storage != '' 
        THEN '✅ File Uploaded'
        ELSE '❌ No File'
    END as upload_status
FROM customer_id 
WHERE cif_number = @latest
ORDER BY id_creation_timestamp;

-- 6. Employment & Financial Information
SELECT '💼 EMPLOYMENT & FINANCIAL DATA' as info;
SELECT 
    employer_business_name,
    position_code,
    income_monthly_gross,
    employment_status
FROM customer_employment_information 
WHERE cif_number = @latest;

-- Show fund sources
SELECT 
    fs.fund_source_code,
    IFNULL(fst.fund_source, 'Unknown Source') as fund_source_description
FROM customer_fund_source fs
LEFT JOIN fund_source_type fst ON fs.fund_source_code = fst.fund_source_code
WHERE fs.cif_number = @latest;

-- 7. System Health Summary
SELECT '🏥 SYSTEM HEALTH SUMMARY' as info;
SELECT 
    CONCAT('Total Customers: ', (SELECT COUNT(*) FROM customer)) as customer_count,
    CONCAT('Total Addresses: ', (SELECT COUNT(*) FROM customer_address)) as address_count,
    CONCAT('Total Contacts: ', (SELECT COUNT(*) FROM customer_contact_details)) as contact_count,
    CONCAT('Total ID Documents: ', (SELECT COUNT(*) FROM customer_id)) as id_count,
    CONCAT('Total Employment Records: ', (SELECT COUNT(*) FROM customer_employment_information)) as employment_count;

-- 8. Recent Registration Activity (last 5)
SELECT '🕐 RECENT REGISTRATIONS' as info;
SELECT 
    cif_number,
    CONCAT(customer_first_name, ' ', customer_last_name) as name,
    customer_username,
    customer_creation_timestamp
FROM customer 
ORDER BY customer_creation_timestamp DESC 
LIMIT 5;

SELECT '✅ VERIFICATION COMPLETE' as status;
SELECT 'If you see data above, your registration system is working!' as message;
