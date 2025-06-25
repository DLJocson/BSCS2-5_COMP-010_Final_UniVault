document.addEventListener('DOMContentLoaded', function() {
  const cif = localStorage.getItem('cif_number');
  if (!cif) return;

  // Fetch and display customer name and last login
  fetch(`/api/customer/${cif}`)
    .then(res => res.json())
    .then(customer => {
      // Set welcome message
      document.querySelector('.welcome .blue-text').textContent = customer.customer_first_name || 'Customer';
      // Set last login
      const lastLogin = localStorage.getItem('last_login');
      if (lastLogin) {
        document.querySelector('.welcome-message p span').textContent = lastLogin;
      } else {
        document.querySelector('.welcome-message p span').textContent = '';
      }
      // Set customer name in profile section
      document.getElementById('customer-name').textContent = 
        [customer.customer_first_name, customer.customer_middle_name, customer.customer_last_name, customer.customer_suffix_name]
          .filter(Boolean).join(' ');
    });

  function renderAccountsByType(accountType, iconPath) {
    fetch(`/api/accounts/${cif}`)
      .then(res => res.json())
      .then(accounts => {
        // Flexible filter: allow both 'Deposit Account' and 'Deposits'
        const filtered = accounts.filter(acc =>
          acc.account_type === 'Deposit Account' || acc.account_type === 'Deposits'
        );
        const cardContainer = document.querySelector('.account-info-card');
        cardContainer.innerHTML = '';

        if (filtered.length === 0) {
          document.querySelector('.account-nickname textarea').value = '';
          document.querySelector('.account-number textarea').value = '';
          document.querySelector('.current-balance textarea').value = '';
          document.querySelector('.open-date textarea').value = '';
          document.querySelector('.close-date textarea').value = '';
          return;
        }

        filtered.forEach((acc, idx) => {
          const card = document.createElement('div');
          card.className = 'account';
          card.innerHTML = `
            <img src="${iconPath}" alt="" />
            <div class="account-name">
              <h2 class="account-title">${acc.account_type || 'N/A'}</h2>
              <h4>${acc.account_nickname || ''}</h4>
            </div>
            <div class="top-label-2">
              <label>${acc.account_number ? '*******' + acc.account_number.toString().slice(-4) : 'N/A'}</label>
              <label class="blue-text">${acc.currency || 'PHP'}</label>
              <label>${typeof acc.current_balance === 'number' ? acc.current_balance.toLocaleString() : (acc.current_balance ? Number(acc.current_balance).toLocaleString() : 'N/A')}</label>
            </div>
            <div class="top-label-3">
              <label>${acc.account_status || 'N/A'}</label>
            </div>
          `;
          cardContainer.appendChild(card);

          // Update the details panel with the first account
          if (idx === 0) {
            document.querySelector('.account-nickname textarea').value = acc.account_nickname || '';
            document.querySelector('.account-number textarea').value = acc.account_number || '';
            document.querySelector('.current-balance textarea').value = typeof acc.current_balance === 'number' ? acc.current_balance.toLocaleString() : (acc.current_balance ? Number(acc.current_balance).toLocaleString() : '');
            document.querySelector('.open-date textarea').value = acc.account_open_date ? acc.account_open_date.slice(0, 10) : '';
            document.querySelector('.close-date textarea').value = acc.account_close_date ? acc.account_close_date.slice(0, 10) : '';
          }
        });
      });
  }

  // Render deposit accounts
  renderAccountsByType('Deposit Account', '/assets/savings.png');

  // Logout functionality
  const logoutBtn = document.getElementById('log-out');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      localStorage.clear();
      window.location.href = '/Registration-Customer/login.html';
    });
  }
});