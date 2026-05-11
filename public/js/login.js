const toggleBtn = document.getElementById('toggle-password');
const pwInput   = document.getElementById('login-password');
const emailInput = document.getElementById('login-email');
const form = document.querySelector('.dg-login-form');

toggleBtn.addEventListener('click', function () {
  pwInput.type = pwInput.type === 'password' ? 'text' : 'password';
});

form.addEventListener('submit', function (e) {
  e.preventDefault();
  if (emailInput.value.trim() && pwInput.value.trim()) {
    localStorage.setItem('dg_logged', '1');
    window.location.href = 'index.html';
  }
});
