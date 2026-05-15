/* ════════════════════════════════════════════
   زاد العشر — Service Worker (PWA Offline)
   ════════════════════════════════════════════ */
const CACHE = 'zad-v3';
const ASSETS = [
  './', './index.html', './worship.html', './takbeer.html',
  './mushaf.html', './arafah.html', './fadael.html', './odhiya.html',
  './sadaqah.html', './badges.html', './kids.html', './ai.html',
  './tasmee.html', './settings.html',
  './css/style.css', './js/app.js',
  './icons/icon-192.svg', './icons/icon-512.svg',
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=Amiri:wght@400;700&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS.filter(a => !a.startsWith('http'))))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k !== CACHE).map(k => caches.delete(k))
  )));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).catch(() =>
      caches.match('./index.html')
    ))
  );
});
