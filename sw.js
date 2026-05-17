/* ════════════════════════════════════════════════════════════
   زاد العشر — Service Worker
   Auto-generated version: 20260517-1944
   Strategy: Network First (HTML/CSS/JS) + Cache First (images/fonts)
   ════════════════════════════════════════════════════════ */

const CACHE_VER  = 'zad-20260517-1944';
const CACHE_STATIC = CACHE_VER + '-static';

/* ── Assets to pre-cache on install ── */
const PRECACHE = [
  './', './index.html',
  './css/style.css', './js/app.js', './manifest.json',
  './icons/icon-192.svg', './icons/icon-512.svg',
];

/* ── Never cache these ── */
const BYPASS = [
  'api.anthropic.com', 'generativelanguage.googleapis.com',
  'fonts.googleapis.com', 'fonts.gstatic.com',
  'cdnjs.cloudflare.com', 'cdn.jsdelivr.net',
  'analytics', 'vercel.com/api', '_vercel',
  'aladhan.com', 'alquran.cloud',
];

const bypass = url => BYPASS.some(p => url.includes(p));

/* ── Install: cache essentials ── */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_STATIC).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

/* ── Activate: delete ALL old caches immediately ── */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_STATIC).map(k => {
          console.log('[SW] Deleting old cache:', k);
          return caches.delete(k);
        })
      ))
      .then(() => self.clients.claim())
      /* Tell all open tabs to reload for fresh content */
      .then(() => self.clients.matchAll({includeUncontrolled:true}))
      .then(clients => clients.forEach(c => c.postMessage({type:'SW_UPDATED', ver:'20260517-1944'})))
  );
});

/* ── Fetch: Network First for HTML/CSS/JS, Cache First for images ── */
self.addEventListener('fetch', e => {
  const url = e.request.url;

  if (!url.startsWith('http')) return;
  if (bypass(url)) return;

  /* Images, fonts → Cache First (they rarely change) */
  const isMedia = /\.(png|jpg|jpeg|svg|gif|webp|woff2?|mp4|mp3)/.test(url);

  if (isMedia) {
    e.respondWith(
      caches.match(e.request).then(hit => {
        if (hit) return hit;
        return fetch(e.request).then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_STATIC).then(c => c.put(e.request, clone));
          }
          return res;
        });
      })
    );
    return;
  }

  /* HTML, CSS, JS → Network First → fallback to cache */
  e.respondWith(
    fetch(e.request, {cache: 'no-cache'})
      .then(res => {
        /* Update cache with fresh response */
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_STATIC).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => {
        /* Offline fallback */
        return caches.match(e.request)
          .then(hit => hit || caches.match('./index.html'));
      })
  );
});
