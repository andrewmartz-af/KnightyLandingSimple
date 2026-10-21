const form = document.querySelector('#signup-form');
form.addEventListener('submit', (event) => {
  event.preventDefault();
  document.querySelector('#password').value = '';
  document.querySelector('.login-status').textContent = 'Registration is not connected yet. No account has been created.';
});
// Enable only after the handler is installed; credentials are never sent or stored.
document.querySelector('.login-submit').disabled = false;
