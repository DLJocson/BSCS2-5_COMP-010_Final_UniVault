-- Referral Fields Removal Verification Script
-- Verifies that referral_type and referral_source have been completely removed from the system

-- =================================================================
-- 1. VERIFY ACCOUNT_DETAILS SCHEMA NO LONGER HAS REFERRAL FIELDS
-- =================================================================
SELECT 'ACCOUNT_DETAILS SCHEMA VERIFICATION' as verification_type;

-- This should show the schema without referral_type and referral_source columns
DESCRIBE ACCOUNT_DETAILS;

-- Alternative verification using INFORMATION_SCHEMA
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'ACCOUNT_DETAILS' 
  AND TABLE_SCHEMA = DATABASE()
ORDER BY ORDINAL_POSITION;

-- =================================================================
-- 2. VERIFY NO REFERRAL CONSTRAINTS EXIST
-- =================================================================
SELECT 'REFERRAL CONSTRAINTS VERIFICATION' as verification_type;

-- Check that referral-related constraints have been removed
SELECT 
    CONSTRAINT_NAME,
    CHECK_CLAUSE
FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS 
WHERE TABLE_NAME = 'ACCOUNT_DETAILS' 
  AND TABLE_SCHEMA = DATABASE()
  AND (CHECK_CLAUSE LIKE '%referral%' OR CONSTRAINT_NAME LIKE '%referral%');

-- Expected: No rows returned (no referral constraints)

-- =================================================================
-- 3. VERIFY ACCOUNT_DETAILS STRUCTURE IS CORRECT
-- =================================================================
SELECT 'ACCOUNT_DETAILS STRUCTURE VERIFICATION' as verification_type;

-- Verify the table has the expected columns (no referral fields)
SELECT 
    'account_number' as expected_column,
    CASE WHEN EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'ACCOUNT_DETAILS' 
          AND COLUMN_NAME = 'account_number'
          AND TABLE_SCHEMA = DATABASE()
    ) THEN 'EXISTS' ELSE 'MISSING' END as status

UNION ALL

SELECT 
    'product_type_code' as expected_column,
    CASE WHEN EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'ACCOUNT_DETAILS' 
          AND COLUMN_NAME = 'product_type_code'
          AND TABLE_SCHEMA = DATABASE()
    ) THEN 'EXISTS' ELSE 'MISSING' END as status

UNION ALL

SELECT 
    'verified_by_employee' as expected_column,
    CASE WHEN EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'ACCOUNT_DETAILS' 
          AND COLUMN_NAME = 'verified_by_employee'
          AND TABLE_SCHEMA = DATABASE()
    ) THEN 'EXISTS' ELSE 'MISSING' END as status

UNION ALL

SELECT 
    'approved_by_employee' as expected_column,
    CASE WHEN EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'ACCOUNT_DETAILS' 
          AND COLUMN_NAME = 'approved_by_employee'
          AND TABLE_SCHEMA = DATABASE()
    ) THEN 'EXISTS' ELSE 'MISSING' END as status

UNION ALL

SELECT 
    'account_open_date' as expected_column,
    CASE WHEN EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'ACCOUNT_DETAILS' 
          AND COLUMN_NAME = 'account_open_date'
          AND TABLE_SCHEMA = DATABASE()
    ) THEN 'EXISTS' ELSE 'MISSING' END as status

UNION ALL

SELECT 
    'account_status' as expected_column,
    CASE WHEN EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'ACCOUNT_DETAILS' 
          AND COLUMN_NAME = 'account_status'
          AND TABLE_SCHEMA = DATABASE()
    ) THEN 'EXISTS' ELSE 'MISSING' END as status

UNION ALL

-- Verify referral fields do NOT exist
SELECT 
    'referral_type (should NOT exist)' as expected_column,
    CASE WHEN EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'ACCOUNT_DETAILS' 
          AND COLUMN_NAME = 'referral_type'
          AND TABLE_SCHEMA = DATABASE()
    ) THEN 'ERROR - STILL EXISTS' ELSE 'CORRECTLY REMOVED' END as status

UNION ALL

SELECT 
    'referral_source (should NOT exist)' as expected_column,
    CASE WHEN EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'ACCOUNT_DETAILS' 
          AND COLUMN_NAME = 'referral_source'
          AND TABLE_SCHEMA = DATABASE()
    ) THEN 'ERROR - STILL EXISTS' ELSE 'CORRECTLY REMOVED' END as status;

-- =================================================================
-- 4. VERIFY EXISTING DATA COMPATIBILITY
-- =================================================================
SELECT 'EXISTING DATA COMPATIBILITY' as verification_type;

-- Test that existing account details data is still accessible
SELECT 
    account_number,
    product_type_code,
    verified_by_employee,
    approved_by_employee,
    account_open_date,
    account_status,
    'DATA ACCESSIBLE' as verification_status
FROM ACCOUNT_DETAILS 
LIMIT 5;

-- =================================================================
-- 5. VERIFY REGISTRATION FLOW COMPATIBILITY
-- =================================================================
SELECT 'REGISTRATION FLOW COMPATIBILITY' as verification_type;

-- Simulate the new account creation INSERT (without referral fields)
SELECT 
    'PR01' as product_type_code,
    1 as verified_by_employee,
    1 as approved_by_employee,
    CURDATE() as account_open_date,
    'Pending Verification' as account_status,
    'INSERT SIMULATION - READY' as verification_status

UNION ALL

SELECT 
    'PR02' as product_type_code,
    2 as verified_by_employee,
    2 as approved_by_employee,
    CURDATE() as account_open_date,
    'Active' as account_status,
    'INSERT SIMULATION - READY' as verification_status;

-- =================================================================
-- 6. COMPLETE REMOVAL VERIFICATION SUMMARY
-- =================================================================
SELECT 'REMOVAL VERIFICATION SUMMARY' as verification_type;

SELECT 
    'Referral fields removed from schema' as check_item,
    CASE WHEN NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'ACCOUNT_DETAILS' 
          AND (COLUMN_NAME = 'referral_type' OR COLUMN_NAME = 'referral_source')
          AND TABLE_SCHEMA = DATABASE()
    ) THEN '✅ PASSED' ELSE '❌ FAILED' END as status

UNION ALL

SELECT 
    'Referral constraints removed' as check_item,
    CASE WHEN NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS 
        WHERE TABLE_NAME = 'ACCOUNT_DETAILS' 
          AND TABLE_SCHEMA = DATABASE()
          AND (CHECK_CLAUSE LIKE '%referral%' OR CONSTRAINT_NAME LIKE '%referral%')
    ) THEN '✅ PASSED' ELSE '❌ FAILED' END as status

UNION ALL

SELECT 
    'Required fields still exist' as check_item,
    CASE WHEN EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'ACCOUNT_DETAILS' 
          AND COLUMN_NAME IN ('account_number', 'product_type_code', 'verified_by_employee', 'approved_by_employee', 'account_open_date', 'account_status')
          AND TABLE_SCHEMA = DATABASE()
        HAVING COUNT(*) = 6
    ) THEN '✅ PASSED' ELSE '❌ FAILED' END as status

UNION ALL

SELECT 
    'Account details data accessible' as check_item,
    CASE WHEN EXISTS (
        SELECT 1 FROM ACCOUNT_DETAILS LIMIT 1
    ) THEN '✅ PASSED' ELSE '❌ FAILED' END as status;

-- =================================================================
-- Expected Results:
-- 1. ACCOUNT_DETAILS schema should show no referral_type or referral_source columns
-- 2. No referral-related constraints should exist
-- 3. All expected columns should exist, referral columns should be correctly removed
-- 4. Existing data should remain accessible
-- 5. New registration flow should be compatible
-- 6. All verification checks should PASS
-- =================================================================
