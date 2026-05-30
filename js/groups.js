/* ══════════════════════════════════════════════════════════════════════════
   زاد العشر — طبقة بيانات «التنافس العائلي» (الركيزة الرابعة)
   ──────────────────────────────────────────────────────────────────────────
   • محلية أولاً (Local-first) وجاهزة للخادم (Backend-ready).
   • الخصوصية: لا يُشارك نوع العبادة أو تفاصيلها إطلاقاً — فقط:
       { id (UUID مجهول), alias, completionPercentage, streakDays, badgeEarned }
   • الترتيب يعتمد على نسبة الإنجاز المئوية (%) لا الأرقام المطلقة
     → تنافسٌ عادلٌ بين الطفل والبالغ.

   كيف تربط خادماً حقيقياً لاحقاً:
   ─────────────────────────────
   استبدِل LocalAdapter بـ FirebaseAdapter أو SupabaseAdapter يطبّق نفس الواجهة
   (GroupsAPI) أدناه — لا يتغيّر أي كود في الصفحات. كل دالة تُعيد Promise.

   interface GroupsAPI {
     getMe(): {id, alias}
     setAlias(alias): Promise<void>
     listGroups(): Promise<Group[]>
     getGroup(groupId): Promise<Group|null>
     createGroup(name): Promise<Group>
     joinGroup(code): Promise<Group>
     leaveGroup(groupId): Promise<void>
     syncMyStats(groupId): Promise<void>   // يرفع %/streak/badge فقط (payload < 5KB)
   }
   صيغة رابط الدعوة (Deep Link): zaad://group/join/[groupId]
   ══════════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var ZKEY = 'zad_v2';

  /* ── أدوات ───────────────────────────────────────────────────────── */
  function uuid() {
    if (global.crypto && global.crypto.randomUUID) return global.crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  function joinCode() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '';
    for (var i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
  }

  /* ── تخزين الحالة الكاملة ────────────────────────────────────────── */
  function readState() { try { return JSON.parse(localStorage.getItem(ZKEY) || '{}') || {}; } catch (e) { return {}; } }
  function writeState(s) { try { localStorage.setItem(ZKEY, JSON.stringify(s)); } catch (e) {} if (global.STATE) global.STATE.groups = s.groups; }

  function readGroups() {
    var s = readState();
    if (!s.groups) s.groups = { me: null, list: [] };
    if (!s.groups.me) {
      s.groups.me = { id: uuid(), alias: '' };
      writeState(s);
    }
    return s.groups;
  }
  function saveGroups(g) { var s = readState(); s.groups = g; writeState(s); }

  /* ── حساب نسبة إنجاز العبادات اليوم (الخصوصية: الرقم فقط يعبر) ──────── */
  var WORSHIP_KEYS = ['fajr','zuhr','asr','maghrib','isha','rawatib','duha','qiyam',
                      'morning_dhikr','evening_dhikr','takbeer_100','tawbah'];
  function myCompletionPct() {
    var s = readState(), w = s.worship || {};
    var done = WORSHIP_KEYS.filter(function (k) { return !!w[k]; }).length;
    return Math.round((done / WORSHIP_KEYS.length) * 100);
  }
  function myStreak() { var s = readState(); return s.streak || 0; }
  function myBadge() {
    var st = myStreak();
    if (st >= 9) return '🏆'; if (st >= 5) return '🥇'; if (st >= 3) return '🥈'; if (st >= 1) return '🔥';
    return '🌱';
  }

  /* ── أعضاء توضيحيون (وضع محلي) — يُستبدلون بأعضاء الخادم الحقيقيين ──── */
  function demoMembers() {
    return [
      { id: uuid(), alias: 'أبو العائلة', pct: 92, streak: 8, badge: '🥇', demo: true },
      { id: uuid(), alias: 'أم الدار',    pct: 100, streak: 9, badge: '🏆', demo: true },
      { id: uuid(), alias: 'الكبيرة',     pct: 75, streak: 5, badge: '🥇', demo: true },
      { id: uuid(), alias: 'الصغير',      pct: 58, streak: 3, badge: '🥈', demo: true }
    ];
  }

  function meAsMember() {
    var me = readGroups().me;
    return { id: me.id, alias: me.alias || 'أنا', pct: myCompletionPct(), streak: myStreak(), badge: myBadge(), isMe: true };
  }

  /* ════════════════════════════════════════════════════════════════
     LocalAdapter — يطبّق GroupsAPI محلياً (وضع تجريبي بلا خادم)
     ════════════════════════════════════════════════════════════════ */
  var LocalAdapter = {
    isLocal: true,

    getMe: function () { return readGroups().me; },

    setAlias: function (alias) {
      var g = readGroups(); g.me.alias = (alias || '').trim().slice(0, 24); saveGroups(g);
      return Promise.resolve();
    },

    listGroups: function () {
      var g = readGroups();
      // حدّث صف المستخدم في كل مجموعة بأحدث نسبة
      g.list.forEach(function (grp) { LocalAdapter._refreshMe(grp); });
      saveGroups(g);
      return Promise.resolve(g.list.slice());
    },

    getGroup: function (groupId) {
      var g = readGroups();
      var grp = g.list.filter(function (x) { return x.id === groupId; })[0] || null;
      if (grp) { LocalAdapter._refreshMe(grp); saveGroups(g); }
      return Promise.resolve(grp);
    },

    createGroup: function (name) {
      var g = readGroups();
      var grp = {
        id: uuid(), name: (name || 'مجموعتي').trim().slice(0, 32),
        code: joinCode(), createdAt: Date.now(), local: true,
        members: [meAsMember()].concat(demoMembers())
      };
      g.list.push(grp); saveGroups(g);
      return Promise.resolve(grp);
    },

    joinGroup: function (code) {
      code = (code || '').trim().toUpperCase();
      if (code.length < 4) return Promise.reject(new Error('رمز غير صالح'));
      var g = readGroups();
      var existing = g.list.filter(function (x) { return x.code === code; })[0];
      if (existing) { LocalAdapter._refreshMe(existing); saveGroups(g); return Promise.resolve(existing); }
      /* وضع محلي: نُنشئ نسخة من المجموعة بالرمز المُدخل + أعضاء توضيحيين */
      var grp = {
        id: uuid(), name: 'مجموعة ' + code, code: code, createdAt: Date.now(), local: true, joined: true,
        members: [meAsMember()].concat(demoMembers())
      };
      g.list.push(grp); saveGroups(g);
      return Promise.resolve(grp);
    },

    leaveGroup: function (groupId) {
      var g = readGroups();
      g.list = g.list.filter(function (x) { return x.id !== groupId; });
      saveGroups(g);
      return Promise.resolve();
    },

    /* يرفع %/streak/badge فقط (لا تفاصيل عبادة) — payload صغير < 5KB */
    syncMyStats: function (groupId) {
      var g = readGroups();
      var grp = g.list.filter(function (x) { return x.id === groupId; })[0];
      if (grp) { LocalAdapter._refreshMe(grp); saveGroups(g); }
      return Promise.resolve();
    },

    _refreshMe: function (grp) {
      var m = meAsMember();
      var i = -1;
      for (var k = 0; k < grp.members.length; k++) if (grp.members[k].isMe) { i = k; break; }
      if (i >= 0) grp.members[i] = m; else grp.members.unshift(m);
    },

    deepLink: function (groupId) { return 'zaad://group/join/' + groupId; }
  };

  /* الترتيب: بنسبة الإنجاز % تنازلياً، ثم الأطول التزاماً */
  function rankMembers(members) {
    return members.slice().sort(function (a, b) {
      if (b.pct !== a.pct) return b.pct - a.pct;
      return (b.streak || 0) - (a.streak || 0);
    });
  }

  /* ── الواجهة العامة ──────────────────────────────────────────────── */
  var Groups = LocalAdapter;
  Groups.rankMembers = rankMembers;
  Groups.myCompletionPct = myCompletionPct;
  Groups.demoMembers = demoMembers;
  global.Groups = Groups;

  /* تفضيل المحوّل السحابي (RTDB) إذا فُعّل بعد تسجيل الدخول */
  try {
    if (global.FirebaseGroupsAdapter && global.sessionStorage && sessionStorage.getItem('zad_cloud_groups') === '1') {
      global.FirebaseGroupsAdapter.rankMembers = rankMembers;
      global.FirebaseGroupsAdapter.myCompletionPct = myCompletionPct;
      global.Groups = global.FirebaseGroupsAdapter;
    }
  } catch (e) {}

})(typeof window !== 'undefined' ? window : this);
