# UniVault Complete Setup Guide

## Prerequisites

Before setting up UniVault, ensure you have the following installed:

- **MySQL 8.0+** or **MariaDB 10.5+**
- **Node.js 16.0+** and **npm**
- **Git** (for version control)

## Database Setup

### Option A: Automated Setup (Recommended)

**For Windows:**
```bash
# Run the batch file (will prompt for MySQL password 3 times)
setup_database.bat
```

**For Linux/Mac:**
```bash
# Make executable and run
chmod +x setup_database.sh
./setup_database.sh
```

### Option B: Manual Setup

#### Step 1: Create the Database
```bash
mysql -u root -p < 3_database/00_create_database.sql
```

#### Step 2: Run Database Schema
```bash
mysql -u root -p < 3_database/01_schema_improved.sql
```

#### Step 3: Load Seed Data
```bash
mysql -u root -p < 3_database/02_seed_data_improved.sql
```

**Note:** You'll be prompted for your MySQL root password for each command.

### Step 4: Verify Database Setup

Log into MySQL and check that the database was created properly:

```sql
USE univault_schema;
SHOW TABLES;

-- Should show 23 tables
-- Verify sample data
SELECT COUNT(*) FROM CUSTOMER;  -- Should return 6
SELECT COUNT(*) FROM BANK_EMPLOYEE;  -- Should return 5
```

## Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd 2_backend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the `2_backend` directory:

```bash
# Copy the example and edit
cp .env.example .env
```

Edit the `.env` file with your database credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_DATABASE=univault_schema
DB_PORT=3306
COUNTRY_STATE_CITY_API_KEY=your_api_key_here
NODE_ENV=development
```

### Step 4: Start the Backend Server

```bash
# Development mode (with detailed logging)
npm run dev

# Or production mode
npm start
```

The server should start on `http://localhost:3000`

### Step 5: Test the Backend

Run the comprehensive test suite:

```bash
npm test
```

## Frontend Setup

### Step 1: Navigate to Frontend Directory

```bash
cd 1_frontend
```

### Step 2: Open in Browser

Since this is a static HTML/CSS/JS frontend, you can:

1. **Use Live Server Extension** (VS Code):
   - Install "Live Server" extension
   - Right-click on `index.html` and select "Open with Live Server"

2. **Use Python HTTP Server**:
   ```bash
   # Python 3
   python -m http.server 8080
   
   # Python 2
   python -m SimpleHTTPServer 8080
   ```

3. **Use Node.js HTTP Server**:
   ```bash
   npx http-server -p 8080
   ```

## System Verification

### Quick Setup Verification

Use the automated verification script to check your setup:

```bash
# Run the verification script
node verify_setup.js

# Or from the backend directory
cd 2_backend
npm run verify
```

This script will check:
- ✅ Database connection
- ✅ Required tables exist
- ✅ Sample data is loaded
- ✅ Backend server is running

### Manual Verification Steps

#### 1. Database Verification

Check that all tables exist and have data:

```sql
USE univault_schema;

-- Check table count (should be 23 tables)
SELECT COUNT(*) as table_count FROM information_schema.tables 
WHERE table_schema = 'univault_schema';

-- Verify sample data
SELECT COUNT(*) as customer_count FROM CUSTOMER;  -- Should be 6
SELECT COUNT(*) as employee_count FROM BANK_EMPLOYEE;  -- Should be 5
SELECT COUNT(*) as account_count FROM ACCOUNT_DETAILS;  -- Should be 6

-- Check data integrity
SELECT 
    c.cif_number,
    c.customer_first_name,
    c.customer_last_name,
    c.customer_status,
    c.risk_level,
    COUNT(ca.account_number) as account_count
FROM CUSTOMER c
LEFT JOIN CUSTOMER_ACCOUNT ca ON c.cif_number = ca.cif_number
GROUP BY c.cif_number;
```

#### 2. Backend API Verification

Start the backend server:

```bash
cd 2_backend
npm run dev
```

Test key endpoints:

```bash
# Health check
curl http://localhost:3000/api

# Get customer info
curl http://localhost:3000/api/customers/1000000000

# Test validation
curl -X POST http://localhost:3000/api/login -H "Content-Type: application/json" -d "{\"username\":\"test\",\"password\":\"test\"}"
```

#### 3. Full Integration Test

Run the comprehensive test suite:

```bash
cd 2_backend
npm test
```

**Expected results:**
- ✅ 10/10 tests should pass
- ✅ All endpoints return proper responses
- ✅ Data validation works correctly
- ✅ Error handling is consistent

## Troubleshooting

### Database Issues

**Error: "Database 'univault_schema' doesn't exist"**
```bash
# Recreate the database
mysql -u root -p -e "CREATE DATABASE univault_schema;"
mysql -u root -p < 3_database/01_schema_improved.sql
mysql -u root -p < 3_database/02_seed_data_improved.sql
```

**Error: "Access denied for user"**
```bash
# Check MySQL service is running
# Windows: services.msc -> MySQL
# Linux: sudo systemctl status mysql
# Mac: brew services list | grep mysql

# Reset MySQL password if needed
mysql -u root -p
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
```

**Error: "Table doesn't exist"**
```bash
# Check if schema was applied
mysql -u root -p -e "USE univault_schema; SHOW TABLES;"

# If empty, reapply schema
mysql -u root -p < 3_database/01_schema_improved.sql
```

### Backend Issues

**Error: "Cannot connect to database"**
- Verify MySQL is running
- Check `.env` file credentials
- Test database connection:
  ```bash
  mysql -h localhost -u root -p univault_schema
  ```

**Error: "Port 3000 already in use"**
```bash
# Find and kill process using port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

**Error: Missing dependencies**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### File Upload Issues

**Error: "Upload directory not accessible"**
```bash
# Create uploads directory with proper permissions
mkdir -p 2_backend/uploads
chmod 755 2_backend/uploads
```

## Development Commands

### Backend Development

```bash
cd 2_backend

# Start development server with auto-reload
npm run dev

# Run tests
npm test

# Clean up old uploaded files
npm run cleanup

# Check file cleanup (dry run)
npm run cleanup-dry
```

### Database Maintenance

```bash
# Backup database
mysqldump -u root -p univault_schema > backup_$(date +%Y%m%d).sql

# Restore database
mysql -u root -p univault_schema < backup_file.sql

# Reset database to fresh state
mysql -u root -p -e "DROP DATABASE IF EXISTS univault_schema;"
mysql -u root -p < 3_database/01_schema_improved.sql
mysql -u root -p < 3_database/02_seed_data_improved.sql
```

## Production Deployment Notes

1. **Environment Variables**: Use production-ready values for all sensitive data
2. **Database Security**: Create dedicated database user with limited privileges
3. **File Storage**: Configure proper file storage with backups
4. **HTTPS**: Ensure all connections use HTTPS in production
5. **Monitoring**: Set up logging and monitoring for the application

## Sample Test Data

The system comes with 6 sample customers for testing:

1. **Juan Dela Cruz** - Standard customer (Low risk)
2. **Maria Clara Santos** - Remittance customer (Medium risk)
3. **Pedro Penduko** - Business owner with alias (Medium risk)
4. **Rodrigo Gambler** - Gaming industry (High risk)
5. **Sisa Madrigal** - Pending verification
6. **Miguel Politico** - Political connection (High risk)

You can use these for testing various scenarios and risk levels.
