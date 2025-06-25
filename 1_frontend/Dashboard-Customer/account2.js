document.addEventListener('DOMContentLoaded', function() {
  const cif = localStorage.getItem('cif_number');
  if (!cif) return;

  fetch(`/api/customer/${cif}`)
    .then(res => res.json())
    .then(customer => {
      document.querySelector('.welcome .blue-text').textContent = customer.customer_first_name || 'Customer';
      const lastLogin = localStorage.getItem('last_login');
      if (lastLogin) {
        document.querySelector('.welcome-message p span').textContent = lastLogin;
      } else {
        document.querySelector('.welcome-message p span').textContent = '';
      }
      document.getElementById('customer-name').textContent = 
        [customer.customer_first_name, customer.customer_middle_name, customer.customer_last_name, customer.customer_suffix_name]
          .filter(Boolean).join(' ');
    });

  // Logout functionality
  const logoutBtn = document.getElementById('log-out');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      localStorage.clear();
      window.location.href = '/Registration-Customer/login.html';
    });
  }
}); 