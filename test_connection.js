// Test script to verify frontend-backend-database connection
const fetch = require('node-fetch');

async function testConnection() {
    console.log('🔍 Testing UniVault Frontend-Backend-Database Connection...\n');

    const baseUrl = 'http://localhost:3000';
    
    try {
        // Test 1: Check if server is running
        console.log('1️⃣ Testing server availability...');
        const serverResponse = await fetch(`${baseUrl}/api`);
        if (serverResponse.ok) {
            const serverInfo = await serverResponse.json();
            console.log('✅ Server is running');
            console.log('   Message:', serverInfo.message);
        } else {
            throw new Error(`Server not responding: ${serverResponse.status}`);
        }

        // Test 2: Test customer data endpoint
        console.log('\n2️⃣ Testing customer data endpoint...');
        const customerResponse = await fetch(`${baseUrl}/api/customer/all/1`);
        if (customerResponse.ok) {
            const customerData = await customerResponse.json();
            console.log('✅ Customer data endpoint working');
            console.log('   Customer Name:', `${customerData.customer.customer_first_name} ${customerData.customer.customer_last_name}`);
            console.log('   CIF Number:', customerData.customer.cif_number);
            console.log('   Addresses:', customerData.addresses.length);
            console.log('   Contacts:', customerData.contacts.length);
            console.log('   Employment Records:', customerData.employment.length);
        } else {
            throw new Error(`Customer endpoint failed: ${customerResponse.status}`);
        }

        // Test 3: Test basic customer endpoint
        console.log('\n3️⃣ Testing basic customer endpoint...');
        const basicResponse = await fetch(`${baseUrl}/api/customer/1`);
        if (basicResponse.ok) {
            const basicData = await basicResponse.json();
            console.log('✅ Basic customer endpoint working');
            console.log('   Customer:', `${basicData.customer_first_name} ${basicData.customer_last_name}`);
        } else {
            throw new Error(`Basic customer endpoint failed: ${basicResponse.status}`);
        }

        console.log('\n🎉 All tests passed! The connection is working properly.');
        console.log('\n📋 Next steps:');
        console.log('   1. Open your browser and go to: http://localhost:3000/Dashboard-Customer/profile.html?cif=1');
        console.log('   2. The profile page should display customer data automatically');
        console.log('   3. Check the browser console for any JavaScript errors');

    } catch (error) {
        console.error('\n❌ Connection test failed:', error.message);
        console.log('\n🔧 Troubleshooting steps:');
        console.log('   1. Make sure the backend server is running: npm run dev');
        console.log('   2. Check if MySQL is running and accessible');
        console.log('   3. Verify the .env file has correct database credentials');
        console.log('   4. Ensure the database has been created and populated with data');
    }
}

// Run the test
testConnection(); 