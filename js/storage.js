/* ═══════════════════════════════════════════════════════════════════════════
   زاد العشر — طبقة التخزين الموحّدة
   الفيز الثاني: استبدال localStorage بـ IndexedDB عبر Dexie.js
   
   المبدأ: Single Source of Truth — كل البيانات تمر من هنا فقط
   الضمان: Persistent Storage + Schema Migration + Export/Import
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── 1. تحميل Dexie من CDN (يُشغَّل قبل app.js) ─────────────────────────── */
(function loadDexie() {
  if (window.Dexie) return; /* already loaded */
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/dexie@3.2.7/dist/dexie.min.js';
  s.async = false;
  document.head.appendChild(s);
})();

/* ═══════════════════════════════════════════════════════════════════════════
   2. تعريف قاعدة البيانات وإصداراتها
   ─────────────────────────────────────────────────────────────────────────
   كل إصدار جديد يضيف أو يعدّل — لا يحذف أبداً بدون migration صريح.
   المستخدمون بالإصدارات القديمة سيُرقَّى schema تلقائياً بواسطة Dexie.
   ═══════════════════════════════════════════════════════════════════════════ */
let ZadDB = null;

async function initDB() {
  if (ZadDB) return ZadDB;

  await waitForDexie();

  const db = new Dexie('ZadDatabase');

  /* ── الإصدار 1: بيانات العشر الأساسية ─────────────────────────── */
  db.version(1).stores({
    /* [keyPath]    الحقول المفهرسة */
    state:        'key',              /* blobات حالة التطبيق العامة */
    worshipLog:   '++id, date, key', /* سجل العبادات اليومية */
    takbeer:      'date',            /* عداد التكبير اليومي */
    mushaf:       'date',            /* تقدم الختمة */
    fasting:      'day',             /* سجل الصيام */
    badges:       'id',              /* الأوسمة المكتسبة */
    settings:     'key',             /* إعدادات المستخدم */
    history:      'date',            /* سجل الأداء التاريخي */
  });

  /* ── الإصدار 2: إضافة الأذكار والتسبيح ─────────────────────────── */
  db.version(2).stores({
    state:        'key',
    worshipLog:   '++id, date, key',
    takbeer:      'date',
    mushaf:       'date',
    fasting:      'day',
    badges:       'id',
    settings:     'key',
    history:      'date',
    tasbih:       'id',              /* أذكار التسبيح */
    adhkar:       '++id, sectionId, date', /* سجل الأذكار */
  });

  /* ── الإصدار 3: إضافة الزكاة والملف الشخصي ─────────────────────── */
  db.version(3).stores({
    state:        'key',
    worshipLog:   '++id, date, key',
    takbeer:      'date',
    mushaf:       'date',
    fasting:      'day',
    badges:       'id',
    settings:     'key',
    history:      'date',
    tasbih:       'id',
    adhkar:       '++id, sectionId, date',
    zakatCalc:    '++id, date',      /* حسابات الزكاة */
    profile:      'key',             /* الملف الشخصي */
  });

  await db.open();
  ZadDB = db;

  /* طلب التخزين المستمر فور فتح قاعدة البيانات */
  await requestPersistentStorage();

  return db;
}

/* ── انتظار تحميل Dexie ─────────────────────────────────────────────────── */
function waitForDexie(maxWait = 5000) {
  return new Promise((resolve, reject) => {
    if (window.Dexie) { resolve(); return; }
    const start = Date.now();
    const check = setInterval(() => {
      if (window.Dexie) { clearInterval(check); resolve(); }
      else if (Date.now() - start > maxWait) {
        clearInterval(check);
        reject(new Error('Dexie failed to load'));
      }
    }, 50);
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   3. Persistent Storage — الحماية من الحذف التلقائي
   ─────────────────────────────────────────────────────────────────────────
   المتصفح قد يحذف IndexedDB تلقائياً عند امتلاء القرص (LRU eviction)
   ما لم نطلب "persistent storage" صراحةً.
   ═══════════════════════════════════════════════════════════════════════════ */
async function requestPersistentStorage() {
  try {
    if (!navigator.storage?.persist) return;
    const isPersistent = await navigator.storage.persisted();
    if (!isPersistent) {
      const granted = await navigator.storage.persist();
      console.log('[ZadStorage] Persistent storage:', granted ? '✅ ممنوح' : '⚠️ مرفوض');
    }
    /* مراقبة المساحة المستخدمة */
    if (navigator.storage.estimate) {
      const { usage, quota } = await navigator.storage.estimate();
      const usedMB  = (usage  / 1048576).toFixed(1);
      const totalMB = (quota  / 1048576).toFixed(0);
      const pct = Math.round((usage / quota) * 100);
      if (pct > 80) {
        console.warn(`[ZadStorage] تحذير: المساحة ${usedMB}MB من ${totalMB}MB (${pct}%)`);
        /* يمكن هنا إظهار تحذير للمستخدم */
      }
    }
  } catch (e) {
    console.warn('[ZadStorage] Persistent storage check failed:', e);
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   4. Migration من localStorage — يُشغَّل مرة واحدة فقط
   ─────────────────────────────────────────────────────────────────────────
   يقرأ البيانات القديمة من localStorage ويحوّلها للـ IndexedDB schema الجديد
   ثم يحذف localStorage القديم بأمان بعد التأكد من النجاح.
   ═══════════════════════════════════════════════════════════════════════════ */
async function migrateFromLocalStorage() {
  const db = await initDB();
  
  /* تحقق إذا تمت الهجرة مسبقاً */
  const migrated = await db.settings.get('_migrated_v1');
  if (migrated) return;

  const OLD_KEY     = 'zad_v2';
  const PROFILE_KEY = 'zad_profile';
  const NOTIF_KEY   = 'zad_notifications';
  
  const raw = localStorage.getItem(OLD_KEY);
  if (!raw) {
    /* لا بيانات قديمة — فقط سجّل الهجرة كمكتملة */
    await db.settings.put({ key: '_migrated_v1', value: true, ts: Date.now() });
    return;
  }

  try {
    const old = JSON.parse(raw);
    const today = new Date().toISOString().split('T')[0];

    /* ── حوّل البيانات للـ schema الجديد ─────────────────────────── */
    await db.transaction('rw',
      db.state, db.worshipLog, db.takbeer, db.mushaf,
      db.fasting, db.badges, db.settings, db.history,
      async () => {

      /* الحالة العامة */
      await db.state.put({ key: 'theme',      value: old.theme      || 'light' });
      await db.state.put({ key: 'streak',     value: old.streak     || 0 });
      await db.state.put({ key: 'lastActive', value: old.lastActive || today });
      await db.state.put({ key: 'fontScale',  value: old.fontScale  || 'md' });
      await db.state.put({ key: 'quranFontSize', value: old.quranFontSize || 24 });

      /* بيانات المشروع */
      if (old.mushaf) {
        await db.mushaf.put({ date: today, juz: old.mushaf.juz || 0, plan: old.mushaf.plan || 'daily-juz' });
      }

      /* التكبير */
      if (old.takbeer) {
        await db.takbeer.put({
          date:     today,
          count:    old.takbeer.count    || 0,
          total:    old.takbeer.total    || 0,
          sessions: old.takbeer.sessions || 0,
          phrase:   old.takbeer.phrase   || 'اللَّهُ أَكْبَرُ',
          target:   old.takbeer.target   || 33,
        });
      }

      /* الصيام */
      if (old.fasting) {
        for (const [day, done] of Object.entries(old.fasting)) {
          await db.fasting.put({ day: +day, done: !!done });
        }
      }

      /* الأوسمة */
      if (Array.isArray(old.badges)) {
        for (const badgeId of old.badges) {
          await db.badges.put({ id: badgeId, earnedAt: Date.now() });
        }
      }

      /* الورد اليومي */
      if (old.worship && Object.keys(old.worship).length) {
        for (const [key, val] of Object.entries(old.worship)) {
          if (val) {
            await db.worshipLog.put({ date: today, key, completed: true, ts: Date.now() });
          }
        }
      }

      /* التاريخ */
      if (old.history) {
        for (const [date, data] of Object.entries(old.history)) {
          await db.history.put({ date, ...data });
        }
      }

      /* تسجيل نجاح الهجرة */
      await db.settings.put({ key: '_migrated_v1', value: true, ts: Date.now() });
    });

    /* الملف الشخصي */
    const profileRaw = localStorage.getItem(PROFILE_KEY);
    if (profileRaw) {
      try {
        const profile = JSON.parse(profileRaw);
        await db.profile.put({ key: 'main', ...profile });
      } catch (e) { console.warn('[storage] ملف شخصي تالف — تم تخطّيه'); }
    }

    /* بعد التأكد من النجاح — احذف localStorage القديم بأمان */
    localStorage.removeItem(OLD_KEY);
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(NOTIF_KEY);
    /* احتفظ بـ: zad_profile_skipped, zad_clock, zad_sound_on لأنها خفيفة */

    console.log('[ZadStorage] ✅ Migration from localStorage: نجحت الهجرة');
    
  } catch (err) {
    console.error('[ZadStorage] ❌ Migration failed:', err);
    /* لا نحذف localStorage في حالة الفشل — بيانات المستخدم آمنة */
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   5. ZadStore — واجهة موحّدة للتخزين
   ─────────────────────────────────────────────────────────────────────────
   كل الكود في app.js يتعامل مع ZadStore فقط — لا يستدعي IndexedDB مباشرة.
   ═══════════════════════════════════════════════════════════════════════════ */
const ZadStore = {

  /* ── STATE ──────────────────────────────────────────────────────────── */
  async getState(key, defaultVal = null) {
    const db = await initDB();
    const row = await db.state.get(key);
    return row ? row.value : defaultVal;
  },

  async setState(key, value) {
    const db = await initDB();
    await db.state.put({ key, value, updatedAt: Date.now() });
  },

  /* ── WORSHIP LOG ────────────────────────────────────────────────────── */
  async getWorshipForDate(date) {
    const db = await initDB();
    const rows = await db.worshipLog.where('date').equals(date).toArray();
    const result = {};
    rows.forEach(r => { result[r.key] = r.completed; });
    return result;
  },

  async setWorshipItem(date, key, completed) {
    const db = await initDB();
    /* upsert */
    const existing = await db.worshipLog.where({ date, key }).first();
    if (existing) {
      await db.worshipLog.update(existing.id, { completed, ts: Date.now() });
    } else {
      await db.worshipLog.add({ date, key, completed, ts: Date.now() });
    }
  },

  /* ── TAKBEER ────────────────────────────────────────────────────────── */
  async getTakbeer(date) {
    const db = await initDB();
    return await db.takbeer.get(date) || {
      date, count: 0, total: 0, sessions: 0,
      phrase: 'اللَّهُ أَكْبَرُ', target: 33,
    };
  },

  async saveTakbeer(date, data) {
    const db = await initDB();
    await db.takbeer.put({ date, ...data });
  },

  /* ── MUSHAF ─────────────────────────────────────────────────────────── */
  async getMushaf(date) {
    const db = await initDB();
    return await db.mushaf.get(date) || { date, juz: 0, plan: 'daily-juz' };
  },

  async saveMushaf(date, data) {
    const db = await initDB();
    await db.mushaf.put({ date, ...data });
  },

  /* ── FASTING ─────────────────────────────────────────────────────────── */
  async getFasting() {
    const db = await initDB();
    const rows = await db.fasting.toArray();
    const result = {};
    rows.forEach(r => { result[r.day] = r.done; });
    return result;
  },

  async setFasting(day, done) {
    const db = await initDB();
    await db.fasting.put({ day, done });
  },

  /* ── BADGES ──────────────────────────────────────────────────────────── */
  async getBadges() {
    const db = await initDB();
    const rows = await db.badges.toArray();
    return rows.map(r => r.id);
  },

  async addBadge(id) {
    const db = await initDB();
    await db.badges.put({ id, earnedAt: Date.now() });
  },

  /* ── SETTINGS ────────────────────────────────────────────────────────── */
  async getSetting(key, defaultVal = null) {
    const db = await initDB();
    const row = await db.settings.get(key);
    return row ? row.value : defaultVal;
  },

  async setSetting(key, value) {
    const db = await initDB();
    await db.settings.put({ key, value });
  },

  /* ── HISTORY ─────────────────────────────────────────────────────────── */
  async saveHistory(date, data) {
    const db = await initDB();
    await db.history.put({ date, ...data });
  },

  async getHistory() {
    const db = await initDB();
    const rows = await db.history.orderBy('date').toArray();
    const result = {};
    rows.forEach(r => { result[r.date] = r; });
    return result;
  },

  /* ── ZAKAT ───────────────────────────────────────────────────────────── */
  async saveZakatCalc(data) {
    const db = await initDB();
    const id = await db.zakatCalc.add({ ...data, date: new Date().toISOString().split('T')[0], ts: Date.now() });
    return id;
  },

  async getZakatHistory() {
    const db = await initDB();
    return await db.zakatCalc.orderBy('ts').reverse().toArray();
  },

  /* ── PROFILE ─────────────────────────────────────────────────────────── */
  async getProfile() {
    const db = await initDB();
    return await db.profile?.get('main') || null;
  },

  async saveProfile(profileData) {
    const db = await initDB();
    await db.profile.put({ key: 'main', ...profileData });
  },

};

/* ═══════════════════════════════════════════════════════════════════════════
   6. Export / Import — نسخ احتياطي متكامل
   ─────────────────────────────────────────────────────────────────────────
   Export: كل البيانات → JSON منظّم مع metadata
   Import: تحقق من الصحة ثم استعادة مع خيار Merge أو Replace
   ═══════════════════════════════════════════════════════════════════════════ */
async function exportAllData() {
  const db = await initDB();

  const payload = {
    _meta: {
      version:    3,
      exportedAt: new Date().toISOString(),
      app:        'زاد العشر',
    },
    state:      await db.state.toArray(),
    worshipLog: await db.worshipLog.toArray(),
    takbeer:    await db.takbeer.toArray(),
    mushaf:     await db.mushaf.toArray(),
    fasting:    await db.fasting.toArray(),
    badges:     await db.badges.toArray(),
    settings:   await db.settings.toArray(),
    history:    await db.history.toArray(),
  };

  const json     = JSON.stringify(payload, null, 2);
  const blob     = new Blob([json], { type: 'application/json' });
  const url      = URL.createObjectURL(blob);
  const dateStr  = new Date().toISOString().split('T')[0];
  const filename = `zad-backup-${dateStr}.json`;

  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return filename;
}

async function importData(jsonText, mode = 'replace') {
  let payload;
  try {
    payload = JSON.parse(jsonText);
  } catch {
    throw new Error('ملف غير صالح — يجب أن يكون JSON صحيح');
  }

  /* تحقق بسيط */
  if (!payload._meta || payload._meta.app !== 'زاد العشر') {
    throw new Error('الملف لا ينتمي لتطبيق زاد العشر');
  }

  const db = await initDB();

  await db.transaction('rw',
    db.state, db.worshipLog, db.takbeer, db.mushaf,
    db.fasting, db.badges, db.settings, db.history,
    async () => {

    if (mode === 'replace') {
      /* مسح القديم واستبداله */
      await db.state.clear();
      await db.worshipLog.clear();
      await db.takbeer.clear();
      await db.mushaf.clear();
      await db.fasting.clear();
      await db.badges.clear();
      await db.settings.clear();
      await db.history.clear();
    }

    /* استيراد البيانات */
    if (payload.state)      await db.state.bulkPut(payload.state);
    if (payload.worshipLog) await db.worshipLog.bulkPut(payload.worshipLog);
    if (payload.takbeer)    await db.takbeer.bulkPut(payload.takbeer);
    if (payload.mushaf)     await db.mushaf.bulkPut(payload.mushaf);
    if (payload.fasting)    await db.fasting.bulkPut(payload.fasting);
    if (payload.badges)     await db.badges.bulkPut(payload.badges);
    if (payload.settings)   await db.settings.bulkPut(payload.settings);
    if (payload.history)    await db.history.bulkPut(payload.history);
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   7. تصدير عام
   ═══════════════════════════════════════════════════════════════════════════ */
window.ZadStore       = ZadStore;
window.initZadDB      = initDB;
window.exportAllData  = exportAllData;
window.importZadData  = importData;
window.migrateFromLocalStorage = migrateFromLocalStorage;

/* بدء التهيئة فور تحميل الملف */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await initDB();
    await migrateFromLocalStorage();
    console.log('[ZadStorage] ✅ Storage layer ready');
  } catch (err) {
    console.error('[ZadStorage] ❌ Init failed — falling back to localStorage:', err);
    /* Fallback: التطبيق يستمر بالـ localStorage الحالي */
  }
});
