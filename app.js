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
  saveAnonymousPrompt();
  window.location.assign('/matches#' + new URLSearchParams({ prompt: input.value }));
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

// Align entered text with the centered prompt's first line, including when it wraps.
const promptLabel = document.querySelector('.search-prompt');
function alignPromptStart() {
  if (!promptLabel) return;
  const range = document.createRange();
  range.selectNodeContents(promptLabel);
  const firstLine = range.getClientRects()[0];
  const inset = firstLine ? Math.max(0, firstLine.left - input.getBoundingClientRect().left) : 0;
  input.style.setProperty('--prompt-inset', `${inset}px`);
}
new ResizeObserver(alignPromptStart).observe(input);
alignPromptStart();

// Retain the anonymous prompt through navigation; no credentials are stored here.
const guestOrigin = 'https://knighty-iota.vercel.app';
const draftStorageKey = 'knighty:anonymous-trip';
const draftLifetime = 24 * 60 * 60 * 1000;
let anonymousDraft = null;
try {
  const stored = JSON.parse(sessionStorage.getItem(draftStorageKey) || 'null');
  if (stored && typeof stored.prompt === 'string' && stored.prompt.length <= 2048 &&
      typeof stored.id === 'string' && /^[0-9a-f-]{36}$/i.test(stored.id) &&
      typeof stored.createdAt === 'number' && Date.now() - stored.createdAt < draftLifetime && stored.createdAt <= Date.now()) {
    anonymousDraft = stored;
    input.value = stored.prompt;
    clear.hidden = !input.value;
  } else sessionStorage.removeItem(draftStorageKey);
} catch { /* Navigation still works when browser storage is unavailable. */ }
function saveAnonymousPrompt() {
  const prompt = input.value.trim();
  if (!prompt) anonymousDraft = null;
  else if (!anonymousDraft || anonymousDraft.prompt !== prompt || Date.now() - anonymousDraft.createdAt >= draftLifetime) {
    anonymousDraft = { id: crypto.randomUUID(), prompt, createdAt: Date.now() };
  }
  try {
    if (anonymousDraft) sessionStorage.setItem(draftStorageKey, JSON.stringify(anonymousDraft));
    else sessionStorage.removeItem(draftStorageKey);
  } catch { /* The current in-memory draft can still be handed off. */ }
  for (const link of document.querySelectorAll('#account-login, #login-note a')) {
    const target = new URL(anonymousDraft ? '/en/start-trip' : '/login', guestOrigin);
    if (anonymousDraft) target.hash = new URLSearchParams({ draft: JSON.stringify(anonymousDraft) }).toString();
    else target.searchParams.set('next', '/en');
    link.href = target.href;
  }
}
input.addEventListener('input', saveAnonymousPrompt);
clear.addEventListener('click', saveAnonymousPrompt);
saveAnonymousPrompt();

// Fragments keep the prompt out of server logs and referrers.
const alpineDemoHotels = [
  { foundersCircle: true, photo: '/demo-hotels/alpenlicht.jpg', name: 'Alpenlicht Lodge', place: 'Zermatt, Switzerland', score: 98, kind: 'Mountain lodge · Quiet retreat', text: 'Wake up to Matterhorn views, walk straight onto alpine trails, and return to a small panoramic spa.', why: 'High-altitude setting, mountain views and direct trail access.' },
  { photo: '/demo-hotels/arolla.jpg', name: 'Arolla Peak House', place: 'Arolla, Switzerland', score: 96, kind: 'Boutique hotel · Nature', text: 'A peaceful base above the valley with timber rooms, a garden terrace and guided glacier walks.', why: 'Secluded alpine village with hiking on the doorstep.' },
  { foundersCircle: true, photo: '/demo-hotels/mont-blanc.jpg', name: 'Mont Blanc Hideaway', place: 'Chamonix, France', score: 94, kind: 'Boutique hotel · Adventure', text: 'A relaxed chalet-style stay near the lifts, with mountain-facing balconies and a sauna for tired legs.', why: 'Mont Blanc scenery and easy access to mountain activities.' },
  { photo: '/demo-hotels/dolomite.jpg', name: 'Dolomite Meadow Hotel', place: 'Val Gardena, Italy', score: 92, kind: 'Country hotel · Walking', text: 'Flower-filled meadows, pale limestone peaks and a family-run kitchen serving South Tyrolean dishes.', why: 'Dolomite landscapes, walking routes and regional character.' },
  { photo: '/demo-hotels/edelweiss.jpg', name: 'Edelweiss Ridge Retreat', place: 'Grindelwald, Switzerland', score: 90, kind: 'Chalet hotel · Scenic stays', text: 'A hillside hideaway with Eiger views, warm wood interiors and a sunny breakfast terrace.', why: 'Classic Swiss Alps views and access to the Jungfrau region.' },
  { photo: '/demo-hotels/bergquell.jpg', name: 'Bergquell Spa Lodge', place: 'Lech, Austria', score: 88, kind: 'Spa hotel · Relaxation', text: 'An intimate mountain spa with an indoor pool, herbal steam rooms and gentle riverside walks nearby.', why: 'Alpine location with a strong wellness focus.' },
  { photo: '/demo-hotels/valley-pine.jpg', name: 'Valley & Pine', place: 'St. Anton, Austria', score: 86, kind: 'Design hotel · Active stays', text: 'Simple contemporary rooms, a ski room and a lively shared dining table close to the village centre.', why: 'Excellent mountain access; a more social village setting.' },
  { photo: '/demo-hotels/lac-cimes.jpg', name: 'Lac des Cimes', place: 'Tignes, France', score: 84, kind: 'Lakeside hotel · Outdoor stays', text: 'A practical base by the alpine lake, with equipment storage and easy access to summer and winter sports.', why: 'High-altitude lake and year-round outdoor activities.' },
  { photo: '/demo-hotels/engadin.jpg', name: 'Engadin Birch House', place: 'Samedan, Switzerland', score: 82, kind: 'Guesthouse · Slow travel', text: 'A small guesthouse with bright rooms, local breakfast and rail connections across the Engadin valley.', why: 'Alpine valley setting with convenient public transport.' },
  { photo: '/demo-hotels/gateway.jpg', name: 'Alpine Gateway Inn', place: 'Innsbruck, Austria', score: 79, kind: 'City hotel · Mountain access', text: 'A comfortable city base for combining old-town cafés with day trips into the surrounding mountains.', why: 'Easy access to the Alps, with an urban rather than mountain setting.' },
];
const demoProfiles = [
  { about: 'A timber-and-stone hideaway for unhurried days beneath the Matterhorn. Start with breakfast on the terrace, follow a mountain trail, then unwind in the panoramic spa as the peaks catch the evening light.', amenities: ['Panoramic spa', 'Mountain-view terrace', 'Trail access', 'Breakfast included'], rooms: '24 rooms and suites · Timber interiors and mountain-facing balconies', dining: 'Seasonal Swiss dishes and a relaxed terrace breakfast', arrival: 'Check-in from 15:00 · Check-out by 11:00' },
  { about: 'Small, welcoming and surrounded by nature, this alpine house is made for walkers and quiet weekends. The hosts help plan gentle valley strolls or guided glacier adventures, with a warm lounge waiting on your return.', amenities: ['Garden terrace', 'Guided walks', 'Boot-drying room', 'Reading lounge'], rooms: '18 rooms · Cosy doubles and family rooms with valley views', dining: 'Home-style mountain suppers and locally sourced breakfast', arrival: 'Check-in from 15:00 · Check-out by 10:30' },
  { about: 'A chalet base for exploring the Mont Blanc valley. Spend the day among the peaks, browse Chamonix’s cafés, or stay in with a book by the fire. A sauna and generous balconies make the return just as inviting.', amenities: ['Sauna', 'Ski storage', 'Balconies', 'Lounge fireplace'], rooms: '32 rooms · Chalet doubles and spacious junior suites', dining: 'French alpine bistro and an early breakfast for adventurers', arrival: 'Check-in from 16:00 · Check-out by 11:00' },
  { about: 'A family-run retreat between wildflower meadows and the Dolomites. Gentle walks begin nearby, while longer excursions lead into dramatic limestone scenery. Evenings centre on regional cooking and warm hospitality.', amenities: ['Meadow garden', 'Walking maps', 'Family rooms', 'Bike storage'], rooms: '22 rooms · Light-filled country rooms with meadow balconies', dining: 'South Tyrolean cooking with Italian influences', arrival: 'Check-in from 14:00 · Check-out by 10:00' },
  { about: 'Set above the village, this chalet pairs wide Eiger views with the comforts of a small mountain home. Enjoy slow terrace breakfasts before exploring the Jungfrau region, then settle into the lounge at sunset.', amenities: ['Eiger-view terrace', 'Guest lounge', 'Trail advice', 'Breakfast included'], rooms: '20 rooms · Traditional chalet rooms and two family suites', dining: 'Swiss breakfast buffet and a small evening menu', arrival: 'Check-in from 15:00 · Check-out by 11:00' },
  { about: 'A restful mountain lodge built around wellbeing. Alternate riverside walks with time in the pool and herbal steam rooms, then enjoy a quiet dinner. Soft textures and natural materials keep the mood calm throughout.', amenities: ['Indoor pool', 'Herbal steam room', 'Spa treatments', 'Riverside walks'], rooms: '28 rooms · Quiet doubles and spa suites', dining: 'Seasonal Austrian cuisine with lighter wellness options', arrival: 'Check-in from 15:00 · Check-out by 11:00' },
  { about: 'A contemporary alpine address with a sociable spirit. Clean-lined rooms offer a comfortable place to recharge, while the shared dining table brings travellers together after active days around St. Anton.', amenities: ['Equipment storage', 'Shared dining table', 'Village location', 'Drying room'], rooms: '36 rooms · Design doubles and flexible twin rooms', dining: 'Communal dinners and generous breakfasts', arrival: 'Check-in from 15:00 · Check-out by 10:00' },
  { about: 'A lakeside base for days outdoors in every season. Walk along the water, head for the slopes, or explore higher trails. Practical spaces for equipment and relaxed rooms make active holidays feel straightforward.', amenities: ['Lake views', 'Equipment storage', 'Family rooms', 'Outdoor terrace'], rooms: '40 rooms · Lakeside doubles and family studios', dining: 'Casual lakeside restaurant and packed lunches on request', arrival: 'Check-in from 16:00 · Check-out by 10:00' },
  { about: 'A quiet guesthouse inspired by the pace of the Engadin valley. Bright rooms, local breakfasts and helpful hosts make a simple base for rail journeys, village walks and time in the mountains.', amenities: ['Local breakfast', 'Reading room', 'Rail connections', 'Bike storage'], rooms: '12 rooms · Bright guest rooms with traditional Engadin details', dining: 'Regional breakfast; village restaurants nearby', arrival: 'Check-in from 14:00 · Check-out by 10:30' },
  { about: 'Combine Innsbruck’s old-town atmosphere with easy mountain day trips. This city base suits guests who want cafés, culture and alpine outings in the same stay, with comfortable rooms for a good night’s rest.', amenities: ['Old-town location', 'Transit connections', 'Luggage storage', 'Guest lounge'], rooms: '46 rooms · City doubles, twins and compact suites', dining: 'Breakfast room and nearby cafés and restaurants', arrival: 'Check-in from 15:00 · Check-out by 11:00' },
];
function beginHotelBooking(hotel) {
  const id = hotel.photo.split('/').pop().replace('.jpg', '');
  window.location.assign(new URL(`/en/booking-request/demo-${encodeURIComponent(id)}`, guestOrigin).href);
}
function openHotelProfile(hotel, opener) {
  const profile = demoProfiles[alpineDemoHotels.indexOf(hotel)];
  const dialog = document.createElement('dialog'); dialog.className = 'hotel-profile-dialog';
  if (hotel.foundersCircle) dialog.classList.add('founders-circle-profile');
  dialog.setAttribute('aria-labelledby', 'hotel-profile-title');
  const close = document.createElement('button'); close.type = 'button'; close.className = 'profile-close'; close.textContent = '×'; close.setAttribute('aria-label', 'Close hotel profile'); close.autofocus = true;
  const photo = document.createElement('img'); photo.className = 'profile-hero'; photo.src = hotel.photo; photo.alt = `${hotel.name} — generated demo photo`;
  const body = document.createElement('div'); body.className = 'profile-body';
  function text(tag, value, className = '') { const el = document.createElement(tag); el.textContent = value; el.className = className; return el; }
  const title = text('h2', hotel.name); title.id = 'hotel-profile-title';
  const heading = document.createElement('div'); heading.className = 'profile-heading'; heading.append(title);
  if (hotel.foundersCircle) heading.append(text('span', 'Founders Circle', 'founders-circle-badge'));
  const amenities = document.createElement('ul'); amenities.className = 'profile-amenities';
  for (const amenity of profile.amenities) amenities.append(text('li', amenity));
  body.append(text('p', 'DEMO HOTEL PROFILE', 'profile-eyebrow'), heading, text('p', `${hotel.place} · ${hotel.kind}`, 'profile-location'), text('p', profile.about), text('h3', 'What you’ll find here'), amenities, text('h3', 'Rooms & stays'), text('p', profile.rooms), text('h3', 'Food & drink'), text('p', profile.dining), text('h3', 'Good to know'), text('p', profile.arrival), text('p', 'Fictional profile and generated photo for demonstration. No live availability or prices.', 'profile-disclaimer'));
  const actions = document.createElement('div'); actions.className = 'profile-booking';
  const book = text('button', 'Book now', 'book-now'); book.type = 'button';
  const note = text('p', '', 'booking-note'); note.setAttribute('role', 'status'); note.hidden = true;
  book.addEventListener('click', () => beginHotelBooking(hotel));
  actions.append(book, note); body.querySelector('.profile-location').after(actions);
  const scroller = document.createElement('div'); scroller.className = 'profile-scroll'; scroller.append(close, photo, body); dialog.append(scroller); document.body.append(dialog);
  const previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target !== dialog) return; const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); });
  dialog.addEventListener('close', () => { document.body.style.overflow = previousOverflow; dialog.remove(); if (opener.isConnected) opener.focus(); }, { once: true });
  dialog.showModal();
}

function renderDemoMatches() {
  const list = document.querySelector('#hotel-results');
  if (!list) return;
  const prompt = new URLSearchParams(location.hash.slice(1)).get('prompt') || input.value;
  const isDemo = prompt.trim().toLowerCase() === 'demo-alps';
  list.replaceChildren();
  document.querySelector('.matches-empty').hidden = isDemo;
  document.querySelector('#demo-disclosure').hidden = !isDemo;
  document.querySelector('#results-summary').textContent = isDemo ? '10 demo hotels · Sorted by relevance' : 'Your matches';
  matchCount.textContent = isDemo ? '10' : '0';
  matchStatus.textContent = isDemo ? 'Demo results — illustrative relevance scores.' : 'Matching coming soon.';
  if (!isDemo) return;
  for (const hotel of [...alpineDemoHotels].sort((a, b) => b.score - a.score)) {
    const item = document.createElement('li');
    item.className = 'hotel-result';
    if (hotel.foundersCircle) item.classList.add('founders-circle-result');
    const photo = document.createElement('img');
    photo.className = 'hotel-photo'; photo.src = hotel.photo; photo.alt = `${hotel.name} — generated demo property photo`;
    photo.width = 240; photo.height = 180; photo.loading = 'lazy';
    const content = document.createElement('div'); content.className = 'hotel-result-content';
    const identity = document.createElement('div'); identity.className = 'hotel-identity';
    if (hotel.logo) {
      const logo = document.createElement('img'); logo.className = 'hotel-logo'; logo.src = hotel.logo;
      logo.alt = `${hotel.name} logo`; logo.width = 32; logo.height = 32;
      logo.addEventListener('error', () => logo.remove()); identity.append(logo);
    }
    const meta = document.createElement('p'); meta.className = 'hotel-location'; meta.textContent = hotel.place;
    const title = document.createElement('h3');
    const profileLink = document.createElement('button'); profileLink.type = 'button'; profileLink.className = 'hotel-profile-link'; profileLink.textContent = hotel.name; profileLink.setAttribute('aria-haspopup', 'dialog');
    profileLink.addEventListener('click', () => openHotelProfile(hotel, profileLink)); title.append(profileLink);
    const kind = document.createElement('p'); kind.className = 'hotel-kind'; kind.textContent = hotel.kind;
    const description = document.createElement('p'); description.className = 'hotel-description'; description.textContent = hotel.text;
    const details = document.createElement('details');
    const summary = document.createElement('summary'); summary.textContent = `${hotel.score}% demo relevance · Why this match`;
    const reason = document.createElement('p'); reason.textContent = hotel.why;
    details.append(summary, reason);
    const actions = document.createElement('div'); actions.className = 'hotel-actions';
    const book = document.createElement('button'); book.type = 'button'; book.className = 'book-now'; book.textContent = 'Book now';
    book.setAttribute('aria-label', `Book now at ${hotel.name}`);
    const bookingNote = document.createElement('p'); bookingNote.className = 'booking-note'; bookingNote.hidden = true; bookingNote.setAttribute('role', 'status');
    book.addEventListener('click', () => beginHotelBooking(hotel));
    actions.append(details, book);
    identity.append(title);
    if (hotel.foundersCircle) {
      const badge = document.createElement('span'); badge.className = 'founders-circle-badge'; badge.textContent = 'Founders Circle'; identity.append(badge);
    }
    content.append(meta, identity, kind, description, actions, bookingNote); item.append(photo, content); list.append(item);
  }
}

function showMatchesPrompt() {
  if (!document.querySelector('#matches-page')) return;
  const prompt = new URLSearchParams(window.location.hash.slice(1)).get('prompt');
  if (prompt !== null) input.value = prompt.slice(0, 2048);
  clear.hidden = !input.value;
  saveAnonymousPrompt();
  document.querySelector('#submitted-prompt').textContent = input.value ? `Results for “${input.value}”` : 'Describe your stay above to get started.';
  renderDemoMatches();
}
window.addEventListener('hashchange', showMatchesPrompt);
showMatchesPrompt();
