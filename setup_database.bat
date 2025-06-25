@echo off
echo Setting up UniVault Database...
echo.

echo Step 1: Creating database...
mysql -u root -p < 3_database/00_create_database.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to create database
    pause
    exit /b 1
)

echo Step 2: Creating schema...  
mysql -u root -p < 3_database/01_schema.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to create schema
    pause
    exit /b 1
)

echo Step 3: Loading seed data...
mysql -u root -p < 3_database/02_seed_data.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to load seed data
    pause
    exit /b 1
)

echo.
echo ✅ Database setup completed successfully!
echo.
echo Verifying setup...
mysql -u root -p -e "USE univault_schema; SELECT COUNT(*) as customer_count FROM CUSTOMER; SELECT COUNT(*) as employee_count FROM BANK_EMPLOYEE;"

echo.
echo Database is ready! You can now start the backend server.
pause
