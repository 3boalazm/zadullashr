/* ═══════════════════════════════════════════════════════════════════════════
   زاد — موديول الأهداف الشخصية
   ─────────────────────────────────────────────────────────────────────────
   نقطة ذكرها التحليلان: «صفحة أهداف شخصية» + «adaptive goals»
   المستخدم يختار أهدافه الروحانية ويتتبعها — يعمل سنوياً (مع seasons)
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── قوالب الأهداف الجاهزة ──────────────────────────────────────────────── */
const GOAL_TEMPLATES = [
  { id: 'khatma',      icon: '📖', title: 'ختمة كاملة',        target: 30,  unit: 'جزء',   metric: 'mushaf' },
  { id: 'fasting9',    icon: '🌙', title: 'صيام التسع',        target: 9,   unit: 'يوم',   metric: 'fasting' },
  { id: 'qiyam',       icon: '🌃', title: 'قيام كل ليلة',      target: 10,  unit: 'ليلة',  metric: 'qiyam' },
  { id: 'takbeer1000', icon: '📿', title: '1000 تكبيرة',       target: 1000, unit: 'تكبيرة', metric: 'takbeer' },
  { id: 'sadaqah',     icon: '💝', title: 'صدقة يومية',        target: 10,  unit: 'يوم',   metric: 'charity' },
  { id: 'dhikr',       icon: '🤲', title: 'أذكار الصباح والمساء', target: 10, unit: 'يوم', metric: 'adhkar' },
];

async function getUserGoals() {
  try { return await window.ZadStore?.getState('userGoals', []) || []; }
  catch { return []; }
}

async function addGoal(templateId) {
  const tpl = GOAL_TEMPLATES.find(t => t.id === templateId);
  if (!tpl) return;
  const goals = await getUserGoals();
  if (goals.find(g => g.id === templateId)) {
    if (typeof showToast === 'function') showToast('هذا الهدف مُضاف بالفعل');
    return;
  }
  goals.push({ ...tpl, addedAt: Date.now(), current: 0 });
  await window.ZadStore?.setState('userGoals', goals);
  renderGoals();
  if (typeof showToast === 'function') showToast(`🎯 أُضيف هدف: ${tpl.title}`);
}
window.addGoal = addGoal;

async function removeGoal(id) {
  let goals = await getUserGoals();
  goals = goals.filter(g => g.id !== id);
  await window.ZadStore?.setState('userGoals', goals);
  renderGoals();
}
window.removeGoal = removeGoal;

/* ── حساب التقدم من بيانات التطبيق الفعلية ───────────────────────────────── */
function computeGoalProgress(goal) {
  /* اقرأ من STATE العام (app.js) */
  const S = window.STATE || {};
  switch (goal.metric) {
    case 'mushaf':   return S.mushaf?.juz || 0;
    case 'fasting':  return Object.values(S.fasting || {}).filter(Boolean).length;
    case 'takbeer':  return S.takbeer?.total || 0;
    case 'charity':  return (S.charityDone || []).length;
    case 'qiyam':    return S.streak || 0; /* تقريبي */
    case 'adhkar':   return Object.keys(S.adhkar || {}).length;
    default:         return goal.current || 0;
  }
}

/* ── عرض الأهداف ─────────────────────────────────────────────────────────── */
async function renderGoals() {
  const container = document.getElementById('goals-container');
  if (!container) return;

  const goals = await getUserGoals();

  let html = '';

  if (goals.length === 0) {
    html += `<div class="goals-empty">لم تحدد أهدافاً بعد — اختر من القوالب أدناه 👇</div>`;
  } else {
    html += `<div class="goals-active">`;
    goals.forEach(goal => {
      const current = computeGoalProgress(goal);
      const pct = Math.min(Math.round((current / goal.target) * 100), 100);
      const done = current >= goal.target;
      html += `
        <div class="goal-card ${done ? 'goal-done' : ''}">
          <div class="goal-icon">${goal.icon}</div>
          <div class="goal-body">
            <div class="goal-title">${goal.title} ${done ? '✅' : ''}</div>
            <div class="goal-progress-bar"><span style="width:${pct}%"></span></div>
            <div class="goal-stats">${current} / ${goal.target} ${goal.unit} (${pct}%)</div>
          </div>
          <button class="goal-remove" onclick="removeGoal('${goal.id}')" aria-label="حذف">✕</button>
        </div>`;
    });
    html += `</div>`;
  }

  /* قوالب للإضافة */
  const activeIds = goals.map(g => g.id);
  const available = GOAL_TEMPLATES.filter(t => !activeIds.includes(t.id));
  if (available.length) {
    html += `<div class="goals-templates-title">أضف هدفاً</div>`;
    html += `<div class="goals-templates">`;
    available.forEach(t => {
      html += `
        <button class="goal-template" onclick="addGoal('${t.id}')">
          <span class="gt-icon">${t.icon}</span>
          <span class="gt-title">${t.title}</span>
          <span class="gt-target">${t.target} ${t.unit}</span>
        </button>`;
    });
    html += `</div>`;
  }

  container.innerHTML = html;
}

const GOALS_CSS = `
.goals-empty { text-align: center; padding: 24px; color: var(--muted, #888); }
.goal-card { display: flex; align-items: center; gap: 14px; padding: 16px; border-radius: 14px;
  background: var(--sand, #faf9f6); border: 1.5px solid var(--border, #ddd); margin-bottom: 12px; }
.goal-card.goal-done { background: rgba(14,59,46,.06); border-color: var(--zad-green-700, #1a5d47); }
.goal-icon { font-size: 28px; }
.goal-body { flex: 1; }
.goal-title { font-weight: 800; font-size: 15px; margin-bottom: 6px; }
.goal-progress-bar { height: 8px; background: var(--border, #e5e5e5); border-radius: 4px; overflow: hidden; margin-bottom: 4px; }
.goal-progress-bar span { display: block; height: 100%; background: var(--zad-green-700, #1a5d47); border-radius: 4px; transition: width .4s; }
.goal-stats { font-size: 12px; color: var(--muted, #888); }
.goal-remove { background: none; border: none; color: var(--muted, #aaa); font-size: 16px; cursor: pointer; padding: 8px; }
.goals-templates-title { font-size: 16px; font-weight: 800; margin: 24px 0 12px; }
.goals-templates { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
.goal-template { padding: 14px; border-radius: 12px; border: 1.5px solid var(--border, #ddd); background: var(--card, #fff);
  cursor: pointer; text-align: center; font-family: inherit; transition: all .2s; }
.goal-template:hover { border-color: var(--zad-green-700, #1a5d47); }
.gt-icon { display: block; font-size: 24px; }
.gt-title { display: block; font-weight: 700; font-size: 13px; margin: 4px 0 2px; }
.gt-target { display: block; font-size: 11px; color: var(--muted, #888); }
`;

function injectGoalsCSS() {
  if (document.getElementById('goals-css')) return;
  const s = document.createElement('style');
  s.id = 'goals-css'; s.textContent = GOALS_CSS;
  document.head.appendChild(s);
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('goals-container')) {
    injectGoalsCSS();
    renderGoals();
    console.log('[GoalsModule] ✅ موديول الأهداف الشخصية جاهز');
  }
});

window.GOAL_TEMPLATES = GOAL_TEMPLATES;
window.renderGoals = renderGoals;
