const input = document.querySelector('#search');
const clear = document.querySelector('.clear');
const matchCount = document.querySelector('#match-count');
const matchStatus = document.querySelector('#match-status');
const matchButton = document.querySelector('.submit');
// Placeholder until a matching service returns a count for the current prompt.
function resetMatches() {
  matchCount.textContent = '0';
  matchStatus.textContent = 'Matching coming soon.';
}
input.addEventListener('input', () => {
  clear.hidden = input.value.length === 0;
  input.setCustomValidity('');
  resetMatches();
});
clear.addEventListener('click', () => {
  input.value = '';
  input.setCustomValidity('');
  clear.hidden = true;
  resetMatches();
  input.focus();
});
document.querySelector('form').addEventListener('submit', (event) => {
  event.preventDefault();
  input.value = input.value.trim();
  if (!input.value) {
    input.setCustomValidity('Describe the stay you’re looking for.');
    input.reportValidity();
    return;
  }
  matchStatus.textContent = 'Stay matching is coming soon. Your prompt has not been searched yet.';
});
matchButton.disabled = false;

const accountLogin = document.querySelector('#account-login');
const accountProfile = document.querySelector('#account-profile');
const profilePhoto = document.querySelector('#profile-photo');
const profileInitials = document.querySelector('#profile-initials');
const profileName = document.querySelector('#profile-name');
const loginNote = document.querySelector('#login-note');

// Presentation only: the future authentication provider supplies its verified user.
// This does not authenticate anyone or grant access to account data.
function setUser(user) {
  const signedIn = Boolean(user && typeof user.id === 'string' && user.id.trim());
  accountLogin.hidden = signedIn;
  accountProfile.hidden = !signedIn;
  loginNote.hidden = signedIn;
  if (signedIn) input.removeAttribute('aria-describedby');
  else input.setAttribute('aria-describedby', 'login-note');

  const name = signedIn && typeof user.name === 'string' && user.name.trim() ? user.name.trim() : 'Your profile';
  profileName.textContent = signedIn ? name : '';
  profileInitials.textContent = signedIn ? name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase() : '';
  profilePhoto.hidden = true;
  profileInitials.hidden = false;
  profilePhoto.removeAttribute('src');
  if (signedIn && typeof user.picture === 'string' && user.picture) {
    try {
      const url = new URL(user.picture, window.location.origin);
      if (url.protocol === 'https:' || url.origin === window.location.origin) {
        profilePhoto.src = url.href;
        profilePhoto.hidden = false;
        profileInitials.hidden = true;
      }
    } catch { /* Keep the initials if the image URL is invalid. */ }
  }
}
profilePhoto.addEventListener('error', () => {
  profilePhoto.hidden = true;
  profileInitials.hidden = false;
});
window.knightyAccount = Object.freeze({ setUser });
setUser(null);

// Keep the placeholder centered, with entered text starting at that same position.
const promptMeasure = document.createElement('canvas').getContext('2d');
function alignPromptStart() {
  const placeholderStyle = getComputedStyle(input, '::placeholder');
  const inputStyle = getComputedStyle(input);
  promptMeasure.font = `${placeholderStyle.fontWeight} ${placeholderStyle.fontSize} ${inputStyle.fontFamily}`;
  const textWidth = promptMeasure.measureText(input.placeholder).width;
  const inset = Math.max(0, (input.clientWidth - textWidth) / 2);
  input.style.setProperty('--prompt-inset', `${inset}px`);
}
new ResizeObserver(alignPromptStart).observe(input);
alignPromptStart();
