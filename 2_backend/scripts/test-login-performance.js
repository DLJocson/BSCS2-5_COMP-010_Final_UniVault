#!/usr/bin/env node

require('dotenv').config();

async function testLoginPerformance() {
    console.log('🚀 Testing admin login performance...');
    
    const testCredentials = [
        { username: 'jrizal', password: 'admin123' },
        { username: 'abonifacio', password: 'admin123' },
        { username: 'gdelpilar', password: 'admin123' }
    ];
    
    for (const cred of testCredentials) {
        try {
            const startTime = Date.now();
            
            const response = await fetch('http://localhost:3000/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cred)
            });
            
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                console.log(`✅ ${cred.username}: Login successful in ${responseTime}ms`);
            } else {
                console.log(`❌ ${cred.username}: Login failed - ${data.message}`);
            }
            
        } catch (error) {
            console.log(`❌ ${cred.username}: Network error - ${error.message}`);
        }
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n📊 Performance test completed!');
    console.log('💡 Expected login time should be under 500ms for good performance');
}

// Check if server is running first
async function checkServer() {
    try {
        const response = await fetch('http://localhost:3000/api');
        if (response.ok) {
            return true;
        }
    } catch (error) {
        return false;
    }
    return false;
}

async function main() {
    const serverRunning = await checkServer();
    
    if (!serverRunning) {
        console.log('❌ Server is not running on localhost:3000');
        console.log('💡 Please start the server with: npm run dev');
        process.exit(1);
    }
    
    await testLoginPerformance();
}

main().catch(console.error);
