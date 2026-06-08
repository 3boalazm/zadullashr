/* ═══════════════════════════════════════════════════════════════════════════
   زاد — الفيز التاسع: التقويم الإسلامي السنوي
   ─────────────────────────────────────────────────────────────────────────
   يحوّل «زاد» الموسمي (10 أيام) إلى «زاد» رفيق طوال العام.
   يعتمد على getHijriDateAccurate من الفيز الثالث (calendar.js)
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── 1. مواسم العبادة السنوية ────────────────────────────────────────────── */
/* كل موسم: الشهر الهجري + نطاق الأيام + الموديول المرتبط */
const WORSHIP_SEASONS = [
  {
    id: 'muharram',
    name: 'محرم وعاشوراء',
    month: 1,
    highlight: { day: 10, name: 'يوم عاشوراء' },
    range: [9, 10],
    icon: '🌙',
    color: '#1a5d47',
    deeds: ['صيام عاشوراء (يكفّر سنة)', 'صيام تاسوعاء معه', 'الإكثار من الصدقة'],
    hadith: 'صِيَامُ يَوْمِ عَاشُورَاءَ يُكَفِّرُ السَّنَةَ الَّتِي قَبْلَهُ',
    source: 'رواه مسلم',
  },
  {
    id: 'rajab',
    name: 'رجب — الشهر الحرام',
    month: 7,
    range: [1, 30],
    icon: '🕌',
    color: '#4a3580',
    deeds: ['الإكثار من الاستغفار', 'صيام التطوع', 'الاستعداد لرمضان'],
    hadith: 'رَجَبُ شَهْرُ اللَّهِ، وَشَعْبَانُ شَهْرِي، وَرَمَضَانُ شَهْرُ أُمَّتِي',
    source: 'أثر — يُستأنس به',
  },
  {
    id: 'shaban',
    name: 'شعبان',
    month: 8,
    highlight: { day: 15, name: 'ليلة النصف من شعبان' },
    range: [1, 30],
    icon: '✨',
    color: '#5856d6',
    deeds: ['الإكثار من الصيام (كان أكثر صيام النبي ﷺ)', 'قضاء ما فات من رمضان السابق'],
    hadith: 'كَانَ يَصُومُ شَعْبَانَ كُلَّهُ',
    source: 'متفق عليه',
  },
  {
    id: 'ramadan',
    name: 'رمضان المبارك',
    month: 9,
    range: [1, 30],
    icon: '🌙',
    color: '#0e3b2e',
    isMajor: true,
    deeds: ['الصيام', 'قيام الليل والتراويح', 'ختم القرآن', 'الاعتكاف', 'تحري ليلة القدر'],
    hadith: 'مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ',
    source: 'متفق عليه',
  },
  {
    id: 'shawwal',
    name: 'شوال — الست البيض',
    month: 10,
    range: [2, 8],
    icon: '🌟',
    color: '#ff9500',
    deeds: ['صيام ست من شوال (تعدل صيام الدهر)', 'صلة الرحم بعد العيد'],
    hadith: 'مَنْ صَامَ رَمَضَانَ ثُمَّ أَتْبَعَهُ سِتًّا مِنْ شَوَّالٍ كَانَ كَصِيَامِ الدَّهْرِ',
    source: 'رواه مسلم',
  },
  {
    id: 'dhulhijjah',
    name: 'عشر ذي الحجة',
    month: 12,
    highlight: { day: 9, name: 'يوم عرفة' },
    range: [1, 13],
    icon: '🕋',
    color: '#c9a14a',
    isMajor: true,
    deeds: ['التكبير المطلق', 'صيام التسع', 'صيام يوم عرفة', 'الأضحية', 'الحج'],
    hadith: 'مَا مِنْ أَيَّامٍ الْعَمَلُ الصَّالِحُ فِيهِنَّ أَحَبُّ إِلَى اللَّهِ مِنْ هَذِهِ الأَيَّامِ',
    source: 'رواه البخاري',
    link: 'index.html',
  },
];

/* ── مواسم متكررة شهرياً/أسبوعياً ────────────────────────────────────────── */
const RECURRING_DEEDS = [
  { id: 'white-days', name: 'الأيام البيض', when: 'كل شهر (13، 14، 15)', deed: 'صيام ثلاثة أيام من كل شهر', icon: '🤍' },
  { id: 'mon-thu', name: 'الاثنين والخميس', when: 'كل أسبوع', deed: 'صيام يومي عرض الأعمال', icon: '📅' },
  { id: 'friday', name: 'يوم الجمعة', when: 'كل أسبوع', deed: 'سورة الكهف + الإكثار من الصلاة على النبي ﷺ', icon: '🕌' },
];

/* ── 2. تحديد الموسم الحالي ──────────────────────────────────────────────── */
function getCurrentSeason() {
  const h = window.getHijriDate ? window.getHijriDate() : null;
  if (!h) return null;

  for (const season of WORSHIP_SEASONS) {
    if (season.month === h.month) {
      const [start, end] = season.range;
      if (h.day >= start && h.day <= end) {
        return { ...season, currentDay: h.day, hijri: h };
      }
    }
  }
  return null;
}

/* ── الموسم القادم (للعد التنازلي) ───────────────────────────────────────── */
function getNextSeason() {
  const h = window.getHijriDate ? window.getHijriDate() : null;
  if (!h) return null;

  /* رتّب المواسم وابحث عن أقرب موسم قادم */
  const upcoming = WORSHIP_SEASONS
    .map(s => {
      let monthsAway = s.month - h.month;
      if (monthsAway < 0 || (monthsAway === 0 && h.day > s.range[1])) monthsAway += 12;
      return { ...s, monthsAway };
    })
    .filter(s => s.monthsAway > 0)
    .sort((a, b) => a.monthsAway - b.monthsAway);

  return upcoming[0] || null;
}

/* ── 3. عرض لوحة المواسم ─────────────────────────────────────────────────── */
function renderSeasonsHub() {
  const container = document.getElementById('seasons-hub');
  if (!container) return;

  const current = getCurrentSeason();
  const next = getNextSeason();
  const h = window.getHijriDate ? window.getHijriDate() : null;
  const HIJRI_MONTHS = ['محرم','صفر','ربيع الأول','ربيع الآخر','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'];

  let html = '';

  /* التاريخ الحالي */
  if (h) {
    html += `<div class="season-today">📅 اليوم: ${h.day} ${HIJRI_MONTHS[h.month-1]} ${h.year} هـ</div>`;
  }

  /* الموسم الحالي (إن وُجد) */
  if (current) {
    html += `
      <div class="season-active-card" style="border-color:${current.color}">
        <div class="season-badge" style="background:${current.color}">${current.icon} موسم حالي</div>
        <div class="season-name">${current.name}</div>
        ${current.highlight ? `<div class="season-highlight">⭐ ${current.highlight.name} — اليوم ${current.highlight.day}</div>` : ''}
        <div class="season-hadith">«${current.hadith}»<br><span class="season-source">${current.source}</span></div>
        <div class="season-deeds">
          ${current.deeds.map(d => `<div class="season-deed">✓ ${d}</div>`).join('')}
        </div>
        ${current.link ? `<a href="${current.link}" class="btn btn-primary" style="margin-top:12px">افتح الموديول الكامل ←</a>` : ''}
      </div>`;
  } else {
    html += `<div class="season-none">لا يوجد موسم عبادة كبير حالياً — استمر في الأعمال اليومية والمواسم المتكررة 🌱</div>`;
  }

  /* الموسم القادم */
  if (next) {
    html += `
      <div class="season-next-card">
        <div class="season-next-label">الموسم القادم</div>
        <div class="season-next-name">${next.icon} ${next.name}</div>
        <div class="season-next-away">بعد ${next.monthsAway} ${next.monthsAway === 1 ? 'شهر' : 'أشهر'} تقريباً</div>
      </div>`;
  }

  /* المواسم المتكررة */
  html += `<div class="recurring-title">أعمال متكررة طوال العام</div>`;
  html += `<div class="recurring-grid">`;
  RECURRING_DEEDS.forEach(r => {
    html += `
      <div class="recurring-card">
        <div class="recurring-icon">${r.icon}</div>
        <div class="recurring-name">${r.name}</div>
        <div class="recurring-when">${r.when}</div>
        <div class="recurring-deed">${r.deed}</div>
      </div>`;
  });
  html += `</div>`;

  /* كل المواسم (تقويم سنوي) */
  html += `<div class="recurring-title">التقويم الإسلامي السنوي</div>`;
  html += `<div class="all-seasons">`;
  WORSHIP_SEASONS.forEach(s => {
    const isCurrent = current && current.id === s.id;
    html += `
      <div class="year-season ${isCurrent ? 'is-current' : ''} ${s.isMajor ? 'is-major' : ''}" style="--sc:${s.color}">
        <span class="ys-icon">${s.icon}</span>
        <span class="ys-name">${s.name}</span>
        <span class="ys-month">${HIJRI_MONTHS[s.month-1]}</span>
      </div>`;
  });
  html += `</div>`;

  container.innerHTML = html;
}

/* ── 4. التنبيهات الموسمية الذكية ────────────────────────────────────────── */
function checkSeasonalNotifications() {
  const next = getNextSeason();
  const current = getCurrentSeason();
  if (typeof addNotif !== 'function') return;

  /* تنبيه قبل الموسم الكبير بشهر */
  if (next && next.isMajor && next.monthsAway === 1) {
    const key = `zad_notif_${next.id}_${new Date().getFullYear()}`;
    if (!localStorage.getItem(key)) {
      addNotif(next.icon, `استعد لـ${next.name}`, 'اقترب موسم عظيم — جهّز نيتك وخطتك');
      localStorage.setItem(key, '1');
    }
  }

  /* تنبيه بداية الموسم الحالي */
  if (current) {
    const key = `zad_notif_start_${current.id}_${current.hijri.year}`;
    if (!localStorage.getItem(key)) {
      addNotif(current.icon, `بدأ ${current.name}`, current.deeds[0]);
      localStorage.setItem(key, '1');
    }
  }
}

/* ── 5. موديول رمضان (الأكبر) ────────────────────────────────────────────── */
function renderRamadanModule() {
  const container = document.getElementById('ramadan-module');
  if (!container) return;

  const h = window.getHijriDate ? window.getHijriDate() : null;
  const isRamadan = h && h.month === 9;
  const ramadanDay = isRamadan ? h.day : 0;
  const isLastTen = ramadanDay >= 21;

  let html = '';

  if (isRamadan) {
    html += `
      <div class="ramadan-active">
        <div class="ramadan-day-badge">🌙 اليوم ${ramadanDay} من رمضان</div>
        ${isLastTen ? `<div class="laylat-qadr-banner">⭐ العشر الأواخر — تحرَّ ليلة القدر</div>` : ''}
      </div>`;
  } else {
    /* عد تنازلي لرمضان */
    html += `<div class="ramadan-countdown">🌙 رمضان لم يبدأ بعد — استعد لاستقباله</div>`;
  }

  /* ورد رمضان */
  const ramadanWird = [
    { id: 'fasting', label: 'الصيام', icon: '🌙' },
    { id: 'taraweeh', label: 'التراويح', icon: '🕌' },
    { id: 'qiyam', label: 'قيام الليل', icon: '🌃' },
    { id: 'khatma', label: 'الختمة', icon: '📖' },
    { id: 'dua', label: 'الدعاء', icon: '🤲' },
    { id: 'sadaqah', label: 'الصدقة', icon: '💝' },
  ];

  if (isLastTen) {
    ramadanWird.push({ id: 'itikaf', label: 'الاعتكاف', icon: '🕋' });
  }

  html += `<div class="ramadan-wird-grid">`;
  ramadanWird.forEach(w => {
    html += `
      <div class="ramadan-wird-item" data-wird="${w.id}" onclick="toggleRamadanWird('${w.id}')">
        <span class="rw-icon">${w.icon}</span>
        <span class="rw-label">${w.label}</span>
      </div>`;
  });
  html += `</div>`;

  container.innerHTML = html;
  restoreRamadanWird();
}

async function toggleRamadanWird(id) {
  const today = new Date().toISOString().split('T')[0];
  let log = {};
  try { log = await window.ZadStore?.getState('ramadanWird', {}) || {}; } catch {}
  if (!log[today]) log[today] = {};
  log[today][id] = !log[today][id];
  await window.ZadStore?.setState('ramadanWird', log);

  const el = document.querySelector(`[data-wird="${id}"]`);
  if (el) el.classList.toggle('done', log[today][id]);
  if (navigator.vibrate) navigator.vibrate(30);
}
window.toggleRamadanWird = toggleRamadanWird;

async function restoreRamadanWird() {
  const today = new Date().toISOString().split('T')[0];
  try {
    const log = await window.ZadStore?.getState('ramadanWird', {}) || {};
    const todayLog = log[today] || {};
    Object.entries(todayLog).forEach(([id, done]) => {
      if (done) document.querySelector(`[data-wird="${id}"]`)?.classList.add('done');
    });
  } catch {}
}

/* ── 6. الأنماط ──────────────────────────────────────────────────────────── */
const SEASONS_CSS = `
.season-today { text-align: center; font-size: 14px; color: var(--muted, #888); margin-bottom: 16px; }
.season-active-card { border: 2px solid; border-radius: 18px; padding: 20px; margin-bottom: 16px; background: var(--card, #fff); }
.season-badge { display: inline-block; color: #fff; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-bottom: 10px; }
.season-name { font-size: 22px; font-weight: 900; margin-bottom: 6px; }
.season-highlight { font-size: 14px; color: var(--zad-gold-700, #b87200); font-weight: 700; margin-bottom: 12px; }
.season-hadith { font-size: 14px; line-height: 1.8; color: var(--ink); padding: 12px; background: rgba(0,0,0,.03); border-radius: 12px; margin-bottom: 12px; }
.season-source { font-size: 12px; color: var(--muted, #888); }
.season-deeds { display: flex; flex-direction: column; gap: 6px; }
.season-deed { font-size: 14px; }
.season-none { text-align: center; padding: 24px; color: var(--muted, #888); font-size: 15px; }
.season-next-card { background: var(--sand, #f5f5f0); border-radius: 14px; padding: 16px; margin-bottom: 20px; text-align: center; }
.season-next-label { font-size: 12px; color: var(--muted, #888); }
.season-next-name { font-size: 18px; font-weight: 800; margin: 4px 0; }
.season-next-away { font-size: 13px; color: var(--zad-green-700, #1a5d47); }
.recurring-title { font-size: 16px; font-weight: 800; margin: 24px 0 12px; }
.recurring-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
.recurring-card { background: var(--sand, #faf9f6); border-radius: 14px; padding: 16px; text-align: center; }
.recurring-icon { font-size: 28px; }
.recurring-name { font-weight: 800; font-size: 15px; margin: 6px 0 2px; }
.recurring-when { font-size: 12px; color: var(--muted, #888); margin-bottom: 6px; }
.recurring-deed { font-size: 13px; line-height: 1.5; }
.all-seasons { display: flex; flex-direction: column; gap: 8px; }
.year-season { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 12px; background: var(--sand, #faf9f6); border-right: 4px solid var(--sc); }
.year-season.is-current { background: rgba(14,59,46,.08); font-weight: 800; }
.year-season.is-major .ys-name { font-weight: 800; }
.ys-icon { font-size: 20px; }
.ys-name { flex: 1; font-size: 15px; }
.ys-month { font-size: 12px; color: var(--muted, #888); }
.ramadan-day-badge { background: var(--zad-green-900, #0e3b2e); color: #fff; padding: 8px 18px; border-radius: 20px; font-size: 15px; font-weight: 700; display: inline-block; }
.laylat-qadr-banner { background: linear-gradient(135deg,#5856d6,#c9a14a); color: #fff; padding: 12px; border-radius: 12px; margin-top: 12px; text-align: center; font-weight: 700; }
.ramadan-countdown { text-align: center; padding: 20px; font-size: 16px; color: var(--muted, #888); }
.ramadan-wird-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px; margin-top: 16px; }
.ramadan-wird-item { padding: 16px 8px; border-radius: 14px; border: 1.5px solid var(--border, #ddd); background: var(--sand, #faf9f6); text-align: center; cursor: pointer; transition: all .2s; }
.ramadan-wird-item.done { background: rgba(14,59,46,.1); border-color: var(--zad-green-700, #1a5d47); }
.rw-icon { display: block; font-size: 24px; }
.rw-label { display: block; font-size: 13px; font-weight: 700; margin-top: 4px; }
`;

function injectSeasonsCSS() {
  if (document.getElementById('seasons-css')) return;
  const s = document.createElement('style');
  s.id = 'seasons-css'; s.textContent = SEASONS_CSS;
  document.head.appendChild(s);
}

/* ── تشغيل ───────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  injectSeasonsCSS();
  if (document.getElementById('seasons-hub')) renderSeasonsHub();
  if (document.getElementById('ramadan-module')) renderRamadanModule();
  /* التنبيهات تعمل في أي صفحة */
  setTimeout(checkSeasonalNotifications, 2000);
  console.log('[SeasonsModule] ✅ التقويم الإسلامي السنوي جاهز');
});

window.WORSHIP_SEASONS = WORSHIP_SEASONS;
window.getCurrentSeason = getCurrentSeason;
window.getNextSeason = getNextSeason;
