/* ═══════════════════════════════════════════════════════════════════════════
   زاد — الفيز السادس: موديول الزكاة المتكامل
   ─────────────────────────────────────────────────────────────────────────
   حاسبة زكاة شرعية بخمس خطوات + جدول الأنصبة الموثّق + حفظ في IndexedDB
   
   البيانات الشرعية مصدرها (موثّقة من NotebookLM): القرضاوي + AAOIFI + ZATCA
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── 1. جدول الأنصبة الشرعية الموثّق ─────────────────────────────────────── */
const NISAB_DATA = {
  gold: {
    name: 'الذهب',
    nisabGrams: 85,        /* 85 جرام ذهب خالص عيار 24 */
    rate: 0.025,           /* ربع العشر = 2.5% */
    fixed: true,
    note: 'النصاب 85 جرام من الذهب الخالص (عيار 24). العيارات الأخرى تُحسب بنسبة خلوصها.',
    source: 'القرضاوي · AAOIFI معيار 35',
  },
  silver: {
    name: 'الفضة',
    nisabGrams: 595,       /* 595 جرام فضة خالصة */
    rate: 0.025,
    fixed: true,
    note: 'النصاب 595 جرام من الفضة الخالصة.',
    source: 'القرضاوي · AAOIFI معيار 35',
  },
  cash: {
    name: 'النقود وعروض التجارة',
    nisabRef: 'gold',      /* النصاب = ما يعادل نصاب الذهب */
    rate: 0.025,
    fixed: false,          /* القيمة متغيرة بسعر الذهب */
    note: 'نصاب النقود = ما يعادل قيمة 85 جرام ذهب.',
    source: 'القرضاوي · AAOIFI',
  },
};

/* عيارات الذهب ونسب خلوصها لحساب النصاب الصحيح */
const GOLD_KARAT_PURITY = {
  24: 1.000,
  22: 0.917,
  21: 0.875,
  18: 0.750,
};

/* ── 2. حالة الحاسبة ─────────────────────────────────────────────────────── */
const ZakatCalc = {
  step: 1,
  data: {
    totalMoney: 0,    /* إجمالي الأموال */
    debts: 0,         /* الديون المستحقة */
    goldPriceG: 0,    /* سعر جرام الذهب عيار 24 */
    hawlPassed: null, /* هل مرّ الحول؟ */
  },

  /* الخطوة 3: حساب النصاب */
  get nisabValue() {
    return NISAB_DATA.gold.nisabGrams * this.data.goldPriceG; /* 85 × سعر الجرام */
  },

  /* صافي المال بعد خصم الديون */
  get netMoney() {
    return Math.max(0, this.data.totalMoney - this.data.debts);
  },

  /* هل بلغ النصاب؟ */
  get reachesNisab() {
    return this.data.goldPriceG > 0 && this.netMoney >= this.nisabValue;
  },

  /* الزكاة المستحقة */
  get zakatDue() {
    if (!this.reachesNisab || !this.data.hawlPassed) return 0;
    return this.netMoney * NISAB_DATA.cash.rate; /* 2.5% */
  },
};

/* ── 3. خطوات الحاسبة (Multi-Step Form) ─────────────────────────────────── */
const ZAKAT_STEPS = [
  {
    n: 1,
    title: 'إجمالي أموالك',
    question: 'ما مجموع أموالك النقدية؟ (كاش + أرصدة بنكية + ودائع + عروض تجارة)',
    field: 'totalMoney',
    hint: 'اجمع كل النقود التي تملكها بعملة واحدة',
    ruling: 'الزكاة واجبة في النقود وعموم الأموال النامية — القرضاوي',
  },
  {
    n: 2,
    title: 'الديون المستحقة',
    question: 'هل عليك ديون حالّة تستحق السداد هذا العام؟',
    field: 'debts',
    hint: 'الدين الذي ينقص النصاب يُخصم من الوعاء الزكوي',
    ruling: 'يُخصم الدين الحالّ من الوعاء الزكوي قبل حساب الزكاة',
  },
  {
    n: 3,
    title: 'تحديد النصاب',
    question: 'ما سعر جرام الذهب عيار 24 اليوم بعملتك؟',
    field: 'goldPriceG',
    hint: 'النصاب = 85 جرام × سعر الجرام. يمكنك إدخال السعر يدوياً.',
    ruling: 'النصاب المعتبر للنقود = ما يعادل 85 جرام ذهب خالص',
  },
  {
    n: 4,
    title: 'شرط الحول',
    question: 'هل مرّ عام هجري كامل (354 يوماً) على ملكيتك للمال فوق النصاب؟',
    field: 'hawlPassed',
    type: 'boolean',
    hint: 'يُشترط لوجوب زكاة النقود حولان الحول (مرور سنة قمرية)',
    ruling: 'لا زكاة في المال حتى يحول عليه الحول — متفق عليه',
  },
  {
    n: 5,
    title: 'النتيجة',
    question: 'مقدار الزكاة الواجبة',
    ruling: 'مقدار زكاة النقدين ربع العشر (2.5%)',
  },
];

/* ── 4. عرض الحاسبة ──────────────────────────────────────────────────────── */
function renderZakatWizard() {
  const container = document.getElementById('zakat-wizard');
  if (!container) return;

  const step = ZAKAT_STEPS[ZakatCalc.step - 1];
  const isLast = ZakatCalc.step === 5;

  /* شريط التقدم */
  const progressDots = ZAKAT_STEPS.map((s, i) =>
    `<div class="zk-dot ${i + 1 <= ZakatCalc.step ? 'active' : ''}" 
          title="${s.title}">${i + 1}</div>`
  ).join('<div class="zk-dot-line"></div>');

  let bodyHtml = '';

  if (isLast) {
    /* صفحة النتيجة */
    const reaches = ZakatCalc.reachesNisab;
    const hawl = ZakatCalc.data.hawlPassed;
    const due = ZakatCalc.zakatDue;

    if (!reaches) {
      bodyHtml = `
        <div class="zk-result zk-no-nisab">
          <div class="zk-result-icon">ℹ️</div>
          <div class="zk-result-title">لم يبلغ مالك النصاب</div>
          <div class="zk-result-detail">
            صافي مالك: <strong>${fmtMoney(ZakatCalc.netMoney)}</strong><br>
            النصاب المطلوب: <strong>${fmtMoney(ZakatCalc.nisabValue)}</strong> (85 جرام ذهب)<br><br>
            لا زكاة عليك حالياً. تابع متى بلغ مالك النصاب.
          </div>
        </div>`;
    } else if (!hawl) {
      bodyHtml = `
        <div class="zk-result zk-no-hawl">
          <div class="zk-result-icon">⏳</div>
          <div class="zk-result-title">بلغت النصاب — لكن لم يحُل الحول بعد</div>
          <div class="zk-result-detail">
            مالك بلغ النصاب (${fmtMoney(ZakatCalc.nisabValue)})، لكن الزكاة لا تجب
            حتى يمر عام هجري كامل على ملكيتك للنصاب.<br><br>
            سجّل تاريخ بلوغ النصاب وعُد بعد تمام الحول.
          </div>
        </div>`;
    } else {
      bodyHtml = `
        <div class="zk-result zk-due">
          <div class="zk-result-icon">✅</div>
          <div class="zk-result-title">الزكاة الواجبة عليك</div>
          <div class="zk-result-amount">${fmtMoney(due)}</div>
          <div class="zk-result-detail">
            صافي المال: ${fmtMoney(ZakatCalc.netMoney)}<br>
            × 2.5% (ربع العشر) = <strong>${fmtMoney(due)}</strong>
          </div>
          <button class="btn btn-primary" onclick="saveZakatResult()" style="margin-top:16px">
            💾 حفظ هذا الحساب
          </button>
        </div>`;
    }
    bodyHtml += `<div class="zk-ruling-note">📖 ${step.ruling}</div>`;
  } else {
    /* خطوات الإدخال */
    const inputHtml = step.type === 'boolean'
      ? `<div class="zk-bool-options">
           <button class="zk-bool-btn ${ZakatCalc.data.hawlPassed === true ? 'active' : ''}" 
                   onclick="setZakatField('hawlPassed', true)">نعم، مرّ الحول</button>
           <button class="zk-bool-btn ${ZakatCalc.data.hawlPassed === false ? 'active' : ''}" 
                   onclick="setZakatField('hawlPassed', false)">لا، لم يمر بعد</button>
         </div>`
      : `<input type="number" inputmode="decimal" class="zk-input" id="zk-field-${step.field}"
                value="${ZakatCalc.data[step.field] || ''}" placeholder="0"
                oninput="setZakatField('${step.field}', parseFloat(this.value)||0)">`;

    bodyHtml = `
      <div class="zk-step-title">${step.title}</div>
      <div class="zk-question">${step.question}</div>
      ${inputHtml}
      <div class="zk-hint">💡 ${step.hint}</div>
      <div class="zk-ruling-note">📖 ${step.ruling}</div>`;
  }

  container.innerHTML = `
    <div class="zk-progress">${progressDots}</div>
    <div class="zk-body">${bodyHtml}</div>
    <div class="zk-nav">
      ${ZakatCalc.step > 1 ? `<button class="btn btn-ghost" onclick="zakatPrev()">→ السابق</button>` : '<span></span>'}
      ${!isLast ? `<button class="btn btn-primary" onclick="zakatNext()" id="zk-next-btn">التالي ←</button>` : 
        `<button class="btn btn-ghost" onclick="zakatRestart()">حساب جديد</button>`}
    </div>`;
}

function fmtMoney(n) {
  return (n || 0).toLocaleString('ar-EG', { maximumFractionDigits: 2 }) + ' ج';
}

/* ── 5. التنقل بين الخطوات ───────────────────────────────────────────────── */
function setZakatField(field, value) {
  ZakatCalc.data[field] = value;
  /* لو حقل منطقي → حدّث العرض فوراً */
  if (field === 'hawlPassed') renderZakatWizard();
}
window.setZakatField = setZakatField;

function zakatNext() {
  /* تحقق من صحة الخطوة الحالية */
  const step = ZAKAT_STEPS[ZakatCalc.step - 1];
  if (step.field && step.type !== 'boolean') {
    const val = ZakatCalc.data[step.field];
    if (step.field === 'goldPriceG' && (!val || val <= 0)) {
      if (typeof showToast === 'function') showToast('⚠️ أدخل سعر جرام الذهب أولاً');
      return;
    }
  }
  if (step.field === 'hawlPassed' && ZakatCalc.data.hawlPassed === null) {
    if (typeof showToast === 'function') showToast('⚠️ اختر إجابة أولاً');
    return;
  }
  if (ZakatCalc.step < 5) { ZakatCalc.step++; renderZakatWizard(); }
}
window.zakatNext = zakatNext;

function zakatPrev() {
  if (ZakatCalc.step > 1) { ZakatCalc.step--; renderZakatWizard(); }
}
window.zakatPrev = zakatPrev;

function zakatRestart() {
  ZakatCalc.step = 1;
  ZakatCalc.data = { totalMoney: 0, debts: 0, goldPriceG: 0, hawlPassed: null };
  renderZakatWizard();
}
window.zakatRestart = zakatRestart;

/* ── 6. حفظ النتيجة في IndexedDB ─────────────────────────────────────────── */
async function saveZakatResult() {
  const record = {
    totalMoney: ZakatCalc.data.totalMoney,
    debts:      ZakatCalc.data.debts,
    netMoney:   ZakatCalc.netMoney,
    goldPriceG: ZakatCalc.data.goldPriceG,
    nisab:      ZakatCalc.nisabValue,
    zakatDue:   ZakatCalc.zakatDue,
  };

  try {
    if (window.ZadStore?.saveZakatCalc) {
      await window.ZadStore.saveZakatCalc(record);
    }
    if (typeof showToast === 'function') showToast('💾 تم حفظ حساب الزكاة');
    renderZakatHistory();
  } catch (e) {
    if (typeof showToast === 'function') showToast('تعذّر الحفظ');
  }
}
window.saveZakatResult = saveZakatResult;

/* ── 7. سجل حسابات الزكاة السابقة ────────────────────────────────────────── */
async function renderZakatHistory() {
  const container = document.getElementById('zakat-history');
  if (!container) return;
  try {
    const history = window.ZadStore?.getZakatHistory ? await window.ZadStore.getZakatHistory() : [];
    if (!history.length) { container.innerHTML = ''; return; }
    container.innerHTML = `
      <div class="zk-history-title">سجل حساباتك السابقة</div>
      ${history.slice(0, 5).map(h => `
        <div class="zk-history-row">
          <span>${h.date}</span>
          <span>${fmtMoney(h.zakatDue)}</span>
        </div>`).join('')}`;
  } catch (e) {}
}

/* ── 8. الأنماط ──────────────────────────────────────────────────────────── */
const ZAKAT_CSS = `
#zakat-wizard { max-width: 480px; margin: 0 auto; }
.zk-progress { display: flex; align-items: center; justify-content: center; margin-bottom: 24px; }
.zk-dot { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center;
  justify-content: center; background: var(--sand, #f0f0ec); color: var(--muted, #888);
  font-weight: 700; font-size: 14px; border: 2px solid var(--border, #ddd); transition: all .3s; }
.zk-dot.active { background: var(--zad-green-900, #0e3b2e); color: #fff; border-color: var(--zad-green-900, #0e3b2e); }
.zk-dot-line { width: 24px; height: 2px; background: var(--border, #ddd); }
.zk-body { min-height: 200px; padding: 20px 0; }
.zk-step-title { font-size: 20px; font-weight: 800; margin-bottom: 8px; color: var(--ink); }
.zk-question { font-size: 15px; color: var(--ink); margin-bottom: 16px; line-height: 1.6; }
.zk-input { width: 100%; padding: 16px; font-size: 20px; text-align: center; border-radius: 12px;
  border: 2px solid var(--border, #ddd); background: var(--sand, #faf9f6); font-family: inherit;
  box-sizing: border-box; direction: ltr; }
.zk-input:focus { border-color: var(--zad-green-700, #1a5d47); outline: none; }
.zk-bool-options { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.zk-bool-btn { padding: 18px; border-radius: 12px; border: 2px solid var(--border, #ddd);
  background: var(--sand, #faf9f6); font-family: inherit; font-size: 15px; font-weight: 700;
  cursor: pointer; transition: all .2s; }
.zk-bool-btn.active { background: rgba(14,59,46,.1); border-color: var(--zad-green-900, #0e3b2e); }
.zk-hint { font-size: 13px; color: var(--muted, #888); margin-top: 12px; }
.zk-ruling-note { font-size: 13px; color: var(--zad-green-700, #1a5d47); margin-top: 12px;
  padding: 10px 14px; background: rgba(14,59,46,.05); border-radius: 10px;
  border-right: 3px solid var(--zad-green-700, #1a5d47); }
.zk-nav { display: flex; justify-content: space-between; align-items: center; margin-top: 24px; }
.zk-result { text-align: center; padding: 20px; }
.zk-result-icon { font-size: 48px; margin-bottom: 12px; }
.zk-result-title { font-size: 18px; font-weight: 800; margin-bottom: 12px; }
.zk-result-amount { font-size: 36px; font-weight: 900; color: var(--zad-green-900, #0e3b2e); margin: 16px 0; }
.zk-result-detail { font-size: 14px; color: var(--muted, #666); line-height: 1.8; }
.zk-history-title, .zk-history-row { font-size: 14px; }
.zk-history-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border, #eee); }
`;

function injectZakatCSS() {
  if (document.getElementById('zakat-css')) return;
  const s = document.createElement('style');
  s.id = 'zakat-css'; s.textContent = ZAKAT_CSS;
  document.head.appendChild(s);
}

/* ── تشغيل ───────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('zakat-wizard')) {
    injectZakatCSS();
    renderZakatWizard();
    renderZakatHistory();
    console.log('[ZakatModule] ✅ حاسبة الزكاة جاهزة');
  }
});

window.NISAB_DATA = NISAB_DATA;
window.ZakatCalc = ZakatCalc;
