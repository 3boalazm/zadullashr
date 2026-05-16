/* ════════════════════════════════════════════════════════════
   FIREBASE MESSAGING SERVICE WORKER — زاد العشر
   Must live at root / for FCM to work
   ════════════════════════════════════════════════════════════ */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            'AIzaSyBgs8kMenbiTaJP4d1eEWv6zmp-kGoExqM',
  authDomain:        'zadullashr.firebaseapp.com',
  projectId:         'zadullashr',
  storageBucket:     'zadullashr.firebasestorage.app',
  messagingSenderId: '1001954401018',
  appId:             '1:1001954401018:web:7271f17d574371ff018743',
  measurementId:     'G-W6PZ48LXYJ'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  self.registration.showNotification(
    payload.notification?.title || '🕋 زاد العشر',
    {
      body:  payload.notification?.body || '',
      icon:  '/icons/icon-192.svg',
      badge: '/icons/icon-192.svg',
      dir:   'rtl', lang: 'ar', tag: 'zad-push',
      data:  payload.data || {}
    }
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type:'window', includeUncontrolled:true }).then(list => {
      const w = list.find(c => c.url.includes('zadullashr'));
      return w ? w.focus() : clients.openWindow('/');
    })
  );
});
