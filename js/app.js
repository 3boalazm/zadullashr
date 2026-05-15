/* ════════════════════════════════════════════
   زاد العشر — Shared App Logic v2.0
   ════════════════════════════════════════════ */

/* ──────────────────────────────────────────
   STATE MANAGEMENT
   ────────────────────────────────────────── */
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
    worship: {},          // { key: true/false }
    fasting: {},          // { 1: true, ..., 9: true }
    takbeer: { count: 0, total: 0, sessions: 0, phrase: 'اللَّهُ أَكْبَرُ', target: 33 },
    mushaf: { juz: 0, plan: 'daily-juz' },
    badges: [],
    streak: 0,
    lastActive: todayStr(),
    charityDone: [],
    quranFontSize: 24
  };
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

// Reset daily worship if new day
function checkDayReset(s) {
  if (s.day !== todayStr()) {
    s.day = todayStr();
    s.worship = {};
    s.charityDone = [];
    // update streak
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

/* ──────────────────────────────────────────
   THEME
   ────────────────────────────────────────── */
function applyTheme(theme) {
  STATE.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  // Update all toggles on page
  document.querySelectorAll('.dark-switch').forEach(el => { el.checked = theme === 'dark'; });
  document.querySelectorAll('.btn-theme').forEach(btn => { btn.textContent = theme === 'dark' ? '☀️' : '🌙'; });
  saveState();
}

function toggleTheme() {
  applyTheme(STATE.theme === 'dark' ? 'light' : 'dark');
}

window.toggleTheme = toggleTheme;

/* ──────────────────────────────────────────
   COUNTDOWN TIMER
   ────────────────────────────────────────── */
function startCountdown() {
  const daysEl  = document.getElementById('cd-days');
  const hrsEl   = document.getElementById('cd-hrs');
  const minsEl  = document.getElementById('cd-mins');
  const secsEl  = document.getElementById('cd-secs');
  if (!daysEl) return;

  function tick() {
    // Target = Arafah day: approximate 9th Dhul Hijjah
    // For demo, set 8 days from now
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

/* ──────────────────────────────────────────
   CHECKLIST SYSTEM
   ────────────────────────────────────────── */
function initChecklist() {
  document.querySelectorAll('.check[data-key]').forEach(el => {
    const k = el.dataset.key;
    if (STATE.worship[k]) el.classList.add('done');
    el.addEventListener('click', () => {
      el.classList.toggle('done');
      STATE.worship[k] = el.classList.contains('done');
      if (navigator.vibrate) navigator.vibrate(30);
      if (STATE.worship[k]) showToast('✅ تم التسجيل — بارك الله فيك');
      saveState();
      updateProgress();
      checkBadges();
    });
  });
  updateProgress();
}

function updateProgress() {
  const bar = document.getElementById('prog-bar');
  const txt = document.getElementById('prog-txt');
  if (!bar) return;

  const worshipKeys = ['fajr','zuhr','asr','maghrib','isha','rawatib','duha','qiyam',
                       'morning_dhikr','evening_dhikr','takbeer_100','tawbah'];
  const done = worshipKeys.filter(k => STATE.worship[k]).length;
  const pct  = Math.round((done / worshipKeys.length) * 100);
  bar.style.width = pct + '%';
  if (txt) txt.textContent = done + ' من ' + worshipKeys.length + ' عبادة';
  const pctEl = document.getElementById('prog-pct');
  if (pctEl) pctEl.textContent = pct + '%';
}

/* ──────────────────────────────────────────
   FASTING TRACKER
   ────────────────────────────────────────── */
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

/* ──────────────────────────────────────────
   DASHBOARD STATS
   ────────────────────────────────────────── */
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

/* ──────────────────────────────────────────
   TAKBEER COUNTER
   ────────────────────────────────────────── */
const phrases = [
  { label: 'الله أكبر',       text: 'اللَّهُ أَكْبَرُ', target: 33 },
  { label: 'سبحان الله',      text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', target: 33 },
  { label: 'لا إله إلا الله', text: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ', target: 33 },
  { label: 'التكبير الكامل',  text: 'اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ لَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ وَلِلَّهِ الْحَمْدُ', target: 100 },
  { label: 'الاستغفار',       text: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ', target: 100 }
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

  // Build phrase pills
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

  // Restore count
  if (countEl) countEl.textContent = STATE.takbeer.count;
  if (progEl) {
    const pct = Math.min((STATE.takbeer.count / (STATE.takbeer.target||33)) * 100, 100);
    progEl.querySelector('span').style.width = pct + '%';
  }

  // Stats
  const totalEl = document.getElementById('tkb-total');
  const sessEl  = document.getElementById('tkb-sess');
  if (totalEl) totalEl.textContent = STATE.takbeer.total.toLocaleString('ar-EG');
  if (sessEl)  sessEl.textContent  = STATE.takbeer.sessions;

  // Keyboard shortcut hint
  document.addEventListener('keydown', e => {
    if (e.code === 'Space' && document.getElementById('tkb-ring')) {
      e.preventDefault(); doCount();
    }
  });
}

/* ──────────────────────────────────────────
   MUSHAF / QURAN PROGRESS
   ────────────────────────────────────────── */
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
      const sz = fontSlider.value + 'px';
      STATE.quranFontSize = +fontSlider.value;
      if (fontPreview) fontPreview.style.fontSize = sz;
      const mushafText = document.querySelector('.mushaf');
      if (mushafText) mushafText.style.fontSize = sz;
      saveState();
    };
    if (fontPreview) fontPreview.style.fontSize = (STATE.quranFontSize || 24) + 'px';
  }

  updateMushafUI();
}

/* ──────────────────────────────────────────
   BADGES / GAMIFICATION
   ────────────────────────────────────────── */
const BADGE_DEFS = [
  { id: 'mubakker',   label: 'المبكّر',            cond: s => s.worship.fajr },
  { id: 'dhaker',     label: 'الذاكرون',           cond: s => s.takbeer.total >= 100 },
  { id: 'saem',       label: 'الصائمون',           cond: s => Object.values(s.fasting).filter(Boolean).length >= 3 },
  { id: 'khatim',     label: 'الخاتمون',           cond: s => s.mushaf.juz >= 30 },
  { id: 'musare',     label: 'المسارعون',          cond: s => {
      const keys = ['fajr','zuhr','asr','maghrib','isha'];
      return keys.every(k => s.worship[k]);
    }
  },
  { id: 'mukabbir',   label: 'المُكبِّرون',        cond: s => s.takbeer.total >= 1000 },
  { id: 'sadiq',      label: 'المتصدقون',          cond: s => (s.charityDone||[]).length >= 3 },
  { id: 'kamil',      label: 'جامع الخير',          cond: s => s.streak >= 5 },
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
  if (el) { el.classList.remove('locked'); el.classList.add('earned'); }
}

function updateBadgesPage() {
  BADGE_DEFS.forEach(def => {
    const el = document.querySelector(`[data-badge="${def.id}"]`);
    if (!el) return;
    const earned = STATE.badges.includes(def.id);
    el.classList.toggle('earned', earned);
    el.classList.toggle('locked', !earned);
  });
  // Streak
  const streakEl = document.getElementById('streak-count');
  if (streakEl) streakEl.textContent = STATE.streak || 0;
  // Streak days
  for (let i = 1; i <= 10; i++) {
    const d = document.getElementById('sd-' + i);
    if (d) {
      d.classList.toggle('done',  i < (STATE.streak || 0));
      d.classList.toggle('today', i === (STATE.streak || 1));
    }
  }
  // Summary
  const earnedCount = document.getElementById('earned-count');
  if (earnedCount) earnedCount.textContent = STATE.badges.length + ' / ' + BADGE_DEFS.length;
}

/* ──────────────────────────────────────────
   SETTINGS PAGE
   ────────────────────────────────────────── */
function initSettings() {
  // Dark mode toggle
  const darkSw = document.getElementById('dark-sw');
  if (darkSw) {
    darkSw.checked = STATE.theme === 'dark';
    darkSw.onchange = () => applyTheme(darkSw.checked ? 'dark' : 'light');
  }

  // Notifications toggle (demo)
  document.querySelectorAll('.notif-sw').forEach(sw => {
    sw.onchange = () => showToast(sw.checked ? '🔔 تم تفعيل الإشعارات' : '🔕 تم إيقاف الإشعارات');
  });

  // Quran font slider
  const fs = document.getElementById('font-slider');
  const fp = document.getElementById('font-preview');
  if (fs) {
    fs.value = STATE.quranFontSize || 24;
    fs.oninput = () => {
      STATE.quranFontSize = +fs.value;
      if (fp) fp.style.fontSize = fs.value + 'px';
      saveState();
    };
    if (fp) fp.style.fontSize = (STATE.quranFontSize||24) + 'px';
  }

  // Reset button
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

  // Theme cards
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

/* ──────────────────────────────────────────
   AI CHAT (Anthropic API)
   ────────────────────────────────────────── */
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

  // Append user message
  appendMsg('user', userMsg);
  chatHistory.push({ role: 'user', content: userMsg });
  if (input) input.value = '';
  if (sendBtn) sendBtn.disabled = true;

  // Typing indicator
  const typingId = 'typing-' + Date.now();
  chatWrap.insertAdjacentHTML('beforeend', `
    <div class="msg bot" id="${typingId}">
      <div class="msg-av bot">🤖</div>
      <div class="msg-bubble bot typing"><span></span><span></span><span></span></div>
    </div>`);
  chatWrap.scrollTop = chatWrap.scrollHeight;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: AI_SYSTEM,
        messages: chatHistory.map(m => ({ role: m.role, content: m.content }))
      })
    });
    const data = await res.json();
    const reply = data.content?.[0]?.text || 'عذراً، حدث خطأ في الاتصال.';
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
  const input   = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  if (!input) return;

  sendBtn.onclick = () => sendAIMessage(input.value);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAIMessage(input.value); }
  });

  // Suggested questions
  document.querySelectorAll('.sq').forEach(el => {
    el.addEventListener('click', () => {
      const q = el.querySelector('h3')?.textContent?.replace(/^❓\s*/,'');
      if (q && input) { input.value = q; sendAIMessage(q); }
    });
  });
}

/* ──────────────────────────────────────────
   KIDS PAGE
   ────────────────────────────────────────── */
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

  // Quiz
  initQuiz();

  // Activity cards
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

/* Kids quiz */
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

/* ──────────────────────────────────────────
   CHARITY PAGE
   ────────────────────────────────────────── */
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

/* ──────────────────────────────────────────
   SIDEBAR / MOBILE
   ────────────────────────────────────────── */
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

/* ──────────────────────────────────────────
   TOAST
   ────────────────────────────────────────── */
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

/* ──────────────────────────────────────────
   INIT — runs on every page
   ────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Apply saved theme
  applyTheme(STATE.theme);

  // Wire theme toggles
  document.querySelectorAll('.btn-theme').forEach(btn => {
    btn.onclick = toggleTheme;
  });
  document.querySelectorAll('.dark-switch').forEach(sw => {
    sw.checked = STATE.theme === 'dark';
    sw.onchange = () => applyTheme(sw.checked ? 'dark' : 'light');
  });

  // Init sidebar mobile
  initSidebar();

  // Page-specific inits
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
});

/* ══════════════════════════════════════════
   THEME EXTENSION — OLED + Dynamic Font
   ══════════════════════════════════════════ */
function applyFontSize(size) {
  document.documentElement.setAttribute('data-font', size);
  STATE.fontScale = size;
  saveState();
}
window.applyFontSize = applyFontSize;

// Extended applyTheme to support oled
const _baseApplyTheme = applyTheme;
window.applyTheme = function(theme) {
  STATE.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  document.querySelectorAll('.dark-switch').forEach(el => {
    el.checked = (theme === 'dark' || theme === 'oled');
  });
  document.querySelectorAll('.btn-theme').forEach(btn => {
    btn.textContent = (theme === 'dark' || theme === 'oled') ? '☀️' : '🌙';
  });
  // Highlight active theme card
  document.querySelectorAll('.theme-card').forEach(c => {
    c.classList.toggle('active', c.dataset.theme === theme);
  });
  saveState();
};

/* ══════════════════════════════════════════
   PWA — Register Service Worker + Install
   ══════════════════════════════════════════ */
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

/* ══════════════════════════════════════════
   BROWSER NOTIFICATIONS
   ══════════════════════════════════════════ */
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
  // Prayer reminders (simplified — would need exact times in production)
  const msg = (title, body) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: './icons/icon-192.svg', dir: 'rtl', lang: 'ar' });
    }
  };
  // Demo: remind after 30s
  setTimeout(() => msg('🕌 زاد العشر', 'لا تنس وردك اليومي — بارك الله فيك'), 30000);
}

function initNotifBanner() {
  const btn = document.getElementById('enable-notif');
  if (btn) btn.onclick = requestNotifPermission;

  // Hide notif banner if already granted
  if (Notification.permission === 'granted') {
    const b = document.getElementById('notif-banner');
    if (b) b.style.display = 'none';
  }
}

/* ══════════════════════════════════════════
   SEARCH OVERLAY
   ══════════════════════════════════════════ */
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

  // Build overlay if not present
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

/* ══════════════════════════════════════════
   DAILY VERSES ROTATOR (8 verses)
   ══════════════════════════════════════════ */
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

  // Set today's verse based on day of month
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

  // Auto-rotate every 8s
  setInterval(() => { verseIdx = (verseIdx+1)%DAILY_VERSES.length; renderVerse(); }, 8000);
}

/* ══════════════════════════════════════════
   CIRCULAR PROGRESS RING (SVG)
   ══════════════════════════════════════════ */
function updateCircularRing(pct) {
  const ring = document.getElementById('ring-circle');
  if (!ring) return;
  const R = 44, C = 2 * Math.PI * R;
  ring.style.strokeDasharray = C;
  ring.style.strokeDashoffset = C - (C * pct / 100);
  const pctEl = document.getElementById('ring-pct');
  if (pctEl) pctEl.textContent = pct + '%';
}

/* Extended updateProgress to also update ring */
const _origUpdateProgress = updateProgress;
function updateProgress() {
  _origUpdateProgress();
  const worshipKeys = ['fajr','zuhr','asr','maghrib','isha','rawatib','duha','qiyam',
                       'morning_dhikr','evening_dhikr','takbeer_100','tawbah'];
  const done = worshipKeys.filter(k => STATE.worship[k]).length;
  updateCircularRing(Math.round((done / worshipKeys.length) * 100));
}

/* ══════════════════════════════════════════
   SPEECH RECOGNITION (Arabic Quran Tasmee)
   ══════════════════════════════════════════ */
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

  // Simple word match accuracy
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

/* ══════════════════════════════════════════
   EXTENDED INIT
   ══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // PWA
  initPWA();
  // Search overlay
  initSearch();
  // Verse rotator
  initVerseRotator();
  // Speech recognition (tasmee page only)
  initSpeechRecognition();
  // Notification banner
  initNotifBanner();
  // Font scale restore
  if (STATE.fontScale) applyFontSize(STATE.fontScale);
  // OLED / multi-theme support
  window.applyTheme(STATE.theme);
});
