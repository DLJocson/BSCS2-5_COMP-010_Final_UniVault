const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

console.log('Admin routes module loaded!');

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
router.get('/admin/customers', async (req, res) => {
    console.log('👥 Customer list request received');
    let connection;
    
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;
        const status = req.query.status;
        const search = req.query.search;
        
        connection = await pool.getConnection();
        
        // Build dynamic WHERE clause
        let whereConditions = ['is_deleted = FALSE'];
        let queryParams = [];
        
        if (status && status !== 'all') {
            whereConditions.push('customer_status = ?');
            queryParams.push(status);
        }
        
        if (search) {
            whereConditions.push(`(
                customer_first_name LIKE ? OR 
                customer_last_name LIKE ? OR 
                customer_username LIKE ? OR 
                cif_number LIKE ?
            )`);
            const searchTerm = `%${search}%`;
            queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }
        
        const whereClause = whereConditions.join(' AND ');
        
        // Get customers with pagination and filtering
        const [customers] = await connection.execute(`
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
            WHERE ${whereClause}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `, [...queryParams, limit, offset]);
        
        // Get total count with same filters
        const [countResult] = await connection.execute(`
            SELECT COUNT(*) as total 
            FROM customer 
            WHERE ${whereClause}
        `, queryParams);
        
        const total = countResult[0].total;
        
        res.json({
            customers,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
        
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ 
            message: 'Failed to fetch customers',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// Admin customer verification - update customer status
router.put('/admin/customers/:cif_number/status', async (req, res) => {
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
router.get('/admin/review-queue', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;
        const status = req.query.status || 'PENDING';
        
        const connection = await pool.getConnection();
        
        // Get review queue items with customer details
        const [reviews] = await connection.execute(`
            SELECT 
                rq.review_id,
                rq.cif_number,
                rq.request_type,
                rq.request_timestamp,
                rq.request_details,
                rq.review_status,
                rq.reviewed_by_employee_id,
                rq.review_date,
                rq.review_comment,
                c.customer_first_name,
                c.customer_last_name,
                c.customer_username,
                c.customer_status,
                c.created_at as customer_created_at
            FROM review_queue rq
            JOIN customer c ON rq.cif_number = c.cif_number
            WHERE rq.review_status = ? AND c.is_deleted = FALSE
            ORDER BY rq.request_timestamp DESC
            LIMIT ? OFFSET ?
        `, [status, limit, offset]);
        
        // Get total count
        const [countResult] = await connection.execute(`
            SELECT COUNT(*) as total 
            FROM review_queue rq
            JOIN customer c ON rq.cif_number = c.cif_number
            WHERE rq.review_status = ? AND c.is_deleted = FALSE
        `, [status]);
        
        const total = countResult[0].total;
        
        res.json({
            reviews,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
        
    } catch (error) {
        console.error('Error fetching review queue:', error);
        res.status(500).json({ 
            message: 'Failed to fetch review queue',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// Admin employee management - get all employees
router.get('/admin/employees', async (req, res) => {
    console.log('👨‍💼 Employee list request received');
    let connection;
    
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;
        
        connection = await pool.getConnection();
        
        // Get employees with pagination
        const [employees] = await connection.execute(`
            SELECT 
                employee_id,
                employee_first_name,
                employee_last_name,
                employee_username,
                employee_position,
                created_at
            FROM bank_employee 
            WHERE is_deleted = FALSE
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `, [limit, offset]);
        
        // Get total count
        const [countResult] = await connection.execute(`
            SELECT COUNT(*) as total 
            FROM bank_employee 
            WHERE is_deleted = FALSE
        `);
        
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
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// Admin customer profile - get detailed customer information
router.get('/admin/customers/:cif_number', async (req, res) => {
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
        
        console.log('✅ Customer found:', customerResult[0].customer_first_name, customerResult[0].customer_last_name);
        
        // Return simplified customer profile for now
        res.json({
            customer: customerResult[0],
            accounts: [], // Will implement later when schema is confirmed
            idDocuments: [] // Will implement later when schema is confirmed
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
router.put('/admin/review-queue/:review_id', async (req, res) => {
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
router.get('/admin/customers/search/:query', async (req, res) => {
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

// Admin closed accounts - get all closed/inactive accounts
router.get('/admin/closed-accounts', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;
        
        const connection = await pool.getConnection();
        
        // Get closed/inactive customers
        const [customers] = await connection.execute(`
            SELECT 
                c.cif_number,
                c.customer_first_name,
                c.customer_last_name,
                c.customer_middle_name,
                c.customer_suffix,
                c.customer_username,
                c.customer_status,
                c.updated_at as status_changed_date,
                c.created_at
            FROM customer c
            WHERE c.customer_status IN ('Inactive', 'Suspended', 'Dormant') 
            AND c.is_deleted = FALSE
            ORDER BY c.updated_at DESC
            LIMIT ? OFFSET ?
        `, [limit, offset]);
        
        // Get total count
        const [countResult] = await connection.execute(`
            SELECT COUNT(*) as total 
            FROM customer 
            WHERE customer_status IN ('Inactive', 'Suspended', 'Dormant') 
            AND is_deleted = FALSE
        `);
        
        const total = countResult[0].total;
        
        res.json({
            customers,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
        
    } catch (error) {
        console.error('Error fetching closed accounts:', error);
        res.status(500).json({ 
            message: 'Failed to fetch closed accounts',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// API endpoints for frontend compatibility
// GET /api/employees - For admin-user-management2.html
router.get('/api/employees', async (req, res) => {
    console.log('👨‍💼 API Employee list request received');
    let connection;
    
    try {
        connection = await pool.getConnection();
        
        // Get all employees with essential information
        const [employees] = await connection.execute(`
            SELECT 
                employee_id,
                employee_first_name,
                employee_last_name,
                employee_username,
                employee_position,
                created_at
            FROM bank_employee 
            WHERE is_deleted = FALSE
            ORDER BY created_at DESC
        `);
        
        console.log(`✅ Retrieved ${employees.length} employees`);
        res.json(employees);
        
    } catch (error) {
        console.error('❌ Error fetching employees:', error);
        res.status(500).json({ 
            error: 'Failed to load employees',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// GET /api/customers - For admin-user-management.html  
router.get('/api/customers', async (req, res) => {
    console.log('👥 API Customer list request received');
    let connection;
    
    try {
        connection = await pool.getConnection();
        
        // Get all customers with essential information
        const [customers] = await connection.execute(`
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
            ORDER BY created_at DESC
        `);
        
        console.log(`✅ Retrieved ${customers.length} customers`);
        res.json(customers);
        
    } catch (error) {
        console.error('❌ Error fetching customers:', error);
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

// Employee CRUD Operations
// Create new employee
router.post('/admin/employees', async (req, res) => {
    console.log('👨‍💼 Creating new employee:', req.body);
    let connection;
    
    try {
        const { username, firstName, lastName, position } = req.body;
        
        if (!username || !firstName || !lastName || !position) {
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
        
        // Insert new employee
        const [result] = await connection.execute(`
            INSERT INTO bank_employee (
                employee_username,
                employee_first_name,
                employee_last_name,
                employee_position,
                created_at,
                is_deleted
            ) VALUES (?, ?, ?, ?, NOW(), FALSE)
        `, [username, firstName, lastName, position]);
        
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
router.put('/admin/employees/:employee_id', async (req, res) => {
    console.log('🔧 Updating employee:', req.params.employee_id, req.body);
    let connection;
    
    try {
        const { employee_id } = req.params;
        const { username, firstName, lastName, position } = req.body;
        
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
        
        // Update employee
        const [result] = await connection.execute(`
            UPDATE bank_employee 
            SET employee_username = ?, 
                employee_first_name = ?, 
                employee_last_name = ?, 
                employee_position = ?
            WHERE employee_id = ? AND is_deleted = FALSE
        `, [username, firstName, lastName, position, employee_id]);
        
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
router.delete('/admin/employees/:employee_id', async (req, res) => {
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
