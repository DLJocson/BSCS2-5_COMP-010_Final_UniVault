-- UniVault Database Sample Queries - IMPROVED VERSION
-- Enhanced example queries for testing and analysis
-- Version: 2.0
-- Last Updated: 2025-06-25
-- COMPREHENSIVE AUDIT IMPROVEMENTS APPLIED

USE univault_schema;

-- ////////////////
-- BASIC QUERIES
-- ////////////////

-- 1. Get all customers with their current status and risk level
SELECT 
    cif_number,
    CONCAT(customer_first_name, ' ', customer_last_name) AS full_name,
    customer_status,
    risk_level,
    risk_score,
    created_at
FROM CUSTOMER
ORDER BY risk_score DESC, created_at DESC;

-- 2. Get active accounts with customer info and balances
SELECT 
    c.cif_number,
    CONCAT(c.customer_first_name, ' ', c.customer_last_name) AS customer_name,
    ad.account_number,
    cpt.product_type_name,
    ad.account_status,
    ad.current_balance,
    ad.account_open_date
FROM CUSTOMER c
JOIN CUSTOMER_ACCOUNT ca ON c.cif_number = ca.cif_number
JOIN ACCOUNT_DETAILS ad ON ca.account_number = ad.account_number
JOIN CUSTOMER_PRODUCT_TYPE cpt ON ad.product_type_code = cpt.product_type_code
WHERE ad.account_status = 'Active'
ORDER BY ad.current_balance DESC;

-- 3. Customer contact information summary
SELECT 
    c.cif_number,
    CONCAT(c.customer_first_name, ' ', c.customer_last_name) AS customer_name,
    GROUP_CONCAT(DISTINCT CONCAT(ct.contact_type_description, ': ', ccd.contact_value) ORDER BY ct.contact_type_code SEPARATOR '; ') AS contact_details
FROM CUSTOMER c
JOIN CUSTOMER_CONTACT_DETAILS ccd ON c.cif_number = ccd.cif_number
JOIN CONTACT_TYPE ct ON ccd.contact_type_code = ct.contact_type_code
GROUP BY c.cif_number, c.customer_first_name, c.customer_last_name
ORDER BY c.customer_last_name;

-- ////////////////
-- RISK ANALYSIS QUERIES
-- ////////////////

-- 4. High-risk customers summary
SELECT 
    cif_number,
    CONCAT(customer_first_name, ' ', customer_last_name) AS customer_name,
    risk_level,
    risk_score,
    customer_status,
    CASE 
        WHEN reg_political_affiliation = 'Yes' THEN 'PEP'
        WHEN reg_online_gaming = 'Yes' THEN 'Gaming'
        WHEN reg_dnfbp = 'Yes' THEN 'DNFBP'
        ELSE 'Other'
    END as risk_category,
    created_at
FROM CUSTOMER 
WHERE risk_level IN ('High', 'Medium')
ORDER BY risk_score DESC;

-- 5. Customer risk factors breakdown
SELECT 
    risk_level,
    COUNT(*) as customer_count,
    AVG(risk_score) as avg_risk_score,
    COUNT(CASE WHEN reg_political_affiliation = 'Yes' THEN 1 END) as pep_count,
    COUNT(CASE WHEN reg_online_gaming = 'Yes' THEN 1 END) as gaming_count,
    COUNT(CASE WHEN reg_dnfbp = 'Yes' THEN 1 END) as dnfbp_count,
    COUNT(CASE WHEN remittance_country IS NOT NULL THEN 1 END) as remittance_count
FROM CUSTOMER
GROUP BY risk_level
ORDER BY avg_risk_score DESC;

-- 6. High-risk work nature analysis
SELECT 
    wnt.nature_description,
    wnt.is_high_risk,
    COUNT(DISTINCT c.cif_number) as customer_count,
    AVG(c.risk_score) as avg_customer_risk_score,
    AVG(cei.income_monthly_gross) as avg_income
FROM WORK_NATURE_TYPE wnt
JOIN CUSTOMER_WORK_NATURE cwn ON wnt.work_nature_code = cwn.work_nature_code
JOIN CUSTOMER_EMPLOYMENT_INFORMATION cei ON cwn.customer_employment_id = cei.customer_employment_id
JOIN CUSTOMER c ON cei.cif_number = c.cif_number
WHERE wnt.is_high_risk = TRUE
GROUP BY wnt.work_nature_code, wnt.nature_description, wnt.is_high_risk
ORDER BY avg_customer_risk_score DESC;

-- ////////////////
-- OPERATIONAL QUERIES
-- ////////////////

-- 7. Document verification status
SELECT 
    c.cif_number,
    CONCAT(c.customer_first_name, ' ', c.customer_last_name) AS customer_name,
    COUNT(ci.id_type_code) as total_ids,
    COUNT(CASE WHEN ci.is_verified = TRUE THEN 1 END) as verified_ids,
    COUNT(CASE WHEN ci.id_expiry_date < CURDATE() THEN 1 END) as expired_ids,
    GROUP_CONCAT(DISTINCT it.id_description ORDER BY ci.is_verified DESC SEPARATOR '; ') as id_types
FROM CUSTOMER c
LEFT JOIN CUSTOMER_ID ci ON c.cif_number = ci.cif_number
LEFT JOIN ID_TYPE it ON ci.id_type_code = it.id_type_code
GROUP BY c.cif_number, c.customer_first_name, c.customer_last_name
HAVING total_ids > 0
ORDER BY verified_ids ASC, expired_ids DESC;

-- 8. Registration completeness report
SELECT 
    completeness_status,
    COUNT(*) as customer_count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM CUSTOMER), 2) as percentage
FROM v_registration_completeness
GROUP BY completeness_status;

-- 9. Account balances by product type
SELECT 
    cpt.product_type_name,
    COUNT(ad.account_number) as account_count,
    SUM(ad.current_balance) as total_balance,
    AVG(ad.current_balance) as avg_balance,
    MIN(ad.current_balance) as min_balance,
    MAX(ad.current_balance) as max_balance
FROM ACCOUNT_DETAILS ad
JOIN CUSTOMER_PRODUCT_TYPE cpt ON ad.product_type_code = cpt.product_type_code
WHERE ad.account_status = 'Active'
GROUP BY cpt.product_type_code, cpt.product_type_name
ORDER BY total_balance DESC;

-- ////////////////
-- COMPLIANCE QUERIES
-- ////////////////

-- 10. Review queue analysis
SELECT 
    request_type,
    review_status,
    priority_level,
    COUNT(*) as queue_count,
    AVG(DATEDIFF(CURDATE(), DATE(request_timestamp))) as avg_days_pending
FROM REVIEW_QUEUE
GROUP BY request_type, review_status, priority_level
ORDER BY priority_level, avg_days_pending DESC;

-- 11. Fund source distribution with risk assessment
SELECT 
    fst.fund_source,
    COUNT(cfs.cif_number) as customer_count,
    AVG(c.risk_score) as avg_risk_score,
    COUNT(CASE WHEN c.risk_level = 'High' THEN 1 END) as high_risk_customers,
    ROUND(COUNT(cfs.cif_number) * 100.0 / (SELECT COUNT(*) FROM CUSTOMER_FUND_SOURCE), 2) as percentage
FROM FUND_SOURCE_TYPE fst
LEFT JOIN CUSTOMER_FUND_SOURCE cfs ON fst.fund_source_code = cfs.fund_source_code
LEFT JOIN CUSTOMER c ON cfs.cif_number = c.cif_number
WHERE fst.is_active = TRUE
GROUP BY fst.fund_source_code, fst.fund_source
ORDER BY avg_risk_score DESC;

-- 12. Regulatory compliance summary
SELECT 
    'Political Affiliation' as regulatory_flag,
    COUNT(CASE WHEN reg_political_affiliation = 'Yes' THEN 1 END) as flagged_customers,
    COUNT(*) as total_customers,
    ROUND(COUNT(CASE WHEN reg_political_affiliation = 'Yes' THEN 1 END) * 100.0 / COUNT(*), 2) as percentage
FROM CUSTOMER
UNION ALL
SELECT 
    'FATCA',
    COUNT(CASE WHEN reg_fatca = 'Yes' THEN 1 END),
    COUNT(*),
    ROUND(COUNT(CASE WHEN reg_fatca = 'Yes' THEN 1 END) * 100.0 / COUNT(*), 2)
FROM CUSTOMER
UNION ALL
SELECT 
    'DNFBP',
    COUNT(CASE WHEN reg_dnfbp = 'Yes' THEN 1 END),
    COUNT(*),
    ROUND(COUNT(CASE WHEN reg_dnfbp = 'Yes' THEN 1 END) * 100.0 / COUNT(*), 2)
FROM CUSTOMER
UNION ALL
SELECT 
    'Online Gaming',
    COUNT(CASE WHEN reg_online_gaming = 'Yes' THEN 1 END),
    COUNT(*),
    ROUND(COUNT(CASE WHEN reg_online_gaming = 'Yes' THEN 1 END) * 100.0 / COUNT(*), 2)
FROM CUSTOMER;

-- ////////////////
-- ADVANCED ANALYTICS
-- ////////////////

-- 13. Customer acquisition trends
SELECT 
    DATE_FORMAT(created_at, '%Y-%m') as month_year,
    COUNT(*) as new_customers,
    COUNT(CASE WHEN customer_status = 'Active' THEN 1 END) as active_customers,
    COUNT(CASE WHEN risk_level = 'High' THEN 1 END) as high_risk_customers,
    AVG(risk_score) as avg_risk_score
FROM CUSTOMER
GROUP BY DATE_FORMAT(created_at, '%Y-%m')
ORDER BY month_year;

-- 14. Employee productivity analysis
SELECT 
    be.employee_id,
    CONCAT(be.employee_first_name, ' ', be.employee_last_name) as employee_name,
    be.employee_position,
    COUNT(DISTINCT ad_verified.account_number) as accounts_verified,
    COUNT(DISTINCT ad_approved.account_number) as accounts_approved,
    COUNT(DISTINCT rq.review_id) as reviews_completed
FROM BANK_EMPLOYEE be
LEFT JOIN ACCOUNT_DETAILS ad_verified ON be.employee_id = ad_verified.verified_by_employee
-- approved_by_employee removed per business rule change
LEFT JOIN REVIEW_QUEUE rq ON be.employee_id = rq.reviewed_by_employee_id AND rq.review_status IN ('APPROVED', 'REJECTED')
WHERE be.is_active = TRUE
GROUP BY be.employee_id, be.employee_first_name, be.employee_last_name, be.employee_position
ORDER BY (accounts_verified + accounts_approved + reviews_completed) DESC;

-- 15. Geographic distribution analysis
SELECT 
    ca.address_province,
    COUNT(DISTINCT c.cif_number) as customer_count,
    COUNT(DISTINCT CASE WHEN c.customer_status = 'Active' THEN c.cif_number END) as active_customers,
    SUM(COALESCE(ad.current_balance, 0)) as total_deposits,
    AVG(c.risk_score) as avg_risk_score,
    COUNT(CASE WHEN c.risk_level = 'High' THEN 1 END) as high_risk_customers
FROM CUSTOMER_ADDRESS ca
JOIN CUSTOMER c ON ca.cif_number = c.cif_number
LEFT JOIN CUSTOMER_ACCOUNT cac ON c.cif_number = cac.cif_number
LEFT JOIN ACCOUNT_DETAILS ad ON cac.account_number = ad.account_number AND ad.account_status = 'Active'
WHERE ca.address_type_code = 'AD01' -- Home address only
GROUP BY ca.address_province
HAVING customer_count > 0
ORDER BY total_deposits DESC;

-- ////////////////
-- DATA QUALITY QUERIES
-- ////////////////

-- 16. Data completeness audit
SELECT 
    'Customer Records' as data_category,
    COUNT(*) as total_records,
    COUNT(CASE WHEN customer_middle_name IS NOT NULL THEN 1 END) as has_middle_name,
    COUNT(CASE WHEN remittance_country IS NOT NULL THEN 1 END) as has_remittance_info,
    COUNT(CASE WHEN customer_status = 'Active' THEN 1 END) as active_records
FROM CUSTOMER
UNION ALL
SELECT 
    'Contact Details',
    COUNT(*),
    COUNT(CASE WHEN is_verified = TRUE THEN 1 END),
    COUNT(CASE WHEN is_primary = TRUE THEN 1 END),
    COUNT(CASE WHEN contact_type_code = 'CT04' THEN 1 END) -- Email contacts
FROM CUSTOMER_CONTACT_DETAILS
UNION ALL
SELECT 
    'ID Documents',
    COUNT(*),
    COUNT(CASE WHEN is_verified = TRUE THEN 1 END),
    COUNT(CASE WHEN id_expiry_date > CURDATE() THEN 1 END), -- Not expired
    COUNT(CASE WHEN it.is_primary_id = TRUE THEN 1 END) -- Primary IDs
FROM CUSTOMER_ID ci
JOIN ID_TYPE it ON ci.id_type_code = it.id_type_code;

-- 17. Potential data issues identification
SELECT 
    'Customers without verified IDs' as issue_type,
    COUNT(DISTINCT c.cif_number) as affected_records
FROM CUSTOMER c
LEFT JOIN CUSTOMER_ID ci ON c.cif_number = ci.cif_number AND ci.is_verified = TRUE
WHERE ci.cif_number IS NULL AND c.customer_status != 'Pending Verification'
UNION ALL
SELECT 
    'Customers with expired IDs',
    COUNT(DISTINCT c.cif_number)
FROM CUSTOMER c
JOIN CUSTOMER_ID ci ON c.cif_number = ci.cif_number
WHERE ci.id_expiry_date < CURDATE() AND c.customer_status = 'Active'
UNION ALL
SELECT 
    'High-risk customers without pending reviews',
    COUNT(DISTINCT c.cif_number)
FROM CUSTOMER c
LEFT JOIN REVIEW_QUEUE rq ON c.cif_number = rq.cif_number AND rq.review_status = 'PENDING'
WHERE c.risk_level = 'High' AND rq.cif_number IS NULL
UNION ALL
SELECT 
    'Accounts below minimum balance',
    COUNT(ad.account_number)
FROM ACCOUNT_DETAILS ad
JOIN CUSTOMER_PRODUCT_TYPE cpt ON ad.product_type_code = cpt.product_type_code
WHERE ad.current_balance < cpt.minimum_balance AND ad.account_status = 'Active';

-- ////////////////
-- VIEW UTILIZATION EXAMPLES
-- ////////////////

-- 18. Using registration completeness view
SELECT 
    risk_level,
    completeness_status,
    COUNT(*) as customer_count,
    AVG(risk_score) as avg_risk_score
FROM v_registration_completeness
GROUP BY risk_level, completeness_status
ORDER BY risk_level DESC, completeness_status;

-- 19. Using customer risk analysis view
SELECT *
FROM v_customer_risk_analysis
WHERE (political_risk != '' OR dnfbp_risk != '' OR gaming_risk != '' OR remittance_risk != '')
   OR pending_reviews > 0
ORDER BY risk_score DESC, pending_reviews DESC;

-- 20. Using account summary view
SELECT 
    customer_name,
    customer_status,
    total_accounts,
    active_accounts,
    total_balance,
    product_types
FROM v_account_summary
WHERE total_balance > 50000
ORDER BY total_balance DESC;

-- ////////////////
-- PERFORMANCE TESTING QUERIES
-- ////////////////

-- 21. Index usage verification (explain plan)
EXPLAIN SELECT c.cif_number, c.customer_first_name, c.customer_last_name
FROM CUSTOMER c
WHERE c.customer_status = 'Active' AND c.risk_level = 'High';

-- 22. Complex join performance test
SELECT 
    c.cif_number,
    CONCAT(c.customer_first_name, ' ', c.customer_last_name) as customer_name,
    ca.address_city,
    cei.employer_business_name,
    wnt.nature_description,
    ad.current_balance
FROM CUSTOMER c
JOIN CUSTOMER_ADDRESS ca ON c.cif_number = ca.cif_number AND ca.address_type_code = 'AD01'
JOIN CUSTOMER_EMPLOYMENT_INFORMATION cei ON c.cif_number = cei.cif_number
JOIN CUSTOMER_WORK_NATURE cwn ON cei.customer_employment_id = cwn.customer_employment_id
JOIN WORK_NATURE_TYPE wnt ON cwn.work_nature_code = wnt.work_nature_code
JOIN CUSTOMER_ACCOUNT cac ON c.cif_number = cac.cif_number
JOIN ACCOUNT_DETAILS ad ON cac.account_number = ad.account_number
WHERE c.customer_status = 'Active'
ORDER BY ad.current_balance DESC
LIMIT 10;

-- 23. Audit log sample (if audit logging is implemented)
-- This would be used to track changes to customer data
-- SELECT * FROM AUDIT_LOG WHERE table_name = 'CUSTOMER' AND change_timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY);

/*
QUERY CATEGORIES SUMMARY:

1. BASIC QUERIES (1-3): Simple data retrieval and customer information
2. RISK ANALYSIS (4-6): Risk assessment and high-risk customer identification  
3. OPERATIONAL (7-9): Day-to-day operational reporting
4. COMPLIANCE (10-12): Regulatory compliance and review queue management
5. ADVANCED ANALYTICS (13-15): Business intelligence and trend analysis
6. DATA QUALITY (16-17): Data integrity and completeness validation
7. VIEW UTILIZATION (18-20): Examples using the new business intelligence views
8. PERFORMANCE TESTING (21-23): Query performance verification and optimization

These queries demonstrate:
- Proper use of indexes for performance
- Risk-based customer segmentation
- Regulatory compliance monitoring
- Data quality assurance
- Operational efficiency metrics
- Business intelligence capabilities
*/
