-- Database optimizations for faster admin login
-- Run this script to improve login performance

-- Add missing columns to BANK_EMPLOYEE if they don't exist
ALTER TABLE BANK_EMPLOYEE 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Create optimized indexes for login queries
CREATE INDEX IF NOT EXISTS idx_employee_username_active ON BANK_EMPLOYEE (employee_username, is_deleted);

-- Update any existing employees to set is_deleted = FALSE if it was NULL
UPDATE BANK_EMPLOYEE SET is_deleted = FALSE WHERE is_deleted IS NULL;

-- Show current table structure and indexes
DESCRIBE BANK_EMPLOYEE;
SHOW INDEX FROM BANK_EMPLOYEE;

-- Performance test query (should be very fast)
SELECT COUNT(*) as employee_count FROM BANK_EMPLOYEE WHERE is_deleted = FALSE;
