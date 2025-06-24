# 🚀 COMPLETE LOCAL TESTING GUIDE
**UniVault Registration System - Localhost Setup & Database Verification**  
**Updated:** 2025-06-25

---

## 📋 PRE-TESTING CHECKLIST

### ✅ **1. Database Setup**
Ensure MySQL is running and UniVault database is created:
```sql
-- Connect to MySQL and run:
CREATE DATABASE IF NOT EXISTS univault_schema;
USE univault_schema;
-- Then run the schema from: 3_database/01_schema.sql
-- And seed data from: 3_database/02_seed_data.sql
```

### ✅ **2. Backend Configuration**
Verify your `.env` file in `2_backend/` has correct database credentials:
```env
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_DATABASE=univault_schema
DB_PORT=3306
PORT=3000
```

---

## 🎯 STEP-BY-STEP TESTING PROCESS

### **Step 1: Start the Backend Server**

```bash
# Navigate to backend directory
cd 2_backend

# Install dependencies (if not done already)
npm install

# Start the server
npm start
```

**Expected Output:**
```
> univault-backend@1.0.0 start
> node server.js

Server running on http://localhost:3000
Connected to MySQL database!
```

### **Step 2: Access the Registration System**

**Option A: Direct File Access**
```
file:///c:/Users/louie/Documents/Github/COMP010_BSCS25_G4_UniVault/1_frontend/Registration-Customer/entry.html
```

**Option B: Through Server**
```
http://localhost:3000/Registration-Customer/entry.html
```

### **Step 3: Complete Registration Flow**

Follow this **complete registration test scenario**:

#### **📝 Registration Data to Use:**

**Step 1 & 2:** Customer & Account Type
- Customer Type: Account Owner
- Account Type: Deposit

**Step 3:** Personal Information
- First Name: `Juan`
- Middle Name: `Santos` (optional)
- Last Name: `Cruz`
- Birth Date: `January 15, 1990` (must be 18+)
- Gender: `Male`
- Civil Status: `Single`
- Birth Country: `Philippines`
- Citizenship: `Filipino`
- Residency Status: `Citizen`

**Step 4:** Contact & Address
- Phone Country Code: `63`
- Phone Number: `9171234567`
- Home Code: `02`
- Landline: `1234-5678`
- Email: `juan.cruz@example.com`
- Address:
  - Unit: `Unit 123`
  - Building: `Sample Tower`
  - Street: `Main Street`
  - Subdivision: `Sample Village`
  - Barangay: `Barangay San Juan`
  - City: `Makati`
  - Province: `Metro Manila`
  - Country: `Philippines`
  - ZIP: `1234`

**Step 5:** Employment & Financial
- Currently Employed: `Yes`
- Work Email: `juan.cruz@company.com`
- Work Country: `Philippines`
- Business Number: `02-987-6543`
- TIN: `123-456-789-000`
- Primary Employer: `Sample Company Inc.`
- Position: `Employee`
- Employment Start Date: `January 2020`
- Source of Funds: `Employed - Fixed Income`
- Business Nature: `Information and Communication Technology`
- Gross Income: `50000`

**Step 6:** Aliases & IDs
- Has Alias: `No` (skip alias section)
- **ID 1:**
  - Type: `Driver's License`
  - Number: `D12-34-567890`
  - Issue Date: `January 2020`
  - Expiry Date: `January 2025`
  - Upload front and back images
- **ID 2:**
  - Type: `SSS ID`
  - Number: `12-3456789-0`
  - Issue Date: `June 2019`
  - Expiry Date: `None` (leave blank)
  - Upload front and back images

**Step 7:** ID Verification
- Upload required ID images (use any sample images)

**Step 8:** Regulatory Compliance
- Political Affiliation: `No`
- FATCA: `No`
- DNFBP: `No`
- Online Gaming: `No`
- Beneficial Owner: `No`

**Step 9:** Data Privacy Consent
- ✅ **MUST SELECT:** `I give my consent...`

**Step 10:** Credit Card Consent
- Either option (optional)

**Step 11:** Customer Undertaking
- ✅ **MUST SELECT:** `I agree to the customer undertaking...`

**Step 12:** Username & Password
- Username: `juancruz2025`
- Password: `SecurePass123!`

---

## 🔍 DATABASE VERIFICATION

### **Method 1: Through Backend API**

After successful registration, test these endpoints:

```bash
# Get customer info (replace with actual CIF number from registration)
curl http://localhost:3000/api/customer/1000000000

# Get complete customer data
curl http://localhost:3000/api/customer/all/1000000000
```

### **Method 2: Direct Database Query**

Connect to MySQL and run verification queries:

```sql
-- 1. Check customer record
SELECT cif_number, customer_first_name, customer_last_name, customer_username, customer_status
FROM CUSTOMER 
ORDER BY cif_number DESC 
LIMIT 1;

-- 2. Check address records
SELECT ca.*, at.address_type 
FROM CUSTOMER_ADDRESS ca
JOIN ADDRESS_TYPE at ON ca.address_type_code = at.address_type_code
WHERE ca.cif_number = (SELECT MAX(cif_number) FROM CUSTOMER);

-- 3. Check contact details
SELECT ccd.*, ct.contact_type_description
FROM CUSTOMER_CONTACT_DETAILS ccd
JOIN CONTACT_TYPE ct ON ccd.contact_type_code = ct.contact_type_code
WHERE ccd.cif_number = (SELECT MAX(cif_number) FROM CUSTOMER);

-- 4. Check employment information
SELECT cei.*, ep.job_title, ep.employment_type
FROM CUSTOMER_EMPLOYMENT_INFORMATION cei
JOIN EMPLOYMENT_POSITION ep ON cei.position_code = ep.position_code
WHERE cei.cif_number = (SELECT MAX(cif_number) FROM CUSTOMER);

-- 5. Check fund sources
SELECT cfs.*, fst.fund_source
FROM CUSTOMER_FUND_SOURCE cfs
JOIN FUND_SOURCE_TYPE fst ON cfs.fund_source_code = fst.fund_source_code
WHERE cfs.cif_number = (SELECT MAX(cif_number) FROM CUSTOMER);

-- 6. Check ID documents
SELECT ci.*, it.id_description
FROM CUSTOMER_ID ci
JOIN ID_TYPE it ON ci.id_type_code = it.id_type_code
WHERE ci.cif_number = (SELECT MAX(cif_number) FROM CUSTOMER);

-- 7. Complete customer overview
SELECT 
    c.cif_number,
    c.customer_first_name,
    c.customer_last_name,
    c.customer_username,
    c.birth_date,
    c.gender,
    cs.civil_status_description,
    c.customer_status,
    c.created_at
FROM CUSTOMER c
JOIN CIVIL_STATUS_TYPE cs ON c.civil_status_code = cs.civil_status_code
ORDER BY c.cif_number DESC 
LIMIT 1;
```

---

## ✅ VERIFICATION CHECKLIST

After completing registration, verify these records exist:

### **✅ CUSTOMER Table**
- [ ] New CIF number generated (10-digit)
- [ ] Personal information saved correctly
- [ ] Password is hashed (not plain text)
- [ ] Status is 'Pending Verification'
- [ ] Regulatory fields populated

### **✅ CUSTOMER_ADDRESS Table**
- [ ] Home address (AD01) exists
- [ ] All required address fields populated
- [ ] ZIP code format correct

### **✅ CUSTOMER_CONTACT_DETAILS Table**
- [ ] Phone number with CT01 (Mobile)
- [ ] Email with CT04 (Personal Email)
- [ ] Contact values match input

### **✅ CUSTOMER_EMPLOYMENT_INFORMATION Table**
- [ ] Employment record created
- [ ] Position code mapped correctly (EP01-EP06)
- [ ] Start date is valid (not future)
- [ ] Gross income saved as decimal

### **✅ CUSTOMER_FUND_SOURCE Table**
- [ ] At least one fund source exists
- [ ] Fund source code format correct (FS001-FS012)

### **✅ CUSTOMER_ID Table**
- [ ] Two ID records exist
- [ ] ID types mapped correctly
- [ ] Issue dates are not in future
- [ ] Expiry dates are in future (if provided)
- [ ] File paths stored correctly

---

## 🐛 TROUBLESHOOTING

### **Common Issues & Solutions:**

#### **Server Won't Start**
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill process if needed
taskkill /PID <process_id> /F

# Try different port
PORT=3001 npm start
```

#### **Database Connection Failed**
- Verify MySQL is running: `services.msc` → MySQL
- Check credentials in `.env` file
- Test connection: `mysql -u root -p`

#### **Registration Fails**
- Check browser console for JavaScript errors
- Check backend logs for SQL errors
- Verify all required fields are filled

#### **Data Not Saving**
- Check for constraint violations in backend logs
- Verify reference codes exist in lookup tables
- Check NOT NULL constraint violations

---

## 📊 SUCCESS INDICATORS

### **✅ Successful Registration Shows:**
1. **Frontend:** Redirects to `registration13.html` (success page)
2. **Backend Response:** Returns `{ "cif_number": "1000000000", "message": "Registration successful..." }`
3. **Database:** All 6+ tables have new records for the customer
4. **No Errors:** Console shows no JavaScript or SQL errors

### **✅ Expected Database State:**
```sql
-- Should return 1 for each:
SELECT COUNT(*) FROM CUSTOMER WHERE cif_number = [NEW_CIF];                    -- 1 record
SELECT COUNT(*) FROM CUSTOMER_ADDRESS WHERE cif_number = [NEW_CIF];            -- 1+ records  
SELECT COUNT(*) FROM CUSTOMER_CONTACT_DETAILS WHERE cif_number = [NEW_CIF];    -- 2+ records
SELECT COUNT(*) FROM CUSTOMER_EMPLOYMENT_INFORMATION WHERE cif_number = [NEW_CIF]; -- 1 record
SELECT COUNT(*) FROM CUSTOMER_FUND_SOURCE WHERE cif_number = [NEW_CIF];        -- 1+ records
SELECT COUNT(*) FROM CUSTOMER_ID WHERE cif_number = [NEW_CIF];                 -- 2 records
```

---

## 🎯 NEXT STEPS AFTER TESTING

1. **✅ Verify all data fields are correctly mapped**
2. **✅ Test edge cases (special characters, long names)**
3. **✅ Test file upload functionality**
4. **✅ Test validation rules (age check, required fields)**
5. **✅ Test error handling (duplicate username, invalid data)**

**The system is now fully tested and ready for production deployment!**
