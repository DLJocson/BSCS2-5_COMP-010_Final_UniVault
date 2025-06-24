// Fetch and display all customer data in the dashboard
// Assumes cif_number is stored in localStorage after login/registration

document.addEventListener('DOMContentLoaded', function() {
  const cif = localStorage.getItem('cif_number');
  if (!cif) {
    document.getElementById('customer-info').innerHTML = '<b>Error:</b> No customer ID found.';
    return;
  }
  fetch(`/api/customer/all/${cif}`)
    .then(res => res.json())
    .then(data => {
      if (data.message) {
        document.getElementById('customer-info').innerHTML = `<b>Error:</b> ${data.message}`;
        return;
      }
      // Display main info
      document.getElementById('customer-name').textContent = `${data.customer.customer_first_name} ${data.customer.customer_last_name}`;
      document.getElementById('customer-type').textContent = data.customer.customer_type;
      // Display all data as a table
      const tableDiv = document.createElement('div');
      tableDiv.style.overflowX = 'auto';
      tableDiv.innerHTML = renderAllDataTable(data);
      document.body.appendChild(tableDiv);
    })
    .catch(err => {
      document.getElementById('customer-info').innerHTML = `<b>Error:</b> ${err.message}`;
    });
});

function renderAllDataTable(data) {
  let html = '<h3>All Registration Data</h3>';
  for (const [section, rows] of Object.entries(data)) {
    if (!rows || (Array.isArray(rows) && rows.length === 0)) continue;
    html += `<h4>${section.charAt(0).toUpperCase() + section.slice(1)}</h4>`;
    if (Array.isArray(rows)) {
      html += '<table border="1" cellpadding="4" style="margin-bottom:16px; background:#fff;"><thead><tr>';
      if (rows.length > 0) {
        Object.keys(rows[0]).forEach(key => html += `<th>${key}</th>`);
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
          html += '<tr>';
          Object.values(row).forEach(val => html += `<td>${val === null ? '' : val}</td>`);
          html += '</tr>';
        });
        html += '</tbody></table>';
      }
    } else if (typeof rows === 'object') {
      html += '<table border="1" cellpadding="4" style="margin-bottom:16px; background:#fff;"><tbody>';
      Object.entries(rows).forEach(([k, v]) => {
        html += `<tr><td><b>${k}</b></td><td>${v === null ? '' : v}</td></tr>`;
      });
      html += '</tbody></table>';
    }
  }
  return html;
}
