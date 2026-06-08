/* ════════════════════════════════════════════════════════════
   Firebase Cloud Messaging (FCM) — تسجيل توكن الدفع
   ────────────────────────────────────────────────────────────
   الاستخدام:
     1) فعّل Cloud Messaging في مشروع Firebase.
     2) من Project Settings → Cloud Messaging → Web Push certificates
        انسخ "Key pair" وضعه في VAPID_KEY أدناه.
     3) حمّل هذا الملف بعد firebase-init.js في الصفحات التي تريد فيها التسجيل.
     4) نادِ window.ZadPush.enable() عند موافقة المستخدم (زر تفعيل الإشعارات).
   ملاحظة: التوكن يُخزَّن في RTDB تحت pushTokens/{uid|anon} لإرساله لاحقاً.
   ════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ⚠️ ضع مفتاح VAPID الخاص بمشروعك هنا (Web Push certificate key pair) */
  var VAPID_KEY = 'REPLACE_WITH_YOUR_VAPID_PUBLIC_KEY';

  function ready() {
    return !!(window.ZadFirebase && window.ZadFirebase.app && window.firebase && firebase.messaging);
  }

  function saveToken(token) {
    try {
      if (!window.ZadFirebase || !window.ZadFirebase.db) return;
      var uid = (window.ZadAuth && window.ZadAuth.uid && window.ZadAuth.uid()) || null;
      var key = uid || ('anon-' + token.slice(-12));
      window.ZadFirebase.db.ref('pushTokens/' + key).set({
        token: token,
        uid: uid || null,
        ua: navigator.userAgent.slice(0, 120),
        ts: Date.now()
      });
    } catch (e) { console.warn('[ZadPush] saveToken:', e); }
  }

  var ZadPush = {
    /* تفعيل الإشعارات: يطلب الإذن ثم يسجّل التوكن */
    enable: function () {
      return new Promise(function (resolve, reject) {
        if (!('Notification' in window)) { reject('غير مدعوم'); return; }
        if (!ready()) {
          console.warn('[ZadPush] firebase messaging غير محمّل — أضِف firebase-messaging-compat.js');
          reject('FCM غير محمّل'); return;
        }
        Notification.requestPermission().then(function (perm) {
          if (perm !== 'granted') { reject('الإذن مرفوض'); return; }
          navigator.serviceWorker.ready.then(function (reg) {
            var messaging = firebase.messaging();
            messaging.getToken({ vapidKey: VAPID_KEY, serviceWorkerRegistration: reg })
              .then(function (token) {
                if (!token) { reject('لا يوجد توكن'); return; }
                console.log('[ZadPush] FCM token:', token);
                saveToken(token);
                /* استقبال الرسائل أثناء فتح التطبيق (foreground) */
                messaging.onMessage(function (payload) {
                  var n = (payload && payload.notification) || {};
                  if (typeof window.addNotif === 'function')
                    window.addNotif('🔔', n.title || 'زاد العشر', n.body || '', 'info');
                  if (typeof window.showToast === 'function')
                    window.showToast('🔔 ' + (n.title || 'إشعار جديد'));
                });
                resolve(token);
              })
              .catch(function (err) { console.warn('[ZadPush] getToken:', err); reject(err); });
          });
        });
      });
    },
    isEnabled: function () {
      return ('Notification' in window) && Notification.permission === 'granted';
    }
  };

  window.ZadPush = ZadPush;
})();
