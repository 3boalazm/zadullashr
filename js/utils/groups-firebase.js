/* ══════════════════════════════════════════════════════════════════════════
   groups.firebase.js — محوّل المجموعات على Realtime Database (RTDB)
   يُطبّق نفس عقد GroupsAPI الموجود في js/groups.js، فتعمل صفحات
   groups.html / group-board.html دون تغيير.
   • يستخدم window.ZadFirebase.db + هوية auth.uid (من ZadAuth).
   • نموذج RTDB:
       groups/{gid}: { name, code, createdBy, createdAt, members/{uid}:{alias,pct,streak,badge,updatedAt} }
       codes/{CODE}: gid
       userGroups/{uid}/{gid}: true
   • عبر الحدود لا يعبر سوى alias/pct/streak/badge (ثابتة الخصوصية).
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var ZKEY = 'zad_v2';
  var WK = ['fajr', 'zuhr', 'asr', 'maghrib', 'isha', 'rawatib', 'duha', 'qiyam', 'morning_dhikr', 'evening_dhikr', 'takbeer_100', 'tawbah'];
  function readLocal() { try { return JSON.parse(localStorage.getItem(ZKEY) || '{}') || {}; } catch (e) { return {}; } }
  function fbDB() { return window.ZadFirebase && window.ZadFirebase.db ? window.ZadFirebase.db : null; }
  function uid() { return window.ZadAuth && window.ZadAuth.uid ? window.ZadAuth.uid() : null; }
  function myCompletionPct() { var w = (readLocal().worship) || {}; return Math.round(WK.filter(function (k) { return w[k]; }).length / WK.length * 100); }
  function myStreak() { return readLocal().streak || 0; }
  function myBadge() { var s = myStreak(); return s >= 9 ? '🏆' : s >= 5 ? '🥇' : s >= 3 ? '🥈' : s >= 1 ? '🔥' : '🌱'; }
  function rankMembers(m) { return m.slice().sort(function (a, b) { return b.pct !== a.pct ? b.pct - a.pct : (b.streak || 0) - (a.streak || 0); }); }
  function code6() { var c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', o = ''; for (var i = 0; i < 6; i++) o += c[Math.random() * c.length | 0]; return o; }
  function alias() { var s = readLocal(); return (s.groups && s.groups.me && s.groups.me.alias) || 'صائمُ العشر'; }
  function myPayload() { return { alias: alias(), pct: myCompletionPct(), streak: myStreak(), badge: myBadge(), updatedAt: Date.now() }; }

  function membersArr(gid, membersObj) {
    var out = [], u = uid();
    Object.keys(membersObj || {}).forEach(function (k) {
      var m = membersObj[k]; out.push({ id: k, alias: m.alias, pct: m.pct, streak: m.streak, badge: m.badge, isMe: k === u });
    });
    return out;
  }

  var FirebaseGroupsAdapter = {
    isLocal: false, rankMembers: rankMembers, myCompletionPct: myCompletionPct,
    deepLink: function (gid) { return 'zaad://group/join/' + gid; },
    getMe: function () { return { id: uid(), alias: alias() }; },

    setAlias: function (a) {
      var s = readLocal(); s.groups = s.groups || {}; s.groups.me = s.groups.me || {};
      s.groups.me.alias = (a || '').trim().slice(0, 24);
      try { localStorage.setItem(ZKEY, JSON.stringify(s)); } catch (e) {}
      return Promise.resolve();
    },

    createGroup: function (name) {
      var db = fbDB(), u = uid(); if (!db || !u) return Promise.reject(new Error('سجّل الدخول أولاً'));
      var ref = db.ref('groups').push();
      var gid = ref.key, code = code6();
      var data = { name: (name || 'مجموعتي').trim().slice(0, 40), code: code, createdBy: u, createdAt: Date.now() };
      data['members/' + u] = myPayload();
      var updates = {};
      updates['groups/' + gid] = data;
      updates['codes/' + code] = gid;
      updates['userGroups/' + u + '/' + gid] = true;
      return db.ref().update(updates).then(function () { return FirebaseGroupsAdapter.getGroup(gid); });
    },

    joinGroup: function (code) {
      var db = fbDB(), u = uid(); if (!db || !u) return Promise.reject(new Error('سجّل الدخول أولاً'));
      code = (code || '').trim().toUpperCase();
      return db.ref('codes/' + code).once('value').then(function (snap) {
        var gid = snap.val(); if (!gid) throw new Error('رمز غير صالح');
        var updates = {};
        updates['groups/' + gid + '/members/' + u] = myPayload();
        updates['userGroups/' + u + '/' + gid] = true;
        return db.ref().update(updates).then(function () { return FirebaseGroupsAdapter.getGroup(gid); });
      });
    },

    getGroup: function (gid) {
      var db = fbDB(); if (!db) return Promise.reject(new Error('Firebase غير مهيّأ'));
      return db.ref('groups/' + gid).once('value').then(function (snap) {
        var g = snap.val(); if (!g) return null;
        return { id: gid, name: g.name, code: g.code, createdAt: g.createdAt, members: membersArr(gid, g.members) };
      });
    },

    listGroups: function () {
      var db = fbDB(), u = uid(); if (!db || !u) return Promise.resolve([]);
      return db.ref('userGroups/' + u).once('value').then(function (snap) {
        var ids = Object.keys(snap.val() || {});
        return Promise.all(ids.map(function (gid) { return FirebaseGroupsAdapter.getGroup(gid); })).then(function (gs) {
          return gs.filter(Boolean);
        });
      });
    },

    leaveGroup: function (gid) {
      var db = fbDB(), u = uid(); if (!db || !u) return Promise.resolve();
      var updates = {};
      updates['groups/' + gid + '/members/' + u] = null;
      updates['userGroups/' + u + '/' + gid] = null;
      return db.ref().update(updates);
    },

    syncMyStats: function (gid) {
      var db = fbDB(), u = uid(); if (!db || !u) return Promise.resolve();
      return db.ref('groups/' + gid + '/members/' + u).update(myPayload());
    },

    /* اشتراك حيّ للوحة الصدارة (Realtime) — اختياري */
    subscribe: function (gid, cb) {
      var db = fbDB(); if (!db) return function () {};
      var ref = db.ref('groups/' + gid + '/members');
      var handler = ref.on('value', function (snap) { cb(membersArr(gid, snap.val())); });
      return function () { ref.off('value', handler); };
    }
  };

  window.FirebaseGroupsAdapter = FirebaseGroupsAdapter;

  /* تبديل المحوّل وقت التشغيل (يُستدعى بعد نجاح تسجيل الدخول) */
  window.useFirebaseGroups = function () {
    if (fbDB() && uid()) { window.Groups = FirebaseGroupsAdapter; return true; }
    return false;
  };
})();
