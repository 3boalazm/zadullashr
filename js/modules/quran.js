/* ═══════════════════════════════════════════════════════════════════════════
   زاد — الفيز السابع: موديول القرآن الشامل
   ─────────────────────────────────────────────────────────────────────────
   تحسينات: خطط ختمة متعددة + تتبع الحفظ + إعداد APIs + الرسم العثماني
   
   ملاحظة: التطبيق فيه بالفعل مصحف (mushaf.html) وتسميع (tasmee.html)
   هذه الطبقة تضيف: خطط ختمة مرنة + تتبع حفظ + اختيار API قرآني
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── 1. خطط الختمة المرنة ────────────────────────────────────────────────── */
const KHATMA_PLANS = {
  'ashr-10':   { name: 'ختمة العشر',    days: 10, juzPerDay: 3,    desc: '3 أجزاء يومياً — تختم في العشر' },
  'monthly':   { name: 'ختمة شهرية',    days: 30, juzPerDay: 1,    desc: 'جزء واحد يومياً' },
  'two-month': { name: 'ختمة الشهرين',  days: 60, juzPerDay: 0.5,  desc: 'نصف جزء يومياً — للمبتدئين' },
  'weekly':    { name: 'ختمة أسبوعية',  days: 7,  juzPerDay: 4.3,  desc: 'للحُفّاظ — ختمة كل أسبوع' },
};

function getActiveKhatmaPlan() {
  return localStorage.getItem('zad_khatma_plan') || 'ashr-10';
}
function setKhatmaPlan(planId) {
  localStorage.setItem('zad_khatma_plan', planId);
  renderKhatmaPlans();
  if (typeof showToast === 'function') showToast(`✅ ${KHATMA_PLANS[planId].name}`);
}
window.setKhatmaPlan = setKhatmaPlan;

function renderKhatmaPlans() {
  const container = document.getElementById('khatma-plans');
  if (!container) return;
  const active = getActiveKhatmaPlan();
  container.innerHTML = Object.entries(KHATMA_PLANS).map(([id, plan]) => `
    <div class="khatma-plan-card ${id === active ? 'active' : ''}" onclick="setKhatmaPlan('${id}')">
      <div class="kp-name">${plan.name}</div>
      <div class="kp-desc">${plan.desc}</div>
      <div class="kp-days">${plan.days} يوم</div>
    </div>
  `).join('');
}

/* ── 2. تتبع الحفظ ───────────────────────────────────────────────────────── */
/* السور الـ 114 مع عدد آياتها (للحفظ) */
const SURAHS_SHORT = [
  { n: 114, name: 'الناس', ayat: 6 },
  { n: 113, name: 'الفلق', ayat: 5 },
  { n: 112, name: 'الإخلاص', ayat: 4 },
  { n: 111, name: 'المسد', ayat: 5 },
  { n: 110, name: 'النصر', ayat: 3 },
  { n: 109, name: 'الكافرون', ayat: 6 },
  { n: 108, name: 'الكوثر', ayat: 3 },
  { n: 107, name: 'الماعون', ayat: 7 },
  { n: 106, name: 'قريش', ayat: 4 },
  { n: 105, name: 'الفيل', ayat: 5 },
  /* ... جزء عمّ — يمكن التوسعة لاحقاً */
];

async function getHifzProgress() {
  try {
    return await window.ZadStore?.getState('hifzProgress', {}) || {};
  } catch { return {}; }
}

async function toggleHifz(surahNum) {
  const progress = await getHifzProgress();
  if (progress[surahNum]) {
    delete progress[surahNum];
  } else {
    progress[surahNum] = { masteredAt: Date.now(), reviewCount: 0 };
  }
  await window.ZadStore?.setState('hifzProgress', progress);
  renderHifzTracker();
}
window.toggleHifz = toggleHifz;

async function renderHifzTracker() {
  const container = document.getElementById('hifz-tracker');
  if (!container) return;
  const progress = await getHifzProgress();
  const memorized = Object.keys(progress).length;

  container.innerHTML = `
    <div class="hifz-stats">
      <div class="hifz-stat-num">${memorized}</div>
      <div class="hifz-stat-lbl">سورة محفوظة من ${SURAHS_SHORT.length} (جزء عمّ)</div>
    </div>
    <div class="hifz-grid">
      ${SURAHS_SHORT.map(s => `
        <div class="hifz-surah ${progress[s.n] ? 'memorized' : ''}" onclick="toggleHifz(${s.n})">
          <span class="hifz-surah-name">${s.name}</span>
          <span class="hifz-surah-ayat">${s.ayat} آيات</span>
          ${progress[s.n] ? '<span class="hifz-check">✓</span>' : ''}
        </div>
      `).join('')}
    </div>`;
}

/* ── 3. إعداد APIs القرآنية ──────────────────────────────────────────────── */
const QURAN_APIS = {
  primary: {
    name: 'Quran.com API',
    base: 'https://api.quran.com/api/v4',
    features: ['نص عثماني', 'تفسير (ابن كثير، السعدي، الطبري)', 'تلاوة', 'ترجمة 40+ لغة'],
    needsKey: false,
  },
  fallback: {
    name: 'AlQuran.cloud',
    base: 'https://api.alquran.cloud/v1',
    features: ['نص', 'تلاوة', 'بسيط بدون مفتاح'],
    needsKey: false,
  },
};

/* جلب آية مع تفسير (Quran.com مع fallback) */
async function fetchVerse(surah, ayah) {
  try {
    /* المحاولة الأولى: Quran.com */
    const url = `${QURAN_APIS.primary.base}/verses/by_key/${surah}:${ayah}?fields=text_uthmani&translations=131`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      return {
        text: data.verse?.text_uthmani,
        translation: data.verse?.translations?.[0]?.text,
        source: 'Quran.com',
      };
    }
    throw new Error('primary failed');
  } catch {
    try {
      /* Fallback: AlQuran.cloud */
      const url = `${QURAN_APIS.fallback.base}/ayah/${surah}:${ayah}/quran-uthmani`;
      const res = await fetch(url);
      const data = await res.json();
      return { text: data.data?.text, translation: null, source: 'AlQuran.cloud' };
    } catch {
      return null;
    }
  }
}
window.fetchVerse = fetchVerse;

/* ── 4. الأنماط ──────────────────────────────────────────────────────────── */
const QURAN_CSS = `
#khatma-plans { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
.khatma-plan-card { padding: 16px; border-radius: 14px; border: 2px solid var(--border, #ddd);
  background: var(--sand, #faf9f6); cursor: pointer; transition: all .2s; text-align: center; }
.khatma-plan-card.active { border-color: var(--zad-green-900, #0e3b2e); background: rgba(14,59,46,.06); }
.kp-name { font-weight: 800; font-size: 15px; margin-bottom: 4px; }
.kp-desc { font-size: 12px; color: var(--muted, #888); margin-bottom: 8px; line-height: 1.5; }
.kp-days { font-size: 13px; font-weight: 700; color: var(--zad-green-700, #1a5d47); }
.hifz-stats { text-align: center; margin-bottom: 20px; }
.hifz-stat-num { font-size: 42px; font-weight: 900; color: var(--zad-green-900, #0e3b2e); }
.hifz-stat-lbl { font-size: 13px; color: var(--muted, #888); }
.hifz-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 8px; }
.hifz-surah { position: relative; padding: 12px 8px; border-radius: 10px; border: 1.5px solid var(--border, #ddd);
  background: var(--sand, #faf9f6); cursor: pointer; text-align: center; transition: all .2s; }
.hifz-surah.memorized { background: rgba(14,59,46,.1); border-color: var(--zad-green-700, #1a5d47); }
.hifz-surah-name { display: block; font-weight: 700; font-size: 14px; }
.hifz-surah-ayat { display: block; font-size: 11px; color: var(--muted, #888); margin-top: 2px; }
.hifz-check { position: absolute; top: 4px; left: 4px; color: var(--zad-green-700, #1a5d47); font-weight: 900; }
`;

function injectQuranCSS() {
  if (document.getElementById('quran-module-css')) return;
  const s = document.createElement('style');
  s.id = 'quran-module-css'; s.textContent = QURAN_CSS;
  document.head.appendChild(s);
}

/* ── تشغيل ───────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const hasModule = document.getElementById('khatma-plans') || document.getElementById('hifz-tracker');
  if (hasModule) {
    injectQuranCSS();
    renderKhatmaPlans();
    renderHifzTracker();
    console.log('[QuranModule] ✅ موديول القرآن جاهز');
  }
});

window.KHATMA_PLANS = KHATMA_PLANS;
window.QURAN_APIS = QURAN_APIS;
