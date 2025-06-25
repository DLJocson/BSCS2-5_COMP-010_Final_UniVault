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
            [aliases],
            [accounts]
        ] = await Promise.all([
            pool.query(`SELECT * FROM customer WHERE cif_number = ?`, [cif_number]),
            pool.query(`SELECT * FROM CUSTOMER_ADDRESS WHERE cif_number = ?`, [cif_number]),
            pool.query(`SELECT * FROM CUSTOMER_ID WHERE cif_number = ?`, [cif_number]),
            pool.query(`SELECT * FROM CUSTOMER_CONTACT_DETAILS WHERE cif_number = ?`, [cif_number]),
            pool.query(`SELECT e.*, p.employment_type, p.job_title FROM CUSTOMER_EMPLOYMENT_INFORMATION e LEFT JOIN EMPLOYMENT_POSITION p ON e.position_code = p.position_code WHERE e.cif_number = ?`, [cif_number]),
            pool.query(`SELECT f.*, t.fund_source FROM CUSTOMER_FUND_SOURCE f LEFT JOIN FUND_SOURCE_TYPE t ON f.fund_source_code = t.fund_source_code WHERE f.cif_number = ?`, [cif_number]),
            pool.query(`SELECT * FROM CUSTOMER_ALIAS WHERE cif_number = ?`, [cif_number]),
            pool.query(`SELECT a.account_number, p.product_type_name, a.account_status, a.account_open_date, a.account_close_date FROM CUSTOMER_ACCOUNT ca JOIN ACCOUNT_DETAILS a ON ca.account_number = a.account_number JOIN CUSTOMER_PRODUCT_TYPE p ON a.product_type_code = p.product_type_code WHERE ca.cif_number = ?`, [cif_number])
        ]);
        
        if (customerRows.length === 0) {
            return res.status(404).json({ message: 'Customer not found.' });
        }
        
        const customer = customerRows[0];
        
        // Fetch WORK_NATURE_TYPE for all work_nature_codes in CUSTOMER_WORK_NATURE
        let workNaturesDescriptions = [];
        if (employment.length > 0) {
            const empIds = employment.map(e => e.customer_employment_id).filter(Boolean);
            if (empIds.length > 0) {
                const [workNatures] = await pool.query(
                    `SELECT * FROM CUSTOMER_WORK_NATURE WHERE customer_employment_id IN (${empIds.map(() => '?').join(',')})`,
                    empIds
                );
                if (workNatures.length > 0) {
                    const workNatureCodes = workNatures.map(w => w.work_nature_code).filter(Boolean);
                    if (workNatureCodes.length > 0) {
                        const [natureTypes] = await pool.query(
                            `SELECT * FROM WORK_NATURE_TYPE WHERE work_nature_code IN (${workNatureCodes.map(() => '?').join(',')})`,
                            workNatureCodes
                        );
                        workNaturesDescriptions = workNatures.map(w => {
                            const found = natureTypes.find(n => n.work_nature_code === w.work_nature_code);
                            return found ? found.nature_description : w.work_nature_code;
                        });
                    }
                }
            }
        }
        
        // Compose all data into one object
        const allData = {
            customer,
            addresses,
            ids,
            contacts,
            employment,
            fundSources,
            aliases,
            workNaturesDescriptions: workNaturesDescriptions || [],
            accounts
        };
        
        res.json(allData);
    } catch (err) {
        next(err);
    }
});

// GET /api/accounts/:cif_number - Get all accounts for a customer
router.get('/api/accounts/:cif_number', async (req, res, next) => {
    const { cif_number } = req.params;
    
    // Validate CIF number
    if (!cif_number || isNaN(cif_number) || parseInt(cif_number) <= 0) {
        return res.status(400).json({ 
            message: 'Invalid CIF number format',
            error: 'INVALID_CIF_NUMBER'
        });
    }
    
    try {
        const [accounts] = await pool.query(
            `SELECT 
                a.account_number,
                a.account_nickname,
                a.current_balance,
                a.currency,
                a.account_status,
                a.account_open_date,
                a.account_close_date,
                p.product_type_name as account_type
             FROM CUSTOMER_ACCOUNT ca 
             JOIN ACCOUNT_DETAILS a ON ca.account_number = a.account_number 
             JOIN CUSTOMER_PRODUCT_TYPE p ON a.product_type_code = p.product_type_code 
             WHERE ca.cif_number = ? AND a.account_status != 'CLOSED'
             ORDER BY a.account_open_date DESC`,
            [cif_number]
        );
        
        res.json(accounts);
    } catch (err) {
        next(err);
    }
});

// GET /api/account/:account_number - Get specific account details
router.get('/api/account/:account_number', async (req, res, next) => {
    const { account_number } = req.params;
    
    if (!account_number) {
        return res.status(400).json({ 
            message: 'Account number is required',
            error: 'MISSING_ACCOUNT_NUMBER'
        });
    }
    
    try {
        const [accounts] = await pool.query(
            `SELECT 
                a.account_number,
                a.account_nickname,
                a.current_balance,
                a.currency,
                a.account_status,
                a.account_open_date,
                a.account_close_date,
                p.product_type_name as account_type,
                ca.cif_number
             FROM ACCOUNT_DETAILS a 
             JOIN CUSTOMER_PRODUCT_TYPE p ON a.product_type_code = p.product_type_code
             JOIN CUSTOMER_ACCOUNT ca ON a.account_number = ca.account_number
             WHERE a.account_number = ?`,
            [account_number]
        );
        
        if (accounts.length === 0) {
            return res.status(404).json({ message: 'Account not found.' });
        }
        
        res.json(accounts[0]);
    } catch (err) {
        next(err);
    }
});

// DELETE /api/account/:account_number - Close an account
router.delete('/api/account/:account_number', async (req, res, next) => {
    const { account_number } = req.params;
    const { username, password, confirmClosure } = req.body;
    
    if (!account_number) {
        return res.status(400).json({ 
            message: 'Account number is required',
            error: 'MISSING_ACCOUNT_NUMBER'
        });
    }
    
    if (!username || !password) {
        return res.status(400).json({ 
            message: 'Username and password are required',
            error: 'MISSING_CREDENTIALS'
        });
    }
    
    if (!confirmClosure) {
        return res.status(400).json({ 
            message: 'Account closure must be confirmed',
            error: 'CLOSURE_NOT_CONFIRMED'
        });
    }
    
    try {
        // First, verify the account exists and get customer info
        const [accounts] = await pool.query(
            `SELECT a.*, ca.cif_number, c.customer_username, c.customer_password
             FROM ACCOUNT_DETAILS a 
             JOIN CUSTOMER_ACCOUNT ca ON a.account_number = ca.account_number
             JOIN CUSTOMER c ON ca.cif_number = c.cif_number
             WHERE a.account_number = ?`,
            [account_number]
        );
        
        if (accounts.length === 0) {
            return res.status(404).json({ message: 'Account not found.' });
        }
        
        const account = accounts[0];
        
        // Verify credentials (in a real app, you'd hash the password)
        if (account.customer_username !== username || account.customer_password !== password) {
            return res.status(401).json({ 
                message: 'Invalid credentials',
                error: 'INVALID_CREDENTIALS'
            });
        }
        
        // Check if account is already closed
        if (account.account_status === 'CLOSED') {
            return res.status(400).json({ 
                message: 'Account is already closed',
                error: 'ACCOUNT_ALREADY_CLOSED'
            });
        }
        
        // Check if account has balance
        if (account.current_balance > 0) {
            return res.status(400).json({ 
                message: 'Cannot close account with remaining balance',
                error: 'ACCOUNT_HAS_BALANCE'
            });
        }
        
        // Close the account
        await pool.query(
            `UPDATE ACCOUNT_DETAILS 
             SET account_status = 'CLOSED', 
                 account_close_date = NOW() 
             WHERE account_number = ?`,
            [account_number]
        );
        
        res.json({ 
            message: 'Account closed successfully',
            account_number: account_number,
            closed_date: new Date().toISOString()
        });
        
    } catch (err) {
        next(err);
    }
});

// PUT /api/customer/:cif_number - Update customer profile
router.put('/api/customer/:cif_number', async (req, res, next) => {
    const { cif_number } = req.params;
    const updateData = req.body;
    
    if (!cif_number || isNaN(cif_number) || parseInt(cif_number) <= 0) {
        return res.status(400).json({ 
            message: 'Invalid CIF number format',
            error: 'INVALID_CIF_NUMBER'
        });
    }
    
    try {
        // Start transaction
        await pool.query('START TRANSACTION');
        
        // Update customer table
        if (updateData.customer) {
            const customerFields = [];
            const customerValues = [];
            
            Object.keys(updateData.customer).forEach(key => {
                if (updateData.customer[key] !== undefined && updateData.customer[key] !== null) {
                    customerFields.push(`${key} = ?`);
                    customerValues.push(updateData.customer[key]);
                }
            });
            
            if (customerFields.length > 0) {
                customerValues.push(cif_number);
                await pool.query(
                    `UPDATE CUSTOMER SET ${customerFields.join(', ')} WHERE cif_number = ?`,
                    customerValues
                );
            }
        }
        
        // Update addresses
        if (updateData.addresses && Array.isArray(updateData.addresses)) {
            for (const address of updateData.addresses) {
                if (address.address_type_code) {
                    const addressFields = [];
                    const addressValues = [];
                    
                    Object.keys(address).forEach(key => {
                        if (key !== 'address_type_code' && address[key] !== undefined && address[key] !== null) {
                            addressFields.push(`${key} = ?`);
                            addressValues.push(address[key]);
                        }
                    });
                    
                    if (addressFields.length > 0) {
                        addressValues.push(cif_number, address.address_type_code);
                        await pool.query(
                            `UPDATE CUSTOMER_ADDRESS SET ${addressFields.join(', ')} 
                             WHERE cif_number = ? AND address_type_code = ?`,
                            addressValues
                        );
                    }
                }
            }
        }
        
        // Update contact details
        if (updateData.contacts && Array.isArray(updateData.contacts)) {
            for (const contact of updateData.contacts) {
                if (contact.contact_type_code) {
                    const contactFields = [];
                    const contactValues = [];
                    
                    Object.keys(contact).forEach(key => {
                        if (key !== 'contact_type_code' && contact[key] !== undefined && contact[key] !== null) {
                            contactFields.push(`${key} = ?`);
                            contactValues.push(contact[key]);
                        }
                    });
                    
                    if (contactFields.length > 0) {
                        contactValues.push(cif_number, contact.contact_type_code);
                        await pool.query(
                            `UPDATE CUSTOMER_CONTACT_DETAILS SET ${contactFields.join(', ')} 
                             WHERE cif_number = ? AND contact_type_code = ?`,
                            contactValues
                        );
                    }
                }
            }
        }
        
        // Commit transaction
        await pool.query('COMMIT');
        
        res.json({ 
            message: 'Customer profile updated successfully',
            cif_number: cif_number
        });
        
    } catch (err) {
        // Rollback on error
        await pool.query('ROLLBACK');
        next(err);
    }
});

module.exports = router;
