const CACHE = 'drill-sergeant-v4';
const ASSETS = ['./', './index.html', './app.js', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Nunca cachear chamadas de API
  if (e.request.url.includes('googleapis.com') || e.request.url.includes('anthropic.com')) return;
  // Network-first pra HTML/JS (pega versão nova sempre que online), cache como fallback
  if (e.request.mode === 'navigate' || e.request.url.endsWith('.js') || e.request.url.endsWith('.html')) {
    e.respondWith(
      fetch(e.request).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return r;
      }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
    );
    return;
  }
  // Cache-first pra assets estáticos (imagens, manifest)
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
