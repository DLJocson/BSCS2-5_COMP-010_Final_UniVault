const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

console.log('Admin routes module loaded!');

// Example session check for all admin API endpoints
function requireAdminSession(req, res, next) {
    // For now, allow all requests since we're using localStorage-based auth
    // The frontend handles authentication checks
    // TODO: Implement proper session management if needed
    next();
}

// Test route
router.get('/admin/test', (req, res) => {
    res.json({ message: 'Admin routes are working!' });
});

// Admin dashboard statistics endpoint
router.get('/admin/dashboard-stats', async (req, res) => {
    console.log('📊 Dashboard stats request received');
    let connection;
    
    try {
        connection = await pool.getConnection();
        console.log('✅ Database connection acquired for dashboard stats');
        
        // Get current year for filtering
        const currentYear = new Date().getFullYear();
        
        // Execute all statistics queries in parallel
        const [
            rejectedApplicationsResult,
            pendingVerificationsResult,
            pendingApprovalsResult,
            newAccountsResult,
            verifiedCustomersResult,
            totalCustomersResult,
            monthlyStatsResult
        ] = await Promise.all([
            // Rejected applications (customers with status 'Inactive' or 'Suspended')
            connection.execute(`
                SELECT COUNT(*) as count 
                FROM customer 
                WHERE customer_status IN ('Inactive', 'Suspended')
            `),
            
            // Pending verifications (customers with status 'Pending Verification')
            connection.execute(`
                SELECT COUNT(*) as count 
                FROM customer 
                WHERE customer_status = 'Pending Verification'
            `),
            
            // Pending approvals (from review queue)
            connection.execute(`
                SELECT COUNT(*) as count 
                FROM review_queue 
                WHERE review_status = 'PENDING'
            `),
            
            // New accounts (customers created this month)
            connection.execute(`
                SELECT COUNT(*) as count 
                FROM customer 
                WHERE YEAR(created_at) = ? AND MONTH(created_at) = MONTH(CURRENT_DATE())
            `, [currentYear]),
            
            // Verified customers (active customers)
            connection.execute(`
                SELECT COUNT(*) as count 
                FROM customer 
                WHERE customer_status = 'Active'
            `),
            
            // Total customers
            connection.execute(`
                SELECT COUNT(*) as count 
                FROM customer 
                WHERE is_deleted = FALSE
            `),
            
            // Monthly registration statistics for current year
            connection.execute(`
                SELECT 
                    MONTH(created_at) as month,
                    COUNT(*) as registrations
                FROM customer 
                WHERE YEAR(created_at) = ? AND is_deleted = FALSE
                GROUP BY MONTH(created_at)
                ORDER BY MONTH(created_at)
            `, [currentYear])
        ]);
        
        // Extract counts from results
        const stats = {
            rejectedApplications: rejectedApplicationsResult[0][0]?.count || 0,
            pendingVerifications: pendingVerificationsResult[0][0]?.count || 0,
            pendingApprovals: pendingApprovalsResult[0][0]?.count || 0,
            newAccounts: newAccountsResult[0][0]?.count || 0,
            verifiedCustomers: verifiedCustomersResult[0][0]?.count || 0,
            totalCustomers: totalCustomersResult[0][0]?.count || 0,
            monthlyStats: monthlyStatsResult[0] || []
        };
        
        console.log('📈 Dashboard stats computed successfully:', stats);
        
        res.json(stats);
        
    } catch (error) {
        console.error('Error fetching admin dashboard stats:', error);
        res.status(500).json({ 
            message: 'Failed to fetch dashboard statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// Simple test login endpoint
router.post('/admin/test-login', async (req, res) => {
    console.log('🔐 TEST login route hit with:', req.body);
    const { username, password } = req.body;
    
    if (username === 'jrizal' && password === 'admin123') {
        return res.status(200).json({
            success: true,
            message: 'Test login successful!',
            employee: {
                employee_id: 1,
                employee_username: 'jrizal',
                employee_position: 'Admin',
                employee_first_name: 'Jose',
                employee_last_name: 'Rizal'
            }
        });
    } else {
        return res.status(401).json({ message: 'Invalid test credentials' });
    }
});

// Admin login endpoint - DISABLED (using fixed version in admin-login-fixed.js)
/*
router.post('/admin/login', async (req, res) => {
    console.log('🔐 Admin login route hit with:', req.body);
    let connection;
    
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        
        // Get database connection
        connection = await pool.getConnection();
        
        // Execute query
        const [results] = await connection.execute(`
            SELECT 
                employee_id, 
                employee_username, 
                employee_password, 
                employee_position,
                employee_first_name,
                employee_last_name
            FROM bank_employee 
            WHERE employee_username = ? 
            AND is_deleted = FALSE
            LIMIT 1
        `, [username]);
        
        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        
        const employee = results[0];
        
        // Optimized password validation
        let isValidPassword = false;
        
        // Check exact match first (fastest)
        if (employee.employee_password === password) {
            isValidPassword = true;
        }
        // Development fallback
        else if (password === 'admin123') {
            isValidPassword = true;
        }
        // Bcrypt placeholder check
        else if (employee.employee_password && employee.employee_password.startsWith('$2a$12$') && password === 'admin123') {
            isValidPassword = true;
        }
        
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        
        // Return employee information (excluding password)
        res.json({
            success: true,
            employee: {
                employee_id: employee.employee_id,
                employee_username: employee.employee_username,
                employee_position: employee.employee_position,
                employee_first_name: employee.employee_first_name,
                employee_last_name: employee.employee_last_name
            }
        });
        
        // Log success only in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`✅ Login successful for ${username}`);
        }
        
    } catch (error) {
        console.error('❌ Admin login error:', error.message);
        console.error('❌ Full error:', error);
        
        // Handle specific timeout errors
        if (error.message.includes('timeout')) {
            return res.status(408).json({ 
                message: 'Login request timed out. Please try again.',
                error: 'TIMEOUT'
            });
        }
        
        res.status(500).json({ 
            message: 'Login failed. Please try again.',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    } finally {
        // Always release connection
        if (connection) {
            try {
                connection.release();
            } catch (releaseError) {
                console.error('Error releasing connection:', releaseError.message);
            }
        }
    }
});
*/

// Admin user management - get all customers
router.get('/admin/customers', requireAdminSession, async (req, res) => {
    console.log('👥 Customer list request received');
    let connection;
    try {
        let limit = parseInt(req.query.limit, 10);
        if (isNaN(limit) || limit <= 0) limit = 50;
        let page = parseInt(req.query.page, 10);
        if (isNaN(page) || page <= 0) page = 1;
        const offset = (page - 1) * limit;
        const { status } = req.query;
        
        console.log('📊 Customer query parameters:', { limit, page, offset, status });
        
        connection = await pool.getConnection();
        
        // First check if customer table has any data
        const [customerCheck] = await connection.execute('SELECT COUNT(*) as count FROM customer WHERE is_deleted = FALSE');
        console.log('📊 Customer table has', customerCheck[0].count, 'active records');
        
        if (customerCheck[0].count === 0) {
            console.log('ℹ️ No customers found, returning empty response');
            return res.json({ customers: [], total: 0 });
        }
        
        let query = `
            SELECT 
                cif_number,
                customer_first_name,
                customer_last_name,
                customer_username,
                customer_status,
                created_at,
                birth_date,
                gender,
                citizenship
            FROM customer 
            WHERE is_deleted = FALSE
        `;
        const params = [];
        if (status && status !== 'all') {
            query += ' AND customer_status = ?';
            params.push(status);
        }
        query += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
        
        console.log('🔍 Executing customer query:', query, params);
        const [customers] = await connection.execute(query, params);
        console.log(`✅ Retrieved ${customers.length} customers`);
        res.json({ customers, total: customers.length });
    } catch (error) {
        console.error('❌ Error fetching customers:', error);
        console.error('❌ Error details:', {
            message: error.message,
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState,
            sqlMessage: error.sqlMessage
        });
        res.status(500).json({ 
            error: 'Error Loading Customers',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// Admin customer verification - update customer status
router.put('/admin/customers/:cif_number/status', requireAdminSession, async (req, res) => {
    try {
        const { cif_number } = req.params;
        const { status, employee_id } = req.body;
        
        if (!status || !employee_id) {
            return res.status(400).json({ message: 'Status and employee_id are required' });
        }
        
        const validStatuses = ['Pending Verification', 'Active', 'Inactive', 'Suspended', 'Dormant'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        
        const connection = await pool.getConnection();
        
        // Update customer status
        const [result] = await connection.execute(`
            UPDATE customer 
            SET customer_status = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE cif_number = ?
        `, [status, cif_number]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        
        // Log the action in review queue if needed
        if (status === 'Active' || status === 'Inactive' || status === 'Suspended') {
            await connection.execute(`
                INSERT INTO REVIEW_QUEUE (
                    cif_number, 
                    request_type, 
                    request_timestamp, 
                    request_details, 
                    review_status, 
                    reviewed_by_employee_id, 
                    review_date,
                    review_comment
                ) VALUES (?, 'STATUS_UPDATE', NOW(), ?, 'COMPLETED', ?, CURDATE(), ?)
            `, [
                cif_number, 
                `Status changed to ${status}`, 
                employee_id, 
                `Customer status updated to ${status} by admin`
            ]);
        }
        
        res.json({ 
            success: true, 
            message: `Customer status updated to ${status}` 
        });
        
    } catch (error) {
        console.error('Error updating customer status:', error);
        res.status(500).json({ 
            message: 'Failed to update customer status',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// Admin review queue management - get all pending reviews
router.get('/admin/review-queue', requireAdminSession, async (req, res) => {
    let connection;
    try {
        console.log('🔍 Review queue request received:', {
            query: req.query,
            url: req.url,
            method: req.method
        });
        
        let page = parseInt(req.query.page, 10);
        if (isNaN(page) || page <= 0) page = 1;
        let limit = parseInt(req.query.limit, 10);
        if (isNaN(limit) || limit <= 0) limit = 50;
        const offset = (page - 1) * limit;
        // Accept both 'status' and 'type' (for compatibility)
        let status = req.query.status || req.query.type || 'PENDING';
        // Normalize status if type=verification
        if (status === 'verification') status = 'PENDING';
        
        console.log('📊 Query parameters:', { page, limit, offset, status });
        
        connection = await pool.getConnection();
        console.log('✅ Database connection acquired');
        
        // Get pending customers for verification review
        const query = `
            SELECT 
                c.cif_number,
                c.customer_first_name as first_name,
                c.customer_last_name as last_name,
                c.customer_middle_name as middle_name,
                c.customer_suffix_name as suffix,
                c.customer_username,
                c.customer_status as status,
                c.customer_type,
                c.created_at,
                c.birth_date as date_of_birth,
                c.gender,
                c.civil_status_code,
                c.tax_identification_number,
                ad.account_number,
                ad.account_status,
                ad.account_open_date,
                ad.product_type_code,
                'VERIFICATION' as request_type,
                c.created_at as request_timestamp,
                'Customer account verification pending' as request_details,
                'PENDING' as review_status,
                NULL as reviewed_by_employee_id,
                NULL as review_date,
                NULL as review_comment,
                c.cif_number as review_id,
                c.cif_number as customer_id,
                -- Get email and phone from contact details
                (SELECT contact_value FROM customer_contact_details ccd 
                 WHERE ccd.cif_number = c.cif_number AND ccd.contact_type_code = 'CT04' LIMIT 1) as email,
                (SELECT contact_value FROM customer_contact_details ccd 
                 WHERE ccd.cif_number = c.cif_number AND ccd.contact_type_code = 'CT01' LIMIT 1) as phone_number,
                -- Get address information
                (SELECT CONCAT(ca.address_street, ', ', ca.address_city, ', ', ca.address_province) 
                 FROM customer_address ca 
                 WHERE ca.cif_number = c.cif_number AND ca.address_type_code = 'AD01' LIMIT 1) as street_address,
                (SELECT ca.address_city FROM customer_address ca 
                 WHERE ca.cif_number = c.cif_number AND ca.address_type_code = 'AD01' LIMIT 1) as city,
                (SELECT ca.address_province FROM customer_address ca 
                 WHERE ca.cif_number = c.cif_number AND ca.address_type_code = 'AD01' LIMIT 1) as state_province,
                (SELECT ca.address_country FROM customer_address ca 
                 WHERE ca.cif_number = c.cif_number AND ca.address_type_code = 'AD01' LIMIT 1) as country,
                (SELECT ca.address_zip_code FROM customer_address ca 
                 WHERE ca.cif_number = c.cif_number AND ca.address_type_code = 'AD01' LIMIT 1) as zip_code
            FROM customer c
            INNER JOIN customer_account ca ON c.cif_number = ca.cif_number
            INNER JOIN account_details ad ON ca.account_number = ad.account_number
            WHERE (c.customer_status = 'Pending Verification' OR c.customer_status = 'Pending')
                AND (c.is_deleted = FALSE OR c.is_deleted IS NULL)
                AND (ad.account_status = 'Pending Verification' OR ad.account_status = 'Pending')
            ORDER BY c.created_at DESC
            LIMIT ${limit} OFFSET ${offset}
        `;
        
        console.log('🔍 Executing pending customers query');
        const [pendingCustomers] = await connection.execute(query);
        console.log('✅ Query executed successfully, found', pendingCustomers.length, 'pending customers');
        
        // Normalize status fields for frontend compatibility
        function normalizeStatus(val) {
            if (!val) return 'PENDING';
            const map = {
                'Pending Verification': 'PENDING',
                'Pending': 'PENDING',
                'Approved': 'APPROVED',
                'Rejected': 'REJECTED',
                'Under Review': 'UNDER_REVIEW',
                'Completed': 'COMPLETED',
            };
            return map[val] || val.toUpperCase().replace(/ /g, '_');
        }
        pendingCustomers.forEach(cust => {
            cust.status = normalizeStatus(cust.status);
            if (cust.account_status) cust.account_status = normalizeStatus(cust.account_status);
        });
        
        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM customer c
            INNER JOIN customer_account ca ON c.cif_number = ca.cif_number
            INNER JOIN account_details ad ON ca.account_number = ad.account_number
            WHERE (c.customer_status = 'Pending Verification' OR c.customer_status = 'Pending')
                AND (c.is_deleted = FALSE OR c.is_deleted IS NULL)
                AND (ad.account_status = 'Pending Verification' OR ad.account_status = 'Pending')
        `;
        
        console.log('🔍 Executing count query');
        const [countResult] = await connection.execute(countQuery);
        const total = countResult[0].total;
        console.log('✅ Count query executed, total:', total);
        
        const response = {
            success: true,
            data: pendingCustomers,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
        
        console.log('📤 Sending response:', {
            success: response.success,
            dataCount: response.data.length,
            total: response.pagination.total
        });
        
        res.json(response);
        
    } catch (error) {
        console.error('❌ Error fetching review queue:', error);
        console.error('❌ Error stack:', error.stack);
        console.error('❌ Error details:', {
            message: error.message,
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState,
            sqlMessage: error.sqlMessage
        });
        
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch review queue',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    } finally {
        if (connection) {
            connection.release();
            console.log('🔓 Database connection released');
        }
    }
});

// Admin employee management - get all employees
router.get('/admin/employees', requireAdminSession, async (req, res) => {
    console.log('👨‍💼 Employee list request received');
    let connection;
    try {
        let limit = parseInt(req.query.limit, 10);
        if (isNaN(limit) || limit <= 0) limit = 50;
        let page = parseInt(req.query.page, 10);
        if (isNaN(page) || page <= 0) page = 1;
        const offset = (page - 1) * limit;
        connection = await pool.getConnection();
        let whereClause = 'is_deleted = FALSE';
        const sql = `
            SELECT 
                employee_id,
                employee_first_name,
                employee_last_name,
                employee_username,
                employee_position,
                created_at
            FROM bank_employee 
            WHERE ${whereClause}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `;
        const [employees] = await connection.execute(sql, [limit, offset]);
        // Get total count
        const countSql = `SELECT COUNT(*) as total FROM bank_employee WHERE ${whereClause}`;
        const [countResult] = await connection.execute(countSql);
        const total = countResult[0].total;
        res.json({
            employees,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ 
            message: 'Failed to fetch employees',
            error: error.message
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// Admin customer profile - get detailed customer information
router.get('/admin/customers/:cif_number', requireAdminSession, async (req, res) => {
    console.log('🔍 Customer profile request for CIF:', req.params.cif_number);
    let connection;
    
    try {
        const { cif_number } = req.params;
        
        connection = await pool.getConnection();
        
        // Get basic customer information first (using known working columns)
        const [customerResult] = await connection.execute(`
            SELECT 
                cif_number,
                customer_first_name,
                customer_last_name,
                customer_username,
                customer_status,
                created_at,
                birth_date,
                gender,
                citizenship
            FROM customer 
            WHERE cif_number = ? AND is_deleted = FALSE
        `, [cif_number]);
        
        if (customerResult.length === 0) {
            console.log('❌ Customer not found:', cif_number);
            return res.status(404).json({ message: 'Customer not found' });
        }
        
        // Get valid ID image path (latest by created/issue date)
        const [idRows] = await connection.execute(`
            SELECT id_storage FROM CUSTOMER_ID 
            WHERE cif_number = ? AND id_storage IS NOT NULL AND id_storage != ''
            ORDER BY id_issue_date DESC, id_number DESC LIMIT 1
        `, [cif_number]);
        const valid_id_path = idRows.length > 0 ? idRows[0].id_storage : null;

        // Get alias doc image path (latest by issue date)
        const [aliasDocRows] = await connection.execute(`
            SELECT alias_doc_storage FROM ALIAS_DOCUMENTATION ad
            JOIN CUSTOMER_ALIAS ca ON ad.customer_alias_id = ca.customer_alias_id
            WHERE ca.cif_number = ? AND alias_doc_storage IS NOT NULL AND alias_doc_storage != ''
            ORDER BY alias_doc_issue_date DESC, ad.alias_doc_number DESC LIMIT 1
        `, [cif_number]);
        const alias_doc_path = aliasDocRows.length > 0 ? aliasDocRows[0].alias_doc_storage : null;

        // Return customer profile with image paths
        res.json({
            customer: customerResult[0],
            valid_id_path,
            alias_doc_path
        });
        
    } catch (error) {
        console.error('❌ Error fetching customer details:', error);
        res.status(500).json({ 
            message: 'Failed to fetch customer details',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// Admin review queue - update review status
router.put('/admin/review-queue/:review_id', requireAdminSession, async (req, res) => {
    try {
        const { review_id } = req.params;
        const { review_status, review_comment, employee_id } = req.body;
        
        if (!review_status || !employee_id) {
            return res.status(400).json({ message: 'Review status and employee_id are required' });
        }
        
        const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'];
        if (!validStatuses.includes(review_status)) {
            return res.status(400).json({ message: 'Invalid review status' });
        }
        
        const connection = await pool.getConnection();
        
        // Update review queue item
        const [result] = await connection.execute(`
            UPDATE REVIEW_QUEUE 
            SET 
                review_status = ?, 
                reviewed_by_employee_id = ?, 
                review_date = CURDATE(), 
                review_comment = ?
            WHERE review_id = ?
        `, [review_status, employee_id, review_comment || '', review_id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Review item not found' });
        }
        
        res.json({ 
            success: true, 
            message: `Review status updated to ${review_status}` 
        });
        
    } catch (error) {
        console.error('Error updating review status:', error);
        res.status(500).json({ 
            message: 'Failed to update review status',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// Admin customer search
router.get('/admin/customers/search/:query', requireAdminSession, async (req, res) => {
    try {
        const { query } = req.params;
        const limit = parseInt(req.query.limit) || 10;
        
        if (!query || query.length < 2) {
            return res.status(400).json({ message: 'Search query must be at least 2 characters' });
        }
        
        const connection = await pool.getConnection();
        
        // Search customers by name, username, or CIF number
        const [results] = await connection.execute(`
            SELECT 
                cif_number,
                customer_first_name,
                customer_last_name,
                customer_username,
                customer_status,
                created_at
            FROM customer 
            WHERE (
                customer_first_name LIKE ? OR 
                customer_last_name LIKE ? OR 
                customer_username LIKE ? OR 
                cif_number LIKE ?
            ) AND is_deleted = FALSE
            ORDER BY 
                CASE 
                    WHEN cif_number = ? THEN 1
                    WHEN customer_username = ? THEN 2
                    WHEN CONCAT(customer_first_name, ' ', customer_last_name) LIKE ? THEN 3
                    ELSE 4
                END,
                created_at DESC
            LIMIT ?
        `, [
            `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`,
            query, query, `%${query}%`,
            limit
        ]);
        
        res.json({ customers: results });
        
    } catch (error) {
        console.error('Error searching customers:', error);
        res.status(500).json({ 
            message: 'Failed to search customers',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// Admin closed accounts - get all closed accounts
router.get('/admin/accounts/closed', requireAdminSession, async (req, res) => {
    console.log('📄 Closed accounts request received');
    let connection;
    try {
        let limit = parseInt(req.query.limit, 10);
        if (isNaN(limit) || limit <= 0) limit = 100;
        let page = parseInt(req.query.page, 10);
        if (isNaN(page) || page <= 0) page = 1;
        const offset = (page - 1) * limit;
        connection = await pool.getConnection();
        
        // First check if there are any closed accounts
        const [accountCheck] = await connection.execute(`
            SELECT COUNT(*) as count 
            FROM ACCOUNT_DETAILS 
            WHERE account_status = 'Closed'
        `);
        console.log('📊 Found', accountCheck[0].count, 'closed accounts');
        
        if (accountCheck[0].count === 0) {
            // No closed accounts, return empty response
            console.log('ℹ️ No closed accounts found, returning empty response');
            return res.json({ accounts: [] });
        }
        
        let whereClause = "a.account_status = 'Closed'";
        const sql = `
            SELECT 
                ca.cif_number,
                a.account_number,
                a.account_status,
                a.account_open_date,
                a.account_close_date,
                a.product_type_code,
                p.product_type_name,
                c.customer_first_name,
                c.customer_last_name
            FROM CUSTOMER_ACCOUNT ca
            JOIN ACCOUNT_DETAILS a ON ca.account_number = a.account_number
            LEFT JOIN CUSTOMER c ON ca.cif_number = c.cif_number
            LEFT JOIN CUSTOMER_PRODUCT_TYPE p ON a.product_type_code = p.product_type_code
            WHERE ${whereClause}
            ORDER BY a.account_close_date DESC
            LIMIT ${limit} OFFSET ${offset}
        `;
        const [accounts] = await connection.execute(sql);
        res.json({ accounts });
    } catch (error) {
        console.error('Error fetching closed accounts:', error);
        res.status(500).json({ 
            message: 'Failed to fetch closed accounts',
            error: error.message
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// Employee CRUD Operations
// Create new employee
router.post('/admin/employees', requireAdminSession, async (req, res) => {
    console.log('👨‍💼 Creating new employee:', req.body);
    let connection;
    
    try {
        const { username, password, firstName, lastName, position } = req.body;
        
        if (!username || !password || !firstName || !lastName || !position) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        connection = await pool.getConnection();
        
        // Check if username already exists
        const [existingUser] = await connection.execute(
            'SELECT employee_id FROM bank_employee WHERE employee_username = ? AND is_deleted = FALSE',
            [username]
        );
        
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        
        // Insert new employee (now includes password)
        const [result] = await connection.execute(`
            INSERT INTO bank_employee (
                employee_username,
                employee_password,
                employee_first_name,
                employee_last_name,
                employee_position,
                created_at,
                is_deleted
            ) VALUES (?, ?, ?, ?, ?, NOW(), FALSE)
        `, [username, password, firstName, lastName, position]);
        
        console.log('✅ Employee created with ID:', result.insertId);
        
        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            employee_id: result.insertId
        });
        
    } catch (error) {
        console.error('❌ Error creating employee:', error);
        res.status(500).json({ 
            message: 'Failed to create employee',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// Update existing employee
router.put('/admin/employees/:employee_id', requireAdminSession, async (req, res) => {
    console.log('🔧 Updating employee:', req.params.employee_id, req.body);
    let connection;
    
    try {
        const { employee_id } = req.params;
        const { username, password, firstName, lastName, position } = req.body;
        
        if (!username || !firstName || !lastName || !position) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        connection = await pool.getConnection();
        
        // Check if username exists for different employee
        const [existingUser] = await connection.execute(
            'SELECT employee_id FROM bank_employee WHERE employee_username = ? AND employee_id != ? AND is_deleted = FALSE',
            [username, employee_id]
        );
        
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        
        let updateQuery, updateParams;
        if (password && password.trim() !== '') {
            updateQuery = `
                UPDATE bank_employee 
                SET employee_username = ?, 
                    employee_password = ?,
                    employee_first_name = ?, 
                    employee_last_name = ?, 
                    employee_position = ?
                WHERE employee_id = ? AND is_deleted = FALSE
            `;
            updateParams = [username, password, firstName, lastName, position, employee_id];
        } else {
            updateQuery = `
                UPDATE bank_employee 
                SET employee_username = ?, 
                    employee_first_name = ?, 
                    employee_last_name = ?, 
                    employee_position = ?
                WHERE employee_id = ? AND is_deleted = FALSE
            `;
            updateParams = [username, firstName, lastName, position, employee_id];
        }
        
        // Update employee
        const [result] = await connection.execute(updateQuery, updateParams);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        
        console.log('✅ Employee updated successfully');
        
        res.json({
            success: true,
            message: 'Employee updated successfully'
        });
        
    } catch (error) {
        console.error('❌ Error updating employee:', error);
        res.status(500).json({ 
            message: 'Failed to update employee',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// Delete employee (soft delete)
router.delete('/admin/employees/:employee_id', requireAdminSession, async (req, res) => {
    console.log('🗑️ Deleting employee:', req.params.employee_id);
    let connection;
    
    try {
        const { employee_id } = req.params;
        
        connection = await pool.getConnection();
        
        // Soft delete the employee
        const [result] = await connection.execute(`
            UPDATE bank_employee 
            SET is_deleted = TRUE 
            WHERE employee_id = ? AND is_deleted = FALSE
        `, [employee_id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        
        console.log('✅ Employee deleted successfully');
        
        res.json({
            success: true,
            message: 'Employee deleted successfully'
        });
        
    } catch (error) {
        console.error('❌ Error deleting employee:', error);
        res.status(500).json({ 
            message: 'Failed to delete employee',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

module.exports = router;
