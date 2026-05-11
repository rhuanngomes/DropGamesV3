(function () {
  if (localStorage.getItem('dg_logged') !== '1') return;

  document.querySelectorAll('.dg-auth-only').forEach(function (el) {
    el.style.display = 'none';
  });
  document.querySelectorAll('.dg-logged-only').forEach(function (el) {
    el.style.display = 'flex';
  });
}());
