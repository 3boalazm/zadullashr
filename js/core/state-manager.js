/* ═══════════════════════════════════════════════════════════════════════════
   زاد — core/state-manager.js
   ─────────────────────────────────────────────────────────────────────────
   State Management مركزي:
   - Versioned state (migration آمن عند التحديث)
   - Pub/Sub لتحديث الـ UI
   - يعمل بجانب app.js الحالي (مش بديل — مكمّل)
   ═══════════════════════════════════════════════════════════════════════════ */

const ZadState = (() => {
  'use strict';

  const STATE_VERSION = 3;
  const STATE_KEY     = 'zad_v2';       /* نفس مفتاح app.js */
  const VERSION_KEY   = 'zad_state_v';

  /* ── Default State ──────────────────────────────────────────────────── */
  const DEFAULT = () => ({
    _v: STATE_VERSION,
    theme: 'light',
    day: todayStr(),
    streak: 0,
    lastActive: todayStr(),
    worship: {},
    fasting: {},
    charityDone: [],
    badges: [],
    quranFontSize: 24,
    mushaf: { juz: 0, plan: 'daily-juz' },
    takbeer: { count: 0, total: 0, sessions: 0, phrase: 'اللَّهُ أَكْبَرُ', target: 33 },
    adhkar: {},
    adhkarProgress: {},
    prayerMethod: 4,
    lastCity: '',
    lastLat: null,
    lastLng: null,
    arafah: { milestones: {}, dhikrCount: 0 },
    quranProgress: { page: 1, juz: 1, surah: 1, lastRead: null },
    goals: [],
    notifications: [],
    tasbih7: {},
  });

  function todayStr() { return new Date().toISOString().split('T')[0]; }

  /* ── Migration ───────────────────────────────────────────────────────── */
  const MIGRATIONS = {
    1: (s) => ({ ...DEFAULT(), ...s, _v: 2 }),
    2: (s) => ({
      ...s, _v: 3,
      quranProgress: s.quranProgress || { page: 1, juz: 1, surah: 1, lastRead: null },
      adhkarProgress: s.adhkarProgress || {},
    }),
  };

  function migrate(state) {
    let s = { ...state };
    let v = s._v || 1;
    while (v < STATE_VERSION) {
      const fn = MIGRATIONS[v];
      s = fn ? fn(s) : { ...DEFAULT(), ...s, _v: v + 1 };
      v = s._v;
    }
    return s;
  }

  /* ── Persistence ──────────────────────────────────────────────────────── */
  let _state = null;
  let _saveTimer = null;
  const _listeners = new Map(); /* key → Set<fn> */

  function load() {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (!raw) return DEFAULT();
      const parsed = JSON.parse(raw);
      return migrate(parsed);
    } catch {
      return DEFAULT();
    }
  }

  function save() {
    clearTimeout(_saveTimer);
    _saveTimer = setTimeout(() => {
      try { localStorage.setItem(STATE_KEY, JSON.stringify(_state)); } catch {}
    }, 200);
  }

  /* حفظ فوري (يتخطّى الـ debounce) — للاستخدام عند إغلاق الصفحة */
  function flush() {
    clearTimeout(_saveTimer);
    try { if (_state) localStorage.setItem(STATE_KEY, JSON.stringify(_state)); } catch {}
  }

  /* CHAOS: لو المستخدم قفل الصفحة أثناء الحفظ المؤجّل — احفظ فوراً */
  if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush();
    });
  }

  function init() {
    _state = load();
    /* daily reset */
    if (_state.day !== todayStr()) {
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().split('T')[0];
      if (_state.lastActive === yStr) _state.streak = (_state.streak || 0) + 1;
      else if (_state.lastActive !== todayStr()) _state.streak = 1;
      _state.day = todayStr();
      _state.lastActive = todayStr();
      _state.worship = {};
      _state.charityDone = [];
      save();
    }
    /* مزامنة مع window.STATE لو app.js بيستخدمه */
    window.STATE = _state;
    console.log(`[ZadState] v${STATE_VERSION} — streak: ${_state.streak}`);
    return _state;
  }

  /* ── Getters / Setters ────────────────────────────────────────────────── */
  function get(path) {
    if (!_state) init();
    if (!path) return _state;
    return path.split('.').reduce((o, k) => o?.[k], _state);
  }

  function set(path, value) {
    if (!_state) init();
    const keys = path.split('.');
    let obj = _state;
    for (let i = 0; i < keys.length - 1; i++) {
      if (obj[keys[i]] === undefined) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    const lastKey = keys[keys.length - 1];
    const oldValue = obj[lastKey];
    obj[lastKey] = value;
    save();
    /* إخطار المشتركين */
    const topKey = keys[0];
    _listeners.get(topKey)?.forEach(fn => fn(get(topKey), oldValue));
    _listeners.get('*')?.forEach(fn => fn(_state));
  }

  function update(updater) {
    if (!_state) init();
    const next = updater({ ..._state });
    Object.assign(_state, next);
    window.STATE = _state;
    save();
    _listeners.get('*')?.forEach(fn => fn(_state));
  }

  /* ── Pub/Sub ──────────────────────────────────────────────────────────── */
  function subscribe(key, fn) {
    if (!_listeners.has(key)) _listeners.set(key, new Set());
    _listeners.get(key).add(fn);
    return () => _listeners.get(key).delete(fn); /* unsubscribe */
  }

  /* ── Helpers لشيل التكرار من app.js ───────────────────────────────── */
  function markWorship(key, done = true) {
    const worship = get('worship') || {};
    worship[key] = done;
    set('worship', worship);
  }

  function addNotification(msg, type = 'info') {
    const notifs = get('notifications') || [];
    notifs.unshift({ id: Date.now(), msg, type, read: false, ts: new Date().toISOString() });
    set('notifications', notifs.slice(0, 30)); /* احتفظ بآخر 30 */
  }

  function markNotifRead(id) {
    const notifs = (get('notifications') || []).map(n => n.id === id ? { ...n, read: true } : n);
    set('notifications', notifs);
  }

  /* ── Export ─────────────────────────────────────────────────────────── */
  return {
    init, get, set, update, subscribe, save, load, flush,
    markWorship, addNotification, markNotifRead,
    /* للتوافق مع app.js */
    getState: () => _state,
    saveState: save,
  };
})();

window.ZadState = ZadState;

/* تهيئة فورية + مزامنة مع app.js */
ZadState.init();

/* اجعل saveState و STATE متاحَين عالمياً للتوافق مع app.js */
if (!window.saveState) window.saveState = ZadState.save;
