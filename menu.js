/* ══════════════════════════════════════════════════════════════════════════
   menu.js — مكوّن المنيو الموحّد لـ "زاد العشر"
   • مصدر واحد لكل روابط المنيو (يُحدَّث من مكان واحد، يظهر في كل الصفحات).
   • يحقن ستايل محسّن + تأثيرات حركة + فليرز متحركة في الخلفية + توهّج خارجي.
   • يحدّد الصفحة النشطة تلقائياً من رابط الصفحة الحالية.

   الاستخدام: أضف هذا السطر قبل </body> في كل صفحة:
       <script src="menu.js" defer></script>
   (يستبدل محتوى <nav class="nav"> الموجود تلقائياً — لا حاجة لتعديل الـ HTML)
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── 1) بنية المنيو الكاملة — كل الصفحات بالترتيب المطلوب ───────────────
     ملاحظة: قسم "التعلم والترفيه" أصبح فوق قسم "المتابعة" كما طُلب.        */
  const MENU = [
    { href: 'index.html',        icon: '🏠',  label: 'لوحة التحكم' },

    { sep: 'الصلاة والتقويم' },
    { href: 'prayers.html',      icon: '🕌',  label: 'مواقيت الصلاة' },
    { href: 'qibla.html',        icon: '🧭',  label: 'اتجاه القبلة' },
    { href: 'hijri.html',        icon: '🗓️',  label: 'التقويم الهجري' },

    { sep: 'القرآن الكريم' },
    { href: 'mushaf.html',       icon: '📖',  label: 'ورد العشر' },
    { href: 'mushaf-quran.html', icon: '🕋',  label: 'المصحف الشريف' },
    { href: 'Quran-radio.HTML',  icon: '📻',  label: 'إذاعات القرآن' },
    { href: 'takbeer.html',      icon: '📿',  label: 'المسبحة' },

    { sep: 'الذكر والدعاء' },
    { href: 'adhkar.html',       icon: '🤲',  label: 'الأذكار والدعاء' },
    { href: 'nawawi.html',       icon: '📜',  label: 'الأربعون النووية' },
    { href: "du'a.html",         icon: '🌿',  label: 'الأدعية' },
    { href: 'dua-guide.html',    icon: '🙏',  label: 'قيم الدعاء' },
    { href: 'sunan.html',        icon: '🌙',  label: 'السنن المهجورة' },
    { href: 'ruqyah.html',       icon: '🛡️',  label: 'الرقية الشرعية' },
    { href: 'worship.html',      icon: '✅',  label: 'جدول العبادات' },

    { sep: 'الحج والمناسك' },
    { href: 'fadael.html',       icon: '✨',  label: 'فضائل العشر' },
    { href: 'arafah.html',       icon: '🌄',  label: 'يوم عرفة' },
    { href: 'arafah-dua.html',   icon: '🤲',  label: 'دعاء يوم عرفة' },
    { href: 'manasik.html',      icon: '🐫',  label: 'مناسك الحج' },
    { href: 'odhiya.html',       icon: '🐏',  label: 'دليل الأضحية' },
    { href: 'zakat.html',        icon: '🧮',  label: 'حاسبة الزكاة' },
    { href: 'sadaqah.html',      icon: '💚',  label: 'صدقة العشر' },

    { sep: 'التعلّم والترفيه' },              /* ← انتقل لأعلى */
    { href: 'videos.html',       icon: '🎬',  label: 'محاضرات العشر' },
    { href: 'playlist.html',     icon: '🎵',  label: 'قائمة التشغيل' },
    { href: 'kids.html',         icon: '🌟',  label: 'ثُريّا — وضع الأطفال' },
    { href: 'ghars.html',        icon: '🌱',  label: 'غرس — رحلة الحج' },
    { href: 'asma.html',         icon: '🌺',  label: 'أسماء الله الحسنى' },

    { sep: 'المتابعة' },                       /* ← انتقل لأسفل */
    { href: 'barnamaj.html',     icon: '📅',  label: 'برنامج اليوم' },
    { href: 'hasad.html',        icon: '📊',  label: 'حصاد العشر' },
    { href: 'badges.html',       icon: '🏅',  label: 'أوسمتي' },

    { sep: 'الإعدادات' },
    { href: 'profile.html',      icon: '👤',  label: 'حسابي' },
    { href: 'settings.html',     icon: '⚙️',  label: 'الإعدادات' },
    { href: 'report.html',       icon: '🚩',  label: 'بلاغ مشكلة' },
    { href: 'about.html',        icon: 'ℹ️',  label: 'عن التطبيق' },
    { href: 'developer.html',    icon: '🎨',  label: 'عن المطوّر' },
  ];

  /* ── 2) الستايل المحسّن + الحركة + الفليرز + التوهّج ──────────────────── */
  const CSS = `
  /* ===== توهّج خارجي + خلفية فليرز متحركة على المنيو ===== */
  /* ملاحظة: لا نضبط position هنا — الشريط الجانبي متموضع أصلاً
     (sticky على سطح المكتب، fixed على الموبايل)، وتغييره يكسر التخطيط. */
  .sidebar{
    background:
      radial-gradient(circle 360px at 88% -4%, rgba(201,161,74,.16), transparent 62%),
      radial-gradient(circle 420px at 8% 104%, rgba(42,122,95,.20), transparent 62%),
      var(--card) !important;
    background-repeat:no-repeat !important;
    background-attachment:local !important;
    box-shadow:
      -10px 0 44px rgba(14,59,46,.12),
      inset 1px 0 0 rgba(201,161,74,.14) !important;
    animation:zadGlowPulse 6s ease-in-out infinite;
  }
  html[data-theme="dark"] .sidebar,html[data-theme="oled"] .sidebar{
    background:
      radial-gradient(circle 360px at 88% -4%, rgba(201,161,74,.13), transparent 62%),
      radial-gradient(circle 420px at 8% 104%, rgba(77,216,102,.12), transparent 62%),
      var(--card) !important;
    box-shadow:
      -10px 0 50px rgba(0,0,0,.45),
      inset 1px 0 0 rgba(201,161,74,.12) !important;
  }
  @keyframes zadGlowPulse{
    0%,100%{box-shadow:-10px 0 40px rgba(14,59,46,.10),inset 1px 0 0 rgba(201,161,74,.12)}
    50%    {box-shadow:-12px 0 56px rgba(201,161,74,.18),inset 1px 0 0 rgba(201,161,74,.22)}
  }

  /* طبقة الفليرز المتحركة (أوربات متوهّجة تطوف) */
  .zad-fx{position:absolute;top:0;left:0;right:0;height:100vh;overflow:hidden;
          pointer-events:none;z-index:0;border-radius:inherit}
  .zad-orb{position:absolute;border-radius:50%;filter:blur(22px);opacity:.5;
           will-change:transform}
  .zad-orb.o1{width:130px;height:130px;background:radial-gradient(circle,rgba(201,161,74,.55),transparent 70%);
              top:6%;right:-30px;animation:zadFloat1 13s ease-in-out infinite}
  .zad-orb.o2{width:160px;height:160px;background:radial-gradient(circle,rgba(42,122,95,.50),transparent 70%);
              bottom:14%;left:-40px;animation:zadFloat2 17s ease-in-out infinite}
  .zad-orb.o3{width:90px;height:90px;background:radial-gradient(circle,rgba(230,201,122,.45),transparent 70%);
              top:42%;right:30%;animation:zadFloat3 11s ease-in-out infinite}
  @keyframes zadFloat1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-26px,40px) scale(1.15)}}
  @keyframes zadFloat2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(34px,-46px) scale(1.2)}}
  @keyframes zadFloat3{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-30px,-24px) scale(.85)}}

  /* رفع محتوى المنيو فوق الفليرز */
  .sidebar > *:not(.zad-fx){position:relative;z-index:1}

  /* ===== فواصل الأقسام ===== */
  .nav-sep{
    font-size:10px;font-weight:800;letter-spacing:1.5px;color:var(--muted);
    padding:14px 12px 6px;text-transform:uppercase;position:relative;
    display:flex;align-items:center;gap:8px;opacity:.85;
  }
  .nav-sep::after{content:'';flex:1;height:1px;
    background:linear-gradient(90deg,var(--border),transparent)}

  /* ===== روابط المنيو ===== */
  .sidebar .nav a{
    display:flex;align-items:center;gap:11px;padding:10px 13px;
    border-radius:13px;color:var(--ink);text-decoration:none;
    font-size:13px;font-weight:600;position:relative;overflow:hidden;
    transition:transform .2s cubic-bezier(.34,1.56,.64,1),
               background .25s ease,color .2s ease,box-shadow .25s ease;
    animation:zadNavIn .45s cubic-bezier(.22,.68,0,1) backwards;
  }
  /* لمعة تمر عند المرور */
  .sidebar .nav a::before{
    content:'';position:absolute;inset:0;border-radius:inherit;
    background:linear-gradient(90deg,transparent,rgba(201,161,74,.16),transparent);
    transform:translateX(120%);transition:transform .5s ease;pointer-events:none;
  }
  .sidebar .nav a:hover{
    background:var(--gold-pale,rgba(201,161,74,.1));color:var(--green-deep);
    transform:translateX(-4px);
    box-shadow:0 4px 16px rgba(14,59,46,.10),0 0 0 1px rgba(201,161,74,.18);
  }
  .sidebar .nav a:hover::before{transform:translateX(-120%)}
  html[data-theme="dark"] .sidebar .nav a:hover,
  html[data-theme="oled"] .sidebar .nav a:hover{color:var(--sys-green,#4dd862)}

  .sidebar .nav a .ico{
    font-size:16px;width:30px;height:30px;flex-shrink:0;
    display:flex;align-items:center;justify-content:center;
    background:var(--sand,rgba(0,0,0,.04));border-radius:9px;
    transition:transform .25s cubic-bezier(.34,1.56,.64,1),background .25s;
  }
  .sidebar .nav a:hover .ico{transform:scale(1.12) rotate(-4deg);
    background:rgba(201,161,74,.18)}

  /* العنصر النشط — تدرّج + توهّج + شريط جانبي */
  .sidebar .nav a.active{
    background:linear-gradient(135deg,rgba(201,161,74,.16),rgba(42,122,95,.12));
    color:var(--green-deep);font-weight:800;
    box-shadow:0 6px 22px rgba(14,59,46,.14),0 0 0 1px rgba(201,161,74,.30),
               inset 0 0 24px rgba(201,161,74,.06);
  }
  html[data-theme="dark"] .sidebar .nav a.active,
  html[data-theme="oled"] .sidebar .nav a.active{color:var(--sys-green,#4dd862)}
  .sidebar .nav a.active::after{
    content:'';position:absolute;right:0;top:18%;bottom:18%;width:3px;
    border-radius:3px;background:linear-gradient(var(--gold,#c9a14a),var(--green-mid,#1f5e4b));
    box-shadow:0 0 10px rgba(201,161,74,.7);animation:zadBarGlow 2.4s ease-in-out infinite;
  }
  .sidebar .nav a.active .ico{
    background:linear-gradient(135deg,var(--gold,#c9a14a),var(--green-mid,#1f5e4b));
    box-shadow:0 0 14px rgba(201,161,74,.5);transform:scale(1.06);
  }
  @keyframes zadBarGlow{0%,100%{opacity:.7}50%{opacity:1}}

  /* دخول متدرّج لعناصر المنيو */
  @keyframes zadNavIn{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:none}}

  /* احترام تفضيل تقليل الحركة */
  @media (prefers-reduced-motion: reduce){
    .sidebar,.zad-orb,.sidebar .nav a,.sidebar .nav a.active::after{animation:none !important}
    .sidebar .nav a:hover{transform:none}
  }

  /* ═══ إخفاء زرّي اللغة وتبديل المظهر من أعلى كل الصفحات (متاحة في القائمة الجانبية) ═══ */
  .main .topbar .lang-btn,
  .main .topbar #topbar-lang-btn,
  .main .topbar .btn-theme{ display:none !important; }

  /* ═══ زر التكبير السريع في الشريط العلوي ═══ */
  .zad-tkbr{display:inline-flex;align-items:center;gap:7px;border:none;cursor:pointer;
    background:linear-gradient(135deg,var(--green-deep,#0e3b2e),var(--green-mid,#1f5e4b));color:#fff;
    padding:8px 13px;border-radius:12px;font-family:inherit;font-size:13px;font-weight:800;
    box-shadow:0 4px 14px rgba(14,59,46,.25);transition:transform .15s,box-shadow .2s}
  .zad-tkbr:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(14,59,46,.32)}
  .zad-tkbr:active{transform:scale(.95)}
  .zad-tkbr .zt-ico{font-size:16px;line-height:1}
  .zad-tkbr .zt-n{background:rgba(255,255,255,.22);border-radius:99px;padding:1px 8px;font-size:12px;min-width:20px;text-align:center;font-variant-numeric:tabular-nums}
  html[data-theme="dark"] .zad-tkbr,html[data-theme="oled"] .zad-tkbr{background:linear-gradient(135deg,var(--sys-green,#4dd862),#2a7a5f);color:#03200f}
  @media(max-width:420px){ .zad-tkbr .zt-txt{display:none} }

  /* نافذة العدّاد السريع المنبثقة */
  .zad-tkbr-pop{position:fixed;inset:0;z-index:10001;display:none;align-items:center;justify-content:center;
    padding:24px;background:rgba(6,23,15,.72);backdrop-filter:blur(4px);animation:ztFade .25s ease}
  .zad-tkbr-pop.open{display:flex}
  @keyframes ztFade{from{opacity:0}to{opacity:1}}
  .zt-card{width:100%;max-width:360px;background:radial-gradient(circle at 50% 12%,#1a5d47,#0e3b2e 78%);
    border-radius:26px;padding:26px 22px 24px;text-align:center;color:#fff;position:relative;
    box-shadow:0 24px 64px rgba(0,0,0,.5);animation:ztIn .3s cubic-bezier(.22,.68,0,1) both}
  @keyframes ztIn{from{opacity:0;transform:translateY(20px) scale(.96)}to{opacity:1;transform:none}}
  .zt-close{position:absolute;top:14px;left:14px;background:rgba(255,255,255,.14);border:none;color:#fff;
    width:32px;height:32px;border-radius:50%;font-size:16px;cursor:pointer;line-height:1}
  .zt-phrase{font-size:15px;font-weight:700;line-height:1.9;color:#e6c97a;margin:6px 8px 18px;min-height:54px;
    font-family:'Amiri','Tajawal',serif;display:flex;align-items:center;justify-content:center}
  .zt-ring-wrap{position:relative;width:200px;height:200px;margin:0 auto 18px;cursor:pointer;user-select:none}
  .zt-ring-wrap svg{transform:rotate(-90deg)}
  .zt-count{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
  .zt-count .n{font-size:52px;font-weight:900;font-family:'ThmanyahSans','Tajawal',sans-serif;line-height:1}
  .zt-count .n.bump{animation:ztBump .15s ease}
  @keyframes ztBump{50%{transform:scale(1.18)}}
  .zt-count .lap{font-size:12px;color:rgba(255,255,255,.65);margin-top:4px}
  .zt-tap-hint{font-size:12px;color:rgba(255,255,255,.5);margin-bottom:16px}
  .zt-actions{display:flex;gap:10px}
  .zt-btn{flex:1;padding:12px;border-radius:13px;border:none;font-family:inherit;font-size:13px;font-weight:800;cursor:pointer;transition:filter .15s,transform .15s}
  .zt-btn:active{transform:scale(.96)}
  .zt-btn.gold{background:linear-gradient(135deg,#e6c97a,#c9a14a);color:#0e3b2e}
  .zt-btn.ghost{background:rgba(255,255,255,.1);color:#fff}
  .zt-total{font-size:12px;color:rgba(255,255,255,.6);margin-top:14px}
  .zt-total b{color:#e6c97a;font-weight:800}`;

  /* ── 3) الحقن والبناء ─────────────────────────────────────────────────── */
  function injectStyle() {
    if (document.getElementById('zad-menu-style')) return;
    const s = document.createElement('style');
    s.id = 'zad-menu-style';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* اسم ملف الصفحة الحالية (للمقارنة وتحديد النشط) */
  function currentFile() {
    let p = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (!p) p = 'index.html';
    return p;
  }

  function buildNav(navEl) {
    const cur = currentFile();
    let delay = 0;
    const html = MENU.map(item => {
      if (item.sep) return `<div class="nav-sep">${item.sep}</div>`;
      const isActive = item.href.toLowerCase() === cur;
      delay += 22;
      return `<a href="${item.href}" class="${isActive ? 'active' : ''}" `
           + `style="animation-delay:${delay}ms"><span class="ico">${item.icon}</span>`
           + `<span>${item.label}</span></a>`;
    }).join('');
    navEl.innerHTML = html;
  }

  function injectFlares(sidebar) {
    if (sidebar.querySelector('.zad-fx')) return;
    const fx = document.createElement('div');
    fx.className = 'zad-fx';
    fx.setAttribute('aria-hidden', 'true');
    fx.innerHTML = '<span class="zad-orb o1"></span><span class="zad-orb o2"></span><span class="zad-orb o3"></span>';
    sidebar.insertBefore(fx, sidebar.firstChild);
  }

  /* ═══ التكبير السريع — يتزامن مع STATE.takbeer في zad_v2 ═══ */
  const ZKEY = 'zad_v2';
  const TKBR_PHRASES = [
    'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، لَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ وَلِلَّهِ الْحَمْدُ',
    'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
  ];
  function tkbrRead() { try { return JSON.parse(localStorage.getItem(ZKEY) || '{}') || {}; } catch (e) { return {}; } }
  function tkbrWrite(s) { try { localStorage.setItem(ZKEY, JSON.stringify(s)); } catch (e) {} }

  let _qCount = 0, _qPhrase = 0;

  function buildTakbeerButton(tbRight) {
    if (tbRight.querySelector('.zad-tkbr')) return;
    const s = tkbrRead();
    const total = (s.takbeer && s.takbeer.total) || 0;
    const btn = document.createElement('button');
    btn.className = 'zad-tkbr';
    btn.setAttribute('aria-label', 'التكبير السريع');
    btn.innerHTML = `<span class="zt-ico">📿</span><span class="zt-txt">تكبير</span><span class="zt-n" id="zad-tkbr-badge">${total > 999 ? '٬' + String(total).slice(-3) : total}</span>`;
    btn.onclick = openTakbeerPop;
    tbRight.appendChild(btn);
  }

  function ensurePopup() {
    let pop = document.getElementById('zad-tkbr-pop');
    if (pop) return pop;
    pop = document.createElement('div');
    pop.id = 'zad-tkbr-pop';
    pop.className = 'zad-tkbr-pop';
    pop.innerHTML = `
      <div class="zt-card" role="dialog" aria-label="عدّاد التكبير السريع">
        <button class="zt-close" aria-label="إغلاق">✕</button>
        <div class="zt-phrase" id="zt-phrase"></div>
        <div class="zt-ring-wrap" id="zt-ring-wrap">
          <svg width="200" height="200" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="10"/>
            <circle id="zt-ring" cx="100" cy="100" r="90" fill="none" stroke="#e6c97a" stroke-width="10"
                    stroke-linecap="round" stroke-dasharray="565.5" stroke-dashoffset="565.5"/>
          </svg>
          <div class="zt-count"><span class="n" id="zt-n">0</span><span class="lap" id="zt-lap">الدورة 0 / 33</span></div>
        </div>
        <div class="zt-tap-hint">اضغط الدائرة لتُكبّر</div>
        <div class="zt-actions">
          <button class="zt-btn ghost" id="zt-phrase-btn">↻ الصيغة</button>
          <button class="zt-btn ghost" id="zt-reset">تصفير</button>
          <button class="zt-btn gold" id="zt-full">المسبحة الكاملة</button>
        </div>
        <div class="zt-total">الإجمالي: <b id="zt-total">0</b> تكبيرة</div>
      </div>`;
    document.body.appendChild(pop);

    /* الأحداث */
    pop.querySelector('.zt-close').onclick = closeTakbeerPop;
    pop.onclick = (e) => { if (e.target === pop) closeTakbeerPop(); };
    pop.querySelector('#zt-ring-wrap').onclick = doTakbeer;
    pop.querySelector('#zt-phrase-btn').onclick = () => {
      _qPhrase = (_qPhrase + 1) % TKBR_PHRASES.length;
      document.getElementById('zt-phrase').textContent = TKBR_PHRASES[_qPhrase];
    };
    pop.querySelector('#zt-reset').onclick = () => { _qCount = 0; refreshPop(); };
    pop.querySelector('#zt-full').onclick = () => { location.href = 'takbeer.html'; };
    return pop;
  }

  function refreshPop() {
    const nEl = document.getElementById('zt-n');
    const lap = document.getElementById('zt-lap');
    const ring = document.getElementById('zt-ring');
    const totEl = document.getElementById('zt-total');
    const inLap = _qCount % 33;
    const laps  = Math.floor(_qCount / 33);
    if (nEl) nEl.textContent = _qCount;
    if (lap) lap.textContent = `الدورة ${laps} · ${inLap}/33`;
    if (ring) ring.style.strokeDashoffset = String(565.5 - (565.5 * inLap / 33));
    const s = tkbrRead();
    if (totEl) totEl.textContent = ((s.takbeer && s.takbeer.total) || 0).toLocaleString('ar-EG');
  }

  function doTakbeer() {
    _qCount++;
    /* تزامن مع الإجمالي العام */
    const s = tkbrRead();
    s.takbeer = s.takbeer || { count: 0, total: 0 };
    s.takbeer.total = (s.takbeer.total || 0) + 1;
    tkbrWrite(s);
    /* تأثيرات */
    const nEl = document.getElementById('zt-n');
    if (nEl) { nEl.classList.add('bump'); setTimeout(() => nEl.classList.remove('bump'), 150); }
    try { if (navigator.vibrate) navigator.vibrate(15); } catch (e) {}
    if (_qCount % 33 === 0) {
      try { if (navigator.vibrate) navigator.vibrate([30, 40, 60]); } catch (e) {}
      try { if (window.confetti) window.confetti({ particleCount: 50, spread: 60, origin: { y: .4 } }); } catch (e) {}
    }
    refreshPop();
    /* تحديث الشارة في الزر */
    const badge = document.getElementById('zad-tkbr-badge');
    if (badge) { const t = s.takbeer.total; badge.textContent = t > 999 ? '٬' + String(t).slice(-3) : t; }
  }

  function openTakbeerPop() {
    const pop = ensurePopup();
    document.getElementById('zt-phrase').textContent = TKBR_PHRASES[_qPhrase];
    refreshPop();
    pop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeTakbeerPop() {
    const pop = document.getElementById('zad-tkbr-pop');
    if (pop) pop.classList.remove('open');
    document.body.style.overflow = '';
  }

  function init() {
    injectStyle();
    const sidebar = document.querySelector('.sidebar');
    const navEl   = document.querySelector('.sidebar .nav') || document.querySelector('.nav');
    if (navEl) buildNav(navEl);
    if (sidebar) injectFlares(sidebar);
    /* زر التكبير السريع في الشريط العلوي */
    const tbRight = document.querySelector('.main .topbar .tb-right');
    if (tbRight) buildTakbeerButton(tbRight);
    /* إعادة تطبيق الترجمة على القائمة المُعاد بناؤها (إن كانت لغة غير العربية) */
    if (window.I18N && typeof window.I18N.apply === 'function' && window.I18N.current !== 'ar') {
      try { window.I18N.apply(); } catch (e) {}
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
