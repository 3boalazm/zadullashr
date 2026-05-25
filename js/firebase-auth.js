/* ══════════════════════════════════════════════════════════════════════════
   firebase-auth.js — محوّل المصادقة (FirebaseAuthAdapter) للويب
   يكشف window.ZadAuth بواجهةٍ موحّدة:
     onChange(cb) · uid() · user() · signInWithGoogle() · signInEmail() ·
     signUpEmail() · signOut() · syncLocalToCloud()
   • يستخدم window.ZadFirebase.auth (compat SDK).
   • لا يُنشئ حسابات نيابةً عن أحد — المستخدم نفسه يُدخل بياناته في المتصفح.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var ZKEY = 'zad_v2';
  function fb() { return window.ZadFirebase || null; }
  function readLocal() { try { return JSON.parse(localStorage.getItem(ZKEY) || '{}') || {}; } catch (e) { return {}; } }
  function writeLocal(s) { try { localStorage.setItem(ZKEY, JSON.stringify(s)); } catch (e) {} }

  var ZadAuth = {
    ready: function () { return !!(fb() && fb().auth); },

    onChange: function (cb) {
      if (!this.ready()) return function () {};
      return fb().auth.onAuthStateChanged(function (user) { cb(user || null); });
    },

    uid: function () { return this.ready() && fb().auth.currentUser ? fb().auth.currentUser.uid : null; },
    user: function () { return this.ready() ? fb().auth.currentUser : null; },

    signInWithGoogle: function () {
      if (!this.ready()) return Promise.reject(new Error('Firebase غير مهيّأ'));
      var provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      return fb().auth.signInWithPopup(provider).then(function (res) { return res.user; });
    },

    signInEmail: function (email, password) {
      if (!this.ready()) return Promise.reject(new Error('Firebase غير مهيّأ'));
      return fb().auth.signInWithEmailAndPassword(email, password).then(function (res) { return res.user; });
    },

    /* المستخدم نفسه يُنشئ حسابه ويُدخل كلمته — ثم يُرسَل بريد التحقق */
    signUpEmail: function (email, password) {
      if (!this.ready()) return Promise.reject(new Error('Firebase غير مهيّأ'));
      return fb().auth.createUserWithEmailAndPassword(email, password).then(function (res) {
        try { if (res.user && res.user.sendEmailVerification) res.user.sendEmailVerification(); } catch (e) {}
        return res.user;
      });
    },

    signOut: function () { return this.ready() ? fb().auth.signOut() : Promise.resolve(); },

    /* الترقية الصامتة: نسخ بيانات zad_v2 المحلية إلى السحابة تحت users/{uid} عند أول ربط.
       لا تُرفع الحقول الحسّاسة (الدعاء الشخصي / الملاحظات) — تبقى محلية فقط. */
    syncLocalToCloud: function () {
      var f = fb();
      if (!this.ready() || !f.db || !this.uid()) return Promise.reject(new Error('غير مسجّل دخول'));
      var s = readLocal();
      var safe = {
        userMode: 'registered',
        khatmaGoal: s.khatmaGoal || null,
        streak: s.streak || 0,
        takbeer: s.takbeer ? { total: s.takbeer.total || 0, daily: s.takbeer.daily || 0 } : null,
        mushaf: s.mushaf ? { totalPages: s.mushaf.totalPages || 0, dailyPages: s.mushaf.dailyPages || null } : null,
        worship: s.worship || null,
        accent: s.accent || null,
        lastSync: Date.now()
        /* ملاحظة: personalDua و daily_tasks.notes لا تُرفع إطلاقاً (خصوصية) */
      };
      return f.db.ref('users/' + this.uid()).update(safe).then(function () {
        var ls = readLocal(); ls.userMode = 'registered'; ls.cloudUserId = ZadAuth.uid();
        ls.nudge = ls.nudge || {}; ls.nudge.linked = true; writeLocal(ls);
        return true;
      });
    },

    /* جلب البيانات من السحابة (عند تغيير الهاتف) ودمجها محلياً */
    pullFromCloud: function () {
      var f = fb();
      if (!this.ready() || !f.db || !this.uid()) return Promise.reject(new Error('غير مسجّل دخول'));
      return f.db.ref('users/' + this.uid()).once('value').then(function (snap) {
        var cloud = snap.val(); if (!cloud) return null;
        var ls = readLocal();
        if (cloud.streak != null) ls.streak = Math.max(ls.streak || 0, cloud.streak);
        if (cloud.takbeer && cloud.takbeer.total != null) { ls.takbeer = ls.takbeer || {}; ls.takbeer.total = Math.max((ls.takbeer && ls.takbeer.total) || 0, cloud.takbeer.total); }
        if (cloud.mushaf && cloud.mushaf.totalPages != null) { ls.mushaf = ls.mushaf || {}; ls.mushaf.totalPages = Math.max((ls.mushaf && ls.mushaf.totalPages) || 0, cloud.mushaf.totalPages); }
        if (cloud.khatmaGoal) ls.khatmaGoal = cloud.khatmaGoal;
        ls.userMode = 'registered'; ls.cloudUserId = ZadAuth.uid();
        writeLocal(ls); return cloud;
      });
    }
  };

  window.ZadAuth = ZadAuth;
})();
