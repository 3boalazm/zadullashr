/* ═══════════════════════════════════════════════════════════════════════════
   زاد — الفيز الثامن: موديول الحج التفاعلي (State Machine)
   ─────────────────────────────────────────────────────────────────────────
   آلة حالة لمناسك الحج — مبنية على بيانات موثّقة (الحج المبرور + مصادر الحج)
   
   • 3 مسارات: التمتع / القران / الإفراد
   • Critical Node: الوقوف بعرفة (فواته = فوات الحج)
   • تتبع كل منسك بحكمه الشرعي
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── 1. تعريف المناسك (موثّقة من المصادر) ────────────────────────────────── */
const HAJJ_MANASIK = [
  { id: 'ihram',        name: 'الإحرام',           time: 'عند الميقات',              type: 'ركن',   leave: 'لا ينعقد الحج أصلاً',           day: 8 },
  { id: 'tawaf_qudum',  name: 'طواف القدوم',       time: 'عند الوصول لمكة',          type: 'سنة',   leave: 'لا شيء عليه',                   day: 8 },
  { id: 'mina_day8',    name: 'التوجه إلى منى',    time: 'اليوم الثامن (التروية)',   type: 'سنة',   leave: 'لا شيء عليه',                   day: 8 },
  { id: 'wuquf_arafah', name: 'الوقوف بعرفة',      time: 'من زوال 9 إلى فجر 10',    type: 'ركن',   leave: 'يفوت الحج بالكامل',             day: 9, critical: true },
  { id: 'muzdalifah',   name: 'المبيت بمزدلفة',    time: 'ليلة العاشر',              type: 'واجب',  leave: 'دم (ذبيحة)',                    day: 10 },
  { id: 'rami_aqaba',   name: 'رمي جمرة العقبة',   time: 'ضحى يوم النحر',            type: 'واجب',  leave: 'دم (ذبيحة)',                    day: 10 },
  { id: 'hady',         name: 'الهدي (النحر)',     time: 'يوم العاشر وأيام التشريق', type: 'واجب',  leave: 'دم أو صيام 10 أيام',           day: 10, forTamattu: true },
  { id: 'halq',         name: 'الحلق أو التقصير',  time: 'يوم العاشر',               type: 'واجب',  leave: 'فدية',                          day: 10 },
  { id: 'tawaf_ifadah', name: 'طواف الإفاضة',      time: 'يوم العاشر أو بعده',       type: 'ركن',   leave: 'لا يتم الحج إلا به',            day: 10 },
  { id: 'say',          name: 'السعي بين الصفا والمروة', time: 'بعد طواف الإفاضة',  type: 'ركن',   leave: 'لا يتم الحج إلا به',            day: 10 },
  { id: 'mina_nights',  name: 'المبيت بمنى',       time: 'ليالي التشريق (11-13)',   type: 'واجب',  leave: 'دم (ذبيحة)',                    day: 11 },
  { id: 'rami_all',     name: 'رمي الجمرات الثلاث', time: 'أيام التشريق بعد الزوال', type: 'واجب',  leave: 'دم (ذبيحة)',                    day: 11 },
  { id: 'tawaf_wada',   name: 'طواف الوداع',       time: 'آخر الأعمال قبل السفر',   type: 'واجب',  leave: 'دم (ذبيحة)',                    day: 13 },
];

/* ── 2. أنواع الإحرام ────────────────────────────────────────────────────── */
const IHRAM_TYPES = {
  tamattu: {
    name: 'التمتع',
    desc: 'يحرم بالعمرة أولاً، يتحلل، ثم يحرم بالحج يوم 8',
    note: 'يحتاج طوافين وسعيين + هدي',
    needsHady: true,
  },
  qiran: {
    name: 'القران',
    desc: 'يحرم بالعمرة والحج معاً، يبقى محرماً حتى العيد',
    note: 'يسقط سعي الحج إن فعله بعد طواف القدوم + هدي',
    needsHady: true,
  },
  ifrad: {
    name: 'الإفراد',
    desc: 'يحرم بالحج فقط، يبقى محرماً حتى العيد',
    note: 'لا هدي عليه',
    needsHady: false,
  },
};

/* ── 3. الفروق بين الرجل والمرأة (موثّقة) ────────────────────────────────── */
const GENDER_DIFFS = [
  { topic: 'اللباس',     male: 'الإزار والرداء (غير مخيط)', female: 'ملابسها الساترة، يحرم النقاب والقفازين' },
  { topic: 'التلبية',    male: 'يرفع صوته',                  female: 'بقدر ما تسمع نفسها' },
  { topic: 'الطواف',     male: 'الرمل والاضطباع',            female: 'لا رمل ولا اضطباع' },
  { topic: 'الحلق',      male: 'يحلق أو يقصّر',              female: 'تقصّر فقط قدر أنملة' },
  { topic: 'مزدلفة',     male: 'المبيت حتى الفجر',           female: 'رُخّص لها المغادرة بعد منتصف الليل' },
  { topic: 'طواف الوداع', male: 'واجب',                      female: 'يُعفى عنه للحائض' },
];

/* ── 4. حالة المستخدم ────────────────────────────────────────────────────── */
const HajjState = {
  ihramType: null,   /* tamattu | qiran | ifrad */
  gender: null,      /* male | female */
  completed: {},     /* { manasikId: timestamp } */
  missed: false,     /* هل فات الوقوف بعرفة؟ */
};

async function loadHajjState() {
  try {
    const saved = await window.ZadStore?.getState('hajjState', null);
    if (saved) Object.assign(HajjState, saved);
  } catch {}
}

async function saveHajjState() {
  try {
    await window.ZadStore?.setState('hajjState', {
      ihramType: HajjState.ihramType,
      gender: HajjState.gender,
      completed: HajjState.completed,
      missed: HajjState.missed,
    });
  } catch {}
}

/* ── 5. منطق State Machine ───────────────────────────────────────────────── */
/* المناسك المرئية حسب نوع الإحرام */
function getVisibleManasik() {
  return HAJJ_MANASIK.filter(m => {
    /* الهدي للمتمتع والقارن فقط */
    if (m.forTamattu && HajjState.ihramType === 'ifrad') return false;
    return true;
  });
}

/* هل يمكن إتمام هذا المنسك الآن؟ (الترتيب) */
function canCompleteManasik(manasikId) {
  const visible = getVisibleManasik();
  const idx = visible.findIndex(m => m.id === manasikId);
  if (idx === 0) return true;
  /* لازم المنسك السابق يكون مكتملاً (للأركان والواجبات) */
  const prev = visible[idx - 1];
  if (prev.type === 'سنة') return true; /* السنن لا تمنع التقدم */
  return !!HajjState.completed[prev.id];
}

/* إتمام منسك */
async function completeManasik(manasikId) {
  /* تحقق من Critical Node — الوقوف بعرفة */
  if (HajjState.missed) {
    if (typeof showToast === 'function') showToast('⚠️ فات الحج — راجع حالتك');
    return;
  }

  if (HajjState.completed[manasikId]) {
    delete HajjState.completed[manasikId];
  } else {
    HajjState.completed[manasikId] = Date.now();
  }
  await saveHajjState();
  renderHajjTracker();
}
window.completeManasik = completeManasik;

/* فحص فوات الوقوف بعرفة */
function checkArafahMissed() {
  const day = window.getDhulHijjahDay ? window.getDhulHijjahDay() : null;
  /* إذا تجاوزنا فجر يوم 10 ولم يُسجَّل الوقوف بعرفة */
  if (day !== null && day >= 10 && !HajjState.completed['wuquf_arafah']) {
    HajjState.missed = true;
    saveHajjState();
    return true;
  }
  return false;
}

/* ── 6. اختيار نوع الإحرام والجنس ────────────────────────────────────────── */
function selectIhramType(type) {
  HajjState.ihramType = type;
  saveHajjState();
  renderHajjTracker();
}
window.selectIhramType = selectIhramType;

function selectGender(g) {
  HajjState.gender = g;
  saveHajjState();
  renderHajjTracker();
}
window.selectGender = selectGender;

/* ── 7. عرض المتتبع ──────────────────────────────────────────────────────── */
function renderHajjTracker() {
  const container = document.getElementById('hajj-state-machine');
  if (!container) return;

  /* المرحلة 1: اختيار نوع الإحرام */
  if (!HajjState.ihramType) {
    container.innerHTML = `
      <div class="hajj-setup">
        <div class="hajj-setup-title">اختر نوع نُسُكك</div>
        ${Object.entries(IHRAM_TYPES).map(([id, t]) => `
          <div class="ihram-card" onclick="selectIhramType('${id}')">
            <div class="ihram-name">${t.name}</div>
            <div class="ihram-desc">${t.desc}</div>
            <div class="ihram-note">${t.note}</div>
          </div>
        `).join('')}
      </div>`;
    return;
  }

  /* المرحلة 2: اختيار الجنس (للفروق الفقهية) */
  if (!HajjState.gender) {
    container.innerHTML = `
      <div class="hajj-setup">
        <div class="hajj-setup-title">لعرض الأحكام الخاصة بك</div>
        <div class="gender-options">
          <button class="gender-btn" onclick="selectGender('male')">👨 رجل</button>
          <button class="gender-btn" onclick="selectGender('female')">👩 امرأة</button>
        </div>
      </div>`;
    return;
  }

  /* فحص الفوات */
  checkArafahMissed();

  /* المرحلة 3: عرض المناسك */
  const visible = getVisibleManasik();
  const ihram = IHRAM_TYPES[HajjState.ihramType];
  const doneCount = Object.keys(HajjState.completed).length;

  let html = `
    <div class="hajj-header">
      <div class="hajj-type-badge">${ihram.name} · ${HajjState.gender === 'male' ? 'رجل' : 'امرأة'}</div>
      <button class="btn btn-ghost" onclick="resetHajj()" style="font-size:12px">تغيير</button>
    </div>`;

  if (HajjState.missed) {
    html += `
      <div class="hajj-missed-banner">
        ⚠️ فات وقت الوقوف بعرفة (انتهى بفجر يوم 10).
        من فاته الوقوف فاته الحج — يتحلل بعمرة ويقضي الحج العام القادم.
      </div>`;
  }

  html += `<div class="hajj-progress-txt">${doneCount} من ${visible.length} منسك</div>`;

  html += `<div class="manasik-timeline">`;
  visible.forEach((m, i) => {
    const done = !!HajjState.completed[m.id];
    const canDo = canCompleteManasik(m.id);
    const isCritical = m.critical;
    html += `
      <div class="manasik-node ${done ? 'done' : ''} ${isCritical ? 'critical' : ''} ${!canDo && !done ? 'locked' : ''}">
        <div class="manasik-marker">${done ? '✓' : i + 1}</div>
        <div class="manasik-body">
          <div class="manasik-name">
            ${m.name}
            <span class="manasik-type type-${m.type === 'ركن' ? 'rukn' : m.type === 'واجب' ? 'wajib' : 'sunnah'}">${m.type}</span>
            ${isCritical ? '<span class="critical-flag">⭐ حرج</span>' : ''}
          </div>
          <div class="manasik-time">🕐 ${m.time}</div>
          ${m.type !== 'سنة' ? `<div class="manasik-leave">⚠️ تركه: ${m.leave}</div>` : ''}
          <button class="manasik-btn ${done ? 'done' : ''}" 
                  onclick="completeManasik('${m.id}')"
                  ${!canDo && !done ? 'disabled' : ''}>
            ${done ? '✅ تم' : canDo ? '☐ أتممت هذا المنسك' : '🔒 أتمم السابق أولاً'}
          </button>
        </div>
      </div>`;
  });
  html += `</div>`;

  /* الفروق الفقهية */
  html += `
    <div class="gender-diffs">
      <div class="gender-diffs-title">أحكام خاصة بـ ${HajjState.gender === 'male' ? 'الرجل' : 'المرأة'}</div>
      ${GENDER_DIFFS.map(d => `
        <div class="gender-diff-row">
          <span class="gd-topic">${d.topic}</span>
          <span class="gd-value">${HajjState.gender === 'male' ? d.male : d.female}</span>
        </div>
      `).join('')}
    </div>`;

  container.innerHTML = html;
}

function resetHajj() {
  if (!confirm('إعادة تعيين متابعة الحج؟')) return;
  HajjState.ihramType = null;
  HajjState.gender = null;
  HajjState.completed = {};
  HajjState.missed = false;
  saveHajjState();
  renderHajjTracker();
}
window.resetHajj = resetHajj;

/* ── 8. الأنماط ──────────────────────────────────────────────────────────── */
const HAJJ_CSS = `
.hajj-setup-title { font-size: 18px; font-weight: 800; margin-bottom: 16px; text-align: center; }
.ihram-card { padding: 16px; border-radius: 14px; border: 2px solid var(--border, #ddd);
  background: var(--sand, #faf9f6); cursor: pointer; margin-bottom: 12px; transition: all .2s; }
.ihram-card:hover { border-color: var(--zad-green-700, #1a5d47); }
.ihram-name { font-size: 16px; font-weight: 800; margin-bottom: 4px; }
.ihram-desc { font-size: 13px; color: var(--ink); margin-bottom: 6px; line-height: 1.6; }
.ihram-note { font-size: 12px; color: var(--zad-green-700, #1a5d47); }
.gender-options { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.gender-btn { padding: 24px; border-radius: 14px; border: 2px solid var(--border, #ddd);
  background: var(--sand, #faf9f6); font-family: inherit; font-size: 16px; font-weight: 700; cursor: pointer; }
.hajj-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.hajj-type-badge { background: rgba(14,59,46,.1); color: var(--zad-green-900, #0e3b2e);
  padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; }
.hajj-missed-banner { background: rgba(192,57,43,.1); border: 1px solid rgba(192,57,43,.3);
  color: var(--zad-coral, #c0392b); padding: 14px; border-radius: 12px; font-size: 13px;
  line-height: 1.7; margin-bottom: 16px; }
.hajj-progress-txt { font-size: 14px; color: var(--muted, #888); margin-bottom: 16px; text-align: center; }
.manasik-timeline { position: relative; }
.manasik-node { display: flex; gap: 12px; margin-bottom: 12px; padding: 14px; border-radius: 14px;
  background: var(--sand, #faf9f6); border: 1.5px solid var(--border, #ddd); transition: all .3s; }
.manasik-node.done { background: rgba(14,59,46,.06); border-color: var(--zad-green-700, #1a5d47); }
.manasik-node.critical { border-color: var(--zad-gold-500, #c9a14a); border-width: 2px; }
.manasik-node.locked { opacity: 0.55; }
.manasik-marker { width: 36px; height: 36px; border-radius: 50%; background: var(--zad-green-900, #0e3b2e);
  color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; flex-shrink: 0; }
.manasik-node.critical .manasik-marker { background: var(--zad-gold-500, #c9a14a); }
.manasik-body { flex: 1; }
.manasik-name { font-size: 15px; font-weight: 800; margin-bottom: 6px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.manasik-type { font-size: 11px; padding: 2px 8px; border-radius: 8px; font-weight: 700; }
.type-rukn { background: rgba(192,57,43,.15); color: #c0392b; }
.type-wajib { background: rgba(184,114,0,.15); color: #b87200; }
.type-sunnah { background: rgba(45,138,106,.15); color: #2d8a6a; }
.critical-flag { font-size: 11px; color: var(--zad-gold-700, #b87200); }
.manasik-time { font-size: 12px; color: var(--muted, #888); margin-bottom: 4px; }
.manasik-leave { font-size: 12px; color: var(--zad-coral, #c0392b); margin-bottom: 10px; }
.manasik-btn { width: 100%; padding: 10px; border-radius: 10px; border: 1.5px solid var(--border, #ddd);
  background: #fff; font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer; }
.manasik-btn.done { background: var(--zad-green-900, #0e3b2e); color: #fff; border: none; }
.manasik-btn:disabled { cursor: not-allowed; opacity: 0.6; }
.gender-diffs { margin-top: 24px; padding: 16px; border-radius: 14px; background: rgba(74,53,128,.05); }
.gender-diffs-title { font-size: 15px; font-weight: 800; margin-bottom: 12px; }
.gender-diff-row { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0;
  border-bottom: 1px solid var(--border, #eee); font-size: 13px; }
.gd-topic { font-weight: 700; flex-shrink: 0; }
.gd-value { color: var(--muted, #666); text-align: left; }
`;

function injectHajjCSS() {
  if (document.getElementById('hajj-css')) return;
  const s = document.createElement('style');
  s.id = 'hajj-css'; s.textContent = HAJJ_CSS;
  document.head.appendChild(s);
}

/* ── تشغيل ───────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  if (document.getElementById('hajj-state-machine')) {
    injectHajjCSS();
    await loadHajjState();
    renderHajjTracker();
    console.log('[HajjModule] ✅ آلة حالة الحج جاهزة');
  }
});

window.HAJJ_MANASIK = HAJJ_MANASIK;
window.IHRAM_TYPES = IHRAM_TYPES;
window.HajjState = HajjState;
