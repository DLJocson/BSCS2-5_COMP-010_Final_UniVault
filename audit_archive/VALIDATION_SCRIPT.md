# 🧪 UniVault Registration System Testing & Validation

## Testing Checklist

### 1. Backend Setup Validation

```bash
# 1. Test database connection
cd "C:\Users\louie\Documents\Github\COMP010_BSCS25_G4_UniVault\2_backend"
npm start

# Expected output: "Connected to MySQL database!"
# Expected output: "Server running on http://localhost:3000"
```

### 2. API Endpoints Testing

```bash
# Test API endpoints using curl or browser

# 1. Check API info
GET http://localhost:3000/api

# 2. Test file upload endpoint
# Use browser file upload or Postman to POST to:
POST http://localhost:3000/upload
# With file field "file"
```

### 3. Database Schema Validation

```sql
-- Connect to MySQL and verify tables exist
USE univault_schema;

-- Check if all required tables exist
SHOW TABLES;

-- Expected tables:
-- CUSTOMER
-- CUSTOMER_ADDRESS  
-- CUSTOMER_ID
-- CUSTOMER_CONTACT_DETAILS
-- CUSTOMER_EMPLOYMENT_INFORMATION
-- CUSTOMER_FUND_SOURCE
-- CUSTOMER_WORK_NATURE
-- CUSTOMER_ALIAS
-- [Reference tables]

-- Test customer insertion
SELECT COUNT(*) FROM customer;
```

### 4. Frontend Registration Flow Testing

#### Step 1: Entry Page
- URL: http://localhost:3000/Registration-Customer/entry.html
- ✅ Page loads correctly
- ✅ Navigation buttons work

#### Step 2: Account Type Selection  
- URL: http://localhost:3000/Registration-Customer/registration1.html
- ✅ Customer types are selectable
- ✅ Data saves to localStorage
- ✅ Proceed button works

#### Step 3: Terms & Conditions
- URL: http://localhost:3000/Registration-Customer/registration2.html
- ✅ Terms display correctly
- ✅ Account type saves
- ✅ Proceed requires acceptance

#### Step 4: Personal Information
- URL: http://localhost:3000/Registration-Customer/registration3.html
- ✅ All form fields display
- ✅ Date dropdowns populate
- ✅ Validation works
- ✅ Data saves to localStorage

#### Step 5: Address & Contact Info
- URL: http://localhost:3000/Registration-Customer/registration4.html
- ✅ Address fields work
- ✅ Alternate address toggle works
- ✅ Contact info validation

#### Step 6: Employment & Financial Info  
- URL: http://localhost:3000/Registration-Customer/registration5.html
- ✅ Employment fields
- ✅ Fund source selection
- ✅ Business nature options

#### Step 7: Aliases & ID Upload (CRITICAL)
- URL: http://localhost:3000/Registration-Customer/registration6.html
- ✅ Alias checkbox logic works
- ✅ ID form fields populate
- ✅ **FILE UPLOAD WORKS** (newly fixed)
- ✅ Files upload to server and paths stored
- ✅ Validation prevents proceed without uploads

#### Step 8: Additional ID Upload
- URL: http://localhost:3000/Registration-Customer/registration7.html  
- ✅ File uploads work (already implemented)
- ✅ Supporting document upload

#### Steps 9-13: Additional verifications
- ✅ Political affiliation, FATCA, etc.
- ✅ Data privacy consent
- ✅ Final submission

### 5. End-to-End Data Flow Test

#### Registration Data Collection Test
```javascript
// Open browser console on registration12.html and check:
console.log('LocalStorage data:', localStorage);

// Should show all collected data including:
// - Personal info (name, birth_date, etc.)
// - Address info  
// - Contact details
// - Employment info
// - Fund sources
// - ID information
// - File paths (front-id-1_path, back-id-1_path, etc.)
// - Consent flags
```

#### Backend Registration Test
```bash
# Monitor backend console during registration submission
# Should see:
# 1. POST /register request
# 2. Database insertion logs
# 3. Transaction commit
# 4. CIF number returned
```

#### Database Verification Test  
```sql
-- After successful registration, check data was saved:

-- 1. Check customer record
SELECT * FROM customer ORDER BY customer_creation_timestamp DESC LIMIT 1;

-- 2. Check address was saved
SELECT * FROM customer_address ORDER BY cif_number DESC LIMIT 2;

-- 3. Check ID records with file paths
SELECT * FROM customer_id ORDER BY cif_number DESC LIMIT 4;

-- 4. Check contact details
SELECT * FROM customer_contact_details ORDER BY cif_number DESC LIMIT 1;

-- 5. Check employment info
SELECT * FROM customer_employment_information ORDER BY cif_number DESC LIMIT 1;
```

## 🐞 Known Issues & Fixes Applied

### ✅ FIXED: Image Upload in Step 6
- **Issue**: Files selected but not uploaded to server
- **Fix**: Added async upload functionality to registration6.js
- **Validation**: Files must be uploaded before proceeding

### ✅ VERIFIED: Step 7 Upload Already Working
- **Status**: registration7.js already has proper upload functionality
- **Features**: File upload, preview, server storage

### 🔍 DATA SAVING ISSUES TO CHECK

1. **Missing Contact Details**
   - Check if phone/email from step 4 saves properly
   - Verify CUSTOMER_CONTACT_DETAILS table gets populated

2. **Employment Information**  
   - Verify employment details from step 5 save
   - Check CUSTOMER_EMPLOYMENT_INFORMATION table

3. **Fund Source Mapping**
   - Check if fund source selections save correctly
   - Verify CUSTOMER_FUND_SOURCE table

4. **ID Information**
   - Verify uploaded file paths save to CUSTOMER_ID table
   - Check date formatting for issue/expiry dates

## 🎯 Testing Commands

### Quick Test Sequence
```bash
# 1. Start backend
cd 2_backend && npm start

# 2. Open registration in browser
start http://localhost:3000/Registration-Customer/entry.html

# 3. Complete registration flow
# 4. Check database for new records
# 5. Verify uploaded files in 2_backend/uploads/
```

### File Upload Test
```bash
# Check uploads directory after file uploads
dir "C:\Users\louie\Documents\Github\COMP010_BSCS25_G4_UniVault\2_backend\uploads"

# Should contain uploaded ID images with timestamp prefixes
```

This comprehensive testing guide will help you validate the entire system!
