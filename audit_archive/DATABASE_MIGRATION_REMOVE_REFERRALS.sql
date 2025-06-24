-- Database Migration Script: Remove Referral Fields
-- This script safely removes referral_type and referral_source fields from existing databases

-- =================================================================
-- MIGRATION: REMOVE REFERRAL FIELDS FROM ACCOUNT_DETAILS
-- =================================================================

-- Step 1: Backup existing data (optional but recommended)
-- CREATE TABLE ACCOUNT_DETAILS_BACKUP AS SELECT * FROM ACCOUNT_DETAILS;

-- Step 2: Remove referral-related constraints first
ALTER TABLE ACCOUNT_DETAILS DROP CONSTRAINT IF EXISTS check_referral_type1;
ALTER TABLE ACCOUNT_DETAILS DROP CONSTRAINT IF EXISTS check_referral_type2;
ALTER TABLE ACCOUNT_DETAILS DROP CONSTRAINT IF EXISTS check_referral_source_condition;

-- Step 3: Drop referral columns
ALTER TABLE ACCOUNT_DETAILS DROP COLUMN IF EXISTS referral_source;
ALTER TABLE ACCOUNT_DETAILS DROP COLUMN IF EXISTS referral_type;

-- Step 4: Verify the migration
SELECT 'Migration completed successfully' as status;
DESCRIBE ACCOUNT_DETAILS;

-- =================================================================
-- ROLLBACK SCRIPT (if needed)
-- =================================================================
-- If you need to rollback this migration:
-- 
-- ALTER TABLE ACCOUNT_DETAILS 
-- ADD COLUMN referral_type VARCHAR(30) NOT NULL DEFAULT 'Walk-in',
-- ADD COLUMN referral_source VARCHAR(255) NULL;
--
-- ALTER TABLE ACCOUNT_DETAILS 
-- ADD CONSTRAINT check_referral_type1 CHECK (referral_type REGEXP '^[A-Za-z\\-]+$'),
-- ADD CONSTRAINT check_referral_type2 CHECK (referral_type IN ('Walk-in', 'Referred')),
-- ADD CONSTRAINT check_referral_source_condition CHECK ((referral_type = 'Referred' AND referral_source IS NOT NULL AND referral_source REGEXP '^[A-Za-z ]+$') OR(referral_type = 'Walk-in' AND referral_source IS NULL));
--
-- UPDATE ACCOUNT_DETAILS SET referral_type = 'Walk-in' WHERE referral_type IS NULL;
-- =================================================================
