// MINIMAL EXPRESS TEST
const express = require('express');
const app = express();

console.log('🚀 Express version:', express.version || 'unknown');
console.log('🏗️ App created, router status:', app._router ? 'EXISTS' : 'NULL');

// Add minimal middleware
app.use(express.json());
console.log('🔧 After middleware, router status:', app._router ? 'EXISTS' : 'NULL');

// Add test route
app.get('/test', (req, res) => {
    console.log('✅ TEST ROUTE HIT!');
    res.send('MINIMAL TEST WORKS!');
});
console.log('📍 After route, router status:', app._router ? 'EXISTS' : 'NULL');
console.log('📊 Router stack length:', app._router ? app._router.stack.length : 'NO ROUTER');

app.listen(3001, () => {
    console.log('✅ Minimal test server running on http://localhost:3001');
    console.log('🧪 Test with: curl http://localhost:3001/test');
});
