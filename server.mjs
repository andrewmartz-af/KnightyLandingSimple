import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('./', import.meta.url));
const port = Number(process.env.PORT || 4173);
const allowed = new Map([['/', 'index.html'], ['/index.html', 'index.html'], ['/styles.css', 'styles.css'], ['/app.js', 'app.js'], ['/brand.png', 'brand.png']]);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg' };
allowed.set('/matches', 'matches.html');
allowed.set('/matches.html', 'matches.html');
allowed.set('/login', 'login.html');
allowed.set('/login.html', 'login.html');
allowed.set('/login.js', 'login.js');
allowed.set('/signup', 'signup.html');
allowed.set('/signup.html', 'signup.html');
allowed.set('/signup.js', 'signup.js');
allowed.set('/hotels', 'hotels.html');
allowed.set('/hotels.html', 'hotels.html');
allowed.set('/about', 'about.html');
allowed.set('/about.html', 'about.html');
for (const id of ['alpenlicht', 'arolla', 'mont-blanc', 'dolomite', 'edelweiss', 'bergquell', 'valley-pine', 'lac-cimes', 'engadin', 'gateway']) allowed.set(`/demo-hotels/${id}.jpg`, `demo-hotels/${id}.jpg`);
http.createServer(async (req, res) => {
  const file = allowed.get(new URL(req.url, 'http://localhost').pathname);
  if (!file) { res.writeHead(404); res.end('Not found'); return; }
  try {
    const content = await readFile(path.join(root, file));
    res.writeHead(200, { 'Content-Type': types[path.extname(file)], 'Cache-Control': 'no-store' });
    res.end(content);
  } catch { res.writeHead(500); res.end('Unable to load page'); }
}).listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}`));
