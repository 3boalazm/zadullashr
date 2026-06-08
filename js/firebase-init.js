/* ══════════════════════════════════════════════════════════════════════════
   firebase-init.js — تهيئة Firebase لمشروع «زاد»
   • يُحمَّل بعد سكربتات Firebase compat SDK (app / auth / database).
   • يُهيّئ التطبيق ويكشف window.ZadFirebase = { app, auth, db }.
   • مفتاح الويب ليس سرّاً (مُعرّف مشروع)؛ الحماية عبر قواعد RTDB + تقييد المفتاح بالنطاقات.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (typeof firebase === 'undefined' || !firebase.initializeApp) {
    console.warn('[Zad] Firebase SDK لم يُحمَّل بعد — تأكّد من سكربتات compat قبل هذا الملف.');
    return;
  }
  var firebaseConfig = {
    apiKey: 'AIzaSyBgs8kMenbiTaJP4d1eEWv6zmp-kGoExqM',
    authDomain: 'zad.firebaseapp.com',
    databaseURL: 'https://zad-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: 'zad',
    storageBucket: 'zad.firebasestorage.app',
    messagingSenderId: '1001954401018',
    appId: '1:1001954401018:web:7271f17d574371ff018743',
    measurementId: 'G-W6PZ48LXYJ'
  };
  try {
    if (!firebase.apps || !firebase.apps.length) firebase.initializeApp(firebaseConfig);
    window.ZadFirebase = {
      app: firebase.app(),
      auth: firebase.auth ? firebase.auth() : null,
      db: firebase.database ? firebase.database() : null,
      config: firebaseConfig
    };
    console.log('[Zad] Firebase مهيّأ ✓ — المشروع:', firebaseConfig.projectId);
  } catch (e) {
    console.error('[Zad] فشل تهيئة Firebase:', e);
  }
})();
