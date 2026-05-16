/* ════════════════════════════════════════════════════════════
   FIREBASE INIT — زاد العشر PWA (CDN — no bundler needed)
   Project: zadullashr | App: ZadullashrWeb
   ════════════════════════════════════════════════════════════ */
import { initializeApp }
  from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAnalytics, logEvent }
  from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js';
import { getMessaging, getToken, onMessage }
  from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js';

const FB = {
  apiKey:            'AIzaSyBgs8kMenbiTaJP4d1eEWv6zmp-kGoExqM',
  authDomain:        'zadullashr.firebaseapp.com',
  projectId:         'zadullashr',
  storageBucket:     'zadullashr.firebasestorage.app',
  messagingSenderId: '1001954401018',
  appId:             '1:1001954401018:web:7271f17d574371ff018743',
  measurementId:     'G-W6PZ48LXYJ'
};

let _app, _analytics, _messaging;

try {
  _app        = initializeApp(FB);
  _analytics  = getAnalytics(_app);
  _messaging  = getMessaging(_app);
  window._fbReady     = true;
  window._fbApp       = _app;
  window._fbAnalytics = _analytics;
  window._fbMessaging = _messaging;
  console.log('✅ Firebase connected — zadullashr G-W6PZ48LXYJ');

  /* Auto log page view */
  logEvent(_analytics, 'page_view', {
    page_title:    document.title,
    page_location: location.href
  });

  /* Foreground FCM messages */
  onMessage(_messaging, p => {
    const title = p.notification?.title || 'زاد العشر';
    const body  = p.notification?.body  || '';
    if (typeof showToast === 'function') showToast(`🔔 ${body||title}`);
  });

} catch(e) {
  window._fbReady = false;
  console.warn('Firebase init:', e.message);
}

/* ── helpers exposed globally ── */
window.fbLog = (name, params={}) => {
  try { if (_analytics) logEvent(_analytics, name, params); } catch(e){}
};

window.fbGetToken = async (vapidKey) => {
  if (!_messaging) return null;
  const sw = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  return getToken(_messaging, { vapidKey, serviceWorkerRegistration: sw });
};
