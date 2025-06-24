-- Validation Script: Test Customer Registration Data Persistence
-- This script tests the critical components that were failing silently

-- Test 1: Check if Work Email contact type exists
SELECT * FROM CONTACT_TYPE WHERE contact_type_code = 'CT05';

-- Test 2: Check if ID types exist for customer registration
SELECT * FROM ID_TYPE WHERE id_type_code IN ('ID1', 'ID2', 'DL1', 'PP1', 'NID');

-- Test 3: Check if Fund Source codes exist
SELECT * FROM FUND_SOURCE_TYPE WHERE fund_source_code IN ('FS001', 'FS002', 'FS003', 'FS004', 'FS005');

-- Test 4: Check if Alias Documentation types exist
SELECT * FROM ALIAS_DOCUMENTATION_TYPE WHERE alias_doc_type_code IN ('A01', 'A02', 'A03');

-- Test 5: Check if Employment Position codes exist
SELECT * FROM EMPLOYMENT_POSITION WHERE position_code IN ('EP01', 'EP02', 'EP03', 'EP04', 'EP05', 'EP06');

-- Test 6: Check Product Type codes for account creation
SELECT * FROM CUSTOMER_PRODUCT_TYPE WHERE product_type_code = 'PR01';

-- Test 7: Verify Employee IDs exist for account verification/approval
SELECT * FROM BANK_EMPLOYEE WHERE employee_id IN (1, 2, 3, 4);

-- Expected Results:
-- - All queries should return data
-- - If any query returns empty, it indicates missing reference data
-- - This would cause foreign key constraint violations during registration
