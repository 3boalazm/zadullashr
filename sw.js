/* ════════════════════════════════════════════════════════════
   زاد العشر — Service Worker v2 (Fixed)
   Fixes: cache conflict, MP4 bypass, font precache,
          offline detection, proper cache separation
   ════════════════════════════════════════════════════════ */

const CACHE_VER    = 'zad-20260517-v2';
const CACHE_STATIC = CACHE_VER + '-static';
const CACHE_PAGES  = CACHE_VER + '-pages';
const CACHE_FONTS  = 'zad-fonts-v1'; /* Separate long-lived cache for fonts */

/* ── Assets to pre-cache on install ── */
const PRECACHE_STATIC = [
  './', './index.html',
  './css/style.css', './js/app.js', './lang.js',
  './manifest.json',
  './icons/icon-192.svg', './icons/icon-512.svg',
];

/* ── Key pages to precache (offline-first) ── */
const PRECACHE_PAGES = [
  './worship.html',
  './takbeer.html',
  './adhkar.html',
  './mushaf.html',
  './prayers.html',
  './arafah.html',
  './fadael.html',
  './badges.html',
  './settings.html',
];

/* ── Font files (long-lived separate cache) ── */
const PRECACHE_FONTS = [
  './fonts/thmanyahsans-Regular.otf',
  './fonts/thmanyahsans-Bold.otf',
  './fonts/thmanyahsans-Medium.otf',
  './fonts/thmanyahserifdisplay-Regular.otf',
  './fonts/thmanyahseriftext-Regular.otf',
];

/* ── Never cache these (API calls, analytics, external) ── */
const BYPASS = [
  'api.anthropic.com', 'generativelanguage.googleapis.com',
  'fonts.googleapis.com', 'fonts.gstatic.com',
  'cdnjs.cloudflare.com', 'cdn.jsdelivr.net',
  'analytics', 'vercel.com/api', '_vercel',
  'aladhan.com', 'alquran.cloud', 'groq.com',
];

/* ── Never cache heavy media (audio/video) ── */
const BYPASS_MEDIA = /\.(mp4|mp3|webm|ogg|m4a)(\?|$)/i;

const bypass = url => BYPASS.some(p => url.includes(p));

/* ══════════════════════════════════════════════════════════
   INSTALL — Parallel precaching of static, pages, fonts
   ══════════════════════════════════════════════════════ */
self.addEventListener('install', e => {
  e.waitUntil(
    Promise.all([
      caches.open(CACHE_STATIC).then(c => c.addAll(PRECACHE_STATIC)),
      caches.open(CACHE_PAGES).then(c =>
        Promise.allSettled(PRECACHE_PAGES.map(url =>
          fetch(url, { cache: 'no-cache' })
            .then(res => { if (res.ok) c.put(url, res); })
            .catch(() => { /* page not critical — ignore */ })
        ))
      ),
      caches.open(CACHE_FONTS).then(c =>
        Promise.allSettled(PRECACHE_FONTS.map(url =>
          c.match(url).then(hit => {
            /* Fonts are immutable — only fetch if not already cached */
            if (!hit) return fetch(url).then(res => { if (res.ok) c.put(url, res); });
          })
        ))
      ),
    ]).then(() => self.skipWaiting())
  );
});

/* ══════════════════════════════════════════════════════════
   ACTIVATE — Delete OLD caches only, keep fonts cache
   ══════════════════════════════════════════════════════ */
self.addEventListener('activate', e => {
  const KEEP = new Set([CACHE_STATIC, CACHE_PAGES, CACHE_FONTS]);
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => !KEEP.has(k)).map(k => {
          console.log('[SW] Deleting old cache:', k);
          return caches.delete(k);
        })
      ))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ includeUncontrolled: true }))
      .then(clients => clients.forEach(c =>
        c.postMessage({ type: 'SW_UPDATED', ver: CACHE_VER })
      ))
  );
});

/* ══════════════════════════════════════════════════════════
   FETCH — Tiered strategy:
   - Fonts     → Cache Only (immutable, long-lived)
   - Images    → Cache First → Network fallback
   - Pages     → Network First → Cache fallback (offline)
   - CSS/JS    → Stale-While-Revalidate
   - API/Media → Bypass (no cache)
   ══════════════════════════════════════════════════════ */
self.addEventListener('fetch', e => {
  const url = e.request.url;
  if (!url.startsWith('http')) return;
  if (bypass(url)) return;

  /* ── Heavy media: bypass entirely ── */
  if (BYPASS_MEDIA.test(url)) return;

  /* ── Fonts: Cache Only (never re-download) ── */
  if (/\/fonts\//.test(url)) {
    e.respondWith(
      caches.open(CACHE_FONTS).then(c => c.match(e.request)).then(hit => {
        if (hit) return hit;
        return fetch(e.request).then(res => {
          if (res && res.ok) {
            caches.open(CACHE_FONTS).then(c => c.put(e.request, res.clone()));
          }
          return res;
        });
      })
    );
    return;
  }

  /* ── Static images / icons → Cache First ── */
  const isStaticMedia = /\.(png|jpg|jpeg|svg|gif|webp|woff2?)(\?|$)/i.test(url);
  if (isStaticMedia) {
    e.respondWith(
      caches.match(e.request).then(hit => {
        if (hit) return hit;
        return fetch(e.request).then(res => {
          if (res && res.status === 200) {
            caches.open(CACHE_STATIC).then(c => c.put(e.request, res.clone()));
          }
          return res;
        }).catch(() => caches.match('./icons/icon-192.svg'));
      })
    );
    return;
  }

  /* ── CSS / JS → Stale-While-Revalidate ── */
  const isCSSorJS = /\/(css|js)\//.test(url) || /\.(css|js)(\?|$)/.test(url);
  if (isCSSorJS) {
    e.respondWith(
      caches.open(CACHE_STATIC).then(cache =>
        cache.match(e.request).then(cachedRes => {
          /* Return cached version immediately, update in background */
          const fetchPromise = fetch(e.request).then(networkRes => {
            if (networkRes && networkRes.status === 200) {
              cache.put(e.request, networkRes.clone());
            }
            return networkRes;
          }).catch(() => cachedRes);

          return cachedRes || fetchPromise;
        })
      )
    );
    return;
  }

  /* ── HTML pages → Network First → Cache fallback (offline) ── */
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' })
      .then(res => {
        if (res && res.status === 200) {
          const isPage = /\.html(\?|$)/.test(url) || url.endsWith('/');
          const cacheName = isPage ? CACHE_PAGES : CACHE_STATIC;
          caches.open(cacheName).then(c => c.put(e.request, res.clone()));
        }
        return res;
      })
      .catch(() =>
        caches.match(e.request)
          .then(hit => hit || caches.match('./index.html'))
      )
  );
});

/* ══════════════════════════════════════════════════════════
   MESSAGE — Handle commands from main thread
   ══════════════════════════════════════════════════════ */
self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (e.data?.type === 'CACHE_URLS') {
    /* Dynamic caching of a page when user visits it */
    const urls = e.data.urls || [];
    caches.open(CACHE_PAGES).then(c =>
      Promise.allSettled(urls.map(url =>
        fetch(url).then(res => { if (res.ok) c.put(url, res); }).catch(() => {})
      ))
    );
  }
});
