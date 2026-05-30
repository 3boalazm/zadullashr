/* ═══════════════════════════════════════════════════════════════════════════
   زاد — عارض أقسام الأذكار الكاملة
   ─────────────────────────────────────────────────────────────────────────
   يعرض كل قسم بعدّاد لكل ذكر + فضله + مصدره، ويحفظ التقدم في IndexedDB.
   يتحقق من اكتمال كل ذكر (نص + عدد + مصدر) قبل العرض.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── التحقق من اكتمال كل ذكر ─────────────────────────────────────────────── */
function validateAdhkarCompleteness() {
  const db = window.ADHKAR_DATABASE;
  if (!db) return { ok: false, issues: ['قاعدة البيانات غير محمّلة'] };

  const issues = [];
  let total = 0;

  Object.values(db).forEach(section => {
    section.items.forEach((item, i) => {
      total++;
      const ref = `${section.title}[${i + 1}]`;
      if (!item.ar || item.ar.trim().length < 5) issues.push(`${ref}: نص ناقص`);
      if (!item.count || item.count < 1)         issues.push(`${ref}: عدد غير صحيح`);
      if (!item.source)                          issues.push(`${ref}: مصدر ناقص`);
      if (!item.label)                           issues.push(`${ref}: عنوان ناقص`);
    });
  });

  return { ok: issues.length === 0, total, issues };
}
window.validateAdhkar = validateAdhkarCompleteness;

/* ── حالة العدّادات ──────────────────────────────────────────────────────── */
async function getAdhkarCounts(sectionId) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const all = await window.ZadStore?.getState('adhkarCounts', {}) || {};
    return all[`${today}_${sectionId}`] || {};
  } catch { return {}; }
}

async function saveAdhkarCount(sectionId, itemIdx, count) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const all = await window.ZadStore?.getState('adhkarCounts', {}) || {};
    const key = `${today}_${sectionId}`;
    if (!all[key]) all[key] = {};
    all[key][itemIdx] = count;
    await window.ZadStore?.setState('adhkarCounts', all);
  } catch {}
}

/* ── عرض قسم أذكار كامل ──────────────────────────────────────────────────── */
async function renderAdhkarSection(sectionId) {
  const db = window.ADHKAR_DATABASE;
  const section = db?.[sectionId];
  const container = document.getElementById('adhkar-full-container');
  if (!section || !container) return;

  const counts = await getAdhkarCounts(sectionId);

  let html = `
    <div class="afs-header" style="border-color:${section.color}">
      <div class="afs-icon">${section.icon}</div>
      <div class="afs-title-wrap">
        <div class="afs-title">${section.title}</div>
        <div class="afs-time">🕐 ${section.time}</div>
      </div>
    </div>`;

  section.items.forEach((item, i) => {
    const current = counts[i] || 0;
    const done = current >= item.count;
    const pct = Math.min(Math.round((current / item.count) * 100), 100);

    html += `
      <div class="afs-card ${done ? 'afs-done' : ''}" id="afs-card-${sectionId}-${i}">
        <div class="afs-label">${item.label}</div>
        <div class="afs-arabic">${item.ar}</div>
        ${item.virtue ? `<div class="afs-virtue">✨ ${item.virtue}</div>` : ''}
        <div class="afs-footer">
          <span class="afs-source">📖 ${item.source}</span>
          <div class="afs-counter">
            <button class="afs-count-btn" onclick="countAdhkarItem('${sectionId}', ${i}, ${item.count})" 
                    ${done ? 'disabled' : ''}>
              ${done ? '✅' : 'عدّ'}
            </button>
            <span class="afs-count-num" id="afs-num-${sectionId}-${i}">${current} / ${item.count}</span>
          </div>
        </div>
        <div class="afs-progress"><span id="afs-bar-${sectionId}-${i}" style="width:${pct}%;background:${section.color}"></span></div>
      </div>`;
  });

  container.innerHTML = html;
}
window.renderAdhkarSection = renderAdhkarSection;

/* ── عدّ ذكر ─────────────────────────────────────────────────────────────── */
async function countAdhkarItem(sectionId, itemIdx, target) {
  const counts = await getAdhkarCounts(sectionId);
  const current = Math.min((counts[itemIdx] || 0) + 1, target);
  await saveAdhkarCount(sectionId, itemIdx, current);

  if (navigator.vibrate) navigator.vibrate(15);

  const numEl = document.getElementById(`afs-num-${sectionId}-${itemIdx}`);
  const barEl = document.getElementById(`afs-bar-${sectionId}-${itemIdx}`);
  const card = document.getElementById(`afs-card-${sectionId}-${itemIdx}`);
  const pct = Math.min(Math.round((current / target) * 100), 100);

  if (numEl) numEl.textContent = `${current} / ${target}`;
  if (barEl) barEl.style.width = pct + '%';

  if (current >= target) {
    card?.classList.add('afs-done');
    const btn = card?.querySelector('.afs-count-btn');
    if (btn) { btn.textContent = '✅'; btn.disabled = true; }
    if (navigator.vibrate) navigator.vibrate([40, 30, 40]);
    if (typeof showToast === 'function') showToast('✅ تمّ — تقبّل الله');
    checkSectionComplete(sectionId);
  }
}
window.countAdhkarItem = countAdhkarItem;

/* ── فحص اكتمال القسم بالكامل ────────────────────────────────────────────── */
async function checkSectionComplete(sectionId) {
  const section = window.ADHKAR_DATABASE?.[sectionId];
  const counts = await getAdhkarCounts(sectionId);
  if (!section) return;
  const allDone = section.items.every((item, i) => (counts[i] || 0) >= item.count);
  if (allDone && typeof showToast === 'function') {
    showToast(`🎉 أتممت ${section.title} كاملة — بارك الله فيك`);
    if (typeof triggerConfetti === 'function' && !window._calmMode) {
      /* احترام Calm UX — لا confetti في صفحة الأذكار */
    }
  }
}

/* ── قائمة الأقسام (للصفحة الرئيسية للأذكار) ────────────────────────────── */
function renderAdhkarSectionsMenu() {
  const container = document.getElementById('adhkar-sections-menu');
  if (!container || !window.ADHKAR_DATABASE) return;

  container.innerHTML = Object.values(window.ADHKAR_DATABASE).map(section => `
    <a href="adhkar-section.html?s=${section.id}" class="adhkar-menu-card" style="border-color:${section.color}">
      <div class="amc-icon" style="background:${section.color}20;color:${section.color}">${section.icon}</div>
      <div class="amc-body">
        <div class="amc-title">${section.title}</div>
        <div class="amc-count">${section.items.length} أذكار</div>
      </div>
      <div class="amc-arrow">←</div>
    </a>
  `).join('');
}
window.renderAdhkarSectionsMenu = renderAdhkarSectionsMenu;

/* ── الأنماط ──────────────────────────────────────────────────────────────── */
const ADHKAR_FULL_CSS = `
.afs-header { display: flex; align-items: center; gap: 14px; padding: 16px; border-radius: 16px; background: var(--card,#fff); border-right: 5px solid; margin-bottom: 16px; }
.afs-icon { font-size: 36px; }
.afs-title { font-size: 22px; font-weight: 900; }
.afs-time { font-size: 13px; color: var(--muted,#888); margin-top: 2px; }
.afs-card { background: var(--card,#fff); border: 1.5px solid var(--border,#ddd); border-radius: 16px; padding: 18px; margin-bottom: 14px; }
.afs-card.afs-done { background: rgba(14,59,46,.05); border-color: var(--zad-green-700,#1a5d47); }
.afs-label { font-size: 13px; font-weight: 700; color: var(--zad-green-700,#1a5d47); margin-bottom: 10px; }
.afs-arabic { font-family: var(--font-quran,serif); font-size: 21px; line-height: 2.2; text-align: center; color: var(--ink); margin-bottom: 12px; }
.afs-virtue { font-size: 13px; color: var(--zad-gold-700,#b87200); background: rgba(201,161,74,.08); padding: 8px 12px; border-radius: 10px; margin-bottom: 12px; line-height: 1.6; }
.afs-footer { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.afs-source { font-size: 12px; color: var(--muted,#888); }
.afs-counter { display: flex; align-items: center; gap: 10px; }
.afs-count-btn { min-width: 64px; padding: 10px 18px; border-radius: 12px; border: none; background: var(--zad-green-900,#0e3b2e); color: #fff; font-family: inherit; font-size: 15px; font-weight: 700; cursor: pointer; }
.afs-count-btn:disabled { background: var(--zad-green-700,#1a5d47); opacity: .7; }
.afs-count-num { font-size: 14px; font-weight: 700; min-width: 56px; text-align: center; }
.afs-progress { height: 6px; background: var(--border,#eee); border-radius: 3px; overflow: hidden; margin-top: 12px; }
.afs-progress span { display: block; height: 100%; border-radius: 3px; transition: width .3s; }
.adhkar-menu-card { display: flex; align-items: center; gap: 14px; padding: 16px; border-radius: 16px; background: var(--card,#fff); border: 1.5px solid; border-right-width: 5px; margin-bottom: 12px; text-decoration: none; color: inherit; transition: transform .15s; }
.adhkar-menu-card:active { transform: scale(.98); }
.amc-icon { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 26px; }
.amc-body { flex: 1; }
.amc-title { font-size: 17px; font-weight: 800; }
.amc-count { font-size: 13px; color: var(--muted,#888); }
.amc-arrow { font-size: 20px; color: var(--muted,#aaa); }
`;

function injectAdhkarFullCSS() {
  if (document.getElementById('adhkar-full-css')) return;
  const s = document.createElement('style');
  s.id = 'adhkar-full-css'; s.textContent = ADHKAR_FULL_CSS;
  document.head.appendChild(s);
}

/* ── تشغيل ───────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  injectAdhkarFullCSS();

  /* قائمة الأقسام */
  if (document.getElementById('adhkar-sections-menu')) {
    renderAdhkarSectionsMenu();
  }

  /* صفحة قسم واحد (تقرأ ?s= من الرابط) */
  if (document.getElementById('adhkar-full-container')) {
    const params = new URLSearchParams(window.location.search);
    const sectionId = params.get('s') || 'morning';
    renderAdhkarSection(sectionId);
  }

  /* تحقق من الاكتمال (تطوير) */
  const check = validateAdhkarCompleteness();
  console.log(`[AdhkarDB] ${check.ok ? '✅' : '⚠️'} ${check.total} ذكر — ${check.issues.length} مشكلة`);
  if (check.issues.length) console.warn(check.issues);
});
