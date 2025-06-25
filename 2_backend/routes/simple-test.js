const express = require('express');
const router = express.Router();

console.log('🚀 SIMPLE TEST ROUTES LOADED!');

// Simple test route
router.get('/test-route', (req, res) => {
    console.log('✅ Simple test route hit!');
    res.json({ message: 'Simple test works!' });
});

// Simple login test
router.post('/admin/login', (req, res) => {
    console.log('🔐 SIMPLE LOGIN HIT:', req.body);
    res.json({
        success: true,
        message: 'Simple login works!',
        employee: { employee_id: 1, employee_username: 'test' }
    });
});

module.exports = router;
