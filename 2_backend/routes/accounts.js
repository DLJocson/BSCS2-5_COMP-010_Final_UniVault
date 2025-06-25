const express = require('express');
const { pool } = require('../config/database');
const router = express.Router();

// Get all accounts for a customer
router.get('/api/accounts/:cif_number', async (req, res, next) => {
  const { cif_number } = req.params;
  try {
    const [accounts] = await pool.query(
      `SELECT ca.account_number, 
              ad.product_type_code, 
              ad.account_status, 
              ad.account_open_date, 
              ad.account_close_date, 
              ad.current_balance,
              pt.product_type_name AS account_type,
              'PHP' AS currency,
              CONCAT('Account ', ca.account_number) AS account_nickname
         FROM CUSTOMER_ACCOUNT ca
         JOIN ACCOUNT_DETAILS ad ON ca.account_number = ad.account_number
         JOIN CUSTOMER_PRODUCT_TYPE pt ON ad.product_type_code = pt.product_type_code
        WHERE ca.cif_number = ?`,
      [cif_number]
    );
    res.json(accounts);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/account/:account_number - Update account details with update-if-changed logic
router.patch('/api/account/:account_number', async (req, res, next) => {
  const { account_number } = req.params;
  
  // Validate account number
  if (!account_number || isNaN(account_number) || parseInt(account_number) <= 0) {
    return res.status(400).json({ 
      message: 'Invalid account number format',
      error: 'INVALID_ACCOUNT_NUMBER'
    });
  }
  
  // Define allowed fields for ACCOUNT_DETAILS table
  const accountFields = [
    'account_status', 'current_balance', 'initial_deposit', 'account_close_date'
  ];
  
  try {
    // Fetch current account data
    const [[account]] = await pool.query(
      `SELECT * FROM ACCOUNT_DETAILS WHERE account_number = ?`,
      [account_number]
    );
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found.' });
    }
    
    // Prepare updates
    const accountUpdates = [];
    const accountValues = [];
    
    accountFields.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] != account[field]) {
        accountUpdates.push(`${field} = ?`);
        accountValues.push(req.body[field]);
      }
    });
    
    // Perform updates if any changes detected
    if (accountUpdates.length > 0) {
      accountValues.push(account_number);
      await pool.query(
        `UPDATE ACCOUNT_DETAILS SET ${accountUpdates.join(', ')} WHERE account_number = ?`,
        accountValues
      );
    }
    
    // Return updated account
    const [[updatedAccount]] = await pool.query(
      `SELECT ad.*, pt.product_type_name AS account_type
       FROM ACCOUNT_DETAILS ad
       JOIN CUSTOMER_PRODUCT_TYPE pt ON ad.product_type_code = pt.product_type_code
       WHERE ad.account_number = ?`,
      [account_number]
    );
    
    res.json(updatedAccount);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/account/:account_number - Close account (mark as "Closed")
router.delete('/api/account/:account_number', async (req, res, next) => {
  const { account_number } = req.params;
  
  // Validate account number
  if (!account_number || isNaN(account_number) || parseInt(account_number) <= 0) {
    return res.status(400).json({ 
      message: 'Invalid account number format',
      error: 'INVALID_ACCOUNT_NUMBER'
    });
  }
  
  try {
    // Check if account exists and is not already closed
    const [[account]] = await pool.query(
      `SELECT account_status FROM ACCOUNT_DETAILS WHERE account_number = ?`,
      [account_number]
    );
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found.' });
    }
    
    if (account.account_status === 'Closed') {
      return res.status(400).json({ message: 'Account is already closed.' });
    }
    
    // Close the account
    await pool.query(
      `UPDATE ACCOUNT_DETAILS 
       SET account_status = 'Closed', account_close_date = CURDATE() 
       WHERE account_number = ?`,
      [account_number]
    );
    
    res.json({ 
      message: 'Account closed successfully',
      account_number: parseInt(account_number),
      status: 'Closed'
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/generate-account/:cif_number - Generate accounts for all types
router.post('/api/generate-account/:cif_number', async (req, res, next) => {
  const { cif_number } = req.params;
  
  // Validate CIF number
  if (!cif_number || isNaN(cif_number) || parseInt(cif_number) <= 0) {
    return res.status(400).json({ 
      message: 'Invalid CIF number format',
      error: 'INVALID_CIF_NUMBER'
    });
  }
  
  try {
    // Check if customer exists
    const [[customer]] = await pool.query(
      `SELECT cif_number FROM CUSTOMER WHERE cif_number = ?`,
      [cif_number]
    );
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }
    
    // Get all product types
    const [productTypes] = await pool.query(
      `SELECT product_type_code, product_type_name FROM CUSTOMER_PRODUCT_TYPE`
    );
    
    const createdAccounts = [];
    const defaultEmployeeId = 1; // Default employee ID for testing
    
    for (const productType of productTypes) {
      // Check if customer already has this account type
      const [existingAccount] = await pool.query(
        `SELECT ca.account_number 
         FROM CUSTOMER_ACCOUNT ca
         JOIN ACCOUNT_DETAILS ad ON ca.account_number = ad.account_number
         WHERE ca.cif_number = ? AND ad.product_type_code = ?`,
        [cif_number, productType.product_type_code]
      );
      
      if (existingAccount.length === 0) {
        // Create new account
        const [accountResult] = await pool.query(
          `INSERT INTO ACCOUNT_DETAILS (product_type_code, verified_by_employee, account_open_date, account_status)
           VALUES (?, ?, CURDATE(), 'Active')`,
          [productType.product_type_code, defaultEmployeeId]
        );
        
        const account_number = accountResult.insertId;
        
        // Link customer to account
        await pool.query(
          `INSERT INTO CUSTOMER_ACCOUNT (cif_number, account_number)
           VALUES (?, ?)`,
          [cif_number, account_number]
        );
        
        createdAccounts.push({
          account_number,
          product_type_code: productType.product_type_code,
          product_type_name: productType.product_type_name,
          status: 'Active'
        });
      }
    }
    
    res.json({
      message: 'Account generation completed',
      created_accounts: createdAccounts,
      total_created: createdAccounts.length
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/backfill-accounts - Backfill missing accounts for existing customers
router.post('/api/backfill-accounts', async (req, res, next) => {
  try {
    // Get all customers
    const [customers] = await pool.query(
      `SELECT DISTINCT cif_number FROM CUSTOMER`
    );
    
    // Get all product types
    const [productTypes] = await pool.query(
      `SELECT product_type_code, product_type_name FROM CUSTOMER_PRODUCT_TYPE`
    );
    
    const backfillResults = [];
    const defaultEmployeeId = 1; // Default employee ID for testing
    
    for (const customer of customers) {
      const customerResults = [];
      
      for (const productType of productTypes) {
        // Check if customer already has this account type
        const [existingAccount] = await pool.query(
          `SELECT ca.account_number 
           FROM CUSTOMER_ACCOUNT ca
           JOIN ACCOUNT_DETAILS ad ON ca.account_number = ad.account_number
           WHERE ca.cif_number = ? AND ad.product_type_code = ?`,
          [customer.cif_number, productType.product_type_code]
        );
        
        if (existingAccount.length === 0) {
          // Create new account
          const [accountResult] = await pool.query(
            `INSERT INTO ACCOUNT_DETAILS (product_type_code, verified_by_employee, account_open_date, account_status)
             VALUES (?, ?, CURDATE(), 'Active')`,
            [productType.product_type_code, defaultEmployeeId]
          );
          
          const account_number = accountResult.insertId;
          
          // Link customer to account
          await pool.query(
            `INSERT INTO CUSTOMER_ACCOUNT (cif_number, account_number)
             VALUES (?, ?)`,
            [customer.cif_number, account_number]
          );
          
          customerResults.push({
            account_number,
            product_type_code: productType.product_type_code,
            product_type_name: productType.product_type_name,
            status: 'Active'
          });
        }
      }
      
      if (customerResults.length > 0) {
        backfillResults.push({
          cif_number: customer.cif_number,
          created_accounts: customerResults,
          total_created: customerResults.length
        });
      }
    }
    
    res.json({
      message: 'Account backfill completed',
      results: backfillResults,
      total_customers_processed: customers.length,
      total_accounts_created: backfillResults.reduce((sum, result) => sum + result.total_created, 0)
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/accounts/display/1-5 - Display comprehensive data for accounts 1-5
router.get('/api/accounts/display/1-5', async (req, res, next) => {
  try {
    const [accounts] = await pool.query(
      `SELECT 
        ad.account_number,
        ad.product_type_code,
        pt.product_type_name AS account_type,
        ad.account_status,
        ad.account_open_date,
        ad.account_close_date,
        ad.initial_deposit,
        ad.current_balance,
        ad.verified_by_employee,
        'PHP' AS currency,
        
        -- Customer Information
        ca.cif_number,
        c.customer_first_name,
        c.customer_middle_name,
        c.customer_last_name,
        c.customer_username,
        c.birth_date,
        c.gender,
        c.customer_status,
        c.customer_type,
        
        -- Civil Status
        cs.civil_status_description,
        
        -- Contact Information (Primary)
        cd.contact_value as primary_contact,
        cd_email.contact_value as email_address,
        
        -- Address Information (Primary) 
        addr.address_street,
        addr.address_barangay,
        addr.address_city,
        addr.address_province,
        addr.address_country,
        addr.address_zip_code,
        
        -- Employment Information
        ei.employer_business_name,
        ei.income_monthly_gross,
        ep.job_title,
        
        -- Fund Source
        fs.fund_source,
        cfs.estimated_amount as fund_source_amount,
        
        -- Account nickname
        CONCAT('Account ', ad.account_number) AS account_nickname
        
       FROM ACCOUNT_DETAILS ad
       JOIN CUSTOMER_PRODUCT_TYPE pt ON ad.product_type_code = pt.product_type_code
       JOIN CUSTOMER_ACCOUNT ca ON ad.account_number = ca.account_number
       JOIN CUSTOMER c ON ca.cif_number = c.cif_number
       LEFT JOIN CIVIL_STATUS_TYPE cs ON c.civil_status_code = cs.civil_status_code
       
       -- Primary Contact (Mobile)
       LEFT JOIN CUSTOMER_CONTACT_DETAILS cd ON c.cif_number = cd.cif_number 
         AND cd.contact_type_code = 'CT01' AND cd.is_primary = TRUE
       
       -- Email Contact
       LEFT JOIN CUSTOMER_CONTACT_DETAILS cd_email ON c.cif_number = cd_email.cif_number 
         AND cd_email.contact_type_code = 'CT04' AND cd_email.is_primary = TRUE
       
       -- Primary Address
       LEFT JOIN CUSTOMER_ADDRESS addr ON c.cif_number = addr.cif_number 
         AND addr.is_primary = TRUE
       
       -- Employment Information
       LEFT JOIN CUSTOMER_EMPLOYMENT_INFORMATION ei ON c.cif_number = ei.cif_number
       LEFT JOIN EMPLOYMENT_POSITION ep ON ei.position_code = ep.position_code
       
       -- Fund Source Information
       LEFT JOIN CUSTOMER_FUND_SOURCE cfs ON c.cif_number = cfs.cif_number
       LEFT JOIN FUND_SOURCE_TYPE fs ON cfs.fund_source_code = fs.fund_source_code
       
       ORDER BY ad.account_number ASC
       LIMIT 5`
    );
    
    if (accounts.length === 0) {
      return res.status(404).json({ 
        message: 'No accounts found. Please ensure the database is properly seeded.',
        suggestion: 'Run the seed data script to populate sample accounts.'
      });
    }
    
    // Format the response for better readability
    const formattedAccounts = accounts.map(account => ({
      // Account Information
      account_details: {
        account_number: account.account_number,
        account_type: account.account_type,
        product_type_code: account.product_type_code,
        account_status: account.account_status,
        account_nickname: account.account_nickname,
        currency: account.currency,
        account_open_date: account.account_open_date,
        account_close_date: account.account_close_date,
        initial_deposit: parseFloat(account.initial_deposit || 0),
        current_balance: parseFloat(account.current_balance || 0),
        verified_by_employee: account.verified_by_employee
      },
      
      // Customer Information
      customer_details: {
        cif_number: account.cif_number,
        customer_type: account.customer_type,
        full_name: `${account.customer_first_name} ${account.customer_middle_name || ''} ${account.customer_last_name}`.replace(/\s+/g, ' ').trim(),
        first_name: account.customer_first_name,
        middle_name: account.customer_middle_name,
        last_name: account.customer_last_name,
        username: account.customer_username,
        birth_date: account.birth_date,
        gender: account.gender,
        civil_status: account.civil_status_description,
        customer_status: account.customer_status
      },
      
      // Contact Information
      contact_details: {
        primary_contact: account.primary_contact,
        email_address: account.email_address,
        address: {
          street: account.address_street,
          barangay: account.address_barangay,
          city: account.address_city,
          province: account.address_province,
          country: account.address_country,
          zip_code: account.address_zip_code,
          full_address: `${account.address_street || ''}, ${account.address_barangay || ''}, ${account.address_city || ''}, ${account.address_province || ''}, ${account.address_country || ''} ${account.address_zip_code || ''}`.replace(/,\s*,/g, ',').replace(/^,\s*/, '').replace(/,\s*$/, '')
        }
      },
      
      // Employment & Financial Information
      financial_profile: {
        employer: account.employer_business_name,
        job_title: account.job_title,
        monthly_income: parseFloat(account.income_monthly_gross || 0),
        fund_source: account.fund_source,
        estimated_fund_amount: parseFloat(account.fund_source_amount || 0)
      }
    }));
    
    res.json({
      message: 'Account data for accounts 1-5 retrieved successfully',
      total_accounts: formattedAccounts.length,
      accounts: formattedAccounts,
      timestamp: new Date().toISOString()
    });
    
  } catch (err) {
    next(err);
  }
});

// GET /api/accounts/summary/1-5 - Display essential data for accounts 1-5 in a simple format
router.get('/api/accounts/summary/1-5', async (req, res, next) => {
  try {
    const [accounts] = await pool.query(
      `SELECT 
        ad.account_number,
        pt.product_type_name AS account_type,
        ad.account_status,
        ad.current_balance,
        CONCAT(c.customer_first_name, ' ', IFNULL(c.customer_middle_name, ''), ' ', c.customer_last_name) AS customer_name,
        c.customer_username,
        cd.contact_value as mobile_number,
        cd_email.contact_value as email,
        ei.employer_business_name,
        ei.income_monthly_gross
        
       FROM ACCOUNT_DETAILS ad
       JOIN CUSTOMER_PRODUCT_TYPE pt ON ad.product_type_code = pt.product_type_code
       JOIN CUSTOMER_ACCOUNT ca ON ad.account_number = ca.account_number
       JOIN CUSTOMER c ON ca.cif_number = c.cif_number
       LEFT JOIN CUSTOMER_CONTACT_DETAILS cd ON c.cif_number = cd.cif_number 
         AND cd.contact_type_code = 'CT01' AND cd.is_primary = TRUE
       LEFT JOIN CUSTOMER_CONTACT_DETAILS cd_email ON c.cif_number = cd_email.cif_number 
         AND cd_email.contact_type_code = 'CT04' AND cd_email.is_primary = TRUE
       LEFT JOIN CUSTOMER_EMPLOYMENT_INFORMATION ei ON c.cif_number = ei.cif_number
       
       ORDER BY ad.account_number ASC
       LIMIT 5`
    );
    
    if (accounts.length === 0) {
      return res.status(404).json({ 
        message: 'No accounts found. Please ensure the database is properly seeded.'
      });
    }
    
    // Create a simple summary table format
    const accountSummary = accounts.map((account, index) => ({
      account_id: `Account ${index + 1}`,
      account_number: account.account_number,
      customer_name: account.customer_name.replace(/\s+/g, ' ').trim(),
      username: account.customer_username,
      account_type: account.account_type,
      status: account.account_status,
      current_balance: `₱${parseFloat(account.current_balance || 0).toLocaleString('en-PH', {minimumFractionDigits: 2})}`,
      mobile_number: account.mobile_number || 'N/A',
      email: account.email || 'N/A',
      employer: account.employer_business_name || 'N/A',
      monthly_income: account.income_monthly_gross ? `₱${parseFloat(account.income_monthly_gross).toLocaleString('en-PH', {minimumFractionDigits: 2})}` : 'N/A'
    }));
    
    res.json({
      message: 'Account summary for accounts 1-5',
      total_accounts: accountSummary.length,
      account_summary: accountSummary
    });
    
  } catch (err) {
    next(err);
  }
});

module.exports = router;
