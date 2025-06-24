# 🏠 UniVault Localhost Setup & Database Persistence Validation Guide

## ✅ System Status: **READY FOR LOCAL TESTING**

Your UniVault system is configured and ready for localhost testing. Here's your complete validation guide.

---

## 🚀 **STEP 1: Launch the System**

### **1.1 Start the Backend Server**

```bash
# Navigate to backend directory
cd "C:\Users\louie\Documents\Github\COMP010_BSCS25_G4_UniVault\2_backend"

# Start the server
npm start
```

**Expected Output:**
```
Connected to MySQL database!
Server running on http://localhost:3000
```

**If you see errors:**
- **Database Connection Error**: Check if MySQL is running and credentials in `.env` are correct
- **Port Already in Use**: Change PORT in `.env` or kill existing process

### **1.2 Verify Server is Running**

Open your browser and go to: **http://localhost:3000/api**

**Expected Response:**
```json
{
  "message": "Welcome to the UniVault API!",
  "endpoints": [
    { "method": "GET", "path": "/" },
    { "method": "POST", "path": "/register", "description": "Register a new user" },
    { "method": "POST", "path": "/login", "description": "Login as a user" },
    ...
  ]
}
```

---

## 🗄️ **STEP 2: Verify Database Setup**

### **2.1 Check Database Existence**

Connect to MySQL and verify the database exists:

**Using MySQL Command Line:**
```sql
mysql -u root -p
SHOW DATABASES;
USE univault_schema;
SHOW TABLES;
```

**Using MySQL Workbench:**
1. Connect to localhost
2. Look for `univault_schema` database
3. Expand to see tables

**Expected Tables:**
```
- CUSTOMER
- CUSTOMER_ADDRESS
- CUSTOMER_CONTACT_DETAILS
- CUSTOMER_ID
- CUSTOMER_EMPLOYMENT_INFORMATION
- CUSTOMER_FUND_SOURCE
- CUSTOMER_WORK_NATURE
- CUSTOMER_ALIAS
- [Reference tables: CIVIL_STATUS_TYPE, ADDRESS_TYPE, etc.]
```

### **2.2 Test Database Connection from Backend**

```bash
# Test database connectivity
cd 2_backend
node -e "require('dotenv').config(); const {testConnection} = require('./config/database'); testConnection();"
```

**Expected Output:** `Connected to MySQL database!`

---

## 📝 **STEP 3: Complete Registration Flow Test**

### **3.1 Access Registration System**

Open: **http://localhost:3000/Registration-Customer/entry.html**

### **3.2 Step-by-Step Registration Testing**

#### **Step 1: Entry & Navigation**
- Click "Create Account"
- Should navigate to `registration1.html`

#### **Step 2-5: Basic Information**
Fill out these steps with test data:

**Step 1 (Customer Type):**
- Select: "Individual"

**Step 2 (Terms):**
- Accept terms and conditions

**Step 3 (Personal Info):**
```
First Name: John
Middle Name: Marie
Last Name: Doe
Suffix: Jr.
Birth Date: 1990-01-01
Gender: Male
Civil Status: Single
Birth Country: Philippines
Citizenship: Filipino
Residency Status: Resident
```

**Step 4 (Address & Contact):**
```
Home Address:
- Unit: 123
- Building: Sample Building
- Street: Main Street
- Subdivision: Sample Subdivision
- Barangay: Sample Barangay
- City: Quezon City
- Province: Metro Manila
- Country: Philippines
- ZIP: 1100

Contact:
- Personal Code: +63
- Phone: 9171234567
- Email: john.doe@example.com
```

**Step 5 (Employment):**
```
Are you currently employed? Yes

Work Email: john.work@company.com
Work Phone: +63 9179876543
TIN: 123456789000
Primary Employer: Sample Company Inc.
Position: Software Developer
Gross Income: 50000
Fund Source: Salary/Employment Income
```

#### **Step 6-7: File Uploads (CRITICAL TEST)**

**Step 6 (Aliases & IDs):**
- Select "No" for alias
- Fill ID 1 information:
  ```
  ID Type: Driver's License
  ID Number: D123456789
  Issue Date: 2020-01-01
  Expiry Date: 2025-01-01
  ```
- **Upload front and back images** (test with any PNG/JPEG files)
- Fill ID 2 information and upload images
- **IMPORTANT**: Wait for "✓ filename uploaded" confirmation

**Step 7 (Additional Verification):**
- Upload supporting documents if required

#### **Step 8-12: Compliance & Final Steps**
- Step 8-11: Answer compliance questions (usually "No" for most)
- Step 12: Create username and password
  ```
  Username: johndoe123
  Password: SecurePassword123!
  ```

#### **Step 13: Success Confirmation**
- Should show "Enrollment Successful!" message
- Note the CIF number if displayed

---

## 🔍 **STEP 4: Validate Data Persistence**

### **4.1 Real-Time Monitoring**

**Monitor Backend Console:**
While registering, watch the backend console for:
```
POST /register
Database insertion logs
Transaction commit
CIF number: [generated number]
```

### **4.2 Database Verification Queries**

**After completing registration, run these queries:**

#### **A. Find Latest Customer Registration**
```sql
USE univault_schema;

-- Get the most recent customer
SELECT 
    cif_number,
    customer_type,
    CONCAT(customer_first_name, ' ', customer_last_name) as full_name,
    customer_username,
    birth_date,
    customer_creation_timestamp
FROM customer 
ORDER BY customer_creation_timestamp DESC 
LIMIT 1;
```

#### **B. Verify All Data Tables**
```sql
-- Set the CIF number from previous query
SET @latest_cif = (SELECT MAX(cif_number) FROM customer);

-- 1. Customer basic info
SELECT * FROM customer WHERE cif_number = @latest_cif;

-- 2. Address information
SELECT 
    address_type_code,
    CONCAT(address_street, ', ', address_barangay, ', ', address_city) as address
FROM customer_address 
WHERE cif_number = @latest_cif;

-- 3. Contact details
SELECT 
    contact_type_code,
    contact_value,
    CASE contact_type_code 
        WHEN 'CT01' THEN 'Mobile Phone'
        WHEN 'CT03' THEN 'Email'
        ELSE 'Other'
    END as contact_type
FROM customer_contact_details 
WHERE cif_number = @latest_cif;

-- 4. Employment information
SELECT 
    employer_business_name,
    position_code,
    income_monthly_gross
FROM customer_employment_information 
WHERE cif_number = @latest_cif;

-- 5. ID documents with file paths
SELECT 
    id_type_code,
    id_number,
    id_storage as uploaded_file_path,
    id_issue_date,
    id_expiry_date
FROM customer_id 
WHERE cif_number = @latest_cif;

-- 6. Fund sources
SELECT 
    fund_source_code
FROM customer_fund_source 
WHERE cif_number = @latest_cif;
```

#### **C. Data Completeness Check**
```sql
-- Count records across all tables
SELECT 
    'customer' as table_name,
    COUNT(*) as records
FROM customer WHERE cif_number = @latest_cif
UNION ALL
SELECT 'addresses', COUNT(*) FROM customer_address WHERE cif_number = @latest_cif
UNION ALL
SELECT 'contacts', COUNT(*) FROM customer_contact_details WHERE cif_number = @latest_cif
UNION ALL
SELECT 'employment', COUNT(*) FROM customer_employment_information WHERE cif_number = @latest_cif
UNION ALL
SELECT 'id_documents', COUNT(*) FROM customer_id WHERE cif_number = @latest_cif
UNION ALL
SELECT 'fund_sources', COUNT(*) FROM customer_fund_source WHERE cif_number = @latest_cif;
```

### **4.3 File Upload Verification**

**Check Uploaded Files:**
```bash
# Navigate to uploads directory
cd "C:\Users\louie\Documents\Github\COMP010_BSCS25_G4_UniVault\2_backend\uploads"

# List uploaded files (should see timestamp-prefixed files)
dir

# Expected files:
# 1234567890123-front-id-1.jpg
# 1234567890123-back-id-1.jpg
# 1234567890123-front-id-2.jpg
# 1234567890123-back-id-2.jpg
```

---

## 🧪 **STEP 5: Test Login System**

### **5.1 Test Login with Registered Credentials**

1. Go to: **http://localhost:3000/Registration-Customer/login.html**
2. Enter the credentials you used in Step 12:
   ```
   Username: johndoe123
   Password: SecurePassword123!
   ```
3. Click "Login"

**Expected Behavior:**
- Successful login should redirect to customer dashboard
- Backend should return CIF number

**⚠️ Note:** There's a known issue with the password field in login.js that may need manual fixing.

---

## 📊 **STEP 6: Success Indicators**

### **✅ Registration Success Checklist:**

- [ ] Server starts without errors
- [ ] Database connection successful
- [ ] All 13 registration steps accessible
- [ ] File uploads complete with "✓ uploaded" confirmation
- [ ] Registration submission shows success message
- [ ] CIF number generated
- [ ] Data appears in all database tables
- [ ] Contact details saved (phone + email)
- [ ] Employment information saved
- [ ] ID documents with file paths saved
- [ ] Uploaded files exist in `/uploads` directory

### **🔍 Troubleshooting Common Issues:**

#### **Database Connection Failed:**
```bash
# Check MySQL service
net start mysql
# or
services.msc (look for MySQL)
```

#### **Registration Fails:**
- Check backend console for error messages
- Verify all required fields filled
- Ensure file uploads completed

#### **No Data in Database:**
- Check if transaction committed
- Verify field mapping in registration.js
- Check for SQL errors in backend logs

#### **File Upload Issues:**
- Verify uploads directory exists and has write permissions
- Check file size limits
- Ensure only PNG/JPEG files used

---

## 🎯 **Sample Test Data for Quick Testing**

**Use this data for consistent testing:**

```json
{
  "personal": {
    "firstName": "Maria",
    "lastName": "Santos", 
    "birthDate": "1985-05-15",
    "gender": "Female",
    "civilStatus": "Married"
  },
  "address": {
    "barangay": "Bagong Pag-asa",
    "city": "Quezon City", 
    "province": "Metro Manila",
    "zip": "1105"
  },
  "contact": {
    "phone": "09171234567",
    "email": "maria.santos@email.com"
  },
  "credentials": {
    "username": "mariasantos85",
    "password": "MyPassword123!"
  }
}
```

---

## 📞 **Quick Verification Commands**

**One-line tests you can run:**

```bash
# Test server
curl http://localhost:3000/api

# Test database connection
cd 2_backend && node -e "require('dotenv').config(); require('./config/database').testConnection();"

# Check latest registration
mysql -u root -p -e "USE univault_schema; SELECT MAX(cif_number) as latest_cif, COUNT(*) as total_customers FROM customer;"
```

Your UniVault system is ready for comprehensive testing! 🚀
