# UniVault Database Structure

## Overview
This directory contains the complete database schema and related files for the UniVault banking system.

## File Structure

### Core Database Files
- **`01_schema.sql`** - Complete database schema with tables, constraints, triggers, and procedures
- **`02_seed_data.sql`** - Sample data for testing and development
- **`03_sample_queries.sql`** - Example queries for analysis and testing
- **`99_cleanup_data.sql`** - Script to reset database to clean state

## Database Setup Instructions

### 1. Initial Setup (Improved Version)
```sql
-- Create and populate the database with enhanced features
SOURCE 01_schema_improved.sql;
SOURCE 02_seed_data_improved.sql;
```

### 2. Legacy Setup (Original Version)
```sql
-- Original schema for reference
SOURCE 01_schema.sql;
SOURCE 02_seed_data.sql;
```

### 3. Testing and Validation
```sql
-- Run enhanced sample queries to verify setup
SOURCE 03_sample_queries_improved.sql;
```

### 4. Reset Database (if needed)
```sql
-- Clean all data but keep structure
SOURCE 99_cleanup_data.sql;
-- Then re-run seed data if needed
SOURCE 02_seed_data_improved.sql;
```

## Database Schema Overview

### Reference Tables
- `CIVIL_STATUS_TYPE` - Civil status codes (Single, Married, etc.) ✨ Enhanced with active status
- `ADDRESS_TYPE` - Address type codes (Home, Work, etc.) ✨ Enhanced with active status
- `CONTACT_TYPE` - Contact type codes (Mobile, Email, etc.) ✨ Enhanced with active status
- `EMPLOYMENT_POSITION` - Employment position codes ✨ Enhanced with active status
- `FUND_SOURCE_TYPE` - Fund source codes ✨ Enhanced with documentation requirements
- `WORK_NATURE_TYPE` - Work nature codes ✨ Enhanced with risk classification
- ~~`BIOMETRIC_TYPE`~~ - **REMOVED** (Not required for current system)
- `CUSTOMER_PRODUCT_TYPE` - Product type codes ✨ Enhanced with minimum balance
- `ALIAS_DOCUMENTATION_TYPE` - Document type codes ✨ Enhanced with active status
- `ID_TYPE` - ID type codes ✨ Enhanced with primary ID flags and expiration requirements

### Main Entity Tables
- `CUSTOMER` - Core customer information ✨ Enhanced with risk scoring and regulatory flags
- `CUSTOMER_ADDRESS` - Customer addresses (normalized) ✨ Enhanced with primary address flags
- `CUSTOMER_CONTACT_DETAILS` - Customer contact information ✨ Enhanced with verification status
- `CUSTOMER_EMPLOYMENT_INFORMATION` - Employment details ✨ Enhanced with currency and tenure tracking
- `CUSTOMER_FUND_SOURCE` - Customer fund sources ✨ Enhanced with estimated amounts
- `CUSTOMER_WORK_NATURE` - Work nature details (unchanged)
- `CUSTOMER_ALIAS` - Customer aliases ✨ Enhanced with verification and reason tracking
- `CUSTOMER_ID` - Customer identification documents ✨ Enhanced with verification tracking
- `ALIAS_DOCUMENTATION` - Alias supporting documents ✨ Enhanced with verification status
- `BANK_EMPLOYEE` - Bank employee information ✨ Enhanced with active status tracking
- `ACCOUNT_DETAILS` - Account information ✨ Enhanced with balance tracking
- `CUSTOMER_ACCOUNT` - Customer-Account relationship ✨ Enhanced with account roles
- `REVIEW_QUEUE` - Account review queue ✨ Enhanced with priority levels and status tracking
- `AUDIT_LOG` - **NEW** Comprehensive audit trail for all changes

## Key Features

### Data Integrity ✨ Enhanced
- Comprehensive foreign key constraints with proper cascading
- Enhanced check constraints for data validation
- Improved triggers for business rule enforcement
- **NEW:** Audit logging for all changes
- **NEW:** Data quality validation views

### Business Rules Enforced ✨ Enhanced
- Customers must be 18+ years old
- Customers must have exactly one home address
- Customers can have at most 2 ID documents
- Accounts require minimum supporting documents
- Employment date validation with auto-calculation
- Remittance fund source validation
- **NEW:** Risk-based customer classification
- **NEW:** Document verification requirements
- **NEW:** Regulatory compliance validation

### Security Features ✨ Enhanced
- Enhanced password validation requirements
- Username format validation with uniqueness
- Comprehensive audit columns (created_at, updated_at, etc.)
- Soft delete capability with audit trails
- **NEW:** Document expiry tracking and validation
- **NEW:** Contact verification status tracking
- **NEW:** Risk scoring and monitoring

## Triggers Summary

| Trigger Name | Table | Purpose |
|--------------|-------|---------|
| `check_customer_age_*` | CUSTOMER | Enforce 18+ age requirement |
| `trg_remittance_required` | CUSTOMER_FUND_SOURCE | Validate remittance details |
| `trg_employment_*` | CUSTOMER_EMPLOYMENT_INFORMATION | Employment date validation |
| `trg_prevent_account_*` | CUSTOMER_ACCOUNT | Account creation validation |
| `trg_customer_address_*` | CUSTOMER_ADDRESS | Home address validation |
| `trg_limit_two_ids` | CUSTOMER_ID | Limit 2 IDs per customer |

## Procedures

- `create_customer()` - Safely create customer with initial fund source

## Notes

- All tables use appropriate data types and constraints
- Foreign key relationships are properly defined
- The schema supports both individual and business customers
- Regulatory compliance fields are included
- The database is designed for scalability and maintainability

## Audit Results and Improvements

### Major Enhancements (June 25, 2025)
1. **Risk Management System**: Added comprehensive risk scoring and classification
2. **Regulatory Compliance**: Enhanced fields for PEP, DNFBP, and gaming industry tracking
3. **Document Verification**: Added verification status and expiry tracking
4. **Audit Trail**: New AUDIT_LOG table for comprehensive change tracking
5. **Performance Optimization**: Added strategic indexes and business intelligence views
6. **Data Quality**: Enhanced validation and completeness monitoring

### Previous Cleanup (Original)
1. **Removed duplicate files**: Consolidated multiple schema files
2. **Fixed data inconsistencies**: Corrected invalid enum values
3. **Standardized naming**: Used consistent file naming convention
4. **Added missing constraints**: Enhanced data validation
5. **Consolidated fund source handling**: Removed conflicting implementations
6. **Added proper documentation**: Clear file organization and purpose
7. **Fixed SQL syntax issues**: Resolved trigger and constraint problems

### Deprecated Features Removed
- ~~BIOMETRIC_TYPE table~~ - Not required for current system
- ~~referral_type columns~~ - Removed from all tables
- ~~Duplicate account_type logic~~ - Consolidated and simplified

## New Business Intelligence Views

- `v_registration_completeness` - Customer registration status and completeness scoring
- `v_customer_risk_analysis` - Comprehensive risk assessment and flagging
- `v_account_summary` - Customer account portfolio and balance summary

## Files Structure

| File | Status | Purpose |
|------|--------|---------|
| `01_schema.sql` | Legacy | Original schema (kept for reference) |
| `01_schema_improved.sql` | ✨ **Recommended** | Enhanced schema with audit improvements |
| `02_seed_data.sql` | Legacy | Original test data |
| `02_seed_data_improved.sql` | ✨ **Recommended** | Enhanced test data with risk profiles |
| `03_sample_queries.sql` | Legacy | Original sample queries |
| `03_sample_queries_improved.sql` | ✨ **Recommended** | Enhanced analytics and compliance queries |
| `99_cleanup_data.sql` | Active | Database reset script |
| `DATABASE_AUDIT_REPORT.md` | ✨ **New** | Comprehensive audit findings and recommendations |
