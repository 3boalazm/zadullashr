/* ═══════════════════════════════════════════════════════════════════════════
   زاد — إصلاح GPS والموقع الجغرافي
   ─────────────────────────────────────────────────────────────────────────
   - يحتفظ بآخر موقع ناجح ويستخدمه حتى التحديث
   - يطلب الـ permission صح عبر user gesture
   - يعالج كل حالات الرفض والـ timeout
   ═══════════════════════════════════════════════════════════════════════════ */

const GPS_KEY = 'zad_last_location';
const GPS_MAX_AGE = 24 * 3600 * 1000; /* 24 ساعة */

/* احفظ موقع ناجح */
function saveGPSLocation(lat, lng, cityName) {
  try {
    localStorage.setItem(GPS_KEY, JSON.stringify({
      lat, lng, city: cityName || '', ts: Date.now()
    }));
    console.log(`[GPS] ✅ حُفظ الموقع: ${lat.toFixed(3)}, ${lng.toFixed(3)}`);
  } catch {}
}

/* اجلب آخر موقع محفوظ (سواء قديم أو حديث) */
function getLastSavedGPS() {
  try {
    const raw = localStorage.getItem(GPS_KEY) || localStorage.getItem('zad_saved_location');
    if (!raw) return null;
    const loc = JSON.parse(raw);
    return loc.lat && loc.lng ? loc : null;
  } catch { return null; }
}

/* هل الموقع حديث (أقل من 24 ساعة)؟ */
function isGPSFresh(loc) {
  return loc && loc.ts && (Date.now() - loc.ts) < GPS_MAX_AGE;
}

/* طلب الإذن صح — يجب استدعاؤه من user gesture (onclick) */
async function requestGPSWithFeedback(callback) {
  const btn = document.getElementById('gps-request-btn');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ جارٍ تحديد موقعك...'; }

  /* 1. فحص حالة الـ permission أولاً */
  if (navigator.permissions) {
    try {
      const status = await navigator.permissions.query({ name: 'geolocation' });
      if (status.state === 'denied') {
        showGPSError('تم رفض إذن الموقع من قبل. يرجى السماح يدوياً من إعدادات المتصفح.', btn);
        return;
      }
    } catch {}
  }

  if (!navigator.geolocation) {
    showGPSError('متصفحك لا يدعم تحديد الموقع.', btn);
    return;
  }

  /* 2. اطلب الموقع */
  const opts = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      saveGPSLocation(lat, lng);
      if (btn) { btn.disabled = false; btn.textContent = '✅ تم تحديد موقعك'; }
      setTimeout(() => { if (btn) btn.textContent = '📍 تحديث الموقع'; }, 2000);
      if (callback) callback(lat, lng);
      /* أعد تحميل مواقيت الصلاة */
      if (typeof fetchPrayerTimesIfPossible === 'function') {
        fetchPrayerTimesIfPossible().then(t => {
          if (t && typeof initPrayerTimesPage === 'function') initPrayerTimesPage();
        });
      }
    },
    (err) => {
      let msg = 'تعذّر تحديد موقعك.';
      if (err.code === 1) msg = 'رفضت إذن الموقع. اسمح يدوياً من إعدادات المتصفح.';
      if (err.code === 2) msg = 'الموقع غير متاح. جرّب الاتصال بالإنترنت أو GPS.';
      if (err.code === 3) msg = 'استغرق التحديد وقتاً طويلاً. جرّب مرة أخرى.';
      showGPSError(msg, btn);
      /* استخدم آخر موقع محفوظ كـ fallback */
      const last = getLastSavedGPS();
      if (last && callback) callback(last.lat, last.lng);
    },
    opts
  );
}

function showGPSError(msg, btn) {
  if (btn) { btn.disabled = false; btn.textContent = '📍 تحديث الموقع'; }
  if (typeof showToast === 'function') showToast('⚠️ ' + msg);
  else alert(msg);
}

/* ── استبدل fetchPrayerTimesIfPossible لتستخدم آخر موقع محفوظ أولاً ── */
const _origFetch = window.fetchPrayerTimesIfPossible;
window.fetchPrayerTimesIfPossible = async function() {
  /* أولاً: جرّب آخر موقع محفوظ (سريع ومضمون) */
  const last = getLastSavedGPS();
  if (last) {
    try {
      const today = new Date().toLocaleDateString('en-CA');
      const url = `https://api.aladhan.com/v1/timings/${today}?latitude=${last.lat}&longitude=${last.lng}&method=4`;
      const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
      const data = await r.json();
      if (data?.data?.timings?.Maghrib) {
        const [hh, mm] = data.data.timings.Maghrib.split(':').map(Number);
        const d = new Date();
        console.log(`[GPS] ✅ مواقيت محمّلة من آخر موقع (${last.city || last.lat.toFixed(2)})`);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate(), hh, mm, 0);
      }
    } catch {}
  }
  /* ثانياً: جرّب GPS الحالي (سيطلب permission لو لازم) */
  if (_origFetch) return _origFetch();
  return null;
};

/* أضف حدث onclick لزر GPS لو موجود في الصفحة */
document.addEventListener('DOMContentLoaded', () => {
  /* أي زر بيحمل id أو class GPS */
  const gpsBtns = document.querySelectorAll('#gps-btn, #gps-request-btn, [data-action="gps"], .gps-detect-btn');
  gpsBtns.forEach(btn => {
    btn.addEventListener('click', () => requestGPSWithFeedback());
  });

  /* لو في صفحة المواقيت: حمّل من آخر موقع فوراً */
  if (document.getElementById('prayers-container') || document.getElementById('prayer-times-container')) {
    const last = getLastSavedGPS();
    if (last) {
      console.log(`[GPS] استخدام آخر موقع: ${last.city || last.lat.toFixed(2)}`);
      /* تحديث مؤشر الموقع في الصفحة */
      const locLabel = document.getElementById('location-label') || document.getElementById('city-name');
      if (locLabel && last.city) locLabel.textContent = last.city;
    }
  }

  console.log('[GPSFix] ✅ إصلاح GPS جاهز');
});

window.requestGPSWithFeedback = requestGPSWithFeedback;
window.saveGPSLocation = saveGPSLocation;
window.getLastSavedGPS = getLastSavedGPS;
