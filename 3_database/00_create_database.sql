-- Create UniVault Database
-- This script creates the univault_schema database
-- Run this first before running the schema and seed scripts

CREATE DATABASE IF NOT EXISTS univault_schema;
USE univault_schema;

-- Verify database creation
SELECT 'Database univault_schema created successfully' as status;
