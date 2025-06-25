const express = require('express');
const RegistrationService = require('../services/registrationService');

const router = express.Router();

// Simplified registration POST route
router.post('/register', async (req, res, next) => {
    try {
        const data = req.body;
        
        // Log registration attempt
        console.log('Registration request received for user:', data.customer_username);
        
        // Use the registration service
        const cif_number = await RegistrationService.registerCustomer(data);
        
        console.log('Registration completed successfully, CIF:', cif_number);
        
        res.status(201).json({ 
            message: 'Registration successful! Welcome to UniVault!', 
            redirect: '/Registration-Customer/registration13.html', 
            cif_number 
        });
        
    } catch (error) {
        console.error('Registration error:', error.message);
        
        // Handle specific error types
        if (error.message.includes('Validation failed')) {
            return res.status(400).json({
                message: error.message,
                error: 'VALIDATION_ERROR'
            });
        }
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                message: 'Username already exists. Please choose a different username.',
                error: 'DUPLICATE_USERNAME'
            });
        }
        
        if (error.code === 'ER_BAD_NULL_ERROR') {
            return res.status(400).json({
                message: 'Required field is missing or null',
                error: 'NOT_NULL_CONSTRAINT_VIOLATION'
            });
        }
        
        if (error.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
            let friendlyMessage = 'Invalid value provided for one of the fields';
            
            if (error.message.includes('check_product_type')) {
                friendlyMessage = 'Invalid product type. Please select a valid product type.';
            } else if (error.message.includes('check_customer_type')) {
                friendlyMessage = 'Invalid customer type. Please select a valid customer type.';
            } else if (error.message.includes('check_gender')) {
                friendlyMessage = 'Invalid gender value. Please select a valid gender option.';
            }
            
            return res.status(400).json({
                message: friendlyMessage,
                error: 'CHECK_CONSTRAINT_VIOLATION'
            });
        }
        
        // Pass other errors to error handler
        next(error);
    }
});

module.exports = router;
