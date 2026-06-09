/* ════════════════════════════════════════════════════════════
   زاد العشر — Service Worker
   Version: 20260522-2340
   Strategy: Network-First WITH TIMEOUT (HTML/CSS/JS) + Cache-First (media)

   إصلاح حرج: إضافة مهلة زمنية للشبكة. على الشبكات الضعيفة (0 KB/s متصلة
   لكن ميتة) كان fetch يعلّق للأبد فلا يرجع للكاش = شاشة سوداء. الآن لو لم
   تستجب الشبكة خلال 3 ثوانٍ نرجع فوراً للنسخة المخزّنة.
   ════════════════════════════════════════════════════════════ */

const CACHE_STATIC = 'zad-20260610-7100';
const NET_TIMEOUT  = 3000; /* مهلة الشبكة قبل الرجوع للكاش (ms) */

/* ── أصول تُخزَّن مسبقاً عند التثبيت ── */
const PRECACHE = [
  './', './index.html', './404.html',
  './prayers.html', './adhkar.html', './mushaf.html', './takbeer.html',
  './hasn.html', './worship.html', './zahra.html', './settings.html', './hijri.html',
  './css/style.css', './css/premium-ui.css', './manifest.json',
  './fonts/thmanyahserifdisplay-Bold.otf', './fonts/thmanyahserifdisplay-Regular.otf',
  './icons/icon-192.svg', './icons/icon-512.svg',
  /* core JS */
  './js/app.js', './js/adhkar-azkar.js', './js/ghars-stories.js', './js/diagnostics.js', './js/storage.js', './js/calendar.js',
  './menu.js', './command-palette.js',
  './js/design-system.js', './js/fixes-module.js',
  './js/utils/helpers.js', './js/core/state-manager.js', './js/core/router.js',
  './js/ui/design-tokens.js', './js/ui/feedback.js',
  './js/ui/daily-hub.js', './js/ui/micro-interactions.js', './js/ui/offline-ui.js', './js/nav-accordion.js',
  /* adhkar offline data */
  './js/adhkar-database.js', './js/adhkar-complete.js',
  './js/hasn-part1.js', './js/hasn-part2.js',
];

/* ── لا تُخزَّن أبداً ── */
const BYPASS = [
  'api.anthropic.com', 'generativelanguage.googleapis.com', 'api.groq.com',
  'mcp.tafsir.net',
  'fonts.googleapis.com', 'fonts.gstatic.com',
  'cdnjs.cloudflare.com', 'cdn.jsdelivr.net',
  'analytics', 'vercel.com/api', '_vercel',
  'aladhan.com', 'alquran.cloud',
  'nominatim.openstreetmap.org',
  'radiojar.com', 'zeno.fm',
];
const bypass = url => BYPASS.some(p => url.includes(p));

/* ── Install ── */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_STATIC)
      .then(c => c.addAll(PRECACHE))
      .catch(() => {})           /* لا تفشل التثبيت لو أصل واحد لم يُحمَّل */
      .then(() => self.skipWaiting())
  );
});

/* ── Activate: احذف الكاشات القديمة وتولَّ السيطرة ── */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_STATIC).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ includeUncontrolled: true }))
      .then(clients => clients.forEach(c => c.postMessage({ type: 'SW_UPDATED', ver: '20260522-2340' })))
  );
});

/* ── Helper: fetch مع مهلة زمنية (يرفض بعد NET_TIMEOUT) ── */
function fetchWithTimeout(request, timeout) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('network-timeout')), timeout);
    fetch(request, { cache: 'no-cache' }).then(
      res => { clearTimeout(timer); resolve(res); },
      err => { clearTimeout(timer); reject(err); }
    );
  });
}


/* ── Offline fallback: لو فشل كل شيء، ارجع للصفحة الرئيسية المخزّنة ── */
function offlineFallback(request) {
  if (request.mode === 'navigate' || request.destination === 'document') {
    return caches.match('./index.html').then(hit => hit || caches.match('./'));
  }
  return Promise.resolve(new Response('', { status: 503, statusText: 'Offline' }));
}

/* ── Fetch ── */

/* ── استقبال أمر التفعيل الفوري من الصفحة ── */
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  if (!url.startsWith('http')) return;
  if (e.request.method !== 'GET') return;   /* لا تتدخّل في POST */
  if (bypass(url)) return;

  /* الصور والخطوط → Cache First (نادراً ما تتغيّر) */
  const isMedia = /\.(png|jpg|jpeg|svg|gif|webp|woff2?|mp4|mp3|otf|ttf)/i.test(url);
  if (isMedia) {
    e.respondWith(
      caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type !== 'opaque') {
          const clone = res.clone();
          caches.open(CACHE_STATIC).then(c => c.put(e.request, clone)).catch(() => {});
        }
        return res;
      }).catch(() => hit))
    );
    return;
  }

  /* HTML/CSS/JS → Network-First بمهلة، ثم الكاش، ثم index كحل أخير */
  e.respondWith(
    fetchWithTimeout(e.request, NET_TIMEOUT)
      .then(res => {
        if (res && res.status === 200 && res.type !== 'opaque') {
          const clone = res.clone();
          caches.open(CACHE_STATIC).then(c => c.put(e.request, clone)).catch(() => {});
        }
        return res;
      })
      .catch(() =>
        caches.match(e.request).then(hit =>
          hit || caches.match('./index.html').then(idx =>
            idx || new Response(
              '<!doctype html><meta charset=utf-8><body style="background:#0e3b2e;color:#fff;font-family:sans-serif;text-align:center;padding-top:30vh">'
              + '<h2>تعذّر التحميل</h2><p>تحقّق من الاتصال وحاول مجدداً.</p>'
              + '<a href="./index.html" style="color:#e6c97a">إعادة المحاولة</a></body>',
              { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
            )
          )
        )
      )
  );
});
