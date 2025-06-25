// UniVault Diagnostic Script
// This script helps diagnose common setup issues

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function checkFileExists(filePath, description) {
    const exists = fs.existsSync(filePath);
    console.log(`${exists ? '✅' : '❌'} ${description}: ${filePath}`);
    return exists;
}

function checkCommand(command, description) {
    try {
        execSync(command, { stdio: 'pipe' });
        console.log(`✅ ${description}: Available`);
        return true;
    } catch (error) {
        console.log(`❌ ${description}: Not available`);
        return false;
    }
}

function checkNodeModules() {
    const backendNodeModules = path.join(__dirname, '2_backend', 'node_modules');
    const exists = fs.existsSync(backendNodeModules);
    console.log(`${exists ? '✅' : '❌'} Backend dependencies: ${exists ? 'Installed' : 'Missing'}`);
    
    if (!exists) {
        console.log('   Run: cd 2_backend && npm install');
    }
    
    return exists;
}

function checkDatabaseFiles() {
    const dbDir = path.join(__dirname, '3_database');
    const files = [
        '00_create_database.sql',
        '01_schema.sql',
        '02_seed_data.sql'
    ];
    
    let allExist = true;
    files.forEach(file => {
        const exists = checkFileExists(path.join(dbDir, file), file);
        if (!exists) allExist = false;
    });
    
    return allExist;
}

function checkBackendFiles() {
    const backendDir = path.join(__dirname, '2_backend');
    const files = [
        'server.js',
        'package.json',
        'test-endpoints.js'
    ];
    
    let allExist = true;
    files.forEach(file => {
        const exists = checkFileExists(path.join(backendDir, file), file);
        if (!exists) allExist = false;
    });
    
    return allExist;
}

function checkEnvFile() {
    const envPath = path.join(__dirname, '2_backend', '.env');
    const exists = fs.existsSync(envPath);
    console.log(`${exists ? '✅' : '❌'} Environment file: ${exists ? 'Present' : 'Missing'}`);
    
    if (!exists) {
        console.log('   Create .env file in 2_backend directory with:');
        console.log('   DB_HOST=localhost');
        console.log('   DB_USER=root');
        console.log('   DB_PASSWORD=your_password');
        console.log('   DB_DATABASE=univault_schema');
        console.log('   DB_PORT=3306');
    }
    
    return exists;
}

function checkPort3000() {
    const net = require('net');
    
    return new Promise((resolve) => {
        const server = net.createServer();
        
        server.listen(3000, () => {
            server.close(() => {
                console.log('✅ Port 3000: Available');
                resolve(true);
            });
        });
        
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log('⚠️  Port 3000: In use (this is OK if your server is already running)');
                resolve(false);
            } else {
                console.log('❌ Port 3000: Error -', err.message);
                resolve(false);
            }
        });
    });
}

async function main() {
    console.log('🔍 UniVault Diagnostic Report\n');
    
    // Check system requirements
    console.log('📋 System Requirements:');
    checkCommand('node --version', 'Node.js');
    checkCommand('npm --version', 'npm');
    checkCommand('mysql --version', 'MySQL');
    
    console.log('\n📁 Required Files:');
    checkDatabaseFiles();
    checkBackendFiles();
    checkEnvFile();
    
    console.log('\n📦 Dependencies:');
    checkNodeModules();
    
    console.log('\n🌐 Network:');
    await checkPort3000();
    
    console.log('\n🔧 Common Solutions:');
    console.log('1. Install dependencies: cd 2_backend && npm install');
    console.log('2. Setup database: setup_database.bat (Windows) or ./setup_database.sh (Linux/Mac)');
    console.log('3. Create .env file in 2_backend directory');
    console.log('4. Start server: cd 2_backend && npm run dev');
    console.log('5. Run tests: cd 2_backend && npm test');
    
    console.log('\n📖 For detailed setup instructions, see SETUP.md');
}

main().catch(console.error);
