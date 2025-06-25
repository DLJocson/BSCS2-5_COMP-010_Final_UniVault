require('dotenv').config();
const { pool } = require('./config/database');

async function testPendingCustomers() {
    let connection;
    try {
        console.log('🔍 Testing pending customers...');
        connection = await pool.getConnection();

        // Check if there are pending customers
        const [customers] = await connection.execute(`
            SELECT cif_number, customer_first_name, customer_last_name, customer_status 
            FROM customer 
            WHERE customer_status = 'Pending Verification'
        `);
        console.log('📊 Pending customers found:', customers.length);
        console.log('Customers:', customers);

        // Check if there are pending accounts
        const [accounts] = await connection.execute(`
            SELECT ad.account_number, ad.account_status, ca.cif_number
            FROM account_details ad
            JOIN customer_account ca ON ad.account_number = ca.account_number
            WHERE ad.account_status = 'Pending Verification'
        `);
        console.log('📊 Pending accounts found:', accounts.length);
        console.log('Accounts:', accounts);

        // Test the full query
        const [pendingCustomers] = await connection.execute(`
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
            LEFT JOIN customer_account ca ON c.cif_number = ca.cif_number
            LEFT JOIN account_details ad ON ca.account_number = ad.account_number
            WHERE c.customer_status = 'Pending Verification' 
                AND (c.is_deleted = FALSE OR c.is_deleted IS NULL)
                AND (ad.account_status = 'Pending Verification' OR ad.account_status IS NULL)
            ORDER BY c.created_at DESC
        `);
        console.log('📊 Full query result count:', pendingCustomers.length);
        console.log('Full query result:', JSON.stringify(pendingCustomers, null, 2));

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) {
            connection.release();
        }
        process.exit(0);
    }
}

testPendingCustomers(); 