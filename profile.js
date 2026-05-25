/* ══════════════════════════════════════════════════════════════════════════
   profile.js — نظام البروفايل الموحّد لـ "زاد العشر"
   • المرحلة 1: بروفايل محلي موسّع (أفاتار، اسم، وضع، مدينة، طريقة الحساب،
                أهداف يومية، تفضيلات الإشعارات) — يعمل أوفلاين 100% بلا حساب.
   • المرحلة 2: طبقة local-first اختيارية للنسخ الاحتياطي والمزامنة:
                تصدير/استيراد البيانات كملف، + واجهة "حساب سحابي (قريباً)"
                جاهزة للربط بخادم لاحقاً — كلها اختيارية وغير مطلوبة.

   مبدأ معماري: البيانات المحلية هي مصدر الحقيقة (local-first). الحساب طبقة
   مزامنة فوقها — لا شرط للدخول. متوافق رجعياً مع zad_profile الحالي.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const PROFILE_KEY = 'zad_profile';
  const SKIP_KEY    = 'zad_profile_skipped';

  /* مفاتيح التقدّم التي تُضمّن في النسخ الاحتياطي */
  const BACKUP_KEYS = [
    'zad_profile', 'zad_v2', 'zad_font_size',
    'zad_lat', 'zad_lng', 'zad_city',
    'zad_radio_favs', 'zad_ten_days_method', 'zad_sound_on',
    'zad_profile_skipped',
  ];

  const AVATARS = ['🌙','⭐','🌸','🌿','🕌','📿','🤲','🌺','🦋','🌕','🪷','🕋','📖','✨','🧒'];
  const PRAYER_METHODS = {
    '4':'أم القرى — مكة', '5':'الهيئة المصرية', '2':'رابطة العالم الإسلامي',
    '3':'كراتشي', '8':'الخليج', '9':'الكويت', '10':'قطر', '1':'كاليفورنيا',
  };

  /* ── القراءة/الكتابة الموسّعة (دمج مع الموجود) ───────────────────────── */
  function getProfile() {
    try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null'); }
    catch (e) { return null; }
  }

  /* يُعيد بروفايلاً كامل الحقول مع قيم افتراضية آمنة */
  function getProfileFull() {
    const p = getProfile() || {};
    return {
      name:  p.name  || '',
      type:  p.type  || 'adult',
      avatar: p.avatar || (p.type === 'child' ? '🧒' : '🌙'),
      since: p.since || Date.now(),
      city:  p.city  || (localStorage.getItem('zad_city') || ''),
      prayerMethod: p.prayerMethod || (localStorage.getItem('zad_ten_days_method') || '5'),
      goals: Object.assign({ quranPages: 5, dhikrCount: 100 }, p.goals || {}),
      notifications: Object.assign({ prayers: true, dhikr: true, dailyVerse: true }, p.notifications || {}),
      account: Object.assign({ enabled: false, email: '', syncedAt: null }, p.account || {}),
    };
  }

  /* دمج تعديل جزئي وحفظه */
  function patchProfile(patch) {
    const cur = getProfileFull();
    const next = Object.assign({}, cur, patch);
    if (patch.goals)         next.goals = Object.assign({}, cur.goals, patch.goals);
    if (patch.notifications) next.notifications = Object.assign({}, cur.notifications, patch.notifications);
    if (patch.account)       next.account = Object.assign({}, cur.account, patch.account);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
    /* مزامنة بعض الحقول مع المفاتيح القديمة للتوافق */
    if (next.city) localStorage.setItem('zad_city', next.city);
    if (next.prayerMethod) localStorage.setItem('zad_ten_days_method', next.prayerMethod);
    try { localStorage.removeItem(SKIP_KEY); } catch(e){}
    return next;
  }

  /* ── النسخ الاحتياطي (تصدير) — local-first، بلا خادم ─────────────────── */
  function exportData() {
    const bundle = { _app: 'zad-al-ashr', _ver: 1, _exportedAt: new Date().toISOString(), data: {} };
    BACKUP_KEYS.forEach(k => {
      const v = localStorage.getItem(k);
      if (v != null) bundle.data[k] = v;
    });
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    const name = (getProfileFull().name || 'زائر').replace(/\s+/g, '_');
    a.href = url;
    a.download = `zad-backup-${name}-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    patchProfile({ account: { syncedAt: Date.now() } });
    return true;
  }

  /* الاستيراد — يستعيد البيانات من ملف نسخة احتياطية */
  function importData(file, onDone) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const bundle = JSON.parse(reader.result);
        if (!bundle || bundle._app !== 'zad-al-ashr' || !bundle.data) {
          onDone && onDone(false, 'الملف غير صالح أو ليس نسخة احتياطية من زاد العشر');
          return;
        }
        Object.entries(bundle.data).forEach(([k, v]) => {
          try { localStorage.setItem(k, v); } catch(e){}
        });
        patchProfile({ account: { syncedAt: Date.now() } });
        onDone && onDone(true, 'تم استعادة بياناتك بنجاح');
      } catch (e) {
        onDone && onDone(false, 'تعذّر قراءة الملف — تأكد أنه ملف نسخة صحيح');
      }
    };
    reader.onerror = () => onDone && onDone(false, 'تعذّر قراءة الملف');
    reader.readAsText(file);
  }

  /* مسح كل بيانات التطبيق (مع تأكيد من الواجهة) */
  function resetAll() {
    BACKUP_KEYS.forEach(k => { try { localStorage.removeItem(k); } catch(e){} });
    try { localStorage.removeItem('zad_prayer_today'); localStorage.removeItem('zad_ten_days_table'); } catch(e){}
  }

  /* ── واجهة عامة ──────────────────────────────────────────────────────── */
  window.ZadProfile = {
    get: getProfile,
    getFull: getProfileFull,
    patch: patchProfile,
    exportData, importData, resetAll,
    AVATARS, PRAYER_METHODS,
  };
})();
