// Simple server health check script
const express = require('express');
const { pool } = require('./config/database');

async function testDatabaseConnection() {
    try {
        console.log('🔍 Testing database connection...');
        const connection = await pool.getConnection();
        
        // Test basic query
        const [result] = await connection.execute('SELECT 1 as test');
        console.log('✅ Database connection successful:', result);
        
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

async function testServerHealth() {
    console.log('🚀 Running server health check...');
    
    // Test database
    const dbStatus = await testDatabaseConnection();
    
    // Test admin routes
    try {
        const adminRoutes = require('./routes/admin');
        console.log('✅ Admin routes loaded successfully');
    } catch (error) {
        console.error('❌ Admin routes failed to load:', error.message);
    }
    
    console.log('📋 Health Check Summary:');
    console.log(`Database: ${dbStatus ? '✅ Connected' : '❌ Failed'}`);
    
    if (!dbStatus) {
        console.log('\n🔧 Troubleshooting Database Issues:');
        console.log('1. Check if MySQL server is running');
        console.log('2. Verify database credentials in .env file');
        console.log('3. Ensure database "univault_schema" exists');
        console.log('4. Check if port 3306 is available');
    }
    
    process.exit(dbStatus ? 0 : 1);
}

if (require.main === module) {
    testServerHealth();
}

module.exports = { testDatabaseConnection, testServerHealth };
