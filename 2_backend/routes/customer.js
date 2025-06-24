const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// Get customer info by cif_number (for dashboard display)
router.get('/api/customer/:cif_number', async (req, res, next) => {
    const { cif_number } = req.params;
    
    // Validate CIF number
    if (!cif_number || isNaN(cif_number) || parseInt(cif_number) <= 0) {
        return res.status(400).json({ 
            message: 'Invalid CIF number format',
            error: 'INVALID_CIF_NUMBER'
        });
    }
    
    try {
        // Fetch main customer info (only fields that exist in CUSTOMER table)
        const [rows] = await pool.query(
            `SELECT cif_number, customer_type, customer_last_name, customer_first_name, 
             customer_middle_name, customer_suffix_name, customer_username, birth_date, 
             gender, civil_status_code, birth_country, citizenship
             FROM customer WHERE cif_number = ?`,
            [cif_number]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Customer not found.' });
        }
        
        const customer = rows[0];
        
        // Fetch addresses
        const [addresses] = await pool.query(
            `SELECT address_type_code, address_unit, address_building, address_street, 
             address_subdivision, address_barangay, address_city, address_province, 
             address_country, address_zip_code
             FROM CUSTOMER_ADDRESS WHERE cif_number = ?`,
            [cif_number]
        );
        
        customer.addresses = addresses;
        res.json(customer);
    } catch (err) {
        next(err);
    }
});

// GET /api/customer/all/:cif_number - Display all registration data in one table
router.get('/api/customer/all/:cif_number', async (req, res, next) => {
    const { cif_number } = req.params;
    
    // Validate CIF number
    if (!cif_number || isNaN(cif_number) || parseInt(cif_number) <= 0) {
        return res.status(400).json({ 
            message: 'Invalid CIF number format',
            error: 'INVALID_CIF_NUMBER'
        });
    }
    
    try {
        // Use Promise.all to execute queries concurrently
        const [
            [customerRows],
            [addresses],
            [ids],
            [contacts],
            [employment],
            [fundSources],
            [aliases]
        ] = await Promise.all([
            pool.query(`SELECT * FROM customer WHERE cif_number = ?`, [cif_number]),
            pool.query(`SELECT * FROM CUSTOMER_ADDRESS WHERE cif_number = ?`, [cif_number]),
            pool.query(`SELECT * FROM CUSTOMER_ID WHERE cif_number = ?`, [cif_number]),
            pool.query(`SELECT * FROM CUSTOMER_CONTACT_DETAILS WHERE cif_number = ?`, [cif_number]),
            pool.query(`SELECT * FROM CUSTOMER_EMPLOYMENT_INFORMATION WHERE cif_number = ?`, [cif_number]),
            pool.query(`SELECT * FROM CUSTOMER_FUND_SOURCE WHERE cif_number = ?`, [cif_number]),
            pool.query(`SELECT * FROM CUSTOMER_ALIAS WHERE cif_number = ?`, [cif_number])
        ]);
        
        if (customerRows.length === 0) {
            return res.status(404).json({ message: 'Customer not found.' });
        }
        
        const customer = customerRows[0];
        
        // Fetch work nature if employment exists
        let workNatures = [];
        if (employment.length > 0) {
            const empIds = employment.map(e => e.customer_employment_id);
            const [wn] = await pool.query(
                `SELECT * FROM CUSTOMER_WORK_NATURE WHERE customer_employment_id IN (${empIds.map(() => '?').join(',')})`, 
                empIds
            );
            workNatures = wn;
        }
        
        // Compose all data into one object
        const allData = {
            customer,
            addresses,
            ids,
            contacts,
            employment,
            fundSources,
            workNatures,
            aliases
        };
        
        res.json(allData);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
