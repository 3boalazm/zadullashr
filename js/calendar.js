/* ═══════════════════════════════════════════════════════════════════════════
   زاد العشر — إصلاح التقويم والمواقيت
   الفيز الثالث: islamic-umalqura + adhan-js + إزاحة يدوية
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── 1. التقويم الهجري الصحيح ────────────────────────────────────────────── */

const HIJRI_SETTING_KEY = 'zad_hijri_offset';

/* الإزاحة اليدوية: يختارها المستخدم من الإعدادات (+1/-1/0) */
function getHijriOffset() {
  return parseInt(localStorage.getItem(HIJRI_SETTING_KEY) || '0', 10);
}
function setHijriOffset(n) {
  localStorage.setItem(HIJRI_SETTING_KEY, String(n));
  refreshHijriDisplay();
}
window.setHijriOffset = setHijriOffset;
window.getHijriOffset = getHijriOffset;

/* ── الطريقة الأساسية: islamic-umalqura (التقويم السعودي الرسمي) ─────────── */
function getHijriDateAccurate(date = new Date()) {
  const offset = getHijriOffset();
  const adjusted = new Date(date);
  adjusted.setDate(adjusted.getDate() + offset);

  try {
    /* نجرّب islamic-umalqura أولاً (الأدق) */
    const fmt = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric', month: 'numeric', year: 'numeric'
    });
    const parts = fmt.formatToParts(adjusted);
    const get = type => parseInt(parts.find(p => p.type === type)?.value || '0', 10);
    return { year: get('year'), month: get('month'), day: get('day'), source: 'umalqura' };
  } catch {
    /* Fallback: المرجع الثابت المبرمج في app.js الأصلي */
    return getHijriDateFallback(adjusted);
  }
}

/* Fallback: نفس خوارزمية app.js الأصلية (تعمل بدون Intl) */
function getHijriDateFallback(date) {
  const HIJRI_REF = {
    greg: new Date(2026, 4, 18, 0, 0, 0),
    year: 1447, month: 12, day: 1
  };
  const MONTH_LEN = [30,29,30,29,30,29,30,29,30,29,30,29];
  const diffDays = Math.round((date - HIJRI_REF.greg) / 86400000);
  let { year, month, day } = HIJRI_REF;
  let d = (day - 1) + diffDays;
  if (d >= 0) {
    while (d >= MONTH_LEN[month - 1]) { d -= MONTH_LEN[month - 1]; month++; if (month > 12) { month = 1; year++; } }
  } else {
    while (d < 0) { month--; if (month < 1) { month = 12; year--; } d += MONTH_LEN[month - 1]; }
  }
  return { year, month, day: d + 1, source: 'fallback' };
}

/* Override الدالة الأصلية في app.js */
window.getHijriDate = getHijriDateAccurate;

/* ── عرض التاريخ الهجري المنسّق ─────────────────────────────────────────── */
const HIJRI_MONTHS = [
  'محرم','صفر','ربيع الأول','ربيع الآخر','جمادى الأولى','جمادى الآخرة',
  'رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'
];

function formatHijriDate(date = new Date()) {
  const h = getHijriDateAccurate(date);
  return `${h.day} ${HIJRI_MONTHS[h.month - 1]} ${h.year} هـ`;
}
window.formatHijriDate = formatHijriDate;

function refreshHijriDisplay() {
  const str = formatHijriDate();
  document.querySelectorAll('#hijri-full, .hd-hijri, [data-hijri]').forEach(el => {
    el.textContent = str;
  });
}

/* ── 2. تحسين fetchAndCacheHijriDate (override الأصلية) ──────────────────── */
window.fetchAndCacheHijriDate = async function() {
  try {
    const today   = new Date();
    const key     = 'zad_hijri_today';
    const todayStr = today.toISOString().split('T')[0];
    const h = getHijriDateAccurate(today);
    localStorage.setItem(key, JSON.stringify({
      y: h.year, m: h.month, d: h.day,
      greg: todayStr, ts: Date.now(),
      source: h.source, offset: getHijriOffset()
    }));
    document.querySelectorAll('#hijri-full, .hd-hijri').forEach(el => {
      el.textContent = `${h.day} ${HIJRI_MONTHS[h.month-1]} ${h.year} هـ`;
    });
  } catch(e) {}
};

/* ═══════════════════════════════════════════════════════════════════════════
   3. مواقيت الصلاة — adhan-js
   ─────────────────────────────────────────────────────────────────────────
   مكتبة adhan-js متخصصة وموثوقة — تدعم MWL / ISNA / UmmAlQura / Egypt / Karachi
   نحمّلها بدلاً من حساب الغروب التقريبي في app.js
   ═══════════════════════════════════════════════════════════════════════════ */

/* تحميل adhan-js من CDN */
(function loadAdhan() {
  if (window.adhan) return;
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/adhan@4.4.3/dist/adhan.min.js';
  s.async = false;
  document.head.appendChild(s);
})();

/* طريقة الحساب — يختارها المستخدم من الإعدادات */
const CALC_METHOD_KEY = 'zad_prayer_method';

const CALC_METHODS = {
  'UmmAlQura':  { name: 'أم القرى (السعودية)',   key: 'UmmAlQura'  },
  'Egypt':      { name: 'الهيئة المصرية',         key: 'Egypt'      },
  'MWL':        { name: 'رابطة العالم الإسلامي', key: 'MWL'        },
  'ISNA':       { name: 'أمريكا الشمالية',        key: 'ISNA'       },
  'Karachi':    { name: 'كراتشي',                 key: 'Karachi'    },
  'Kuwait':     { name: 'الكويت',                 key: 'Kuwait'     },
  'Qatar':      { name: 'قطر',                    key: 'Qatar'      },
};

function getPrayerMethod() {
  return localStorage.getItem(CALC_METHOD_KEY) || 'UmmAlQura';
}
function setPrayerMethod(method) {
  localStorage.setItem(CALC_METHOD_KEY, method);
}
window.setPrayerMethod = setPrayerMethod;
window.getPrayerMethod = getPrayerMethod;
window.CALC_METHODS    = CALC_METHODS;

/* ── حساب المواقيت ───────────────────────────────────────────────────────── */
async function calcPrayerTimes(lat, lng, date = new Date()) {
  await waitForAdhan();

  const methodKey = getPrayerMethod();
  const params = adhan.CalculationMethod[methodKey]
    ? adhan.CalculationMethod[methodKey]()
    : adhan.CalculationMethod.UmmAlQura();

  const coords = new adhan.Coordinates(lat, lng);
  const prayerDate = new adhan.DateComponents(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const times = new adhan.PrayerTimes(coords, prayerDate, params);

  function fmt(t) {
    if (!t) return '--:--';
    return t.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  return {
    fajr:    { time: times.fajr,    label: 'الفجر',   fmt: fmt(times.fajr)    },
    sunrise: { time: times.sunrise, label: 'الشروق',  fmt: fmt(times.sunrise) },
    dhuhr:   { time: times.dhuhr,   label: 'الظهر',   fmt: fmt(times.dhuhr)   },
    asr:     { time: times.asr,     label: 'العصر',   fmt: fmt(times.asr)     },
    maghrib: { time: times.maghrib, label: 'المغرب',  fmt: fmt(times.maghrib) },
    isha:    { time: times.isha,    label: 'العشاء',  fmt: fmt(times.isha)    },
    method:  methodKey,
  };
}

function waitForAdhan(maxWait = 5000) {
  return new Promise((resolve, reject) => {
    if (window.adhan) { resolve(); return; }
    const start = Date.now();
    const check = setInterval(() => {
      if (window.adhan) { clearInterval(check); resolve(); }
      else if (Date.now() - start > maxWait) { clearInterval(check); reject(new Error('adhan.js timeout')); }
    }, 50);
  });
}

/* ── override الدالة القديمة في app.js ───────────────────────────────────── */
window.fetchPrayerTimesIfPossible = async function() {
  try {
    const pos = await window._getGeoLocation({ timeout: 8000 });
    const { latitude: lat, longitude: lng } = pos.coords;
    const times = await calcPrayerTimes(lat, lng);
    /* إرجاع وقت المغرب كـ Date (متوافق مع الكود القديم) */
    return times.maghrib.time;
  } catch (e) {
    return null;
  }
};

window.calcPrayerTimes = calcPrayerTimes;

/* ── عرض المواقيت في صفحة الصلاة ────────────────────────────────────────── */
async function renderPrayerTimesPage() {
  const container = document.getElementById('prayer-times-container');
  if (!container) return;

  try {
    const pos = await window._getGeoLocation({ timeout: 8000 });
    const { latitude: lat, longitude: lng } = pos.coords;
    const times = await calcPrayerTimes(lat, lng);
    const method = CALC_METHODS[times.method]?.name || times.method;

    container.innerHTML = `
      <div class="prayer-method-badge">
        📍 طريقة الحساب: ${method}
        <button onclick="showMethodPicker()" class="btn btn-ghost" style="font-size:12px;padding:4px 10px">تغيير</button>
      </div>
      ${Object.entries(times).filter(([k]) => k !== 'method').map(([key, p]) => `
        <div class="prayer-row ${key}">
          <span class="prayer-name">${p.label}</span>
          <span class="prayer-time" data-time24="${p.fmt}">${p.fmt}</span>
        </div>
      `).join('')}
    `;

    /* تطبيق تنسيق الساعة */
    if (typeof applyClockFormat === 'function') applyClockFormat();

  } catch (e) {
    container.innerHTML = '<div class="error-state">تعذّر الحصول على الموقع — تأكد من تفعيل GPS</div>';
  }
}
window.renderPrayerTimesPage = renderPrayerTimesPage;

/* ── قائمة اختيار طريقة الحساب ──────────────────────────────────────────── */
function showMethodPicker() {
  const current = getPrayerMethod();
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.innerHTML = `
    <div style="background:var(--card);border-radius:20px;padding:24px;width:100%;max-width:360px">
      <h3 style="margin:0 0 16px;font-size:16px;color:var(--ink)">اختر طريقة حساب المواقيت</h3>
      ${Object.entries(CALC_METHODS).map(([key, m]) => `
        <div onclick="setPrayerMethod('${key}');document.body.removeChild(this.closest('[style*=fixed]'));if(typeof showToast==='function')showToast('✅ تم اختيار: ${m.name}');setTimeout(()=>location.reload(),800)"
          style="padding:14px 16px;border-radius:12px;cursor:pointer;margin-bottom:8px;
                 background:${key===current?'rgba(14,59,46,.1)':'var(--sand)'};
                 border:${key===current?'2px solid var(--green-deep)':'1.5px solid var(--border)'}">
          <div style="font-size:14px;font-weight:${key===current?800:500}">${m.name} ${key===current?'✓':''}</div>
        </div>
      `).join('')}
      <button onclick="document.body.removeChild(this.closest('[style*=fixed]'))" 
        style="width:100%;padding:12px;border:none;background:none;color:var(--muted);font-family:inherit;cursor:pointer;margin-top:8px">
        إلغاء
      </button>
    </div>`;
  document.body.appendChild(modal);
}
window.showMethodPicker = showMethodPicker;

/* ═══════════════════════════════════════════════════════════════════════════
   4. إعداد الإزاحة الهجرية في الإعدادات
   ─────────────────────────────────────────────────────────────────────────
   يُضاف تلقائياً لصفحة الإعدادات
   ═══════════════════════════════════════════════════════════════════════════ */
function injectHijriOffsetControl() {
  const container = document.getElementById('hijri-offset-container');
  if (!container) return;

  const current = getHijriOffset();
  container.innerHTML = `
    <div class="setting-row">
      <div class="setting-label">
        <div style="font-weight:700;margin-bottom:4px">ضبط التاريخ الهجري</div>
        <div style="font-size:12px;color:var(--muted)">
          في حال اختلاف التاريخ مع إعلان رؤية الهلال، يمكنك ضبطه يدوياً
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;margin-top:10px">
        <button onclick="setHijriOffset(getHijriOffset()-1)" class="btn btn-ghost" style="padding:8px 14px">-1</button>
        <span id="hijri-offset-display" style="font-size:14px;font-weight:700;min-width:40px;text-align:center">
          ${current > 0 ? '+' : ''}${current}
        </span>
        <button onclick="setHijriOffset(getHijriOffset()+1)" class="btn btn-ghost" style="padding:8px 14px">+1</button>
        <button onclick="setHijriOffset(0)" class="btn btn-ghost" style="padding:8px 14px;font-size:12px">إعادة</button>
      </div>
      <div style="margin-top:8px;font-size:13px;color:var(--muted)">
        التاريخ الحالي: <strong id="hijri-current-display">${formatHijriDate()}</strong>
      </div>
    </div>
  `;
}

/* Override setHijriOffset لتحديث العرض */
const _origSetOffset = window.setHijriOffset;
window.setHijriOffset = function(n) {
  _origSetOffset(n);
  const display = document.getElementById('hijri-offset-display');
  if (display) display.textContent = n > 0 ? `+${n}` : String(n);
  const current = document.getElementById('hijri-current-display');
  if (current) current.textContent = formatHijriDate();
};

/* تشغيل التهيئة */
document.addEventListener('DOMContentLoaded', () => {
  refreshHijriDisplay();
  injectHijriOffsetControl();
});

console.log('[ZadCalendar] ✅ التقويم الهجري الدقيق + مواقيت adhan-js جاهزة');
