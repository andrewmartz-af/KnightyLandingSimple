const form = document.querySelector('#login-form');
form.addEventListener('submit', (event) => {
  event.preventDefault();
  document.querySelector('#password').value = '';
  document.querySelector('.login-status').textContent = 'Account sign-in is not connected yet. Please come back soon.';
});
// Enable only after the handler is installed; credentials are never sent or stored.
document.querySelector('.login-submit').disabled = false;
