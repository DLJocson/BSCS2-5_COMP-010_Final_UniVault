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

  function renderAccountsByType(accountType, iconPath) {
    fetch(`/api/accounts/${cif}`)
      .then(res => res.json())
      .then(accounts => {
        // Flexible filter: allow both 'Wealth Management Account' and 'Wealth Management'
        const filtered = accounts.filter(acc =>
          acc.account_type === 'Wealth Management Account' || acc.account_type === 'Wealth Management'
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
            document.querySelector('.account-title').textContent = acc.account_type || '';
            document.querySelector('.account-number textarea').value = acc.account_number || '';
            document.querySelector('.current-balance textarea').value = typeof acc.current_balance === 'number' ? acc.current_balance.toLocaleString() : (acc.current_balance ? Number(acc.current_balance).toLocaleString() : '');
            document.querySelector('.open-date textarea').value = acc.account_open_date ? acc.account_open_date.slice(0, 10) : '';
            document.querySelector('.close-date textarea').value = acc.account_close_date ? acc.account_close_date.slice(0, 10) : '';
            const topLabels = document.querySelectorAll('.top-label-2 label');
            if (topLabels.length >= 3) {
              topLabels[0].textContent = acc.account_number ? '*******' + acc.account_number.toString().slice(-4) : 'N/A';
              topLabels[1].textContent = acc.currency || 'PHP';
              topLabels[2].textContent = typeof acc.current_balance === 'number' ? acc.current_balance.toLocaleString() : (acc.current_balance ? Number(acc.current_balance).toLocaleString() : 'N/A');
            }
            const statusLabel = document.querySelector('.top-label-3 label');
            if (statusLabel) statusLabel.textContent = acc.account_status || 'N/A';
          }
        });
      });
  }

  renderAccountsByType('Wealth Management Account', '/assets/investment.png');

  const logoutBtn = document.getElementById('log-out');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      localStorage.clear();
      window.location.href = '/Registration-Customer/login.html';
    });
  }
});
