#!/usr/bin/env node

require('dotenv').config();
const { pool } = require('../config/database');

async function optimizeLoginPerformance() {
    let connection;
    
    try {
        console.log('🔧 Starting login performance optimization...');
        
        connection = await pool.getConnection();
        
        // Add missing columns (with MySQL compatibility)
        console.log('📋 Checking and adding missing columns to BANK_EMPLOYEE...');
        
        // Check if columns exist first
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'BANK_EMPLOYEE'
        `);
        
        const existingColumns = columns.map(col => col.COLUMN_NAME);
        
        if (!existingColumns.includes('is_deleted')) {
            await connection.execute(`
                ALTER TABLE BANK_EMPLOYEE 
                ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE
            `);
            console.log('  ✅ Added is_deleted column');
        } else {
            console.log('  ⏭️ is_deleted column already exists');
        }
        
        if (!existingColumns.includes('created_at')) {
            await connection.execute(`
                ALTER TABLE BANK_EMPLOYEE 
                ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            `);
            console.log('  ✅ Added created_at column');
        } else {
            console.log('  ⏭️ created_at column already exists');
        }
        
        if (!existingColumns.includes('updated_at')) {
            await connection.execute(`
                ALTER TABLE BANK_EMPLOYEE 
                ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            `);
            console.log('  ✅ Added updated_at column');
        } else {
            console.log('  ⏭️ updated_at column already exists');
        }
        
        // Create optimized index
        console.log('🚀 Creating optimized indexes...');
        try {
            await connection.execute(`
                CREATE INDEX idx_employee_username_active 
                ON BANK_EMPLOYEE (employee_username, is_deleted)
            `);
            console.log('  ✅ Created optimized login index');
        } catch (error) {
            if (error.code === 'ER_DUP_KEYNAME') {
                console.log('  ⏭️ Login index already exists');
            } else {
                console.log('  ⚠️ Index creation error:', error.message);
            }
        }
        
        // Update existing records
        console.log('📝 Updating existing employee records...');
        const [updateResult] = await connection.execute(`
            UPDATE BANK_EMPLOYEE 
            SET is_deleted = FALSE 
            WHERE is_deleted IS NULL
        `);
        console.log(`Updated ${updateResult.affectedRows} employee records`);
        
        // Test query performance
        console.log('⚡ Testing query performance...');
        const startTime = Date.now();
        const [testResult] = await connection.execute(`
            SELECT employee_id, employee_username, employee_position 
            FROM BANK_EMPLOYEE 
            WHERE employee_username = 'jrizal' 
            AND is_deleted = FALSE 
            LIMIT 1
        `);
        const queryTime = Date.now() - startTime;
        console.log(`Query completed in ${queryTime}ms`);
        console.log(`Found ${testResult.length} employee(s)`);
        
        // Show table status
        console.log('📊 Table optimization status:');
        const [indexes] = await connection.execute(`
            SHOW INDEX FROM BANK_EMPLOYEE 
            WHERE Key_name LIKE '%username%'
        `);
        
        console.log('Username-related indexes:');
        indexes.forEach(index => {
            console.log(`  - ${index.Key_name}: ${index.Column_name} (${index.Index_type})`);
        });
        
        console.log('✅ Login performance optimization completed successfully!');
        
    } catch (error) {
        console.error('❌ Error during optimization:', error.message);
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
        await pool.end();
    }
}

// Run optimization if this script is executed directly
if (require.main === module) {
    optimizeLoginPerformance()
        .then(() => {
            console.log('🎉 All optimizations applied successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 Optimization failed:', error.message);
            process.exit(1);
        });
}

module.exports = { optimizeLoginPerformance };
