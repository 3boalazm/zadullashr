/* ════════════════════════════════════════════
   زاد العشر — Service Worker v4 (PWA Offline)
   ════════════════════════════════════════════ */
const CACHE = 'zad-v4';
const ASSETS = [
  './', './index.html', './worship.html', './takbeer.html',
  './mushaf.html', './arafah.html', './fadael.html', './odhiya.html',
  './sadaqah.html', './badges.html', './kids.html', './ai.html',
  './tasmee.html', './settings.html', './adhkar.html', './hasad.html',
  './report.html',
  './css/style.css', './js/app.js', './animations.js',
  './icons/icon-192.svg', './icons/icon-512.svg'
];

/* URLs to NEVER cache — API calls, external services */
const BYPASS = [
  'api.anthropic.com',
  'generativelanguage.googleapis.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdnjs.cloudflare.com',
  'cdn.jsdelivr.net',
  '/api/',          /* Vercel Edge Functions */
];

function shouldBypass(url) {
  return BYPASS.some(p => url.includes(p));
}

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      c.addAll(ASSETS.filter(a => a.startsWith('.')))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  /* Always bypass API calls — never cache, never intercept */
  if (shouldBypass(url)) return;

  /* For navigation requests — serve cached or fallback */
  if (e.request.mode === 'navigate') {
    e.respondWith(
      caches.match(e.request).then(hit => hit ||
        fetch(e.request).catch(() => caches.match('./index.html'))
      )
    );
    return;
  }

  /* For assets — cache first, then network */
  e.respondWith(
    caches.match(e.request).then(hit => {
      if (hit) return hit;
      return fetch(e.request).then(res => {
        /* Only cache same-origin successful responses */
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});