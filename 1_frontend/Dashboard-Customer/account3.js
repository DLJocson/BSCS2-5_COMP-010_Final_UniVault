document.addEventListener('DOMContentLoaded', function() {
  const cif = localStorage.getItem('cif_number');
  if (cif) {
    fetch(`/api/customer/${cif}`)
      .then(res => res.json())
      .then(customer => {
        document.querySelector('.welcome .blue-text').textContent = customer.customer_first_name || 'Customer';
        const lastLogin = localStorage.getItem('last_login');
        document.querySelector('.welcome-message p span').textContent = lastLogin || '';
      });
  }
}); 