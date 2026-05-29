/* ═══════════════════════════════════════════════════════════════════════════
   زاد — حزمة الإصلاحات والتحسينات (من التحليل الفني)
   ─────────────────────────────────────────────────────────────────────────
   ملاحظة: التطبيق Vanilla JS (مش Next.js)، لذا مشاكل Hydration/SSR
   المذكورة في التحليل غير موجودة أصلاً. نطبّق الإصلاحات الواقعية فقط.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   إصلاح 1: مواقيت الصلاة — Fallback عند رفض/فشل الموقع
   ─────────────────────────────────────────────────────────────────────────
   المشكلة: ظهور --:-- عند رفض إذن الموقع بدون خطة بديلة
   الحل: عند الفشل → IP geolocation → اختيار يدوي للمدينة
   ═══════════════════════════════════════════════════════════════════════════ */

/* مدن رئيسية بإحداثياتها (للاختيار اليدوي) */
const FALLBACK_CITIES = {
  'القاهرة':     { lat: 30.0444, lng: 31.2357, country: 'مصر' },
  'الإسكندرية':  { lat: 31.2001, lng: 29.9187, country: 'مصر' },
  'مكة المكرمة': { lat: 21.4225, lng: 39.8262, country: 'السعودية' },
  'المدينة':     { lat: 24.5247, lng: 39.5692, country: 'السعودية' },
  'الرياض':      { lat: 24.7136, lng: 46.6753, country: 'السعودية' },
  'جدة':         { lat: 21.4858, lng: 39.1925, country: 'السعودية' },
  'دبي':         { lat: 25.2048, lng: 55.2708, country: 'الإمارات' },
  'الكويت':      { lat: 29.3759, lng: 47.9774, country: 'الكويت' },
  'الدوحة':      { lat: 25.2854, lng: 51.5310, country: 'قطر' },
  'عمّان':       { lat: 31.9454, lng: 35.9284, country: 'الأردن' },
  'بغداد':       { lat: 33.3152, lng: 44.3661, country: 'العراق' },
  'الخرطوم':     { lat: 15.5007, lng: 32.5599, country: 'السودان' },
  'بيروت':       { lat: 33.8938, lng: 35.5018, country: 'لبنان' },
  'دمشق':        { lat: 33.5138, lng: 36.2765, country: 'سوريا' },
  'تونس':        { lat: 36.8065, lng: 10.1815, country: 'تونس' },
  'الجزائر':     { lat: 36.7538, lng: 3.0588,  country: 'الجزائر' },
  'الرباط':      { lat: 34.0209, lng: -6.8416, country: 'المغرب' },
  'إسطنبول':     { lat: 41.0082, lng: 28.9784, country: 'تركيا' },
};

const SAVED_LOCATION_KEY = 'zad_saved_location';

/* احصل على الموقع: محفوظ → GPS → IP → يدوي */
async function getLocationWithFallback() {
  /* 1. موقع محفوظ سابقاً */
  const saved = getSavedLocation();
  if (saved) return saved;

  /* 2. جرّب GPS */
  try {
    const pos = await window._getGeoLocation({ timeout: 6000 });
    const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude, source: 'gps' };
    saveLocation(loc);
    return loc;
  } catch (gpsErr) {
    console.log('[Location] GPS فشل، نجرّب IP...');
  }

  /* 3. جرّب IP geolocation */
  try {
    const loc = await getLocationByIP();
    if (loc) { saveLocation(loc); return loc; }
  } catch (ipErr) {
    console.log('[Location] IP فشل، نطلب اختيار يدوي');
  }

  /* 4. اختيار يدوي */
  return null; /* يستدعي showCityPicker */
}
window.getLocationWithFallback = getLocationWithFallback;

function getSavedLocation() {
  try {
    const raw = localStorage.getItem(SAVED_LOCATION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveLocation(loc) {
  try { localStorage.setItem(SAVED_LOCATION_KEY, JSON.stringify({ ...loc, ts: Date.now() })); } catch {}
}

/* IP geolocation عبر خدمة مجانية */
async function getLocationByIP() {
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    if (data.latitude && data.longitude) {
      return { lat: data.latitude, lng: data.longitude, city: data.city, source: 'ip' };
    }
  } catch {}
  return null;
}

/* نافذة اختيار المدينة يدوياً */
function showCityPicker() {
  if (document.getElementById('city-picker-modal')) return;
  const modal = document.createElement('div');
  modal.id = 'city-picker-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.innerHTML = `
    <div style="background:var(--card,#fff);border-radius:20px;padding:24px;width:100%;max-width:400px;max-height:80vh;overflow:auto">
      <h3 style="margin:0 0 8px;font-size:17px">📍 اختر مدينتك</h3>
      <p style="font-size:13px;color:var(--muted,#888);margin:0 0 16px">لحساب مواقيت الصلاة والقبلة بدقة</p>
      <input id="city-search" placeholder="ابحث عن مدينتك..." 
             style="width:100%;padding:12px;border-radius:10px;border:1.5px solid var(--border,#ddd);background:var(--sand,#faf9f6);font-family:inherit;margin-bottom:12px;box-sizing:border-box"
             oninput="filterCities(this.value)">
      <div id="city-list">
        ${Object.entries(FALLBACK_CITIES).map(([name, c]) => `
          <div class="city-option" data-city="${name}" onclick="selectCity('${name}')"
               style="padding:12px 14px;border-radius:10px;cursor:pointer;display:flex;justify-content:space-between;border-bottom:1px solid var(--border,#eee)">
            <span style="font-weight:600">${name}</span>
            <span style="font-size:12px;color:var(--muted,#888)">${c.country}</span>
          </div>
        `).join('')}
      </div>
    </div>`;
  document.body.appendChild(modal);
}
window.showCityPicker = showCityPicker;

function filterCities(q) {
  document.querySelectorAll('.city-option').forEach(el => {
    const name = el.dataset.city;
    el.style.display = name.includes(q.trim()) ? 'flex' : 'none';
  });
}
window.filterCities = filterCities;

function selectCity(name) {
  const c = FALLBACK_CITIES[name];
  if (!c) return;
  saveLocation({ lat: c.lat, lng: c.lng, city: name, source: 'manual' });
  document.getElementById('city-picker-modal')?.remove();
  if (typeof showToast === 'function') showToast(`📍 تم اختيار ${name}`);
  /* أعد حساب المواقيت */
  if (typeof renderPrayerTimesPage === 'function') renderPrayerTimesPage();
  setTimeout(() => location.reload(), 600);
}
window.selectCity = selectCity;

/* ═══════════════════════════════════════════════════════════════════════════
   إصلاح 2: العداد التنازلي — التوقيت من السيرفر لا الجهاز
   ─────────────────────────────────────────────────────────────────────────
   المشكلة: العداد يعتمد على توقيت الجهاز (قد يكون خاطئاً)
   الحل: جلب التوقيت من سيرفر موثوق + حساب الفارق
   ═══════════════════════════════════════════════════════════════════════════ */
let _serverTimeOffset = 0; /* الفارق بين السيرفر والجهاز (ms) */

async function syncServerTime() {
  try {
    const before = Date.now();
    /* استخدم Aladhan API كمصدر وقت (موثوق ومستخدم بالفعل) */
    const res = await fetch('https://api.aladhan.com/v1/currentTime?zone=UTC', { signal: AbortSignal.timeout(5000) });
    const after = Date.now();
    const data = await res.json();
    if (data?.data) {
      const networkDelay = (after - before) / 2;
      const serverTime = new Date(data.data).getTime() + networkDelay;
      _serverTimeOffset = serverTime - after;
      console.log(`[Time] الفارق مع السيرفر: ${Math.round(_serverTimeOffset/1000)} ثانية`);
      /* لو الفارق كبير (>5 دقائق) → نبّه المستخدم */
      if (Math.abs(_serverTimeOffset) > 300000) {
        if (typeof showToast === 'function') {
          showToast('⏰ توقيت جهازك غير دقيق — تم ضبط العدادات تلقائياً');
        }
      }
    }
  } catch {
    _serverTimeOffset = 0; /* fallback لتوقيت الجهاز */
  }
}

/* الوقت المصحّح */
function getCorrectedNow() {
  return new Date(Date.now() + _serverTimeOffset);
}
window.getCorrectedNow = getCorrectedNow;

/* ═══════════════════════════════════════════════════════════════════════════
   إصلاح 3: مشغل الصوت العام — استمرار عبر الصفحات
   ─────────────────────────────────────────────────────────────────────────
   المشكلة: الصوت ينقطع عند الانتقال بين الصفحات
   الحل: مشغل صوت ثابت في الـ DOM + حفظ الحالة في sessionStorage
   ملاحظة: PWA متعدد الصفحات (MPA) — الصوت ينقطع بطبيعته عند التنقل.
   الحل العملي: حفظ موضع التشغيل واستئنافه عند العودة.
   ═══════════════════════════════════════════════════════════════════════════ */
const AUDIO_STATE_KEY = 'zad_audio_state';

function initPersistentAudio() {
  /* احفظ حالة أي audio يُشغَّل */
  document.querySelectorAll('audio').forEach(audio => {
    if (audio._zadTracked) return;
    audio._zadTracked = true;

    audio.addEventListener('play', () => {
      saveAudioState(audio.src, audio.currentTime, true);
    });
    audio.addEventListener('pause', () => {
      saveAudioState(audio.src, audio.currentTime, false);
    });
    audio.addEventListener('timeupdate', () => {
      if (!audio.paused) {
        /* حدّث الموضع كل 3 ثوان فقط */
        if (!audio._lastSave || Date.now() - audio._lastSave > 3000) {
          saveAudioState(audio.src, audio.currentTime, true);
          audio._lastSave = Date.now();
        }
      }
    });

    /* استأنف لو كان نفس المصدر يُشغَّل قبل التنقل */
    const state = getAudioState();
    if (state && state.src === audio.src && state.playing) {
      audio.currentTime = state.time || 0;
      /* لا نشغّل تلقائياً (سياسة المتصفح) لكن نعرض زر استئناف */
      showResumeBar(audio, state.time);
    }
  });
}

function saveAudioState(src, time, playing) {
  try {
    sessionStorage.setItem(AUDIO_STATE_KEY, JSON.stringify({ src, time, playing, ts: Date.now() }));
  } catch {}
}

function getAudioState() {
  try {
    const raw = sessionStorage.getItem(AUDIO_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function showResumeBar(audio, time) {
  if (document.getElementById('audio-resume-bar')) return;
  const bar = document.createElement('div');
  bar.id = 'audio-resume-bar';
  bar.style.cssText = `
    position:fixed;bottom:16px;right:16px;left:16px;z-index:9000;
    background:var(--zad-green-900,#0e3b2e);color:#fff;padding:12px 16px;
    border-radius:14px;display:flex;align-items:center;justify-content:space-between;
    box-shadow:0 8px 24px rgba(0,0,0,.2);font-size:14px;max-width:400px;margin:0 auto;
  `;
  const mins = Math.floor(time / 60), secs = Math.floor(time % 60);
  bar.innerHTML = `
    <span>🎵 استئناف من ${mins}:${String(secs).padStart(2,'0')}؟</span>
    <div style="display:flex;gap:8px">
      <button onclick="this.closest('#audio-resume-bar').remove()" 
              style="background:none;border:none;color:#fff;opacity:.7;cursor:pointer">لا</button>
      <button id="resume-yes" style="background:#fff;color:var(--zad-green-900,#0e3b2e);border:none;padding:6px 14px;border-radius:8px;font-weight:700;cursor:pointer">استئناف</button>
    </div>`;
  document.body.appendChild(bar);
  bar.querySelector('#resume-yes').onclick = () => {
    audio.currentTime = time;
    audio.play().catch(() => {});
    bar.remove();
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   إصلاح 4: الرسائل التشجيعية بدل الأصفار الباردة
   ─────────────────────────────────────────────────────────────────────────
   المشكلة: المستخدم الجديد يرى 0% كثيرة (Cognitive cold start)
   الحل: رسائل ترحيبية تشجيعية مكان الأصفار في أول زيارة
   ═══════════════════════════════════════════════════════════════════════════ */
function replaceZeroStates() {
  /* لو المستخدم جديد (لا بيانات) → رسائل تشجيعية */
  const isNewUser = !localStorage.getItem('zad_v2') && !localStorage.getItem('zad_has_data');

  if (!isNewUser) return;

  /* استبدل نِسب 0% بعبارات تحفيزية */
  document.querySelectorAll('#prog-txt, .prog-txt').forEach(el => {
    if (el.textContent.includes('0 من') || el.textContent.trim() === '0%') {
      el.innerHTML = '<span style="color:var(--zad-green-700,#1a5d47)">ابدأ رحلتك — أول عبادة بانتظارك 🌱</span>';
    }
  });

  /* الإحصائيات الصفرية */
  document.querySelectorAll('.stat-num, #stat-takbeer, #stat-juz').forEach(el => {
    if (el.textContent.trim() === '0' || el.textContent.trim() === '٠') {
      el.style.opacity = '0.5';
    }
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   إصلاح 5: Lazy Loading للوسائط
   ─────────────────────────────────────────────────────────────────────────
   المشكلة: تحميل كل الفيديوهات/الصوتيات يبطئ التحميل الأولي
   الحل: loading="lazy" + تحميل المشغلات عند الحاجة
   ═══════════════════════════════════════════════════════════════════════════ */
function applyLazyLoading() {
  /* صور */
  document.querySelectorAll('img:not([loading])').forEach(img => {
    img.setAttribute('loading', 'lazy');
  });

  /* iframes (يوتيوب) → lazy + facade */
  document.querySelectorAll('iframe[src*="youtube"]:not([loading])').forEach(iframe => {
    iframe.setAttribute('loading', 'lazy');
  });

  /* فيديو → preload metadata فقط */
  document.querySelectorAll('video:not([preload])').forEach(video => {
    video.setAttribute('preload', 'metadata');
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   إصلاح 6: مشاركة الإنجازات كصورة (Social Sharing)
   ─────────────────────────────────────────────────────────────────────────
   توليد صورة للوسام/الإنجاز للمشاركة على واتساب/فيسبوك
   ═══════════════════════════════════════════════════════════════════════════ */
async function shareAchievement(title, subtitle) {
  /* أنشئ canvas بتصميم جذاب */
  const canvas = document.createElement('canvas');
  canvas.width = 1080; canvas.height = 1080;
  const ctx = canvas.getContext('2d');

  /* خلفية متدرجة */
  const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
  grad.addColorStop(0, '#0e3b2e');
  grad.addColorStop(1, '#1a5d47');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1080, 1080);

  /* النصوص */
  ctx.textAlign = 'center';
  ctx.fillStyle = '#c9a14a';
  ctx.font = 'bold 80px Arial';
  ctx.fillText('زاد العشر', 540, 300);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 64px Arial';
  ctx.fillText(title, 540, 540);

  if (subtitle) {
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.font = '44px Arial';
    ctx.fillText(subtitle, 540, 640);
  }

  ctx.fillStyle = 'rgba(255,255,255,.6)';
  ctx.font = '36px Arial';
  ctx.fillText('zadullashr.vercel.app', 540, 980);

  /* حوّل لصورة وشارك */
  canvas.toBlob(async (blob) => {
    const file = new File([blob], 'zad-achievement.png', { type: 'image/png' });
    /* Web Share API لو مدعوم */
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'زاد العشر', text: title });
        return;
      } catch {}
    }
    /* Fallback: تنزيل */
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'zad-achievement.png';
    a.click();
    URL.revokeObjectURL(url);
    if (typeof showToast === 'function') showToast('✅ تم حفظ الصورة — شاركها مع أحبابك');
  }, 'image/png');
}
window.shareAchievement = shareAchievement;

/* ═══════════════════════════════════════════════════════════════════════════
   تشغيل كل الإصلاحات
   ═══════════════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  syncServerTime();              /* إصلاح 2 */
  initPersistentAudio();         /* إصلاح 3 */
  replaceZeroStates();           /* إصلاح 4 */
  applyLazyLoading();            /* إصلاح 5 */

  /* إصلاح 1: لو صفحة فيها مواقيت ولا يوجد موقع محفوظ */
  if (document.getElementById('prayer-times-container') || document.querySelector('[data-time24]')) {
    getLocationWithFallback().then(loc => {
      if (!loc) {
        /* لا موقع → اعرض اختيار المدينة */
        setTimeout(showCityPicker, 1000);
      }
    });
  }

  console.log('[ZadFixes] ✅ حزمة الإصلاحات مطبّقة');
});
