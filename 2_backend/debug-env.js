// Debug environment variables
require('dotenv').config();

console.log('🔍 Environment Variables Check:');
console.log('DB_HOST:', process.env.DB_HOST || '❌ MISSING');
console.log('DB_USER:', process.env.DB_USER || '❌ MISSING');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '✅ SET' : '❌ MISSING');
console.log('DB_DATABASE:', process.env.DB_DATABASE || '❌ MISSING');
console.log('DB_PORT:', process.env.DB_PORT || '❌ MISSING');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');

console.log('\n📁 Current working directory:', process.cwd());
console.log('📁 Looking for .env file at:', require('path').resolve('.env'));

const fs = require('fs');
const envPath = require('path').resolve('.env');

if (fs.existsSync(envPath)) {
    console.log('✅ .env file exists');
    const envSize = fs.statSync(envPath).size;
    console.log(`📊 .env file size: ${envSize} bytes`);
    
    if (envSize === 0) {
        console.log('⚠️  .env file is empty!');
    }
} else {
    console.log('❌ .env file not found!');
}
