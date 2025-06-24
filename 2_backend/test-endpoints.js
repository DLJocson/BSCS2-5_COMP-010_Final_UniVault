#!/usr/bin/env node

/**
 * Endpoint Testing Script
 * Tests all backend endpoints to ensure they work correctly
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const TEST_CIF = 1; // Use existing CIF for testing

// Test results
const results = {
    passed: 0,
    failed: 0,
    tests: []
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const lib = url.startsWith('https') ? https : http;
        const req = lib.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    data: data
                });
            });
        });
        
        req.on('error', reject);
        
        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

// Test helper
async function test(description, testFn) {
    console.log(`Testing: ${description}`);
    try {
        await testFn();
        console.log(`✅ PASS: ${description}`);
        results.passed++;
        results.tests.push({ description, status: 'PASS' });
    } catch (error) {
        console.log(`❌ FAIL: ${description} - ${error.message}`);
        results.failed++;
        results.tests.push({ description, status: 'FAIL', error: error.message });
    }
}

// Individual tests
async function testRootEndpoint() {
    const response = await makeRequest(`${BASE_URL}/`);
    if (response.statusCode !== 200) {
        throw new Error(`Expected 200, got ${response.statusCode}`);
    }
}

async function testAPIEndpoint() {
    const response = await makeRequest(`${BASE_URL}/api`);
    if (response.statusCode !== 200) {
        throw new Error(`Expected 200, got ${response.statusCode}`);
    }
    
    const data = JSON.parse(response.data);
    if (!data.message || !data.endpoints) {
        throw new Error('API endpoint response missing required fields');
    }
}

async function testCustomerEndpoint() {
    const response = await makeRequest(`${BASE_URL}/api/customer/${TEST_CIF}`);
    if (response.statusCode !== 200 && response.statusCode !== 404) {
        throw new Error(`Expected 200 or 404, got ${response.statusCode}`);
    }
}

async function testCustomerAllEndpoint() {
    const response = await makeRequest(`${BASE_URL}/api/customer/all/${TEST_CIF}`);
    if (response.statusCode !== 200 && response.statusCode !== 404) {
        throw new Error(`Expected 200 or 404, got ${response.statusCode}`);
    }
}

async function testInvalidCIFValidation() {
    const response = await makeRequest(`${BASE_URL}/api/customer/invalid`);
    if (response.statusCode !== 400) {
        throw new Error(`Expected 400 for invalid CIF, got ${response.statusCode}`);
    }
    
    const data = JSON.parse(response.data);
    if (data.error !== 'INVALID_CIF_NUMBER') {
        throw new Error('Expected INVALID_CIF_NUMBER error code');
    }
}

async function testLoginValidation() {
    const response = await makeRequest(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    });
    
    if (response.statusCode !== 400) {
        throw new Error(`Expected 400 for empty login, got ${response.statusCode}`);
    }
}

async function testRegistrationValidation() {
    const response = await makeRequest(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    });
    
    if (response.statusCode !== 400) {
        throw new Error(`Expected 400 for empty registration, got ${response.statusCode}`);
    }
}

async function testFileUploadEndpoint() {
    // Test without file
    const response = await makeRequest(`${BASE_URL}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    });
    
    if (response.statusCode !== 400) {
        throw new Error(`Expected 400 for upload without file, got ${response.statusCode}`);
    }
}

async function testCountriesAPIProxy() {
    const response = await makeRequest(`${BASE_URL}/api/countries`);
    // This might fail if external API is down, so we accept both success and failure
    if (response.statusCode !== 200 && response.statusCode !== 500) {
        throw new Error(`Expected 200 or 500 for countries API, got ${response.statusCode}`);
    }
}

async function testNonExistentEndpoint() {
    const response = await makeRequest(`${BASE_URL}/nonexistent`);
    if (response.statusCode !== 404) {
        throw new Error(`Expected 404 for non-existent endpoint, got ${response.statusCode}`);
    }
}

// Main test runner
async function runTests() {
    console.log('🚀 Starting Backend Endpoint Tests\n');
    
    // Basic endpoint tests
    await test('Root endpoint (/)', testRootEndpoint);
    await test('API info endpoint (/api)', testAPIEndpoint);
    
    // Customer endpoint tests
    await test('Customer endpoint validation', testCustomerEndpoint);
    await test('Customer all data endpoint', testCustomerAllEndpoint);
    await test('Invalid CIF number validation', testInvalidCIFValidation);
    
    // Authentication tests
    await test('Login validation', testLoginValidation);
    await test('Registration validation', testRegistrationValidation);
    
    // File upload tests
    await test('File upload endpoint', testFileUploadEndpoint);
    
    // External API tests
    await test('Countries API proxy', testCountriesAPIProxy);
    
    // Error handling tests
    await test('Non-existent endpoint (404)', testNonExistentEndpoint);
    
    // Print summary
    console.log('\n📊 Test Summary:');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
    
    // Save results to file
    fs.writeFileSync(
        path.join(__dirname, 'test-results.json'), 
        JSON.stringify(results, null, 2)
    );
    
    if (results.failed > 0) {
        console.log('\n❌ Some tests failed. Check the details above.');
        process.exit(1);
    } else {
        console.log('\n🎉 All tests passed!');
    }
}

// Run tests if this script is executed directly
if (require.main === module) {
    // Check if server is running
    makeRequest(`${BASE_URL}/`)
        .then(() => runTests())
        .catch((error) => {
            console.error('❌ Server is not running or not accessible at', BASE_URL);
            console.error('Please start the server first with: npm start');
            process.exit(1);
        });
}

module.exports = { test, makeRequest, runTests };
