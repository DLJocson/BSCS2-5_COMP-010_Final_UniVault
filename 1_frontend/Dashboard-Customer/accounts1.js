document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('log-out');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.clear();
            window.location.href = '/Registration-Customer/login.html';
        });
    }
}); 