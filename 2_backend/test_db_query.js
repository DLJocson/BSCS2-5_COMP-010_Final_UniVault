require('dotenv').config();
const { pool } = require('./config/database');
const mysql = require('mysql2/promise');

// async function testPendingCustomers() {
//   ...
// }
// async function printStatuses() {
//   ...
// }

async function printJoinResults() {
  const pool = mysql.createPool({host: 'localhost', user: 'root', password: 'kV:a7ij?,8GbSKG', database: 'univault_schema'});
  const [rows] = await pool.execute(`
    SELECT c.cif_number, c.customer_status, ca.account_number, ad.account_status
    FROM customer c
    INNER JOIN customer_account ca ON c.cif_number = ca.cif_number
    INNER JOIN account_details ad ON ca.account_number = ad.account_number
    WHERE (c.customer_status = 'Pending Verification' OR c.customer_status = 'Pending')
      AND (ad.account_status = 'Pending Verification' OR ad.account_status = 'Pending')
  `);
  console.log('Join results:');
  rows.forEach(r => console.log(r));
  process.exit(0);
}

printJoinResults(); 