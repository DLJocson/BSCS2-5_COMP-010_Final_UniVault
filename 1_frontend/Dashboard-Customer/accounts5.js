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

  let allAccounts = [];

  // Fetch and display customer name and last login
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
    });

  function renderAccountsByType(accountType, iconPath, filterText = '') {
    fetch(`/api/accounts/${cif}`)
      .then(res => res.json())
      .then(accounts => {
        allAccounts = accounts.filter(acc =>
          acc.account_type === 'Insurance Account' || acc.account_type === 'Insurance'
        );
        let filtered = allAccounts;
        if (filterText) {
          const lower = filterText.toLowerCase();
          filtered = allAccounts.filter(acc =>
            (acc.account_number && acc.account_number.toString().includes(lower)) ||
            (acc.account_nickname && acc.account_nickname.toLowerCase().includes(lower))
          );
        }
        updateAccountDisplay(filtered, iconPath);
      });
  }

  function updateAccountDisplay(filtered, iconPath) {
    const cardContainer = document.querySelector('.account-info-card');
    cardContainer.innerHTML = '';

    if (filtered.length === 0) {
      document.querySelector('.account-nickname textarea').value = '';
      document.querySelector('.account-number textarea').value = '';
      document.querySelector('.current-balance textarea').value = '';
      document.querySelector('.open-date textarea').value = '';
      document.querySelector('.close-date textarea').value = '';
      document.querySelector('.biometrics-type textarea').value = 'N/A';
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

      if (idx === 0) {
        document.querySelector('.account-nickname textarea').value = acc.account_nickname || '';
        document.querySelector('.account-number textarea').value = acc.account_number || '';
        document.querySelector('.current-balance textarea').value = typeof acc.current_balance === 'number' ? acc.current_balance.toLocaleString() : (acc.current_balance ? Number(acc.current_balance).toLocaleString() : '');
        document.querySelector('.open-date textarea').value = acc.account_open_date ? acc.account_open_date.slice(0, 10) : '';
        document.querySelector('.close-date textarea').value = acc.account_close_date ? acc.account_close_date.slice(0, 10) : '';
      }
    });
  }

  // Initial render
  renderAccountsByType('Insurance Account', '/assets/insurance.png');

  // Search bar logic
  const searchInput = document.getElementById('search');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const filterText = searchInput.value.trim();
      // Use already-fetched accounts for filtering
      const filtered = allAccounts.filter(acc =>
        (acc.account_number && acc.account_number.toString().includes(filterText)) ||
        (acc.account_nickname && acc.account_nickname.toLowerCase().includes(filterText.toLowerCase()))
      );
      updateAccountDisplay(filtered, '/assets/insurance.png');
    });
  }

  const logoutBtn = document.getElementById('log-out');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      localStorage.clear();
      window.location.href = '/Registration-Customer/login.html';
    });
  }
});
