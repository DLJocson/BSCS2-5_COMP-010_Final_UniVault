-- UniVault Database Sample Queries
-- Example queries for testing and analysis
-- Version: 1.0
-- Last Updated: 2025-06-24

USE univault_schema;

-- ////////////////
-- EASY QUERIES
-- ////////////////

-- 1. Get all male customers with their age
SELECT 
    customer_first_name, 
    customer_last_name, 
    birth_date,
    TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) AS age
FROM CUSTOMER
WHERE gender = 'Male';

-- 2. Get all active accounts with customer info
SELECT 
    ca.cif_number, 
    ad.account_number, 
    ad.account_open_date, 
    ad.account_status
FROM 
    ACCOUNT_DETAILS AS ad
JOIN 
    CUSTOMER_ACCOUNT AS ca 
    ON ad.account_number = ca.account_number
WHERE 
    ad.account_status = 'Active';

-- 3. Get all married customers
SELECT 
    cif_number, 
    CONCAT(customer_first_name, ' ', customer_last_name) AS full_name
FROM 
    CUSTOMER
WHERE 
    civil_status_code = 'CS02';

-- ////////////////
-- MODERATE QUERIES
-- ////////////////

-- 4. Customer count by civil status
SELECT 
    cst.civil_status_description, 
    COUNT(c.cif_number) AS number_of_customers
FROM 
    CUSTOMER AS c
JOIN 
    CIVIL_STATUS_TYPE AS cst 
    ON c.civil_status_code = cst.civil_status_code
GROUP BY 
    cst.civil_status_description
ORDER BY 
    number_of_customers DESC;

-- 5. Product types with more than 1 account
SELECT 
    cpt.product_type_name, 
    COUNT(ad.account_number) AS number_of_accounts
FROM 
    ACCOUNT_DETAILS AS ad
JOIN 
    CUSTOMER_PRODUCT_TYPE AS cpt 
    ON ad.product_type_code = cpt.product_type_code
GROUP BY 
    cpt.product_type_name
HAVING 
    COUNT(ad.account_number) > 1
ORDER BY 
    number_of_accounts DESC;

-- 6. Customers with home address in Metro Manila
SELECT 
    c.cif_number, 
    CONCAT(c.customer_first_name, ' ', c.customer_last_name) AS full_name
FROM 
    CUSTOMER AS c
JOIN 
    CUSTOMER_ADDRESS AS ca 
    ON c.cif_number = ca.cif_number
WHERE 
    ca.address_type_code = 'AD01' 
    AND ca.address_province = 'Metro Manila';

-- 7. Employees and their verification counts
SELECT 
    be.employee_id, 
    CONCAT(be.employee_first_name, ' ', be.employee_last_name) AS employee_full_name, 
    COUNT(ad.account_number) AS total_accounts_verified
FROM 
    ACCOUNT_DETAILS AS ad
JOIN 
    BANK_EMPLOYEE AS be 
    ON ad.verified_by_employee = be.employee_id
GROUP BY 
    be.employee_id, 
    employee_full_name
HAVING 
    COUNT(ad.account_number) >= 1
ORDER BY 
    total_accounts_verified DESC;

-- ////////////////
-- DIFFICULT QUERIES
-- ////////////////

-- 8. Active customers with both home and work addresses in Metro Manila
SELECT DISTINCT 
    CONCAT(c.customer_first_name, ' ', c.customer_last_name) AS full_name
FROM 
    CUSTOMER AS c
JOIN 
    CUSTOMER_ACCOUNT AS ca 
    ON c.cif_number = ca.cif_number
JOIN 
    ACCOUNT_DETAILS AS ad 
    ON ca.account_number = ad.account_number
WHERE 
    ad.account_status = 'Active'
    AND c.cif_number IN (
        SELECT cif_number 
        FROM CUSTOMER_ADDRESS 
        WHERE address_type_code = 'AD03' -- Work Address
          AND address_province = 'Metro Manila'
    )
    AND c.cif_number IN (
        SELECT cif_number 
        FROM CUSTOMER_ADDRESS 
        WHERE address_type_code = 'AD01' -- Home Address
          AND address_province = 'Metro Manila'
    )
ORDER BY 
    full_name;

-- 9. Employees who both verified and approved deposit accounts
SELECT DISTINCT 
    CONCAT(be.employee_first_name, ' ', be.employee_last_name) AS employee_full_name
FROM 
    BANK_EMPLOYEE AS be
JOIN 
    ACCOUNT_DETAILS AS ad_verified 
    ON be.employee_id = ad_verified.verified_by_employee
JOIN 
    ACCOUNT_DETAILS AS ad_approved 
    -- approved_by_employee removed per business rule change
JOIN 
    CUSTOMER_PRODUCT_TYPE AS cpt_v 
    ON ad_verified.product_type_code = cpt_v.product_type_code
JOIN 
    CUSTOMER_PRODUCT_TYPE AS cpt_a 
    ON ad_approved.product_type_code = cpt_a.product_type_code
WHERE 
    cpt_v.product_type_name = 'Deposits' 
    AND cpt_a.product_type_name = 'Deposits';

-- 10. Active customers with monthly income > 70,000
SELECT DISTINCT 
    c.customer_first_name, 
    c.customer_last_name
FROM 
    CUSTOMER AS c
JOIN 
    CUSTOMER_ACCOUNT AS ca 
    ON c.cif_number = ca.cif_number
JOIN 
    ACCOUNT_DETAILS AS ad 
    ON ca.account_number = ad.account_number
JOIN 
    CUSTOMER_EMPLOYMENT_INFORMATION AS cei 
    ON c.cif_number = cei.cif_number
WHERE 
    ad.account_status = 'Active' 
    AND cei.income_monthly_gross > 70000.00
ORDER BY 
    c.customer_last_name, 
    c.customer_first_name;

-- ////////////////
-- BUSINESS INTELLIGENCE QUERIES
-- ////////////////

-- 11. Customer demographics summary
SELECT 
    gender,
    AVG(TIMESTAMPDIFF(YEAR, birth_date, CURDATE())) AS avg_age,
    COUNT(*) AS customer_count,
    COUNT(CASE WHEN customer_status = 'Active' THEN 1 END) AS active_customers
FROM CUSTOMER
GROUP BY gender;

-- 12. Fund source distribution
SELECT 
    fst.fund_source,
    COUNT(cfs.cif_number) AS customer_count,
    ROUND(COUNT(cfs.cif_number) * 100.0 / (SELECT COUNT(*) FROM CUSTOMER_FUND_SOURCE), 2) AS percentage
FROM FUND_SOURCE_TYPE fst
LEFT JOIN CUSTOMER_FUND_SOURCE cfs ON fst.fund_source_code = cfs.fund_source_code
GROUP BY fst.fund_source_code, fst.fund_source
ORDER BY customer_count DESC;

-- 13. Account status summary by product type
SELECT 
    cpt.product_type_name,
    ad.account_status,
    COUNT(*) AS account_count
FROM ACCOUNT_DETAILS ad
JOIN CUSTOMER_PRODUCT_TYPE cpt ON ad.product_type_code = cpt.product_type_code
GROUP BY cpt.product_type_name, ad.account_status
ORDER BY cpt.product_type_name, ad.account_status;

-- 14. Employment income analysis
SELECT 
    ep.employment_type,
    ep.job_title,
    AVG(cei.income_monthly_gross) AS avg_income,
    MIN(cei.income_monthly_gross) AS min_income,
    MAX(cei.income_monthly_gross) AS max_income,
    COUNT(*) AS employee_count
FROM CUSTOMER_EMPLOYMENT_INFORMATION cei
JOIN EMPLOYMENT_POSITION ep ON cei.position_code = ep.position_code
WHERE cei.employment_status = 'Current'
GROUP BY ep.employment_type, ep.job_title
ORDER BY avg_income DESC;

-- 15. Regional customer distribution
SELECT 
    address_province,
    COUNT(DISTINCT ca.cif_number) AS customer_count,
    COUNT(DISTINCT CASE WHEN c.customer_status = 'Active' THEN ca.cif_number END) AS active_customers
FROM CUSTOMER_ADDRESS ca
JOIN CUSTOMER c ON ca.cif_number = c.cif_number
WHERE ca.address_type_code = 'AD01' -- Home address only
GROUP BY address_province
HAVING customer_count > 0
ORDER BY customer_count DESC;


-- // running all tables:

USE UNIVAULT_SCHEMA;

-- 1. CIVIL_STATUS_TYPE
SELECT * FROM CIVIL_STATUS_TYPE;

-- 2. ADDRESS_TYPE
SELECT * FROM ADDRESS_TYPE;

-- 3. CONTACT_TYPE
SELECT * FROM CONTACT_TYPE;

-- 4. EMPLOYMENT_POSITION
SELECT * FROM EMPLOYMENT_POSITION;

-- 5. FUND_SOURCE_TYPE
SELECT * FROM FUND_SOURCE_TYPE;

-- 6. WORK_NATURE_TYPE
SELECT * FROM WORK_NATURE_TYPE;

-- 7. CUSTOMER_PRODUCT_TYPE
SELECT * FROM CUSTOMER_PRODUCT_TYPE;

-- 8. ALIAS_DOCUMENTATION_TYPE
SELECT * FROM ALIAS_DOCUMENTATION_TYPE;

-- 9. ID_TYPE
SELECT * FROM ID_TYPE;

-- 10. BANK_EMPLOYEE
SELECT * FROM BANK_EMPLOYEE;

-- 11. CUSTOMER
SELECT * FROM CUSTOMER;

-- 12. CUSTOMER_ADDRESS
SELECT * FROM CUSTOMER_ADDRESS;

-- 13. CUSTOMER_CONTACT_DETAILS
SELECT * FROM CUSTOMER_CONTACT_DETAILS;

-- 14. CUSTOMER_ID
SELECT * FROM CUSTOMER_ID;

-- 15. CUSTOMER_FUND_SOURCE
SELECT * FROM CUSTOMER_FUND_SOURCE;

-- 16. CUSTOMER_EMPLOYMENT_INFORMATION
SELECT * FROM CUSTOMER_EMPLOYMENT_INFORMATION;

-- 17. CUSTOMER_WORK_NATURE
SELECT * FROM CUSTOMER_WORK_NATURE;

-- 18. ACCOUNT_DETAILS
SELECT * FROM ACCOUNT_DETAILS;

-- 19. CUSTOMER_ACCOUNT
SELECT * FROM CUSTOMER_ACCOUNT;

-- 20. CUSTOMER_ALIAS
SELECT * FROM CUSTOMER_ALIAS;

-- 21. ALIAS_DOCUMENTATION
SELECT * FROM ALIAS_DOCUMENTATION;
