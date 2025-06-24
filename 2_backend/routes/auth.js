const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

const router = express.Router();

// Login POST route
router.post('/login', async (req, res, next) => {
    const { customer_username, customer_password } = req.body;
    
    if (!customer_username || !customer_password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }
    
    try {
        const [rows] = await pool.query(
            'SELECT cif_number, customer_password FROM customer WHERE customer_username = ?',
            [customer_username]
        );
        
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }
        
        const user = rows[0];
        const passwordMatch = await bcrypt.compare(customer_password, user.customer_password);
        
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }
        
        res.json({ 
            message: 'Login successful', 
            redirect: `/Dashboard-Customer/account1.html`, 
            cif_number: user.cif_number 
        });
    } catch (err) {
        next(err);
    }
});

// Remove unused GET endpoints - they serve no purpose

module.exports = router;
