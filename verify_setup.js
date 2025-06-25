// UniVault Setup Verification Script
// This script verifies that the database and backend are properly configured

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
function loadEnvFile() {
    const envPath = path.join(__dirname, '2_backend', '.env');
    if (!fs.existsSync(envPath)) {
        console.log('❌ .env file not found in 2_backend directory');
        console.log('Please create .env file with your database credentials');
        return null;
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            envVars[key.trim()] = value.trim();
        }
    });
    
    return envVars;
}

async function verifyDatabase() {
    console.log('🔍 Verifying Database Setup...\n');
    
    const envVars = loadEnvFile();
    if (!envVars) return false;
    
    try {
        // Test database connection
        const connection = await mysql.createConnection({
            host: envVars.DB_HOST || 'localhost',
            user: envVars.DB_USER || 'root',
            password: envVars.DB_PASSWORD || '',
            database: envVars.DB_DATABASE || 'univault_schema',
            port: envVars.DB_PORT || 3306
        });
        
        console.log('✅ Database connection successful');
        
        // Check if required tables exist
        const [tables] = await connection.execute('SHOW TABLES');
        const tableNames = tables.map(row => Object.values(row)[0]);
        
        const requiredTables = [
            'CUSTOMER', 'BANK_EMPLOYEE', 'ACCOUNT_DETAILS', 
            'CUSTOMER_ADDRESS', 'CUSTOMER_CONTACT_DETAILS',
            'CUSTOMER_ID', 'CUSTOMER_EMPLOYMENT_INFORMATION'
        ];
        
        const missingTables = requiredTables.filter(table => !tableNames.includes(table));
        
        if (missingTables.length > 0) {
            console.log('❌ Missing tables:', missingTables.join(', '));
            return false;
        }
        
        console.log(`✅ Found ${tableNames.length} tables`);
        
        // Check sample data
        const [customers] = await connection.execute('SELECT COUNT(*) as count FROM CUSTOMER');
        const [employees] = await connection.execute('SELECT COUNT(*) as count FROM BANK_EMPLOYEE');
        const [accounts] = await connection.execute('SELECT COUNT(*) as count FROM ACCOUNT_DETAILS');
        
        console.log(`✅ Sample data loaded:`);
        console.log(`   - Customers: ${customers[0].count}`);
        console.log(`   - Employees: ${employees[0].count}`);
        console.log(`   - Accounts: ${accounts[0].count}`);
        
        if (customers[0].count < 1 || employees[0].count < 1) {
            console.log('⚠️  Warning: Limited sample data found');
        }
        
        await connection.end();
        return true;
        
    } catch (error) {
        console.log('❌ Database verification failed:', error.message);
        return false;
    }
}

async function verifyBackend() {
    console.log('\n🔍 Verifying Backend Setup...\n');
    
    const http = require('http');
    
    return new Promise((resolve) => {
        const req = http.get('http://localhost:3000/api', (res) => {
            if (res.statusCode === 200) {
                console.log('✅ Backend server is running on port 3000');
                resolve(true);
            } else {
                console.log('❌ Backend server returned status:', res.statusCode);
                resolve(false);
            }
        });
        
        req.on('error', () => {
            console.log('❌ Backend server is not running');
            console.log('   Start the server with: cd 2_backend && npm run dev');
            resolve(false);
        });
        
        req.setTimeout(2000, () => {
            console.log('❌ Backend server connection timeout');
            resolve(false);
        });
    });
}

async function main() {
    console.log('🚀 UniVault Setup Verification\n');
    
    const dbOk = await verifyDatabase();
    const backendOk = await verifyBackend();
    
    console.log('\n📊 Verification Summary:');
    console.log('Database:', dbOk ? '✅ OK' : '❌ FAILED');
    console.log('Backend:', backendOk ? '✅ OK' : '❌ FAILED');
    
    if (dbOk && backendOk) {
        console.log('\n🎉 UniVault is ready for use!');
        console.log('You can now run: cd 2_backend && npm test');
    } else {
        console.log('\n⚠️  Setup incomplete. Please check the issues above.');
        if (!dbOk) {
            console.log('To fix database issues:');
            console.log('1. Run: setup_database.bat (Windows) or ./setup_database.sh (Linux/Mac)');
            console.log('2. Check your .env file in 2_backend directory');
        }
        if (!backendOk) {
            console.log('To start the backend:');
            console.log('1. cd 2_backend');
            console.log('2. npm run dev');
        }
    }
}

main().catch(console.error);
