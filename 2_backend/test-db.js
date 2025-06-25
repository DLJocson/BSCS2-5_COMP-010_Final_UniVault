require('dotenv').config();
const { pool } = require('./config/database');

async function testDatabase() {
    let connection;
    try {
        console.log('🔍 Testing database connection and tables...');
        connection = await pool.getConnection();
        
        // Test 1: Check if tables exist
        console.log('\n📋 Checking if tables exist...');
        const tables = ['customer', 'review_queue', 'account_details', 'bank_employee', 'customer_product_type'];
        
        for (const table of tables) {
            try {
                const [result] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
                console.log(`✅ ${table}: ${result[0].count} records`);
            } catch (error) {
                console.log(`❌ ${table}: ${error.message}`);
            }
        }
        
        // Test 2: Check customer table structure
        console.log('\n👥 Testing customer query...');
        try {
            const [customers] = await connection.execute(`
                SELECT COUNT(*) as count 
                FROM customer 
                WHERE is_deleted = FALSE
            `);
            console.log(`✅ Customer query successful: ${customers[0].count} active customers`);
        } catch (error) {
            console.log(`❌ Customer query failed: ${error.message}`);
        }
        
        // Test 3: Check review queue
        console.log('\n📋 Testing review queue...');
        try {
            const [reviews] = await connection.execute(`
                SELECT COUNT(*) as count 
                FROM review_queue
            `);
            console.log(`✅ Review queue query successful: ${reviews[0].count} records`);
        } catch (error) {
            console.log(`❌ Review queue query failed: ${error.message}`);
        }
        
        // Test 4: Check closed accounts
        console.log('\n📄 Testing closed accounts...');
        try {
            const [accounts] = await connection.execute(`
                SELECT COUNT(*) as count 
                FROM ACCOUNT_DETAILS 
                WHERE account_status = 'Closed'
            `);
            console.log(`✅ Closed accounts query successful: ${accounts[0].count} records`);
        } catch (error) {
            console.log(`❌ Closed accounts query failed: ${error.message}`);
        }
        
        // Test 5: Check employees
        console.log('\n👨‍💼 Testing employees...');
        try {
            const [employees] = await connection.execute(`
                SELECT COUNT(*) as count 
                FROM bank_employee 
                WHERE is_deleted = FALSE
            `);
            console.log(`✅ Employee query successful: ${employees[0].count} active employees`);
        } catch (error) {
            console.log(`❌ Employee query failed: ${error.message}`);
        }
        
        console.log('\n✅ Database test completed!');
        
    } catch (error) {
        console.error('❌ Database test failed:', error);
    } finally {
        if (connection) {
            connection.release();
        }
        process.exit(0);
    }
}

testDatabase(); 