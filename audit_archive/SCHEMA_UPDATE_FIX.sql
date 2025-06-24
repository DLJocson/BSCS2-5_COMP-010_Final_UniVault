-- Schema Updates to Fix Registration Errors
-- Run this to apply the field length fixes

USE UNIVAULT;

-- Fix customer_type field length issue
ALTER TABLE CUSTOMER MODIFY COLUMN customer_type VARCHAR(50) NOT NULL;

-- Fix TIN field length issue  
ALTER TABLE CUSTOMER MODIFY COLUMN tax_identification_number VARCHAR(25) NOT NULL;

-- Verify the changes
DESCRIBE CUSTOMER;

SELECT 'Schema updates completed successfully!' as status;
