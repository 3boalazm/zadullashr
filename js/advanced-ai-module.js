/* ═══════════════════════════════════════════════════════════════════════════
   زاد — الفيز العاشر: الـ AI الروحاني المتقدم
   ─────────────────────────────────────────────────────────────────────────
   ثلاثة موديولات: السيرة النبوية + الفقه العملي + مساعد الأذكار الذكي
   
   يلتزم بنفس ضوابط الفيز الخامس (ai-guard): الفتوى تُحال، التعليم متاح.
   يعتمد على /api/gemini (RAG عبر Tafsir MCP) الموجود.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   1. مساعد الأذكار الذكي
   ─────────────────────────────────────────────────────────────────────────
   المستخدم يصف حالته → يقترح الأذكار المناسبة من المصادر الموثّقة
   البيانات من ملفات المشروع الشرعية (الأذكار، الأدعية، 40 ذكراً)
   ═══════════════════════════════════════════════════════════════════════════ */

/* قاعدة أذكار موثّقة مفهرسة بالحالة (RAG محلي بسيط) */
const ADHKAR_BY_STATE = {
  anxiety: {
    label: 'القلق والهم',
    triggers: ['قلق', 'هم', 'خوف', 'توتر', 'ضيق', 'حزن', 'كرب'],
    adhkar: [
      { text: 'اللَّهُمَّ إِنِّي عَبْدُكَ... أَسْأَلُكَ أَنْ تَجْعَلَ الْقُرْآنَ رَبِيعَ قَلْبِي وَجَلَاءَ حُزْنِي', source: 'رواه أحمد' },
      { text: 'لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ', source: 'متفق عليه — دعاء الكرب' },
      { text: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', source: 'البخاري' },
    ],
  },
  gratitude: {
    label: 'الشكر والفرح',
    triggers: ['فرح', 'سعادة', 'نعمة', 'شكر', 'خير', 'بشرى'],
    adhkar: [
      { text: 'الْحَمْدُ لِلَّهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ', source: 'ابن ماجه' },
      { text: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ', source: 'أبو داود' },
    ],
  },
  illness: {
    label: 'المرض والشفاء',
    triggers: ['مرض', 'وجع', 'ألم', 'تعب', 'شفاء', 'سقم'],
    adhkar: [
      { text: 'أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ', source: 'الترمذي — سبع مرات' },
      { text: 'اللَّهُمَّ رَبَّ النَّاسِ، أَذْهِبِ الْبَاسَ، اشْفِ أَنْتَ الشَّافِي', source: 'متفق عليه' },
    ],
  },
  travel: {
    label: 'السفر',
    triggers: ['سفر', 'رحلة', 'طريق', 'مسافر'],
    adhkar: [
      { text: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ', source: 'مسلم — دعاء الركوب' },
      { text: 'اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى', source: 'مسلم' },
    ],
  },
  forgiveness: {
    label: 'الاستغفار والتوبة',
    triggers: ['ذنب', 'توبة', 'استغفار', 'خطيئة', 'معصية'],
    adhkar: [
      { text: 'أَسْتَغْفِرُ اللَّهَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيَّ الْقَيُّومَ وَأَتُوبُ إِلَيْهِ', source: 'أبو داود' },
      { text: 'سيد الاستغفار: اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ', source: 'البخاري' },
    ],
  },
  protection: {
    label: 'الحفظ والحماية',
    triggers: ['حماية', 'حفظ', 'شر', 'عين', 'حسد', 'خوف'],
    adhkar: [
      { text: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', source: 'مسلم' },
      { text: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ', source: 'أبو داود والترمذي' },
    ],
  },
};

function findAdhkarByState(input) {
  const text = input.trim();
  for (const [key, group] of Object.entries(ADHKAR_BY_STATE)) {
    for (const trigger of group.triggers) {
      if (text.includes(trigger)) return group;
    }
  }
  return null;
}

function renderAdhkarAssistant() {
  const container = document.getElementById('adhkar-assistant');
  if (!container) return;

  container.innerHTML = `
    <div class="aa-intro">صِف حالتك أو شعورك، وسأقترح عليك الأذكار المأثورة المناسبة</div>
    <div class="aa-input-row">
      <input id="aa-input" class="aa-input" placeholder="مثال: أشعر بالقلق... / أنا مسافر... / مريض..." 
             onkeydown="if(event.key==='Enter')askAdhkar()">
      <button class="btn btn-primary" onclick="askAdhkar()">اقترح</button>
    </div>
    <div class="aa-quick">
      ${Object.entries(ADHKAR_BY_STATE).map(([k, g]) => 
        `<button class="aa-chip" onclick="document.getElementById('aa-input').value='${g.triggers[0]}';askAdhkar()">${g.label}</button>`
      ).join('')}
    </div>
    <div id="aa-results"></div>`;
}

function askAdhkar() {
  const input = document.getElementById('aa-input');
  const results = document.getElementById('aa-results');
  if (!input || !results) return;

  const group = findAdhkarByState(input.value);
  if (!group) {
    results.innerHTML = `<div class="aa-empty">لم أجد أذكاراً مطابقة. جرّب وصفاً آخر، أو اختر من الحالات أعلاه.</div>`;
    return;
  }

  results.innerHTML = `
    <div class="aa-result-title">أذكار ${group.label}</div>
    ${group.adhkar.map(a => `
      <div class="aa-dhikr-card">
        <div class="aa-dhikr-text">${a.text}</div>
        <div class="aa-dhikr-source">📖 ${a.source}</div>
      </div>
    `).join('')}`;
}
window.askAdhkar = askAdhkar;

/* ═══════════════════════════════════════════════════════════════════════════
   2. موديول السيرة النبوية
   ═══════════════════════════════════════════════════════════════════════════ */
const SEERAH_EVENTS = [
  { id: 'birth', title: 'المولد الشريف', period: 'عام الفيل', lesson: 'بداية النور الذي أضاء العالم' },
  { id: 'revelation', title: 'بدء الوحي', period: 'غار حراء', lesson: 'العلم أول ما نزل: اقرأ' },
  { id: 'hijrah', title: 'الهجرة النبوية', period: 'ربيع الأول', lesson: 'التوكل مع الأخذ بالأسباب' },
  { id: 'badr', title: 'غزوة بدر', period: '17 رمضان', lesson: 'النصر بالإيمان لا بالعدد' },
  { id: 'fath', title: 'فتح مكة', period: '20 رمضان', lesson: 'العفو عند المقدرة' },
];

function renderSeerahModule() {
  const container = document.getElementById('seerah-module');
  if (!container) return;
  container.innerHTML = `
    <div class="seerah-timeline">
      ${SEERAH_EVENTS.map(e => `
        <div class="seerah-event">
          <div class="se-period">${e.period}</div>
          <div class="se-title">${e.title}</div>
          <div class="se-lesson">💡 ${e.lesson}</div>
        </div>
      `).join('')}
    </div>
    <div class="seerah-ai-note">
      اسأل المساعد عن أي حدث في السيرة للتعمق — يستند إلى المصادر الموثّقة
    </div>`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   3. موديول الفقه العملي (مع ضوابط الفيز 5)
   ─────────────────────────────────────────────────────────────────────────
   يعرض أسئلة العبادة الشائعة بإجابات تعليمية، والخلافي يُعرض بأقواله
   دون ترجيح + إحالة لعالم.
   ═══════════════════════════════════════════════════════════════════════════ */
const FIQH_TOPICS = [
  {
    q: 'كيف يصلي المسافر؟',
    a: 'يقصر الصلاة الرباعية إلى ركعتين (الظهر، العصر، العشاء)، ويجوز الجمع بين الصلاتين. الفجر والمغرب لا تُقصران.',
    type: 'متفق عليه',
  },
  {
    q: 'ما الذي يفطر الصائم؟',
    a: 'الأكل والشرب عمداً، والجماع. أما الناسي فصيامه صحيح. والمريض والمسافر يفطران ويقضيان.',
    type: 'متفق عليه',
  },
  {
    q: 'حكم صيام الست من شوال؟',
    a: 'سنة مستحبة — من صام رمضان وأتبعه ستاً من شوال كان كصيام الدهر. يجوز متتابعة أو متفرقة.',
    type: 'سنة',
  },
];

function renderFiqhModule() {
  const container = document.getElementById('fiqh-module');
  if (!container) return;
  container.innerHTML = `
    <div class="fiqh-disclaimer">
      ℹ️ هذه إجابات تعليمية عامة. للمسائل الخاصة بحالتك، راجع عالماً متخصصاً أو دار الإفتاء.
    </div>
    ${FIQH_TOPICS.map((t, i) => `
      <div class="fiqh-item" onclick="toggleFiqh(${i})">
        <div class="fiqh-q">${t.q} <span class="fiqh-toggle" id="ft-${i}">+</span></div>
        <div class="fiqh-a" id="fa-${i}" style="display:none">
          ${t.a}
          <div class="fiqh-type">${t.type}</div>
        </div>
      </div>
    `).join('')}`;
}

function toggleFiqh(i) {
  const a = document.getElementById('fa-' + i);
  const t = document.getElementById('ft-' + i);
  if (a) {
    const show = a.style.display === 'none';
    a.style.display = show ? 'block' : 'none';
    if (t) t.textContent = show ? '−' : '+';
  }
}
window.toggleFiqh = toggleFiqh;

/* ── الأنماط ──────────────────────────────────────────────────────────────── */
const ADVANCED_AI_CSS = `
.aa-intro { font-size: 14px; color: var(--muted, #888); margin-bottom: 12px; text-align: center; }
.aa-input-row { display: flex; gap: 8px; margin-bottom: 12px; }
.aa-input { flex: 1; padding: 12px 16px; border-radius: 12px; border: 1.5px solid var(--border, #ddd); background: var(--sand, #faf9f6); font-family: inherit; font-size: 14px; }
.aa-quick { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.aa-chip { padding: 6px 14px; border-radius: 20px; border: 1.5px solid var(--border, #ddd); background: var(--sand, #faf9f6); font-family: inherit; font-size: 13px; cursor: pointer; }
.aa-result-title { font-size: 16px; font-weight: 800; margin: 16px 0 12px; }
.aa-dhikr-card { background: var(--sand, #faf9f6); border-radius: 14px; padding: 16px; margin-bottom: 10px; border-right: 3px solid var(--zad-green-700, #1a5d47); }
.aa-dhikr-text { font-family: var(--font-quran, serif); font-size: 18px; line-height: 2; margin-bottom: 8px; }
.aa-dhikr-source { font-size: 12px; color: var(--muted, #888); }
.aa-empty { text-align: center; padding: 20px; color: var(--muted, #888); }
.seerah-timeline { display: flex; flex-direction: column; gap: 12px; }
.seerah-event { padding: 16px; border-radius: 14px; background: var(--sand, #faf9f6); border-right: 4px solid var(--zad-purple, #4a3580); }
.se-period { font-size: 12px; color: var(--zad-purple, #4a3580); font-weight: 700; }
.se-title { font-size: 17px; font-weight: 800; margin: 4px 0; }
.se-lesson { font-size: 14px; color: var(--ink); }
.seerah-ai-note, .fiqh-disclaimer { font-size: 13px; color: var(--muted, #888); padding: 12px; background: rgba(0,0,0,.03); border-radius: 10px; margin-top: 16px; }
.fiqh-disclaimer { margin-bottom: 16px; margin-top: 0; }
.fiqh-item { background: var(--sand, #faf9f6); border-radius: 12px; padding: 16px; margin-bottom: 10px; cursor: pointer; }
.fiqh-q { font-size: 15px; font-weight: 700; display: flex; justify-content: space-between; }
.fiqh-toggle { color: var(--zad-green-700, #1a5d47); font-size: 20px; }
.fiqh-a { font-size: 14px; line-height: 1.8; margin-top: 12px; color: var(--ink); }
.fiqh-type { font-size: 12px; color: var(--zad-green-700, #1a5d47); margin-top: 8px; font-weight: 700; }
`;

function injectAdvancedAICSS() {
  if (document.getElementById('advanced-ai-css')) return;
  const s = document.createElement('style');
  s.id = 'advanced-ai-css'; s.textContent = ADVANCED_AI_CSS;
  document.head.appendChild(s);
}

/* ── تشغيل ───────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const has = document.getElementById('adhkar-assistant') || document.getElementById('seerah-module') || document.getElementById('fiqh-module');
  if (has) {
    injectAdvancedAICSS();
    renderAdhkarAssistant();
    renderSeerahModule();
    renderFiqhModule();
    console.log('[AdvancedAI] ✅ موديولات السيرة والفقه والأذكار جاهزة');
  }
});

window.ADHKAR_BY_STATE = ADHKAR_BY_STATE;
window.findAdhkarByState = findAdhkarByState;
