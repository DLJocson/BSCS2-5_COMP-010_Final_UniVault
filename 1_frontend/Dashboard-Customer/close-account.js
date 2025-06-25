document.addEventListener('DOMContentLoaded', function() {
  const cif = localStorage.getItem('cif_number');
  if (!cif) return;

  // Fetch and display all accounts
  function renderAllAccounts() {
    fetch(`/api/accounts/${cif}`)
      .then(res => res.json())
      .then(accounts => {
        const cardContainer = document.querySelector('.account-info');
        cardContainer.innerHTML = '';
        if (!accounts || accounts.length === 0) {
          cardContainer.innerHTML = '<div style="padding:2em;">No accounts found.</div>';
          return;
        }
        accounts.forEach(acc => {
          const card = document.createElement('div');
          card.className = 'account-info-card';
          card.innerHTML = `
            <div class="account" data-account-number="${acc.account_number}">
              <img src="/assets/${getIcon(acc.account_type)}" alt="" />
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
              <button class="delete-account-btn" style="margin-left:1em; color:#fff; background:#e74c3c; border:none; border-radius:8px; padding:6px 16px; cursor:pointer;">Delete</button>
            </div>
          `;
          cardContainer.appendChild(card);
        });
        // Add delete button listeners
        document.querySelectorAll('.delete-account-btn').forEach(btn => {
          btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const accountDiv = btn.closest('.account');
            const accountNumber = accountDiv.getAttribute('data-account-number');
            if (confirm('Are you sure you want to close this account?')) {
              fetch(`/api/account/${accountNumber}`, { method: 'DELETE' })
                .then(res => res.json())
                .then(() => {
                  renderAllAccounts();
                });
            }
          });
        });
      });
  }

  // Helper to get icon filename by account type
  function getIcon(type) {
    if (!type) return 'savings.png';
    const map = {
      'Deposit Account': 'savings.png',
      'Deposits': 'savings.png',
      'Card Account': 'card.png',
      'Cards': 'card.png',
      'Loan Account': 'loan.png',
      'Loans': 'loan.png',
      'Wealth Management Account': 'investment.png',
      'Wealth Management': 'investment.png',
      'Insurance Account': 'insurance.png',
      'Insurance': 'insurance.png'
    };
    return map[type] || 'savings.png';
  }

  renderAllAccounts();

  // Logout functionality
  const logoutBtn = document.getElementById('log-out');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      localStorage.clear();
      window.location.href = '/Registration-Customer/login.html';
    });
  }
});
