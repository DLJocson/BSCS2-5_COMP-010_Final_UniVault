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
            pool.query(
                `SELECT cei.*, ep.job_title, ep.employment_type
                 FROM CUSTOMER_EMPLOYMENT_INFORMATION cei
                 LEFT JOIN EMPLOYMENT_POSITION ep ON cei.position_code = ep.position_code
                 WHERE cei.cif_number = ?`,
                [cif_number]
            ),
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
                `SELECT cwn.*, wnt.nature_description
                 FROM CUSTOMER_WORK_NATURE cwn
                 LEFT JOIN WORK_NATURE_TYPE wnt ON cwn.work_nature_code = wnt.work_nature_code
                 WHERE cwn.customer_employment_id IN (${empIds.map(() => '?').join(',')})`,
                empIds
            );
            workNatures = wn;
        }
        // Join fund sources with FUND_SOURCE_TYPE
        const [fundSourcesJoined] = await pool.query(
            `SELECT cfs.*, fst.fund_source AS fund_source_description
             FROM CUSTOMER_FUND_SOURCE cfs
             LEFT JOIN FUND_SOURCE_TYPE fst ON cfs.fund_source_code = fst.fund_source_code
             WHERE cfs.cif_number = ?`,
            [cif_number]
        );
        // Compose all data into one object
        const allData = {
            customer,
            addresses,
            ids,
            contacts,
            employment,
            fundSources: fundSourcesJoined,
            workNatures,
            aliases
        };
        
        res.json(allData);
    } catch (err) {
        next(err);
    }
});

// PATCH /api/customer/:cif_number - Partial update of customer info, address, and contact details
router.patch('/api/customer/:cif_number', async (req, res, next) => {
    const { cif_number } = req.params;
    // Define allowed fields for each table
    const customerFields = [
        'customer_first_name', 'customer_middle_name', 'customer_last_name', 'customer_suffix_name',
        'birth_date', 'birth_country', 'citizenship', 'gender', 'civil_status_code', 'residency_status'
    ];
    const addressFields = [
        'address_unit', 'address_building', 'address_street', 'address_subdivision',
        'address_barangay', 'address_city', 'address_province', 'address_country', 'address_zip_code'
    ];
    const contactFields = [
        'mobile_number', 'landline_number', 'email_address'
    ];
    try {
        // Fetch current data
        const [[customer]] = await pool.query(`SELECT * FROM CUSTOMER WHERE cif_number = ?`, [cif_number]);
        const [[address]] = await pool.query(`SELECT * FROM CUSTOMER_ADDRESS WHERE cif_number = ? AND address_type_code = 'AD01'`, [cif_number]);
        const [contacts] = await pool.query(`SELECT * FROM CUSTOMER_CONTACT_DETAILS WHERE cif_number = ?`, [cif_number]);
        // Employment, Fund Source, Alias (get first record for each)
        const [[employment]] = await pool.query(`SELECT * FROM CUSTOMER_EMPLOYMENT_INFORMATION WHERE cif_number = ? LIMIT 1`, [cif_number]);
        const [[fundSource]] = await pool.query(`SELECT * FROM CUSTOMER_FUND_SOURCE WHERE cif_number = ? LIMIT 1`, [cif_number]);
        const [[alias]] = await pool.query(`SELECT * FROM CUSTOMER_ALIAS WHERE cif_number = ? LIMIT 1`, [cif_number]);
        // Map contact_type_code to field
        const contactTypeMap = {
            'CT01': 'mobile_number',
            'CT02': 'landline_number',
            'CT04': 'email_address'
        };
        const contactDbMap = {};
        contacts.forEach(c => {
            if (contactTypeMap[c.contact_type_code]) {
                contactDbMap[contactTypeMap[c.contact_type_code]] = c.contact_value;
            }
        });
        // Prepare updates
        const customerUpdates = [];
        const customerValues = [];
        customerFields.forEach(field => {
            if (req.body[field] !== undefined && req.body[field] != customer[field]) {
                customerUpdates.push(`${field} = ?`);
                customerValues.push(req.body[field]);
            }
        });
        const addressUpdates = [];
        const addressValues = [];
        addressFields.forEach(field => {
            if (req.body[field] !== undefined && (!address || req.body[field] != address[field])) {
                addressUpdates.push(`${field} = ?`);
                addressValues.push(req.body[field]);
            }
        });
        // Contact updates (update by contact_type_code)
        const contactUpdates = [];
        for (const field of contactFields) {
            if (req.body[field] !== undefined && req.body[field] != contactDbMap[field]) {
                let typeCode = null;
                if (field === 'mobile_number') typeCode = 'CT01';
                if (field === 'landline_number') typeCode = 'CT02';
                if (field === 'email_address') typeCode = 'CT04';
                if (typeCode) {
                    contactUpdates.push({ typeCode, value: req.body[field] });
                }
            }
        }
        // Employment updates
        const employmentFields = [
            'employer_business_name', 'employment_start_date', 'employment_end_date', 'employment_status',
            'position_code', 'income_monthly_gross', 'income_currency', 'years_in_current_position'
        ];
        const employmentUpdates = [];
        const employmentValues = [];
        if (employment) {
            employmentFields.forEach(field => {
                if (req.body[field] !== undefined) {
                    let value = req.body[field];
                    // Sanitize income_monthly_gross: remove currency symbols and commas
                    if (field === 'income_monthly_gross' && typeof value === 'string') {
                        value = value.replace(/[^0-9.\-]/g, '');
                    }
                    if (value != employment[field]) {
                        employmentUpdates.push(`${field} = ?`);
                        employmentValues.push(value);
                    }
                }
            });
        }
        // Fund source updates
        const fundSourceFields = ['fund_source_code', 'estimated_amount'];
        const fundSourceUpdates = [];
        const fundSourceValues = [];
        if (fundSource) {
            fundSourceFields.forEach(field => {
                if (req.body[field] !== undefined && req.body[field] != fundSource[field]) {
                    fundSourceUpdates.push(`${field} = ?`);
                    fundSourceValues.push(req.body[field]);
                }
            });
        }
        // Alias updates
        const aliasFields = ['alias_last_name', 'alias_first_name', 'alias_middle_name', 'alias_suffix_name', 'alias_reason'];
        const aliasUpdates = [];
        const aliasValues = [];
        if (alias) {
            aliasFields.forEach(field => {
                if (req.body[field] !== undefined && req.body[field] != alias[field]) {
                    aliasUpdates.push(`${field} = ?`);
                    aliasValues.push(req.body[field]);
                }
            });
        }
        // Perform updates
        if (customerUpdates.length > 0) {
            customerValues.push(cif_number);
            await pool.query(`UPDATE CUSTOMER SET ${customerUpdates.join(', ')} WHERE cif_number = ?`, customerValues);
        }
        if (addressUpdates.length > 0) {
            addressValues.push(cif_number, 'AD01');
            await pool.query(`UPDATE CUSTOMER_ADDRESS SET ${addressUpdates.join(', ')} WHERE cif_number = ? AND address_type_code = 'AD01'`, addressValues);
        }
        for (const upd of contactUpdates) {
            await pool.query(`UPDATE CUSTOMER_CONTACT_DETAILS SET contact_value = ? WHERE cif_number = ? AND contact_type_code = ?`, [upd.value, cif_number, upd.typeCode]);
        }
        if (employment && employmentUpdates.length > 0) {
            employmentValues.push(employment.customer_employment_id);
            await pool.query(`UPDATE CUSTOMER_EMPLOYMENT_INFORMATION SET ${employmentUpdates.join(', ')} WHERE customer_employment_id = ?`, employmentValues);
        }
        if (fundSource && fundSourceUpdates.length > 0) {
            fundSourceValues.push(cif_number, fundSource.fund_source_code);
            await pool.query(`UPDATE CUSTOMER_FUND_SOURCE SET ${fundSourceUpdates.join(', ')} WHERE cif_number = ? AND fund_source_code = ?`, fundSourceValues);
        }
        if (alias && aliasUpdates.length > 0) {
            aliasValues.push(alias.customer_alias_id);
            await pool.query(`UPDATE CUSTOMER_ALIAS SET ${aliasUpdates.join(', ')} WHERE customer_alias_id = ?`, aliasValues);
        }
        // Return updated profile
        const [[updatedCustomer]] = await pool.query(`SELECT * FROM CUSTOMER WHERE cif_number = ?`, [cif_number]);
        const [[updatedAddress]] = await pool.query(`SELECT * FROM CUSTOMER_ADDRESS WHERE cif_number = ? AND address_type_code = 'AD01'`, [cif_number]);
        const [updatedContacts] = await pool.query(`SELECT * FROM CUSTOMER_CONTACT_DETAILS WHERE cif_number = ?`, [cif_number]);
        const [[updatedEmployment]] = await pool.query(`SELECT * FROM CUSTOMER_EMPLOYMENT_INFORMATION WHERE cif_number = ? LIMIT 1`, [cif_number]);
        const [[updatedFundSource]] = await pool.query(`SELECT * FROM CUSTOMER_FUND_SOURCE WHERE cif_number = ? LIMIT 1`, [cif_number]);
        const [[updatedAlias]] = await pool.query(`SELECT * FROM CUSTOMER_ALIAS WHERE cif_number = ? LIMIT 1`, [cif_number]);
        res.json({
            customer: updatedCustomer,
            address: updatedAddress,
            contacts: updatedContacts,
            employment: updatedEmployment,
            fundSource: updatedFundSource,
            alias: updatedAlias
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
