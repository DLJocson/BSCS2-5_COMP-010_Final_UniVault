#!/bin/bash

echo "Setting up UniVault Database..."
echo

# Check if MySQL is available
if ! command -v mysql &> /dev/null; then
    echo "ERROR: MySQL is not installed or not in PATH"
    exit 1
fi

echo "Step 1: Creating database..."
mysql -u root -p < 3_database/00_create_database.sql
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to create database"
    exit 1
fi

echo "Step 2: Creating schema..."
mysql -u root -p < 3_database/01_schema_improved.sql
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to create schema"
    exit 1
fi

echo "Step 3: Loading seed data..."
mysql -u root -p < 3_database/02_seed_data_improved.sql
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to load seed data"
    exit 1
fi

echo
echo "✅ Database setup completed successfully!"
echo

echo "Verifying setup..."
mysql -u root -p -e "USE univault_schema; SELECT COUNT(*) as customer_count FROM CUSTOMER; SELECT COUNT(*) as employee_count FROM BANK_EMPLOYEE;"

echo
echo "Database is ready! You can now start the backend server."
