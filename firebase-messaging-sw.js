/* ════════════════════════════════════════════════════════════
   firebase-messaging-sw.js — عامل خدمة FCM للإشعارات في الخلفية
   يجب أن يكون في جذر الموقع (نفس مستوى index.html).
   FCM يبحث عنه تلقائياً عند getToken().
   ════════════════════════════════════════════════════════════ */
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBgs8kMenbiTaJP4d1eEWv6zmp-kGoExqM",
  authDomain: "zadullashr.firebaseapp.com",
  databaseURL: "https://zadullashr-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "zadullashr",
  storageBucket: "zadullashr.appspot.com",
  messagingSenderId: "1001954401018",
  appId: "1:1001954401018:web:7271f17d574371ff018743"
});

var messaging = firebase.messaging();

/* إشعارات الخلفية (التطبيق مغلق) */
messaging.onBackgroundMessage(function (payload) {
  var n = payload.notification || {};
  var title = n.title || 'زاد العشر';
  self.registration.showNotification(title, {
    body: n.body || 'لديك تحديث جديد',
    icon: './icons/icon-192.svg',
    badge: './icons/icon-192.svg',
    dir: 'rtl', lang: 'ar',
    tag: (payload.data && payload.data.tag) || 'zad-fcm',
    vibrate: [60, 80, 60],
    data: { url: (payload.data && payload.data.url) || './videos.html' }
  });
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || './index.html';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        if ('focus' in list[i]) { list[i].navigate(url); return list[i].focus(); }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
