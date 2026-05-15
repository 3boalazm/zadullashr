const KEY = 'zad_v2';
function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : defaultState();
  } catch (e) { return defaultState(); }
}
function saveState() {
  try { localStorage.setItem(KEY, JSON.stringify(STATE)); } catch (e) {}
}
function defaultState() {
  return {
    theme: 'light',
    day: todayStr(),
    worship: {},
    fasting: {},
    takbeer: { count: 0, total: 0, sessions: 0, phrase: 'اللَّهُ أَكْبَرُ', target: 33 },
    mushaf: { juz: 0, plan: 'daily-juz' },
    badges: [],
    streak: 0,
    lastActive: todayStr(),
    charityDone: [],
    quranFontSize: 24,
    arafah:  { milestones: {}, dhikrCount: 0, khushooMode: false, bonus: {} },
    adhkar:  {},
    takbeer7: {}  
  };
}
function todayStr() {
  return new Date().toISOString().split('T')[0];
}
function checkDayReset(s) {
  if (s.day !== todayStr()) {
    s.day = todayStr();
    s.worship = {};
    s.charityDone = [];
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    if (s.lastActive === yesterday.toISOString().split('T')[0]) {
      s.streak = (s.streak || 0) + 1;
    } else if (s.lastActive !== todayStr()) {
      s.streak = 1;
    }
    s.lastActive = todayStr();
  }
  return s;
}
let STATE = checkDayReset(loadState());
function applyTheme(theme) {
  STATE.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  document.querySelectorAll('.dark-switch').forEach(el => { el.checked = theme === 'dark'; });
  document.querySelectorAll('.btn-theme').forEach(btn => { btn.textContent = theme === 'dark' ? '☀️' : '🌙'; });
  saveState();
}
function toggleTheme() {
  applyTheme(STATE.theme === 'dark' ? 'light' : 'dark');
}
window.toggleTheme = toggleTheme;
function applyQuranFont(size) {
  size = size || STATE.quranFontSize || 24;
  document.documentElement.style.setProperty('--qf-size', size + 'px');
  STATE.quranFontSize = size;
  saveState();
  document.querySelectorAll('#font-slider, #m-font').forEach(sl => {
    sl.value = size;
  });
}
window.applyQuranFont = applyQuranFont;
function startCountdown() {
  const daysEl  = document.getElementById('cd-days');
  const hrsEl   = document.getElementById('cd-hrs');
  const minsEl  = document.getElementById('cd-mins');
  const secsEl  = document.getElementById('cd-secs');
  if (!daysEl) return;
  function tick() {
    const target = new Date();
    target.setDate(target.getDate() + 8);
    target.setHours(9, 0, 0, 0);
    const diff = Math.max(0, target - new Date());
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const pad = n => String(n).padStart(2,'0');
    daysEl.textContent = pad(d);
    hrsEl.textContent  = pad(h);
    minsEl.textContent = pad(m);
    secsEl.textContent = pad(s);
  }
  tick();
  setInterval(tick, 1000);
}
function initChecklist() {
  document.querySelectorAll('.check[data-key]').forEach(el => {
    const k = el.dataset.key;
    if (STATE.worship[k]) el.classList.add('done');
    el.addEventListener('click', () => {
      el.classList.toggle('done');
      STATE.worship[k] = el.classList.contains('done');
      if (navigator.vibrate) navigator.vibrate(30);
      if (STATE.worship[k]) showToast(typeof getSuccessMsg==='function' ? getSuccessMsg(k) : '✅ تم التسجيل — بارك الله فيك');
      saveState();
      updateProgress();
      checkBadges();
      checkDailyComplete();
      recordDailyProgress();
    });
  });
  updateProgress();
}
function updateProgress() {
  const bar = document.getElementById('prog-bar');
  const txt = document.getElementById('prog-txt');
  const worshipKeys = ['fajr','zuhr','asr','maghrib','isha','rawatib','duha','qiyam',
                       'morning_dhikr','evening_dhikr','takbeer_100','tawbah'];
  const done = worshipKeys.filter(k => STATE.worship[k]).length;
  const pct  = Math.round((done / worshipKeys.length) * 100);
  if (bar) bar.style.width = pct + '%';
  if (txt) txt.textContent = done + ' من ' + worshipKeys.length + ' عبادة';
  const pctEl = document.getElementById('prog-pct');
  if (pctEl) pctEl.textContent = pct + '%';
  if (typeof updateCircularRing === 'function') updateCircularRing(pct);
}
function initFasting() {
  document.querySelectorAll('.fast-day').forEach(el => {
    const day = +el.dataset.day;
    if (STATE.fasting[day]) el.classList.add('done');
    el.addEventListener('click', () => {
      el.classList.toggle('done');
      STATE.fasting[day] = el.classList.contains('done');
      if (navigator.vibrate) navigator.vibrate(40);
      if (STATE.fasting[day]) {
        showToast(day === 9 ? '⭐ صيام يوم عرفة — يكفّر سنتين!' : `🌙 يوم ${day} مُسجَّل!`);
      }
      saveState();
      checkBadges();
      updateDashStats();
    });
  });
}
function updateDashStats() {
  const statTkbr  = document.getElementById('stat-takbeer');
  const statJuz   = document.getElementById('stat-juz');
  const statPray  = document.getElementById('stat-pray');
  const statProg  = document.getElementById('stat-prog');
  if (statTkbr)  statTkbr.textContent  = STATE.takbeer.total.toLocaleString('ar-EG');
  if (statJuz)   statJuz.textContent   = STATE.mushaf.juz;
  if (statProg)  {
    const worshipKeys = ['fajr','zuhr','asr','maghrib','isha','rawatib','duha','qiyam',
                         'morning_dhikr','evening_dhikr','takbeer_100','tawbah'];
    const done = worshipKeys.filter(k => STATE.worship[k]).length;
    const pct  = Math.round((done / worshipKeys.length) * 100);
    statProg.textContent = pct + '%';
  }
  const prayers = ['fajr','zuhr','asr','maghrib','isha'];
  const prayDone = prayers.filter(k => STATE.worship[k]).length;
  if (statPray) statPray.textContent = prayDone + '/5';
}
const phrases = [
  { label:'التكبير الثنائي',  text:'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، لَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ وَلِلَّهِ الْحَمْدُ', target:100, source:'مأثور عن ابن مسعود' },
  { label:'التكبير الثلاثي',  text:'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، لَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ وَلِلَّهِ الْحَمْدُ', target:100, source:'مأثور عن عمر بن الخطاب' },
  { label:'صيغة سلمان',      text:'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ كَبِيرًا', target:33, source:'مأثور عن سلمان الفارسي رضي الله عنه' },
  { label:'الصيغة الجامعة',  text:'اللَّهُ أَكْبَرُ كَبِيرًا، وَالْحَمْدُ لِلَّهِ كَثِيرًا، وَسُبْحَانَ اللَّهِ بُكْرَةً وَأَصِيلًا', target:33, source:'من الأذكار المأثورة' },
  { label:'ذكر عرفة ⭐',    text:'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', target:100, source:'رواه الترمذي — خير الدعاء' },
  { label:'التلبية 🕋',     text:'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ', target:33, source:'متفق عليه — تلبية الحاج' },
  { label:'الاستغفار',       text:'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ', target:100, source:'حديث شريف' },
];
function initTakbeer() {
  const ring    = document.getElementById('tkb-ring');
  const countEl = document.getElementById('tkb-count');
  const progEl  = document.getElementById('tkb-prog');
  const wordEl  = document.getElementById('tkb-word');
  const resetBtn= document.getElementById('tkb-reset');
  const saveBtn = document.getElementById('tkb-save');
  const pillWrap= document.getElementById('tkb-pills');
  if (!ring) return;
  if (pillWrap) {
    phrases.forEach((p, i) => {
      const btn = document.createElement('button');
      btn.className = 'phrase-pill' + (i === 0 ? ' active' : '');
      btn.textContent = p.label;
      btn.onclick = () => {
        document.querySelectorAll('.phrase-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        STATE.takbeer.phrase  = p.text;
        STATE.takbeer.target  = p.target;
        STATE.takbeer.count   = 0;
        if (wordEl)   wordEl.textContent   = p.text;
        if (countEl)  countEl.textContent  = '0';
        if (progEl)   progEl.querySelector('span').style.width = '0%';
        saveState();
      };
      pillWrap.appendChild(btn);
    });
    if (wordEl) wordEl.textContent = STATE.takbeer.phrase || phrases[0].text;
  }
  function doCount() {
    STATE.takbeer.count++;
    STATE.takbeer.total++;
    const c = STATE.takbeer.count;
    const t = STATE.takbeer.target;
    if (countEl) {
      countEl.textContent = c;
      countEl.classList.add('bump');
      setTimeout(() => countEl.classList.remove('bump'), 150);
    }
    if (progEl) {
      const pct = Math.min((c / t) * 100, 100);
      progEl.querySelector('span').style.width = pct + '%';
    }
    if (navigator.vibrate) navigator.vibrate(25);
    if (c === t) {
      STATE.takbeer.sessions++;
      STATE.worship.takbeer_100 = true;
      saveState();
      checkBadges();
      showToast(`🎉 ما شاء الله! أتممت ${t} ${STATE.takbeer.phrase.split(' ')[0]}`);
    } else {
      saveState();
    }
    updateDashStats();
  }
  ring.addEventListener('click', doCount);
  ring.addEventListener('keydown', e => { if(e.key===' '||e.key==='Enter') doCount(); });
  ring.setAttribute('tabindex','0');
  if (resetBtn) resetBtn.onclick = () => {
    STATE.takbeer.count = 0;
    if (countEl) countEl.textContent = '0';
    if (progEl) progEl.querySelector('span').style.width = '0%';
    saveState();
    showToast('🔄 تمت إعادة العداد');
  };
  if (saveBtn) saveBtn.onclick = () => {
    showToast(`💾 تم حفظ ${STATE.takbeer.count} تسبيحة`);
  };
  if (countEl) countEl.textContent = STATE.takbeer.count;
  if (progEl) {
    const pct = Math.min((STATE.takbeer.count / (STATE.takbeer.target||33)) * 100, 100);
    progEl.querySelector('span').style.width = pct + '%';
  }
  const totalEl = document.getElementById('tkb-total');
  const sessEl  = document.getElementById('tkb-sess');
  if (totalEl) totalEl.textContent = STATE.takbeer.total.toLocaleString('ar-EG');
  if (sessEl)  sessEl.textContent  = STATE.takbeer.sessions;
  document.addEventListener('keydown', e => {
    if (e.code === 'Space' && document.getElementById('tkb-ring')) {
      e.preventDefault(); doCount();
    }
  });
}
function initMushaf() {
  const progBar    = document.getElementById('m-prog-bar');
  const progTxt    = document.getElementById('m-prog-txt');
  const addBtn     = document.getElementById('m-add-juz');
  const resetBtn   = document.getElementById('m-reset');
  const fontSlider = document.getElementById('m-font');
  const fontPreview= document.getElementById('m-font-preview');
  const planCards  = document.querySelectorAll('.plan-card');
  function updateMushafUI() {
    const j = STATE.mushaf.juz;
    const pct = Math.round((j / 30) * 100);
    if (progBar) progBar.style.width = pct + '%';
    if (progTxt) progTxt.textContent = j + ' جزء / 30 جزء · المتبقي ' + (30 - j) + ' جزء';
    if (addBtn) addBtn.disabled = j >= 30;
  }
  if (addBtn) addBtn.onclick = () => {
    if (STATE.mushaf.juz < 30) {
      STATE.mushaf.juz++;
      updateMushafUI();
      saveState();
      checkBadges();
      if (STATE.mushaf.juz === 30) showToast('🏆 ما شاء الله! أتممت الختمة كاملة!');
      else showToast(`📖 جزء ${STATE.mushaf.juz} مكتمل — بارك الله فيك`);
    }
  };
  if (resetBtn) resetBtn.onclick = () => {
    if (confirm('إعادة تعيين تقدم الختمة؟')) {
      STATE.mushaf.juz = 0;
      updateMushafUI();
      saveState();
      showToast('🔄 تمت إعادة التعيين');
    }
  };
  planCards.forEach(c => {
    if (c.dataset.plan === STATE.mushaf.plan) c.classList.add('active');
    c.addEventListener('click', () => {
      planCards.forEach(x => x.classList.remove('active'));
      c.classList.add('active');
      STATE.mushaf.plan = c.dataset.plan;
      saveState();
      showToast('✅ تم اختيار الخطة');
    });
  });
  if (fontSlider) {
    fontSlider.value = STATE.quranFontSize || 24;
    fontSlider.oninput = () => {
      applyQuranFont(+fontSlider.value);
    };
  }
  updateMushafUI();
}
const BADGE_DEFS = [
  { id:'mubakker',  label:'المبكّر',        cond: s => s.worship?.fajr },
  { id:'dhaker',    label:'الذاكرون',       cond: s => (s.takbeer?.total||0) >= 100 },
  { id:'saem',      label:'الصائمون',       cond: s => Object.values(s.fasting||{}).filter(Boolean).length >= 3 },
  { id:'khatim',    label:'الخاتمون',       cond: s => (s.mushaf?.juz||0) >= 30 },
  { id:'musare',    label:'المسارعون',      cond: s => ['fajr','zuhr','asr','maghrib','isha'].every(k => s.worship?.[k]) },
  { id:'mukabbir',  label:'المُكبِّرون',    cond: s => (s.takbeer?.total||0) >= 1000 },
  { id:'sadiq',     label:'المتصدقون',      cond: s => (s.charityDone?.length||0) >= 3 },
  { id:'kamil',     label:'جامع الخير',     cond: s => (s.streak||0) >= 5 },
  { id:'saher',     label:'فجر العشر',      cond: s => (s.streak||0) >= 5 },
  { id:'sabiq',     label:'السابق',         cond: s => Object.values(s.arafah?.milestones||{}).filter(Boolean).length >= 5 },
  { id:'lisan',     label:'لسان ذاكر',      cond: s => (s.takbeer?.total||0) >= 1000 },
  { id:'khatim2',   label:'الراسخون',       cond: s => (s.mushaf?.juz||0) >= 15 },
  { id:'wasil',     label:'الواصلون',       cond: s => (s.charityDone?.length||0) >= 5 },
];
function checkBadges() {
  BADGE_DEFS.forEach(def => {
    if (!STATE.badges.includes(def.id) && def.cond(STATE)) {
      STATE.badges.push(def.id);
      saveState();
      showToast('🏅 وسام جديد: ' + def.label);
      updateBadgeUI(def.id);
    }
  });
  updateBadgesPage();
}
function updateBadgeUI(id) {
  const el = document.querySelector(`[data-badge="${id}"]`);
  if (!el) return;
  el.classList.remove('locked');
  el.classList.add('earned', 'just-earned');
  setTimeout(() => el.classList.remove('just-earned'), 1000);
}
function updateBadgesPage() {
  BADGE_DEFS.forEach(def => {
    const el = document.querySelector(`[data-badge="${def.id}"]`);
    if (!el) return;
    const earned = STATE.badges.includes(def.id);
    el.classList.toggle('earned', earned);
    el.classList.toggle('locked', !earned);
  });
  const streakEl = document.getElementById('streak-count');
  if (streakEl) streakEl.textContent = STATE.streak || 0;
  for (let i = 1; i <= 10; i++) {
    const d = document.getElementById('sd-' + i);
    if (d) {
      d.classList.toggle('done',  i < (STATE.streak || 0));
      d.classList.toggle('today', i === (STATE.streak || 1));
    }
  }
  const earnedCount = document.getElementById('earned-count');
  if (earnedCount) earnedCount.textContent = STATE.badges.length + ' / ' + BADGE_DEFS.length;
}
function initSettings() {
  const darkSw = document.getElementById('dark-sw');
  if (darkSw) {
    darkSw.checked = STATE.theme === 'dark';
    darkSw.onchange = () => applyTheme(darkSw.checked ? 'dark' : 'light');
  }
  document.querySelectorAll('.notif-sw').forEach(sw => {
    sw.onchange = () => showToast(sw.checked ? '🔔 تم تفعيل الإشعارات' : '🔕 تم إيقاف الإشعارات');
  });
  const fs = document.getElementById('font-slider');
  if (fs) {
    fs.value = STATE.quranFontSize || 24;
    fs.oninput = () => applyQuranFont(+fs.value);
  }
  const resetBtn = document.getElementById('reset-all');
  if (resetBtn) resetBtn.onclick = () => {
    if (confirm('هل تريد مسح جميع البيانات؟ لا يمكن التراجع.')) {
      const th = STATE.theme;
      localStorage.removeItem(KEY);
      STATE = defaultState();
      STATE.theme = th;
      saveState();
      applyTheme(th);
      showToast('🔄 تمت إعادة التعيين');
      setTimeout(() => location.reload(), 800);
    }
  };
  document.querySelectorAll('.theme-card').forEach(c => {
    c.addEventListener('click', () => {
      const t = c.dataset.theme;
      if (t) applyTheme(t);
      document.querySelectorAll('.theme-card').forEach(x => x.classList.remove('active'));
      c.classList.add('active');
    });
    if (c.dataset.theme === STATE.theme) c.classList.add('active');
  });
}
const AI_SYSTEM = `أنت مساعد إسلامي متخصص في فضائل وأحكام عشر ذي الحجة، مصادرك القرآن الكريم والأحاديث الصحيحة وكتب التفاسير المعتمدة كابن كثير والطبري والقرطبي وكتب الفقه الإسلامي.
أجب باللغة العربية الفصحى الميسّرة، وابدأ دائماً بالدليل الشرعي مع ذكر المصدر (الكتاب والباب أو رقم الحديث).
اقتصر على أسئلة متعلقة بـ: عشر ذي الحجة، يوم عرفة، الأضحية، التكبير، الصيام في العشر، فضائل الأعمال في هذه الأيام. إذا سُئلت عن شيء خارج هذا الإطار، بيّن أنك متخصص في موضوع العشر فقط.
اجعل إجاباتك موجزة (3-6 جمل) ما لم يطلب المستخدم التفصيل.`;
let chatHistory = [];
async function sendAIMessage(userMsg) {
  const chatWrap = document.getElementById('chat-wrap');
  const input    = document.getElementById('chat-input');
  const sendBtn  = document.getElementById('chat-send');
  if (!chatWrap || !userMsg.trim()) return;
  appendMsg('user', userMsg);
  chatHistory.push({ role: 'user', content: userMsg });
  if (input) input.value = '';
  if (sendBtn) sendBtn.disabled = true;
  const typingId = 'typing-' + Date.now();
  chatWrap.insertAdjacentHTML('beforeend', `
    <div class="msg bot" id="${typingId}">
      <div class="msg-av bot">🤖</div>
      <div class="msg-bubble bot typing"><span></span><span></span><span></span></div>
    </div>`);
  chatWrap.scrollTop = chatWrap.scrollHeight;
  try {
    /* Gemini via /api/gemini Edge Function — API key secure server-side */
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: chatHistory.map(m => ({ role: m.role, content: m.content }))
      })
    });
    const data = await res.json();
    const reply = data.text || data.error || 'عذراً، حدث خطأ في الاتصال.';
    chatHistory.push({ role: 'assistant', content: reply });
    const typing = document.getElementById(typingId);
    if (typing) typing.remove();
    appendMsg('bot', reply);
  } catch (err) {
    const typing = document.getElementById(typingId);
    if (typing) typing.remove();
    appendMsg('bot', 'عذراً، تعذّر الاتصال. تحقق من اتصالك بالإنترنت وحاول مجدداً.');
  }
  if (sendBtn) sendBtn.disabled = false;
  chatWrap.scrollTop = chatWrap.scrollHeight;
}
function appendMsg(role, text) {
  const chatWrap = document.getElementById('chat-wrap');
  if (!chatWrap) return;
  const isBot = role === 'bot';
  const el = document.createElement('div');
  el.className = 'msg ' + role;
  el.innerHTML = `
    <div class="msg-av ${role}">${isBot ? '🤖' : '👤'}</div>
    <div class="msg-bubble ${role}" style="white-space:pre-wrap">${escapeHtml(text)}</div>`;
  chatWrap.appendChild(el);
  chatWrap.scrollTop = chatWrap.scrollHeight;
}
function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function initAIChat() {
  if (!document.getElementById("chat-input")) return;
  const input   = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  if (!input) return;
  sendBtn.onclick = () => sendAIMessage(input.value);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAIMessage(input.value); }
  });
  document.querySelectorAll('.sq').forEach(el => {
    el.addEventListener('click', () => {
      const q = el.querySelector('h3')?.textContent?.replace(/^❓\s*/,'');
      if (q && input) { input.value = q; sendAIMessage(q); }
    });
  });
}
const stories = [
  { ico:'🕌', title:'إبراهيم عليه السلام — النبي الخليل', body:'كان سيدنا إبراهيم أحب الناس إلى الله وأعظمهم توحيداً، سمّاه الله "خليل الله" أي صديقه المقرّب. كان الله يختبره كثيراً فيجتاز كل اختبار بتفوق لأن حبه لله كان أكبر من كل شيء.' },
  { ico:'🌟', title:'الابتلاء العظيم', body:'أمر الله سيدنا إبراهيم في المنام بذبح ابنه إسماعيل. فأخبره إبراهيم بذلك فقال إسماعيل: "يا أبتِ افعل ما تؤمر ستجدني إن شاء الله من الصابرين". وهنا ظهر إيمانهما العظيم!' },
  { ico:'🐏', title:'الفداء المبارك', body:'لما وضع إبراهيم ابنه للذبح، نادى المَلك: "يا إبراهيم قد صدّقت الرؤيا!" وفدى الله إسماعيل بكبش عظيم من الجنة. ومن ذلك اليوم أصبحت الأضحية شعيرة إسلامية نحتفل بها كل عيد أضحى.' },
  { ico:'🕋', title:'بناء بيت الله', body:'أمر الله إبراهيم وإسماعيل ببناء الكعبة المشرفة — بيت الله الحرام في مكة. فبنياها بأحجار جبل أبي قبيس وهما يدعوان: "ربنا تقبّل منا إنك أنت السميع العليم".' },
  { ico:'✨', title:'درسنا من القصة', body:'تعلّمنا أن حب الله أهم من كل شيء، وأن الطاعة لله حتى في الأشياء الصعبة هي طريق السعادة. في أيام العشر نتذكر هذه القصة ونضحي ونكبّر ونصلي شكراً لله.' }
];
let storyIdx = 0;
function initKids() {
  renderStory();
  const next = document.getElementById('story-next');
  const prev = document.getElementById('story-prev');
  if (next) next.onclick = () => { storyIdx = (storyIdx+1) % stories.length; renderStory(); };
  if (prev) prev.onclick = () => { storyIdx = (storyIdx-1+stories.length) % stories.length; renderStory(); };
  initQuiz();
  document.querySelectorAll('.activity-card[data-act]').forEach(el => {
    el.addEventListener('click', () => {
      const act = el.dataset.act;
      if (act === 'quiz') {
        const quizSec = document.getElementById('quiz-section');
        if (quizSec) quizSec.style.display = 'block';
      } else {
        showToast({ takbeer:'اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ 🎵', story:'استمع للقصة أعلاه ⬆️', stars:'نجوم ثريّا ⭐ تجمع مع كل نشاط!' }[act] || '🌟 نشاط ممتع!');
      }
    });
  });
}
function renderStory() {
  const s = stories[storyIdx];
  const ico  = document.getElementById('story-ico');
  const ttl  = document.getElementById('story-title');
  const body = document.getElementById('story-body');
  const cnt  = document.getElementById('story-count');
  if (ico)  ico.textContent  = s.ico;
  if (ttl)  ttl.textContent  = s.title;
  if (body) body.textContent = s.body;
  if (cnt)  cnt.textContent  = (storyIdx+1) + ' / ' + stories.length;
}
const quiz = [
  { q:'كم عدد أيام العشر المباركة؟', opts:['5','7','10','15'], a:2 },
  { q:'ما هو اليوم الأفضل في عشر ذي الحجة؟', opts:['اليوم الأول','اليوم الثالث','يوم عرفة (التاسع)','يوم العيد'], a:2 },
  { q:'لماذا نضحّي في عيد الأضحى؟', opts:['لأن اللحم لذيذ','اقتداءً بسيدنا إبراهيم','يوم العطلة','عادة قديمة'], a:1 },
  { q:'ما الذي نقوله كثيراً في أيام العشر؟', opts:['أهلاً وسهلاً','الله أكبر','صباح الخير','شكراً'], a:1 },
  { q:'في أي شهر هجري تأتي أيام العشر؟', opts:['رمضان','محرم','ذو الحجة','شوال'], a:2 },
];
let qIdx = 0;
function initQuiz() {
  const qBox = document.getElementById('quiz-section');
  if (!qBox) return;
  renderQuestion();
}
function renderQuestion() {
  const qEl   = document.getElementById('quiz-q');
  const optsEl= document.getElementById('quiz-opts');
  const fbEl  = document.getElementById('quiz-fb');
  const nextBtn= document.getElementById('quiz-next');
  if (!qEl) return;
  if (qIdx >= quiz.length) {
    qEl.textContent = '🎉 أحسنت! أنهيت المسابقة بنجاح';
    if (optsEl) optsEl.innerHTML = '';
    if (fbEl)   fbEl.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    return;
  }
  const q = quiz[qIdx];
  qEl.textContent = `سؤال ${qIdx+1}: ${q.q}`;
  if (fbEl)   { fbEl.style.display = 'none'; fbEl.textContent = ''; }
  if (nextBtn) nextBtn.style.display = 'none';
  if (optsEl) {
    optsEl.innerHTML = '';
    q.opts.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-opt';
      btn.textContent = opt;
      btn.onclick = () => {
        optsEl.querySelectorAll('.quiz-opt').forEach(b => b.disabled = true);
        if (i === q.a) {
          btn.classList.add('correct');
          if (fbEl) { fbEl.textContent = '✅ إجابة صحيحة!'; fbEl.style.color='#2e7d32'; fbEl.style.display='block'; }
        } else {
          btn.classList.add('wrong');
          optsEl.querySelectorAll('.quiz-opt')[q.a].classList.add('correct');
          if (fbEl) { fbEl.textContent = '❌ الإجابة الصحيحة: ' + q.opts[q.a]; fbEl.style.color='#c62828'; fbEl.style.display='block'; }
        }
        if (nextBtn) nextBtn.style.display = 'block';
      };
      optsEl.appendChild(btn);
    });
  }
}
window.quizNext = function() {
  qIdx++;
  renderQuestion();
};
function initCharity() {
  document.querySelectorAll('.charity-act[data-act]').forEach(el => {
    const act = el.dataset.act;
    const done = (STATE.charityDone || []).includes(act);
    if (done) markCharityDone(el);
    el.addEventListener('click', () => {
      if ((STATE.charityDone||[]).includes(act)) {
        showToast('سجّلت هذا العمل بالفعل ✅');
        return;
      }
      STATE.charityDone = [...(STATE.charityDone||[]), act];
      markCharityDone(el);
      saveState();
      checkBadges();
      showToast('💝 بارك الله فيك — ' + el.querySelector('h3')?.textContent);
    });
  });
}
function markCharityDone(el) {
  const btn = el.querySelector('.btn');
  if (btn) { btn.textContent = '✅ تم'; btn.disabled = true; }
  el.style.borderColor = 'var(--green-soft)';
  el.style.background  = 'var(--green-pale)';
}
function initSidebar() {
  const hamburger = document.getElementById('hamburger');
  const sidebar   = document.querySelector('.sidebar');
  const overlay   = document.querySelector('.sidebar-overlay');
  if (!hamburger || !sidebar) return;
  hamburger.onclick = () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
  };
  overlay.onclick = () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
  };
}
let toastTimer;
function showToast(msg) {
  let toast = document.getElementById('zad-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'zad-toast'; toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}
window.showToast = showToast;
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(STATE.theme);
  applyQuranFont(STATE.quranFontSize || 24);
  document.querySelectorAll('.btn-theme').forEach(btn => {
    btn.onclick = toggleTheme;
    if (!btn.getAttribute('aria-label')) btn.setAttribute('aria-label', 'تبديل المظهر');
  });
  document.querySelectorAll('.dark-switch').forEach(sw => {
    sw.checked = (STATE.theme === 'dark' || STATE.theme === 'oled');
    sw.onchange = () => applyTheme(sw.checked ? 'dark' : 'light');
  });
  initSidebar();
  initContextualDashboard();  
  startCountdown();
  initChecklist();
  initFasting();
  updateDashStats();
  initTakbeer();
  initMushaf();
  initAIChat();
  initKids();
  initSettings();
  initCharity();
  checkBadges();
  updateBadgesPage();
  initAnimations();
  initPWA();
  initSearch();
  initVerseRotator();
  initSpeechRecognition();
  initNotifBanner();
  if (STATE.fontScale) applyFontSize(STATE.fontScale);
});
function initAnimations() {
  document.querySelectorAll('.grid:not(.no-stagger)').forEach(g => {
    g.classList.add('stagger');
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.card, .tl-item, .info-step, .badge, .audio').forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = (i % 6) * 0.06 + 's';
    io.observe(el);
  });
  document.querySelectorAll('.check').forEach(el => {
    const orig = el.onclick;
    const existingListener = el._zadAnimBound;
    if (existingListener) return;  
    el._zadAnimBound = true;
    el.addEventListener('click', () => {
      if (el.classList.contains('done')) {
        const ripple = document.createElement('div');
        ripple.className = 'check-ripple';
        el.appendChild(ripple);
        el.classList.add('just-done');
        setTimeout(() => {
          ripple.remove();
          el.classList.remove('just-done');
        }, 500);
      }
    });
  });
  document.querySelectorAll('.fast-day').forEach(el => {
    if (el._zadAnimBound) return;
    el._zadAnimBound = true;
    el.addEventListener('click', () => {
      if (el.classList.contains('done')) {
        const rip = document.createElement('div');
        rip.className = 'fast-ripple';
        el.appendChild(rip);
        setTimeout(() => rip.remove(), 500);
      }
    });
  });
  document.querySelectorAll('.badge.earned').forEach(b => {
    if (!b._zadAnimBound) {
      b._zadAnimBound = true;
    }
  });
  initCountdownFlip();
  initPageTransition();
}
let _prevCd = {};
function initCountdownFlip() {
  const ids = ['cd-days','cd-hrs','cd-mins','cd-secs'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const mo = new MutationObserver(() => {
      const newVal = el.textContent;
      if (_prevCd[id] !== newVal) {
        el.classList.remove('flip');
        requestAnimationFrame(() => {
          el.classList.add('flip');
          setTimeout(() => el.classList.remove('flip'), 250);
        });
        _prevCd[id] = newVal;
      }
    });
    mo.observe(el, { childList: true, characterData: true, subtree: true });
  });
}
function animateBadgeUnlock(id) {
  const el = document.querySelector('[data-badge="' + id + '"]');
  if (!el) return;
  el.classList.remove('locked');
  el.classList.add('earned', 'just-earned');
  setTimeout(() => el.classList.remove('just-earned'), 1000);
}
function initPageTransition() {
  const links = document.querySelectorAll('.nav a, a.card');
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript') || href.startsWith('http')) return;
      e.preventDefault();
      const main = document.querySelector('.main');
      if (main) {
        main.style.transition = 'opacity .2s ease, transform .2s ease';
        main.style.opacity = '0';
        main.style.transform = 'translateY(8px)';
      }
      setTimeout(() => { window.location.href = href; }, 200);
    });
  });
}
function animateVerseTransition(callback) {
  const arEl  = document.getElementById('verse-ar');
  const srcEl = document.getElementById('verse-src');
  const trEl  = document.getElementById('verse-tr');
  const els = [arEl, srcEl, trEl].filter(Boolean);
  els.forEach(el => {
    el.style.transition = 'opacity .2s ease, transform .2s ease';
    el.style.opacity = '0';
    el.style.transform = 'translateY(-8px)';
  });
  setTimeout(() => {
    callback();  
    els.forEach(el => {
      el.style.transform = 'translateY(8px)';
      el.style.opacity = '0';
    });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        els.forEach(el => {
          el.style.transition = 'opacity .3s ease, transform .3s ease';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        });
      });
    });
  }, 220);
}
window.animateVerseTransition = animateVerseTransition;
function applyFontSize(size) {
  document.documentElement.setAttribute('data-font', size);
  STATE.fontScale = size;
  saveState();
}
window.applyFontSize = applyFontSize;
window.applyTheme = function(theme) {
  STATE.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  document.querySelectorAll('.dark-switch').forEach(el => {
    el.checked = (theme === 'dark' || theme === 'oled');
  });
  document.querySelectorAll('#oled-sw').forEach(el => {
    el.checked = (theme === 'oled');
  });
  document.querySelectorAll('.btn-theme').forEach(btn => {
    btn.textContent = (theme === 'dark' || theme === 'oled') ? '☀️' : '🌙';
  });
  document.querySelectorAll('.theme-card').forEach(c => {
    c.classList.toggle('active', c.dataset.theme === theme);
  });
  saveState();
};
let deferredInstall = null;
function initPWA() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredInstall = e;
    showInstallBanner();
  });
}
function showInstallBanner() {
  const b = document.getElementById('pwa-banner');
  if (b) b.style.display = 'flex';
}
window.installPWA = function() {
  if (!deferredInstall) {
    showToast('📲 افتح القائمة ← "إضافة للشاشة الرئيسية"');
    return;
  }
  deferredInstall.prompt();
  deferredInstall.userChoice.then(r => {
    if (r.outcome === 'accepted') showToast('✅ تم تثبيت التطبيق!');
    deferredInstall = null;
    const b = document.getElementById('pwa-banner');
    if (b) b.style.display = 'none';
  });
};
async function requestNotifPermission() {
  if (!('Notification' in window)) {
    showToast('⚠️ المتصفح لا يدعم الإشعارات');
    return false;
  }
  const perm = await Notification.requestPermission();
  if (perm === 'granted') {
    showToast('🔔 تم تفعيل الإشعارات بنجاح!');
    scheduleReminders();
    return true;
  }
  showToast('🔕 تم رفض الإشعارات');
  return false;
}
window.requestNotifPermission = requestNotifPermission;
function scheduleReminders() {
  const msg = (title, body) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: './icons/icon-192.svg', dir: 'rtl', lang: 'ar' });
    }
  };
  setTimeout(() => msg('🕌 زاد العشر', 'لا تنس وردك اليومي — بارك الله فيك'), 30000);
}
function initNotifBanner() {
  const btn = document.getElementById('enable-notif');
  if (btn) btn.onclick = requestNotifPermission;
  if (Notification.permission === 'granted') {
    const b = document.getElementById('notif-banner');
    if (b) b.style.display = 'none';
  }
}
const SEARCH_INDEX = [
  { ico:'🏠', title:'لوحة التحكم',         sub:'الصفحة الرئيسية والإحصائيات',    url:'index.html' },
  { ico:'✨', title:'فضائل العشر',         sub:'أدلة الفضل من القرآن والسنة',   url:'fadael.html' },
  { ico:'📿', title:'جدول العبادات',       sub:'ورد يومي — صلوات، صيام، ذكر',  url:'worship.html' },
  { ico:'📖', title:'مصحف العشر',          sub:'خطة ختمة مرنة مع تتبع الجزء', url:'mushaf.html' },
  { ico:'🕋', title:'المُكبِّر',           sub:'عداد تكبير مع حفظ الإحصائيات', url:'takbeer.html' },
  { ico:'🐏', title:'دليل الأضحية',        sub:'شروط وعيوب وأحكام الأضحية',   url:'odhiya.html' },
  { ico:'🌄', title:'يوم عرفة',            sub:'برنامج متكامل ساعة بساعة',      url:'arafah.html' },
  { ico:'💚', title:'صدقة العشر',          sub:'أبواب البر وأعمال الخير',       url:'sadaqah.html' },
  { ico:'🏅', title:'أوسمتي',              sub:'إنجازاتك الروحانية والشارات',  url:'badges.html' },
  { ico:'🧒', title:'وضع الأطفال',         sub:'قصص وألعاب ومسابقات للصغار',  url:'kids.html' },
  { ico:'🤖', title:'تدبّر بالذكاء',      sub:'اسأل عن آيات وأحكام العشر',    url:'ai.html' },
  { ico:'🎙️', title:'تسميع القرآن',        sub:'تصحيح التلاوة بالذكاء الاصطناعي', url:'tasmee.html' },
  { ico:'🚩', title:'بلاغ مشكلة',      sub:'أرسل بلاغاً عن خطأ أو اقتراح',   url:'report.html' },
  { ico:'⚙️', title:'الإعدادات',          sub:'المظهر والتنبيهات والخصوصية',  url:'settings.html' },
  { ico:'🌙', title:'الوضع الداكن',        sub:'تفعيل / إيقاف الوضع الليلي',   url:'settings.html' },
  { ico:'📅', title:'صيام يوم عرفة',       sub:'يكفر ذنوب سنتين ماضية وقادمة', url:'worship.html' },
  { ico:'📿', title:'التكبير المطلق',       sub:'من أول ذي الحجة حتى العيد',    url:'takbeer.html' },
  { ico:'🌅', title:'فجر يوم عرفة',       sub:'برنامج الفجر وما بعده',         url:'arafah.html' },
];
function initSearch() {
  const searchInputs = document.querySelectorAll('.search input');
  searchInputs.forEach(inp => {
    inp.addEventListener('focus', openSearchOverlay);
    inp.addEventListener('input', filterSearch);
  });
  if (!document.getElementById('search-overlay')) {
    const ov = document.createElement('div');
    ov.className = 'search-overlay'; ov.id = 'search-overlay';
    ov.innerHTML = `
      <div class="search-box-big">
        <input id="search-main" placeholder="ابحث في التطبيق..." autocomplete="off" dir="rtl">
        <div class="search-results" id="search-results"></div>
      </div>`;
    document.body.appendChild(ov);
    ov.addEventListener('click', e => { if (e.target === ov) closeSearchOverlay(); });
    document.getElementById('search-main').addEventListener('input', filterSearch);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSearchOverlay(); });
  }
}
function openSearchOverlay() {
  document.getElementById('search-overlay').classList.add('open');
  setTimeout(() => document.getElementById('search-main')?.focus(), 80);
  renderSearchResults('');
}
function closeSearchOverlay() {
  document.getElementById('search-overlay')?.classList.remove('open');
}
function filterSearch() {
  const q = (document.getElementById('search-main')?.value || '').trim();
  renderSearchResults(q);
}
function renderSearchResults(q) {
  const container = document.getElementById('search-results');
  if (!container) return;
  const filtered = q
    ? SEARCH_INDEX.filter(i => i.title.includes(q) || i.sub.includes(q))
    : SEARCH_INDEX;
  if (!filtered.length) {
    container.innerHTML = '<div class="search-empty">لم يُعثر على نتائج 🔍</div>';
    return;
  }
  container.innerHTML = filtered.slice(0, 8).map(i => `
    <div class="search-result" onclick="location.href='${i.url}';closeSearchOverlay()">
      <div class="sr-ico">${i.ico}</div>
      <div class="sr-txt"><b>${i.title}</b><small>${i.sub}</small></div>
    </div>`).join('');
}
window.closeSearchOverlay = closeSearchOverlay;
const DAILY_VERSES = [
  { src:'سورة الفجر 1-2', ar:'وَالْفَجْرِ ۝ وَلَيَالٍ عَشْرٍ', tr:'أقسم الله بهذه الليالي العشر تنويهاً بشأنها وعظيم فضلها.' },
  { src:'سورة الحج 28', ar:'وَيَذْكُرُوا اسْمَ اللَّهِ فِي أَيَّامٍ مَّعْلُومَاتٍ', tr:'قال المفسرون: هي عشر ذي الحجة، أيام العمل الصالح.' },
  { src:'سورة البقرة 197', ar:'فَمَن فَرَضَ فِيهِنَّ الْحَجَّ فَلَا رَفَثَ وَلَا فُسُوقَ وَلَا جِدَالَ فِي الْحَجِّ', tr:'في هذه الأيام يُتجنب الرفث والخصام.' },
  { src:'سورة الكوثر 1-2', ar:'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ ۝ فَصَلِّ لِرَبِّكَ وَانْحَرْ', tr:'الصلاة والأضحية — ركيزتا عيد الأضحى.' },
  { src:'سورة الأنعام 162', ar:'قُلْ إِنَّ صَلَاتِي وَنُسُكِي وَمَحْيَايَ وَمَمَاتِي لِلَّهِ رَبِّ الْعَالَمِينَ', tr:'كل شيء لله — هذا معنى الأضحية.' },
  { src:'سورة البقرة 286', ar:'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا', tr:'اعمل بما تستطيع في هذه الأيام — الله رحيم.' },
  { src:'سورة آل عمران 133', ar:'وَسَارِعُوا إِلَىٰ مَغْفِرَةٍ مِّن رَّبِّكُمْ وَجَنَّةٍ عَرْضُهَا السَّمَاوَاتُ وَالْأَرْضُ', tr:'العشر فرصة المسارعة إلى الجنة.' },
  { src:'سورة الذاريات 56', ar:'وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ', tr:'العبادة الحقيقية — غاية الوجود الإنساني.' },
];
let verseIdx = 0;
function initVerseRotator() {
  const arEl  = document.getElementById('verse-ar');
  const srcEl = document.getElementById('verse-src');
  const trEl  = document.getElementById('verse-tr');
  const dotsEl= document.getElementById('verse-dots');
  if (!arEl) return;
  verseIdx = new Date().getDate() % DAILY_VERSES.length;
  renderVerse();
  if (dotsEl) {
    DAILY_VERSES.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'verse-dot' + (i === verseIdx ? ' active' : '');
      d.onclick = () => { verseIdx = i; renderVerse(); };
      dotsEl.appendChild(d);
    });
  }
  function renderVerse() {
    const v = DAILY_VERSES[verseIdx];
    if (arEl)  arEl.textContent  = v.ar;
    if (srcEl) srcEl.textContent = v.src;
    if (trEl)  trEl.textContent  = v.tr;
    document.querySelectorAll('.verse-dot').forEach((d,i) =>
      d.classList.toggle('active', i === verseIdx));
  }
  function renderVerseAnimated() {
    if (typeof animateVerseTransition === 'function') {
      animateVerseTransition(renderVerse);
    } else {
      renderVerse();
    }
  }
  setInterval(() => {
    verseIdx = (verseIdx+1) % DAILY_VERSES.length;
    renderVerseAnimated();
  }, 8000);
}
function updateCircularRing(pct) {
  const ring = document.getElementById('ring-circle');
  if (!ring) return;
  const R = 44, C = 2 * Math.PI * R;
  ring.style.strokeDasharray = C;
  ring.style.strokeDashoffset = C - (C * pct / 100);
  const pctEl = document.getElementById('ring-pct');
  if (pctEl) pctEl.textContent = pct + '%';
}
let recognition = null;
let isListening = false;
function initSpeechRecognition() {
  const micBtn   = document.getElementById('mic-btn');
  const transEl  = document.getElementById('transcript');
  const feedEl   = document.getElementById('speech-feedback');
  if (!micBtn) return;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    micBtn.textContent = '⚠️';
    micBtn.title = 'المتصفح لا يدعم التعرف على الصوت';
    micBtn.style.opacity = '.5';
    if (feedEl) feedEl.textContent = 'استخدم Chrome أو Safari للتسميع الصوتي';
    return;
  }
  recognition = new SpeechRecognition();
  recognition.lang = 'ar-SA';
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.onresult = e => {
    const transcript = Array.from(e.results)
      .map(r => r[0].transcript).join('');
    if (transEl) transEl.textContent = transcript;
    if (e.results[0].isFinal) {
      analyzeRecitation(transcript);
    }
  };
  recognition.onend = () => {
    isListening = false;
    micBtn.classList.remove('listening');
    micBtn.textContent = '🎙️';
  };
  recognition.onerror = e => {
    isListening = false;
    micBtn.classList.remove('listening');
    micBtn.textContent = '🎙️';
    if (feedEl) feedEl.textContent = 'حدث خطأ في الميكروفون — حاول مجدداً';
  };
  micBtn.onclick = () => {
    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
        isListening = true;
        micBtn.classList.add('listening');
        micBtn.textContent = '⏹️';
        if (transEl) transEl.textContent = 'جارٍ الاستماع...';
        if (feedEl)  feedEl.textContent  = '';
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      } catch(e) { console.warn(e); }
    }
  };
}
async function analyzeRecitation(text) {
  const targetEl = document.getElementById('tasmee-target');
  const feedEl   = document.getElementById('speech-feedback');
  const accEl    = document.getElementById('accuracy-pct');
  if (!feedEl) return;
  const target = targetEl ? targetEl.getAttribute('data-text') : '';
  if (!target) {
    if (feedEl) feedEl.textContent = 'اختر آية أولاً';
    return;
  }
  const cleanText = s => s.replace(/[ًٌٍَُِّْ]/g,'').trim();
  const targetWords = cleanText(target).split(/\s+/);
  const spokenWords = cleanText(text).split(/\s+/);
  let matched = 0;
  targetWords.forEach((w,i) => { if (spokenWords[i] === w) matched++; });
  const acc = Math.round((matched / targetWords.length) * 100);
  if (accEl) accEl.textContent = acc + '%';
  updateAccuracyRing(acc);
  if (feedEl) {
    if (acc >= 90) feedEl.innerHTML = '<span style="color:#2e7d32">✅ ممتاز! تلاوتك صحيحة</span>';
    else if (acc >= 70) feedEl.innerHTML = '<span style="color:#f57c00">⚠️ جيد — راجع بعض الكلمات</span>';
    else feedEl.innerHTML = '<span style="color:#c62828">❌ حاول مجدداً — استمع للتلاوة أولاً</span>';
  }
}
function updateAccuracyRing(pct) {
  const ring = document.getElementById('acc-ring');
  if (!ring) return;
  const R = 52, C = 2*Math.PI*R;
  const color = pct>=90?'#4caf50':pct>=70?'#ff9800':'#e53935';
  ring.style.stroke = color;
  ring.style.strokeDasharray = C;
  ring.style.strokeDashoffset = C - (C*pct/100);
}
const HIJRI_REF = {
  greg:  new Date(2026, 4, 28, 0, 0, 0), 
  year:  1447,
  month: 12,   
  day:   1
};
const HIJRI_MONTH_LEN = [30,29,30,29,30,29,30,29,30,29,30,29];
function getHijriDate(date = new Date()) {
  const diffDays = Math.round((date - HIJRI_REF.greg) / 86400000);
  let { year, month, day } = HIJRI_REF;
  let d = (day - 1) + diffDays;
  if (d >= 0) {
    while (d >= HIJRI_MONTH_LEN[month - 1]) {
      d -= HIJRI_MONTH_LEN[month - 1];
      month++;
      if (month > 12) { month = 1; year++; }
    }
  } else {
    while (d < 0) {
      month--;
      if (month < 1) { month = 12; year--; }
      d += HIJRI_MONTH_LEN[month - 1];
    }
  }
  return { year, month, day: d + 1 };
}
function getDhulHijjahDay() {
  const h = getHijriDate();
  return h.month === 12 ? h.day : null;
}
const isArafahDay   = () => getDhulHijjahDay() === 9;
const isEidDay      = () => getDhulHijjahDay() === 10;
const isTashriq     = () => { const d = getDhulHijjahDay(); return d >= 11 && d <= 13; };
const isInAshra     = () => { const d = getDhulHijjahDay(); return d !== null && d >= 1 && d <= 10; };
window.getHijriDate = getHijriDate;
window.getDhulHijjahDay = getDhulHijjahDay;
window.isArafahDay  = isArafahDay;
function getApproxMaghrib(lat = 24.7) { 
  const d = new Date();
  const J = Math.floor((d - new Date(d.getFullYear(),0,0)) / 86400000);
  const decl = 23.45 * Math.sin((360/365 * (J - 81)) * Math.PI / 180);
  const cosH  = (Math.sin(-0.83 * Math.PI/180) - Math.sin(lat*Math.PI/180)*Math.sin(decl*Math.PI/180))
              / (Math.cos(lat*Math.PI/180)*Math.cos(decl*Math.PI/180));
  const H = Math.acos(Math.max(-1, Math.min(1, cosH))) * 180 / Math.PI;
  const tz = -(d.getTimezoneOffset() / 60);
  const sunsetHr = 12 + H/15 + tz - (4 * 0) / 60; 
  const h = Math.floor(sunsetHr);
  const m = Math.floor((sunsetHr - h) * 60);
  const maghrib = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m + 3, 0); 
  return maghrib;
}
async function fetchPrayerTimesIfPossible() {
  try {
    const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, {timeout:5000}));
    const { latitude: lat, longitude: lng } = pos.coords;
    const today = new Date().toLocaleDateString('en-CA'); 
    const url = `https://api.aladhan.com/v1/timings/${today}?latitude=${lat}&longitude=${lng}&method=4`;
    const r = await fetch(url);
    const data = await r.json();
    if (data?.data?.timings?.Maghrib) {
      const [hh, mm] = data.data.timings.Maghrib.split(':').map(Number);
      const d = new Date();
      return new Date(d.getFullYear(), d.getMonth(), d.getDate(), hh, mm, 0);
    }
  } catch (e) {}
  return null; 
}
function getTimePhase() {
  const h = new Date().getHours();
  if (h <  4) return { name:'layl',    emoji:'🌙', label:'الليل',          gradient:'#020408,#05080f' };
  if (h <  5) return { name:'sahar',   emoji:'🌠', label:'وقت السحر',      gradient:'#120822,#200a3a' };
  if (h <  7) return { name:'fajr',    emoji:'🌅', label:'وقت الفجر',      gradient:'#1a0e3a,#2d1e60' };
  if (h <  9) return { name:'ishraq',  emoji:'🌤️', label:'الإشراق',        gradient:'#0d3860,#0d6098' };
  if (h < 12) return { name:'duha',    emoji:'☀️',  label:'وقت الضحى',      gradient:'#0e3b2e,#1a5d47' };
  if (h < 15) return { name:'zuhr',    emoji:'🕛',  label:'نهار عرفة',      gradient:'#1a3a5c,#0e5080' };
  if (h < 17) return { name:'asr',     emoji:'🌤️', label:'وقت العصر',      gradient:'#3a2a0a,#6a4a10' };
  if (h < 18) return { name:'golden',  emoji:'✨',  label:'الساعة الذهبية ⭐', gradient:'#5a2a00,#9a5000' };
  if (h < 20) return { name:'maghrib', emoji:'🌇', label:'وقت المغرب',      gradient:'#3a0a10,#6a1010' };
  return               { name:'isha',   emoji:'🌙', label:'وقت العشاء',      gradient:'#050a08,#0a1210' };
}
function applyTimeBackground(el) {
  if (!el) return;
  const { gradient } = getTimePhase();
  const [c1, c2] = gradient.split(',');
  el.style.background = `linear-gradient(160deg, ${c1}, ${c2})`;
}
function initContextualDashboard() {
  const day = getDhulHijjahDay();
  if (!day || day > 13) return;
  const ARABIC_NUMS = ['','الأول','الثاني','الثالث','الرابع','الخامس','السادس','السابع','الثامن','التاسع','العاشر'];
  const heroEye  = document.querySelector('.hero-eyebrow');
  const heroH1   = document.querySelector('.hero h1');
  const heroP    = document.querySelector('.hero p');
  const heroEl   = document.querySelector('.hero');
  const notifEl  = document.getElementById('notif-banner');
  if (isArafahDay()) {
    document.title = '⭐ يوم عرفة — زاد العشر';
    if (heroEye)  heroEye.textContent = '⭐ يوم عرفة — يوم الإجابة العظمى';
    if (heroH1)   heroH1.innerHTML    = 'ربيع القلوب وعتق الرقاب';
    if (heroP)    heroP.textContent   = 'أكثر من الدعاء والذكر — خير الدعاء دعاء يوم عرفة';
    if (heroEl)   heroEl.style.background = 'linear-gradient(135deg, #3a1a00, #7a3a00 60%, #b05a00)';
    startArafahMaghribCountdown();
    if (notifEl) {
      notifEl.style.background = 'linear-gradient(135deg, rgba(180,100,0,.15), rgba(180,100,0,.06))';
      notifEl.style.borderColor = 'rgba(200,120,0,.35)';
      const b = notifEl.querySelector('b'), s = notifEl.querySelector('small');
      if (b) b.textContent = '⭐ اليوم يوم عرفة — لا تغفل عن الدعاء';
      if (s) s.textContent = 'ساعة الإجابة قبيل المغرب — أعِدّ دعاءك';
    }
  } else if (isEidDay()) {
    if (heroEye) heroEye.textContent = '🎉 عيد الأضحى المبارك';
    if (heroH1)  heroH1.textContent  = 'تقبّل الله منكم ومنا';
    if (heroP)   heroP.textContent   = 'اللهم اجعله عيد عتق وقبول — كل عام وأنتم بخير';
    if (heroEl)  heroEl.style.background = 'linear-gradient(135deg, #0e3b2e, #1a6040)';
  } else {
    const label = day <= 10 ? (ARABIC_NUMS[day] || day) : day;
    if (heroEye) heroEye.textContent = `اليوم ${label} من عشر ذي الحجة`;
    if (notifEl) {
      const b = notifEl.querySelector('b'), s = notifEl.querySelector('small');
      if (b) b.textContent = `اليوم ${day < 10 ? day : ''} من العشر المباركة`;
      if (s) s.textContent = getDhulHijjahDay() < 9
        ? `${9 - day} أيام على يوم عرفة — اغتنم ما بقي`
        : 'استمر في ذكر الله وإحياء هذه الأيام';
    }
  }
}
function startArafahMaghribCountdown() {
  const daysBox = document.querySelector('.cd-box:first-child');
  if (daysBox) daysBox.style.display = 'none';
  const hrsEl  = document.getElementById('cd-hrs');
  const minsEl = document.getElementById('cd-mins');
  const secsEl = document.getElementById('cd-secs');
  if (!hrsEl) return;
  const labels = document.querySelectorAll('.cd-lbl');
  if (labels[1]) labels[1].textContent = 'ساعة';
  if (labels[2]) labels[2].textContent = 'دقيقة';
  if (labels[3]) labels[3].textContent = 'ثانية';
  let maghribTime = getApproxMaghrib();
  fetchPrayerTimesIfPossible().then(t => { if (t) maghribTime = t; });
  clearInterval(window._countdownInterval);
  window._countdownInterval = setInterval(() => {
    const diff = Math.max(0, maghribTime - new Date());
    const pad = n => String(n).padStart(2,'0');
    if (hrsEl)  hrsEl.textContent  = pad(Math.floor(diff / 3600000));
    if (minsEl) minsEl.textContent = pad(Math.floor((diff % 3600000) / 60000));
    if (secsEl) secsEl.textContent = pad(Math.floor((diff % 60000) / 1000));
  }, 1000);
}
const ARAFAH_MILESTONES = [
  { id:'sahar',    emoji:'🌠', time:'03:30',      label:'السحور والتهجد',      desc:'4 ركعات تهجد + دعاء السحر + استغفار', dua:'رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنتَ التَّوَّابُ الرَّحِيمُ' },
  { id:'fajr',     emoji:'🌅', time:'الفجر',      label:'الفجر والإشراق',      desc:'صلاة الفجر جماعةً + ذكر حتى الإشراق + صلاة ركعتين (أجر حجة وعمرة)', dua:'أجر الإشراق: "اللهم أنت السلام ومنك السلام تباركت يا ذا الجلال والإكرام"' },
  { id:'duha',     emoji:'☀️',  time:'09:00',      label:'القرآن والضحى',       desc:'قراءة وتدبر القرآن — سورة الكهف والبقرة + صلاة الضحى 4 ركعات', dua:'' },
  { id:'khutba',   emoji:'📻',  time:'12:00',      label:'خطبة عرفة والظهر',   desc:'الاستماع لخطبة عرفة من الحجيج + صلاة الظهر + قيلولة خفيفة', dua:'' },
  { id:'golden',   emoji:'⭐',  time:'العصر→المغرب', label:'الساعة الذهبية ⭐', desc:'وقت الضراعة الأكبر — أكثر من لا إله إلا الله والدعاء', dua:'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ' },
  { id:'iftar',    emoji:'🌇', time:'المغرب',     label:'الإفطار والشكر',      desc:'إفطار الصائم — اختم بالحمد والثناء', dua:'اللهم لك صمت وعلى رزقك أفطرت' },
];
function initArafahPage() {
  const timelineEl = document.getElementById('af-timeline');
  if (!timelineEl) return;
  if (!STATE.arafah) STATE.arafah = { milestones: {}, dhikrCount: 0, khushooMode: false };
  timelineEl.innerHTML = '';
  ARAFAH_MILESTONES.forEach((m, i) => {
    const done = !!STATE.arafah.milestones[m.id];
    const card = document.createElement('div');
    card.className = `af-milestone${done ? ' af-done' : ''}${m.id === 'golden' ? ' af-golden' : ''}`;
    card.id = 'af-ms-' + m.id;
    card.innerHTML = `
      <div class="af-ms-left">
        <div class="af-ms-time">${m.time}</div>
        <div class="af-ms-emoji">${m.emoji}</div>
        <div class="af-ms-line ${i < ARAFAH_MILESTONES.length - 1 ? 'has-line' : ''}"></div>
      </div>
      <div class="af-ms-body">
        <div class="af-ms-title">${m.label}</div>
        <div class="af-ms-desc">${m.desc}</div>
        ${m.dua ? `<div class="af-ms-dua">${m.dua}</div>` : ''}
        <button class="af-ms-btn${done ? ' done' : ''}" onclick="checkMilestone('${m.id}', this)">
          ${done ? '✅ تم' : '☐ تحديد كمنجز'}
        </button>
      </div>`;
    timelineEl.appendChild(card);
  });
  updateArafahProgress();
  const dhikrEl = document.getElementById('af-dhikr-count');
  if (dhikrEl) dhikrEl.textContent = STATE.arafah.dhikrCount || 0;
  const dhikrRing = document.getElementById('af-dhikr-ring');
  if (dhikrRing) dhikrRing.addEventListener('click', countArafahDhikr);
  if (STATE.arafah.khushooMode) document.body.classList.add('khushoo');
  initTimeBackground();
}
window.initArafahPage = initArafahPage;
function checkMilestone(id, btn) {
  if (!STATE.arafah) STATE.arafah = { milestones: {}, dhikrCount: 0, khushooMode: false };
  const done = !STATE.arafah.milestones[id];
  STATE.arafah.milestones[id] = done;
  saveState();
  const card = document.getElementById('af-ms-' + id);
  if (card) card.classList.toggle('af-done', done);
  if (btn) { btn.textContent = done ? '✅ تم' : '☐ تحديد كمنجز'; btn.classList.toggle('done', done); }
  if (done && card) {
    const rip = document.createElement('div');
    rip.className = 'check-ripple';
    card.appendChild(rip);
    setTimeout(() => rip.remove(), 500);
    if (navigator.vibrate) navigator.vibrate(40);
  }
  updateArafahProgress();
  checkBadges();
  showToast(done ? `✅ ${ARAFAH_MILESTONES.find(m=>m.id===id)?.label || ''} مكتملة` : '↩️ تم الإلغاء');
}
window.checkMilestone = checkMilestone;
function updateArafahProgress() {
  const done  = Object.values(STATE.arafah?.milestones || {}).filter(Boolean).length;
  const total = ARAFAH_MILESTONES.length;
  const pct   = Math.round((done / total) * 100);
  const bar   = document.getElementById('af-prog-bar');
  const txt   = document.getElementById('af-prog-txt');
  const ring  = document.getElementById('af-prog-ring');
  if (bar)  bar.style.width   = pct + '%';
  if (txt)  txt.textContent   = `${done} من ${total} محطات مكتملة`;
  if (ring) {
    ring.style.background = `conic-gradient(var(--gold) ${pct}%, var(--sand-2) ${pct}%)`;
    ring.textContent = pct + '%';
  }
}
function countArafahDhikr() {
  if (!STATE.arafah) STATE.arafah = { milestones: {}, dhikrCount: 0, khushooMode: false };
  STATE.arafah.dhikrCount = (STATE.arafah.dhikrCount || 0) + 1;
  saveState();
  if (navigator.vibrate) navigator.vibrate(20);
  const el = document.getElementById('af-dhikr-count');
  if (el) {
    el.textContent = STATE.arafah.dhikrCount;
    el.classList.remove('bump');
    requestAnimationFrame(() => {
      el.classList.add('bump');
      setTimeout(() => el.classList.remove('bump'), 180);
    });
  }
  const prog = document.querySelector('.af-dhikr-prog span');
  if (prog) prog.style.width = Math.min((STATE.arafah.dhikrCount % 100), 100) + '%';
}
window.countArafahDhikr = countArafahDhikr;
function toggleKhushoo() {
  if (!STATE.arafah) STATE.arafah = { milestones: {}, dhikrCount: 0, khushooMode: false };
  STATE.arafah.khushooMode = !STATE.arafah.khushooMode;
  document.body.classList.toggle('khushoo', STATE.arafah.khushooMode);
  saveState();
  const btn = document.getElementById('khushoo-toggle');
  if (btn) btn.textContent = STATE.arafah.khushooMode ? '💡 إيقاف الخشوع' : '🌙 وضع الخشوع';
  showToast(STATE.arafah.khushooMode ? '🌙 وضع الخشوع مفعّل — ركّز على ربك' : '💡 تم إيقاف وضع الخشوع');
}
window.toggleKhushoo = toggleKhushoo;
function initTimeBackground() {
  const bgEl = document.getElementById('time-bg');
  if (!bgEl) return;
  const phase = getTimePhase();
  const [c1, c2] = phase.gradient.split(',');
  bgEl.style.background = `linear-gradient(160deg, ${c1}, ${c2})`;
  bgEl.querySelector('.time-phase-lbl').textContent = `${phase.emoji} ${phase.label}`;
  setInterval(() => {
    const p = getTimePhase();
    const [g1, g2] = p.gradient.split(',');
    bgEl.style.background = `linear-gradient(160deg, ${g1}, ${g2})`;
    bgEl.querySelector('.time-phase-lbl').textContent = `${p.emoji} ${p.label}`;
  }, 60000); 
}
const ADHKAR_SECTIONS = [
  {
    id: 'arafah_main',
    title: '⭐ أفضل دعاء يوم عرفة',
    color: 'gold',
    items: [
      { id:'tahlil', label:'التهليل الكامل', arabic:'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', target:100, source:'رواه الترمذي' },
      { id:'istighfar_arafah', label:'الاستغفار', arabic:'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ', target:100, source:'حديث شريف' },
      { id:'salawat', label:'الصلاة على النبي ﷺ', arabic:'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ', target:100, source:'مستحب' },
    ]
  },
  {
    id: 'morning',
    title: '🌅 أذكار الصباح',
    color: 'green',
    items: [
      { id:'ayat_kursi_m', label:'آية الكرسي', arabic:'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ...', target:1, source:'مرة صباحاً — البقرة 255' },
      { id:'morning_tasbih', label:'تسبيح الصباح', arabic:'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ', target:3, source:'صحيح مسلم — 3 مرات' },
      { id:'sayyid_istig', label:'سيد الاستغفار', arabic:'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ...', target:1, source:'صحيح البخاري' },
    ]
  },
  {
    id: 'evening',
    title: '🌙 أذكار المساء',
    color: 'purple',
    items: [
      { id:'asr_tasbih', label:'تسبيح المساء', arabic:'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', target:100, source:'100 مرة مساءً' },
      { id:'three_quls', label:'المعوذتان والإخلاص', arabic:'قُلْ هُوَ اللَّهُ أَحَدٌ — قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ — قُلْ أَعُوذُ بِرَبِّ النَّاسِ', target:3, source:'3 مرات — صحيح الترمذي' },
    ]
  }
];
function initAdhkarPage() {
  const container = document.getElementById('adhkar-container');
  if (!container) return;
  if (!STATE.adhkar) STATE.adhkar = {};
  ADHKAR_SECTIONS.forEach(section => {
    const secEl = document.createElement('div');
    secEl.className = 'adhkar-section';
    secEl.innerHTML = `<div class="section-title adhkar-sec-title adhkar-${section.color}">${section.title}</div>`;
    section.items.forEach(item => {
      if (!STATE.adhkar[item.id]) STATE.adhkar[item.id] = 0;
      const count = STATE.adhkar[item.id];
      const done  = count >= item.target;
      const pct   = Math.min(Math.round((count / item.target) * 100), 100);
      const card = document.createElement('div');
      card.className = `adhkar-card${done ? ' adhkar-card-done' : ''}`;
      card.id = 'adhk-' + item.id;
      card.innerHTML = `
        <div class="adhkar-arabic">${item.arabic}</div>
        <div class="adhkar-meta">
          <span class="adhkar-label">${item.label}</span>
          <span class="adhkar-source tag">${item.source}</span>
        </div>
        <div class="adhkar-progress-row">
          <div class="progress" style="margin-top:8px"><span style="width:${pct}%"></span></div>
          <div class="adhkar-count-row">
            <span class="adhkar-count-num" id="adhk-cnt-${item.id}">${count} / ${item.target}</span>
            <button class="btn btn-primary adhkar-count-btn" onclick="countAdhkar('${item.id}', ${item.target})"
              ${done ? 'disabled style="opacity:.5"' : ''}>
              ${done ? '✅ مكتمل' : '+ عدّ'}
            </button>
            <button class="btn btn-ghost adhkar-reset-btn" onclick="resetAdhkar('${item.id}')" style="padding:8px 12px;font-size:12px">↺</button>
          </div>
        </div>`;
      secEl.appendChild(card);
    });
    container.appendChild(secEl);
  });
}
window.initAdhkarPage = initAdhkarPage;
function countAdhkar(id, target) {
  if (!STATE.adhkar) STATE.adhkar = {};
  STATE.adhkar[id] = Math.min((STATE.adhkar[id] || 0) + 1, target);
  saveState();
  if (navigator.vibrate) navigator.vibrate(15);
  const countEl = document.getElementById('adhk-cnt-' + id);
  const card    = document.getElementById('adhk-' + id);
  const btn     = card?.querySelector('.adhkar-count-btn');
  const progEl  = card?.querySelector('.progress span');
  const cnt     = STATE.adhkar[id];
  const pct     = Math.min(Math.round((cnt / target) * 100), 100);
  if (countEl) countEl.textContent = `${cnt} / ${target}`;
  if (progEl)  progEl.style.width  = pct + '%';
  if (cnt >= target) {
    card?.classList.add('adhkar-card-done');
    if (btn) { btn.textContent = '✅ مكتمل'; btn.disabled = true; btn.style.opacity = '.5'; }
    showToast('✅ مكتمل — بارك الله فيك');
    if (navigator.vibrate) navigator.vibrate([60, 30, 60]);
    checkBadges();
  }
}
window.countAdhkar = countAdhkar;
function resetAdhkar(id) {
  if (!STATE.adhkar) STATE.adhkar = {};
  STATE.adhkar[id] = 0;
  saveState();
  const container = document.getElementById('adhkar-container');
  if (container) { container.innerHTML = ''; initAdhkarPage(); }
}
window.resetAdhkar = resetAdhkar;
const ZAD_WEIGHTS = {
  fajr:30, zuhr:30, asr:30, maghrib:30, isha:30,  
  rawatib:20, duha:25, qiyam:80,                    
  morning_dhikr:15, evening_dhikr:15,               
  takbeer_100:30,                                   
  tawbah:10,                                        
  fasting_day:100,                                  
  fasting_arafah:500,                               
  juz:150,                                          
  arafah_milestone:50,                              
  charity_act:40,                                   
};
function calcZadPoints() {
  let base = 0;
  Object.entries(STATE.worship || {}).forEach(([k, v]) => {
    if (v && ZAD_WEIGHTS[k]) base += ZAD_WEIGHTS[k];
  });
  Object.entries(STATE.fasting || {}).forEach(([day, done]) => {
    if (done) base += +day === 9 ? ZAD_WEIGHTS.fasting_arafah : ZAD_WEIGHTS.fasting_day;
  });
  base += Math.floor((STATE.takbeer?.total || 0) / 100) * ZAD_WEIGHTS.takbeer_100;
  base += (STATE.mushaf?.juz || 0) * ZAD_WEIGHTS.juz;
  base += Object.values(STATE.arafah?.milestones || {}).filter(Boolean).length * ZAD_WEIGHTS.arafah_milestone;
  base += (STATE.charityDone?.length || 0) * ZAD_WEIGHTS.charity_act;
  const streak = STATE.streak || 0;
  const mult = streak >= 9 ? 2.0 : streak >= 5 ? 1.5 : streak >= 3 ? 1.2 : 1.0;
  return { points: Math.round(base * mult), multiplier: mult };
}
window.calcZadPoints = calcZadPoints;
const EXTRA_BADGES = [
  { id:'saher',   label:'فجر العشر',        cond: s => s.streak >= 5 },
  { id:'sabiq',   label:'السابق',            cond: s => Object.values(s.arafah?.milestones||{}).filter(Boolean).length >= 5 },
  { id:'lisan',   label:'لسان ذاكر',        cond: s => s.takbeer?.total >= 1000 },
  { id:'khatim2', label:'الراسخون',          cond: s => s.mushaf?.juz >= 15 },
  { id:'wasil',   label:'الواصلون',          cond: s => (s.charityDone?.length||0) >= 5 },
];
EXTRA_BADGES.forEach(b => {
  if (!BADGE_DEFS.find(x => x.id === b.id)) BADGE_DEFS.push(b);
});
function recordDailyProgress() {
  if (!STATE.history) STATE.history = {};
  const worshipKeys = ['fajr','zuhr','asr','maghrib','isha','rawatib','duha','qiyam','morning_dhikr','evening_dhikr','takbeer_100','tawbah'];
  const done = worshipKeys.filter(k => STATE.worship[k]).length;
  const pct  = Math.round((done / worshipKeys.length) * 100);
  const { points } = calcZadPoints();
  STATE.history[todayStr()] = {
    pct,
    zad:       points,
    fasting:   Object.values(STATE.fasting || {}).filter(Boolean).length,
    takbeer:   STATE.takbeer?.total || 0,
    juz:       STATE.mushaf?.juz || 0,
    badges:    STATE.badges.length,
    dhulHijja: getDhulHijjahDay() || 0,
    ts:        Date.now()
  };
  saveState();
}
window.recordDailyProgress = recordDailyProgress;
function generateInsights() {
  const strength = [], improve = [];
  const streak   = STATE.streak || 0;
  const total    = STATE.takbeer?.total || 0;
  const juz      = STATE.mushaf?.juz || 0;
  const fasting  = Object.values(STATE.fasting||{}).filter(Boolean).length;
  const worship  = STATE.worship || {};
  if (streak >= 5)      strength.push(`🔥 شريط ${streak} أيام متتالية — استمر`);
  if (total >= 500)     strength.push('📿 مداومتك على التكبير رائعة');
  if (worship.qiyam)    strength.push('🌙 قيام الليل في عشر ذي الحجة يعدل ليلة القدر');
  if (juz >= 5)         strength.push(`📖 قرأت ${juz} أجزاء — ما شاء الله`);
  if (fasting >= 3)     strength.push(`🌙 صمت ${fasting} أيام — "الصيام لي وأنا أجزي به"`);
  if (!worship.qiyam)                improve.push('🌙 قيام الليل لم يُسجل — استثمره الليلة');
  if (total < 100)                   improve.push('📿 التكبير قليل — أكثر منه في كل لحظة');
  if (juz < 3)                       improve.push('📖 تقدم القراءة بطيء — ابدأ بنصف جزء يومياً');
  if (fasting < 2)                   improve.push('🌙 الصيام فرصتك في العشر — لا تفوّتها');
  if (!worship.morning_dhikr)        improve.push('🌅 أذكار الصباح لم تُسجل اليوم');
  const { points, multiplier } = calcZadPoints();
  return { strength, improve, points, multiplier, streak };
}
window.generateInsights = generateInsights;
function triggerConfetti() {
  const colors = ['#c9a14a','#4dd866','#ffe54d','#ffffff','#5aabff','#ff6b85'];
  for (let i = 0; i < 60; i++) {
    const el = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size  = 5 + Math.random() * 9;
    const isPill = Math.random() > 0.6;
    el.style.cssText = `position:fixed;top:-12px;left:${Math.random()*100}%;
      width:${size}px;height:${isPill?size*2:size}px;
      background:${color};border-radius:${isPill?'3px':'50%'};
      animation:confettiFall ${1.8+Math.random()*2}s ease-out forwards;
      z-index:9998;transform:rotate(${Math.random()*360}deg);
      animation-delay:${Math.random()*0.5}s;`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }
}
window.triggerConfetti = triggerConfetti;
function checkDailyComplete() {
  const keys = ['fajr','zuhr','asr','maghrib','isha','rawatib','duha','qiyam','morning_dhikr','evening_dhikr','takbeer_100','tawbah'];
  if (keys.every(k => STATE.worship[k]) && !STATE._confettiFired) {
    STATE._confettiFired = true;
    saveState();
    setTimeout(() => {
      triggerConfetti();
      showToast('🎉 ما شاء الله! أتممت الورد اليومي كاملاً');
    }, 400);
  }
}
window.checkDailyComplete = checkDailyComplete;
const DHIKR_LIST = [
  {
    id:'subhan',
    arabic:'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    label:'سبحان الله', sub:'سبحان الله وبحمده',
    target:33, sessions:0,
    color:'#5aabff', bg:'rgba(90,171,255,.12)'
  },
  {
    id:'hamd',
    arabic:'الْحَمْدُ لِلَّهِ',
    label:'الحمد لله', sub:'الحمد لله رب العالمين',
    target:33, sessions:0,
    color:'#4dd866', bg:'rgba(77,216,102,.12)'
  },
  {
    id:'tahlil',
    arabic:'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
    label:'لا إله إلا الله', sub:'كلمة التوحيد',
    target:33, sessions:0,
    color:'#e6c97a', bg:'rgba(230,201,122,.15)'
  },
  {
    id:'takbir_s',
    arabic:'اللَّهُ أَكْبَرُ',
    label:'الله أكبر', sub:'التكبير المطلق',
    target:33, sessions:0,
    color:'#ffba3b', bg:'rgba(255,186,59,.12)'
  },
  {
    id:'hawqala',
    arabic:'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ',
    label:'الحوقلة', sub:'كنز من كنوز الجنة',
    target:100, sessions:0,
    color:'#7de5ff', bg:'rgba(125,229,255,.12)'
  },
  {
    id:'istigfar_s',
    arabic:'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ',
    label:'أستغفر الله', sub:'الاستغفار',
    target:100, sessions:0,
    color:'#d47dff', bg:'rgba(212,125,255,.12)'
  },
  {
    id:'salawat',
    arabic:'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى سَيِّدِنَا مُحَمَّدٍ',
    label:'الصلاة على النبي ﷺ', sub:'أفضل ما يقوله المسلم',
    target:100, sessions:0,
    color:'#ff6b85', bg:'rgba(255,107,133,.12)'
  },
];
function initTasbih() {
  const cardsWrap = document.getElementById('tasbih-cards');
  if (!cardsWrap) return;
  if (!STATE.tasbih) STATE.tasbih = { active:'subhan', subhan:0, hamd:0, tahlil:0, takbir_s:0, hawqala:0, istigfar_s:0, salawat:0, sessions:{} };
  DHIKR_LIST.forEach(d => {
    if (!STATE.tasbih[d.id]) STATE.tasbih[d.id] = 0;
    const card = document.createElement('div');
    card.className = 'dhikr-card' + (STATE.tasbih.active === d.id ? ' active' : '');
    card.id = 'dc-' + d.id;
    card.style.setProperty('--dc-color', d.color);
    card.style.setProperty('--dc-bg', d.bg);
    const cnt   = STATE.tasbih[d.id] || 0;
    const pct   = Math.min(Math.round((cnt / d.target) * 100), 100);
    const laps  = Math.floor(cnt / d.target);
    card.innerHTML = `
      <div class="dc-arabic">${d.arabic}</div>
      <div class="dc-sub-lbl">${d.sub || ''}</div>
      <div class="dc-meta">
        <span class="dc-count" id="dcnt-${d.id}">${cnt}</span>
        <span class="dc-sep"> / </span>
        <span class="dc-target">${d.target}</span>
        <span class="dc-unit">مرة</span>
      </div>
      <div class="dc-prog"><span style="width:${pct}%"></span></div>
      ${laps > 0 ? `<div class="dc-laps" id="dlaps-${d.id}">✅ ×${laps}</div>` : `<div class="dc-laps" id="dlaps-${d.id}" style="opacity:0">×0</div>`}`;
    card.addEventListener('click', () => selectDhikr(d.id));
    cardsWrap.appendChild(card);
  });
  renderActiveDhikr();
  const ring = document.getElementById('ts-ring');
  if (ring) {
    ring.addEventListener('click', () => window.countTasbih());
    ring.setAttribute('tabindex', '0');
    ring.addEventListener('keydown', e => { if(e.key===' '||e.key==='Enter'){e.preventDefault();window.countTasbih();} });
  }
  const resetBtn = document.getElementById('ts-reset');
  if (resetBtn) resetBtn.onclick = resetCurrentDhikr;
  const resetAll = document.getElementById('ts-reset-all');
  if (resetAll) resetAll.onclick = () => {
    if (confirm('إعادة تعيين جميع الأذكار؟')) {
      DHIKR_LIST.forEach(d => { STATE.tasbih[d.id] = 0; });
      STATE.tasbih.sessions = {};
      saveState();
      const wrap = document.getElementById('tasbih-cards');
      if (wrap) { wrap.innerHTML = ''; initTasbih(); }
      renderActiveDhikr();
      showToast('🔄 تمت إعادة تعيين الأذكار');
    }
  };
}
window.initTasbih = initTasbih;
function selectDhikr(id) {
  STATE.tasbih.active = id;
  saveState();
  document.querySelectorAll('.dhikr-card').forEach(c => c.classList.remove('active'));
  const card = document.getElementById('dc-' + id);
  if (card) card.classList.add('active');
  renderActiveDhikr();
}
window.selectDhikr = selectDhikr;
function renderActiveDhikr() {
  const id   = STATE.tasbih.active || 'subhan';
  const def  = DHIKR_LIST.find(d => d.id === id) || DHIKR_LIST[0];
  const cnt  = STATE.tasbih[id] || 0;
  const pct  = Math.min(Math.round((cnt / def.target) * 100), 100);
  const circlePct = Math.min((cnt % def.target) / def.target, 1); 
  const textEl = document.getElementById('ts-text');
  const cntEl  = document.getElementById('ts-count');
  const subEl  = document.getElementById('ts-sub');
  const lapEl  = document.getElementById('ts-laps');
  if (textEl) { textEl.textContent = def.arabic; textEl.style.color = def.color; }
  if (cntEl)  { cntEl.textContent  = cnt % def.target || (cnt > 0 && cnt % def.target === 0 ? def.target : 0); }
  if (subEl)  subEl.textContent    = def.label + ' — كل ' + def.target;
  if (lapEl) {
    const laps = Math.floor(cnt / def.target);
    lapEl.textContent  = laps > 0 ? `× ${laps} دورة مكتملة` : '';
    lapEl.style.display = laps > 0 ? 'block' : 'none';
  }
  const svgRing = document.getElementById('ts-ring-progress');
  if (svgRing) {
    const R = 80, C = 2 * Math.PI * R;
    svgRing.style.stroke = def.color;
    svgRing.style.strokeDasharray = C;
    svgRing.style.strokeDashoffset = C - C * circlePct;
  }
  const ringBg = document.getElementById('ts-ring-bg');
  if (ringBg) ringBg.style.stroke = def.bg;
}
window.renderActiveDhikr = renderActiveDhikr;
function countTasbih() {
  const id  = STATE.tasbih.active || 'subhan';
  const def = DHIKR_LIST.find(d => d.id === id) || DHIKR_LIST[0];
  STATE.tasbih[id] = (STATE.tasbih[id] || 0) + 1;
  const cnt = STATE.tasbih[id];
  if (navigator.vibrate) navigator.vibrate(18);
  if (id === 'takbir_s') {
    STATE.takbeer.total = (STATE.takbeer.total || 0) + 1;
    STATE.worship.takbeer_100 = STATE.takbeer.total >= 100;
  }
  saveState();
  const cntEl = document.getElementById('ts-count');
  if (cntEl) { cntEl.classList.remove('bump'); requestAnimationFrame(() => { cntEl.classList.add('bump'); setTimeout(()=>cntEl.classList.remove('bump'),180); }); }
  const cardCnt = document.getElementById('dcnt-' + id);
  if (cardCnt) cardCnt.textContent = cnt;
  const laps = Math.floor(cnt / def.target);
  const lapCard = document.getElementById('dlaps-' + id);
  if (lapCard) { lapCard.textContent = `×${laps}`; lapCard.style.opacity = laps > 0 ? '1' : '0'; }
  const card = document.getElementById('dc-' + id);
  const cardProg = card?.querySelector('.dc-prog span');
  if (cardProg) cardProg.style.width = Math.min(Math.round(((cnt % def.target || (cnt%def.target===0&&cnt>0?def.target:0)) / def.target) * 100), 100) + '%';
  if (cnt === def.target) {
    if (!STATE.tasbih.sessions) STATE.tasbih.sessions = {};
    STATE.tasbih.sessions[id] = (STATE.tasbih.sessions[id] || 0) + 1;
    saveState();
    if (navigator.vibrate) navigator.vibrate([50,30,50]);
    showToast(`✅ ${def.label} — دورة مكتملة! (×${STATE.tasbih.sessions[id]})`);
    checkBadges();
  } else if (cnt % def.target === 0 && cnt > 0) {
    if (!STATE.tasbih.sessions) STATE.tasbih.sessions = {};
    STATE.tasbih.sessions[id] = (STATE.tasbih.sessions[id] || 0) + 1;
    saveState();
    if (navigator.vibrate) navigator.vibrate([50,30,50]);
    showToast(`🔄 ${def.label} — دورة ${STATE.tasbih.sessions[id]} مكتملة!`);
  }
  renderActiveDhikr();
  updateDashStats();
}
window.countTasbih = countTasbih;
function resetCurrentDhikr() {
  const id = STATE.tasbih.active || 'subhan';
  STATE.tasbih[id] = 0;
  saveState();
  const card = document.getElementById('dc-' + id);
  const cardCnt  = document.getElementById('dcnt-' + id);
  const cardProg = card?.querySelector('.dc-prog span');
  if (cardCnt)  cardCnt.textContent = 0;
  if (cardProg) cardProg.style.width = '0%';
  renderActiveDhikr();
  showToast('🔄 تمت إعادة التعيين');
}
window.resetCurrentDhikr = resetCurrentDhikr;
/* ══════════════════════════════════════════════════════════
   9-DAY CONTENT PLAN — خطة المحتوى اليومي
   ══════════════════════════════════════════════════════════ */
const DAY_CONTENT = {
  1: {
    title: 'بداية الرحلة والنية الصادقة',
    message: 'بدأت أفضل أيام الدنيا.. استقبلها بقلب تائب ونية صادقة',
    hadith: 'ما من أيامٍ العمل الصالح فيهن أحب إلى الله من هذه الأيام العشر',
    source: 'رواه البخاري',
    task: 'ضبط جدول العبادات وتحديد خطة ختم القرآن',
    taskUrl: 'worship.html',
    icon: '🌱', color: '#2a7a5f',
    notif: 'هل نويت صيام غد؟ الصيام عبادة اختص الله بها نفسه',
  },
  2: {
    title: 'إحياء سنة التكبير',
    message: 'زيّن يومك بذكر الله.. أحيِ سنة التكبير في بيتك وعملك',
    hadith: 'وَيَذْكُرُوا اسْمَ اللَّهِ فِي أَيَّامٍ مَعْلُومَاتٍ',
    source: 'سورة الحج — 28',
    task: 'الوصول إلى أول 100 تكبيرة اليوم',
    taskUrl: 'takbeer.html',
    icon: '📿', color: '#c9a14a',
    notif: 'الله أكبر، الله أكبر.. لا تنسَ التكبير المطلق طوال اليوم',
  },
  3: {
    title: 'جواهر القرآن والتدبر',
    message: 'نور قلبك بآيات الله.. عِش مع معاني سورة الحج',
    hadith: 'أَفَلَا يَتَدَبَّرُونَ الْقُرْآنَ أَمْ عَلَىٰ قُلُوبٍ أَقْفَالُهَا',
    source: 'سورة محمد — 24',
    task: 'قراءة وردك اليومي مع تدوين ملاحظة تأملية واحدة',
    taskUrl: 'mushaf.html',
    icon: '📖', color: '#1a5d47',
    notif: '10 دقائق من القرآن قد تغير مجرى يومك بالكامل',
  },
  4: {
    title: 'محطة الاستغفار والتوبة',
    message: 'طهّر صحيفتك.. التوبة مفتاح القبول في مواسم الفضل',
    hadith: 'وَتُوبُوا إِلَى اللَّهِ جَمِيعًا أَيُّهَا الْمُؤْمِنُونَ لَعَلَّكُمْ تُفْلِحُونَ',
    source: 'سورة النور — 31',
    task: 'تخصيص وقت السحر لـ 100 استغفار ودعاء',
    taskUrl: 'adhkar.html',
    icon: '🌠', color: '#5856d6',
    notif: 'وقت التنزل الإلهي.. استثمر دقائق السحر في طلب المغفرة',
  },
  5: {
    title: 'صدقة العشر وبر الأثر',
    message: 'مالك لا ينقص بالصدقة.. اجعل لك أثراً في حياة محتاج',
    hadith: 'كل امرئٍ في ظل صدقته حتى يُقضى بين الناس',
    source: 'رواه أحمد وصحَّحه الألباني',
    task: 'إخراج صدقة اليوم — ولو بإطعام طعام',
    taskUrl: 'sadaqah.html',
    icon: '💚', color: '#34c759',
    notif: 'صدقة بسيطة اليوم قد تكون حجابك من النار غداً',
  },
  6: {
    title: 'صلة الرحم والكلمة الطيبة',
    message: 'بادر بالوصل.. خير الناس من يبدأ بالسلام',
    hadith: 'مَن كان يؤمن بالله واليوم الآخر فليصل رحمه',
    source: 'متفق عليه',
    task: 'اتصال أو رسالة لأحد الأقارب الذين بعُد التواصل معهم',
    taskUrl: 'sadaqah.html',
    icon: '❤️', color: '#ff2d55',
    notif: 'رسالة تهنئة بالعيد لأهلك تدخل السرور على قلوبهم',
  },
  7: {
    title: 'نوافل العبادات والقربات',
    message: 'تقرب إلى الله بما يحب.. السجود يرفعك درجات',
    hadith: 'وما يزال عبدي يتقرب إليّ بالنوافل حتى أحبه',
    source: 'رواه البخاري',
    task: 'المحافظة على ركعتي الضحى والسنن الرواتب كاملة',
    taskUrl: 'worship.html',
    icon: '🌤️', color: '#ff9500',
    notif: 'صلاة الضحى هي صلاة الأوابين.. لا تفرط في أجرها اليوم',
  },
  8: {
    title: 'يوم التروية — التحضير للقمة',
    message: 'ارتوِ بالطاعة.. غداً هو اليوم الموعود — يوم عرفة',
    hadith: 'صِيَامُ يَوْمِ عَرَفَةَ يُكَفِّرُ السَّنَةَ الَّتِي قَبْلَهُ وَالسَّنَةَ الَّتِي بَعْدَهُ',
    source: 'رواه مسلم',
    task: 'قراءة دليل يوم عرفة وتجهيز قائمة أدعيتك الشخصية',
    taskUrl: 'arafah.html',
    icon: '🌄', color: '#ff9500',
    notif: 'استعد لغد.. صيام يوم عرفة يكفر سنتين من الخطايا',
  },
  9: {
    title: 'يوم عرفة — يوم الجائزة الكبرى',
    message: 'اليوم هو ربيع القلوب.. لا تغيبنّ عن موكب الذاكرين',
    hadith: 'خَيْرُ الدُّعَاءِ دُعَاءُ يَوْمِ عَرَفَةَ',
    source: 'رواه الترمذي وحسَّنه',
    task: 'تفعيل المسار الزمني التفاعلي من الفجر حتى المغرب',
    taskUrl: 'arafah.html',
    icon: '⭐', color: '#c9a14a',
    notif: 'بدأت الساعات الذهبية.. ألحّ في الدعاء — اللهم اعتق رقابنا من النار',
  },
};
window.DAY_CONTENT = DAY_CONTENT;

/* ── Render Daily Content Card ─────────────────────────── */
function renderDailyContentCard() {
  const container = document.getElementById('daily-content-card');
  if (!container) return;
  const day = getDhulHijjahDay ? getDhulHijjahDay() : null;
  if (!day || day < 1 || day > 9) { container.style.display='none'; return; }
  const d = DAY_CONTENT[day];
  if (!d) return;
  container.innerHTML = `
    <div class="dc-day-badge" style="background:${d.color}20;border-color:${d.color}40;color:${d.color}">
      ${d.icon} اليوم ${['','الأول','الثاني','الثالث','الرابع','الخامس','السادس','السابع','الثامن','التاسع'][day]}
    </div>
    <div class="dc-day-title">${d.title}</div>
    <div class="dc-day-msg">${d.message}</div>
    <div class="dc-day-hadith">
      <div class="dc-hadith-text">«${d.hadith}»</div>
      <div class="dc-hadith-src">${d.source}</div>
    </div>
    <a href="${d.taskUrl}" class="dc-day-task-btn">
      <span>📌 مهمة اليوم</span>
      <span class="dc-task-text">${d.task}</span>
      <span>←</span>
    </a>`;
  container.style.display = 'block';
}
window.renderDailyContentCard = renderDailyContentCard;

/* ══════════════════════════════════════════════════════════
   VARIED SUCCESS MESSAGES — رسائل النجاح المتنوعة
   ══════════════════════════════════════════════════════════ */
const SUCCESS_MSGS = {
  fajr:          ['تقبل الله.. صلاتك نورٌ في الدنيا والآخرة 🌅','نوّرت يومك بالفجر — بارك الله فيك','صليت الفجر في وقته — وعدك الله بالنور التام 🌟','أحسنت — فجرك سيشهد لك يوم لا ينفع مال ولا بنون'],
  zuhr:          ['تقبل الله صلاتك.. والصلاة عماد الدين 🕌','أديت حق ربك — جزاك الله خيراً','الصلاة خير موضوع — تقبل الله منك ✅','لقد وقفت بين يدي الله — أعظم بهذا المقام'],
  asr:           ['تقبل الله صلاة العصر.. وهي الصلاة الوسطى ⭐','أحسنت — الملائكة تشهد صلاة العصر وتسجلها','حافظت على الصلاة الوسطى — بشرى لك 🌟','بارك الله فيك وفي طاعتك'],
  maghrib:       ['تقبل الله — المغرب وقت إجابة الدعاء 🌇','أحسنت يا صاحب الطاعة — بارك الله فيك','صليت وقت يُرفع فيه الدعاء — ادعُ الله بما شئت','تقبل الله منك — الصلاة نور ✨'],
  isha:          ['تقبل الله العشاء — من صلاها في جماعة فله نصف الليل','أنهيت نصف الليل في طاعة الله — هنيئاً لك 🌙','بارك الله فيك — إخلاص في العشاء نور في القلب','تقبل الله — ومن حافظ على الجماعة كُتب له ربع الدين'],
  qiyam:         ['ما شاء الله! قيام الليل في عشر ذي الحجة يعدل ليلة القدر 🌙','نهضت حين نام الناس — شرّفك الله بهذه القربة','زرعت الآن في جنتك.. دمت على هذه النعمة ⭐','هنيئاً لك — السُّهد في طاعة الله يُبدَّل بالأنس يوم القيامة'],
  takbeer:       ['زَرعتَ الآن نخلة في الجنة.. لسانك رطب بذكر الله 📿','الله أكبر — كلمة تملأ الميزان وتفرح الملائكة','هنيئاً لك — التكبير شعيرة هذه الأيام المباركة','بارك الله في لسانك الذاكر — ولا تنقطع عن التكبير ✨'],
  morning_dhikr: ['أذكار الصباح كالحصن المنيع — حصّنت يومك 🌅','بارك الله في صباحك — اللهم ما أصبح بي من نعمة فمنك','ما شاء الله — محمي من شر هذا اليوم بإذن الله','هنيئاً لك — أذكار الصباح تفتح أبواب البركة ✨'],
  evening_dhikr: ['حصّنت مساءك بذكر الله — لا تُوطأ 🌙','بارك الله في مسائك — اللهم ما أمسى بي من نعمة فمنك','ما شاء الله — أتممت حراسة يومك بالذكر','مساؤك محاط بالحفظ — استمر على هذه العادة ✨'],
  fasting:       ['بُورك لك في صيامك — الله يتولى مكافأتك 🌙','تقبل الله صيامك — الصيام لله وهو يجزي به','ما أعظم أجر الصائم — هنيئاً لك هذه القربة ⭐','الصيام جنة — نسأل الله أن يكتبك من الصائمين في المواسم'],
  default:       ['✅ تم التسجيل — بارك الله فيك','أحسنت — كل عمل صالح في العشر محبوب إلى الله','جزاك الله خيراً — ما يخفى على الناس لا يخفى على الله','تقبل الله منك — اللهم اجعل أعمالنا في ميزان حسناتنا ✨'],
};

function getSuccessMsg(key) {
  const msgs = SUCCESS_MSGS[key] || SUCCESS_MSGS.default;
  return msgs[Math.floor(Math.random() * msgs.length)];
}
window.getSuccessMsg = getSuccessMsg;



/* ══════════════════════════════════════════════════════════
   CLICK SOUND — صوت النقر
   ══════════════════════════════════════════════════════════ */
let _audioCtx = null;
function playClickSound() {
  if (STATE.theme && !localStorage.getItem('zad_sound_on')) return; /* default off */
  try {
    if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = _audioCtx.createOscillator();
    const g = _audioCtx.createGain();
    o.connect(g); g.connect(_audioCtx.destination);
    o.frequency.setValueAtTime(880, _audioCtx.currentTime);
    o.frequency.exponentialRampToValueAtTime(440, _audioCtx.currentTime + 0.08);
    g.gain.setValueAtTime(0.12, _audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, _audioCtx.currentTime + 0.12);
    o.start(); o.stop(_audioCtx.currentTime + 0.12);
  } catch(e) {}
}
window.playClickSound = playClickSound;

/* ── Hook sound to checklist ── */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.check[data-key]').forEach(el => {
    el.addEventListener('click', () => { if (el.classList.contains('done')) playClickSound(); });
  });
  renderDailyContentCard();
});