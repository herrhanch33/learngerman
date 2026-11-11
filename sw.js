// Built by dev/build_site.js. Page: network first (updates show at once), cached copy when offline.
// Recordings and fonts: cache first (a recording never changes: its name is a hash of its text).
const CACHE = 'deutsch-874b272f';
const AUDIO = 'deutsch-audio-2';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== AUDIO).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
function keep(name, req, res) {
  if (res && res.status === 200) { const copy = res.clone(); caches.open(name).then(c => c.put(req, copy)); }
  return res;
}
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin && url.pathname.includes('/audio/')) {
    if (req.headers.has('range')) return;            // let the browser handle partial requests itself
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => keep(AUDIO, req, r))));
    return;
  }
  if (url.origin === location.origin) {
    e.respondWith(fetch(req).then(r => keep(CACHE, req, r))
      .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
    return;
  }
  if (/^fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => keep(CACHE, req, r))));
  }
});
