@echo off
echo Testing UniVault Database Setup...

echo Step 1: Dropping and recreating database...
mysql -u root -p -e "DROP DATABASE IF EXISTS univault_schema_test; CREATE DATABASE univault_schema_test;"

echo Step 2: Testing schema creation...
mysql -u root -p univault_schema_test < 3_database/01_schema_improved.sql

if %ERRORLEVEL% equ 0 (
    echo ✅ Schema created successfully!
    
    echo Step 3: Testing seed data...
    mysql -u root -p univault_schema_test < 3_database/02_seed_data_improved.sql
    
    if %ERRORLEVEL% equ 0 (
        echo ✅ Seed data loaded successfully!
        echo ✅ Database setup test PASSED!
        
        echo Step 4: Verifying single employee approval...
        mysql -u root -p univault_schema_test -e "DESCRIBE ACCOUNT_DETAILS; SELECT 'approved_by_employee column check:' as test; SELECT COUNT(*) as 'Should be 0' FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='univault_schema_test' AND TABLE_NAME='ACCOUNT_DETAILS' AND COLUMN_NAME='approved_by_employee';"
    ) else (
        echo ❌ Seed data failed to load
    )
) else (
    echo ❌ Schema creation failed
)

echo.
echo Cleaning up test database...
mysql -u root -p -e "DROP DATABASE IF EXISTS univault_schema_test;"

pause
