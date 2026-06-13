/* ══════════════════════════════════════════════════════════════════════════
   menu.js v3 — المنيو الموحّد المحدّث لـ "زاد"
   جديد v3:
   • أقسام قابلة للطي (accordion) — يُفتح القسم النشط تلقائياً.
   • محوّل اللغة بثلاثة أزرار ظاهرة (العربية / English / قريباً).
   • زر التكبير السريع في الشريط العلوي مع عدّاد منبثق.
   • إخفاء زرّي اللغة/المظهر من أعلى كل الصفحات.
   • زر "تثبيت التطبيق" + زر "مشاركة التطبيق" بجانبه.
   • حفظ واستعادة موضع التمرير في القائمة بين الصفحات.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── بنية المنيو ─────────────────────────────────────────────────────── */
  const MENU = [
    { href: 'index.html',        icon: '🏠', label: 'لوحة التحكم', section: null },

    { sep: 'الصلاة والتقويم', id: 'sec-prayer' },
    { href: 'prayers.html',      icon: '🕌', label: 'مواقيت الصلاة',   section: 'sec-prayer' },
    { href: 'qibla.html',        icon: '🧭', label: 'اتجاه القبلة',    section: 'sec-prayer' },
    { href: 'hijri.html',        icon: '🗓️', label: 'التقويم الهجري',  section: 'sec-prayer' },
    { href: 'barnamaj.html',     icon: '📅', label: 'برنامج اليوم',     section: 'sec-prayer' },

    { sep: 'القرآن الكريم', id: 'sec-quran' },
    { href: 'mushaf.html',       icon: '📖', label: 'الورد اليومي',      section: 'sec-quran' },
    { href: 'mushaf-quran.html', icon: '🕋', label: 'المصحف الشريف',   section: 'sec-quran' },
    { href: 'Quran-radio.HTML',  icon: '📻', label: 'إذاعات القرآن',   section: 'sec-quran' },
    { href: 'takbeer.html',      icon: '📿', label: 'المسبحة',          section: 'sec-quran' },

    { sep: 'الذكر والدعاء', id: 'sec-dhikr' },
    { href: 'adhkar.html',       icon: '🤲', label: 'الأذكار',          section: 'sec-dhikr' },
    { href: 'nawawi.html',       icon: '📜', label: 'الأربعون النووية', section: 'sec-dhikr' },
    { href: "du'a.html",         icon: '🌿', label: 'الأدعية',          section: 'sec-dhikr' },
    { href: 'dua-guide.html',    icon: '🙏', label: 'قيم الدعاء',       section: 'sec-dhikr' },
    { href: 'ruqyah.html',       icon: '🛡️', label: 'الرقية الشرعية',  section: 'sec-dhikr' },
    { href: 'sunan.html',        icon: '🌙', label: 'السنن المهجورة',  section: 'sec-dhikr' },
    { href: 'asma.html',         icon: '🌺', label: 'أسماء الله الحسنى',section: 'sec-dhikr' },

    { sep: 'الحج والمناسك', id: 'sec-hajj' },
    { href: 'fadael.html',       icon: '✨', label: 'فضائل العشر',     section: 'sec-hajj' },
    { href: 'manasik.html',      icon: '🕋', label: 'مناسك الحج',       section: 'sec-hajj' },
    { href: 'arafah.html',       icon: '🌄', label: 'يوم عرفة',         section: 'sec-hajj' },
    { href: 'arafah-dua.html',   icon: '🤲', label: 'دعاء يوم عرفة',   section: 'sec-hajj' },
    { href: 'odhiya.html',       icon: '🐏', label: 'دليل الأضحية',     section: 'sec-hajj' },
    { href: 'sadaqah.html',      icon: '💚', label: 'صدقة العشر',       section: 'sec-hajj' },
    { href: 'hasad.html',        icon: '📊', label: 'حصاد العشر',       section: 'sec-hajj' },
    { href: 'hikayat-hajj.html', icon: '🕋', label: 'حكاية حج (للأطفال)', section: 'sec-hajj' },

    { sep: 'رمضان الخير 🌙', id: 'sec-ramadan' },
    { href: 'ramadan.html',         icon: '🌙', label: 'رمضان الخير — الرئيسية', section: 'sec-ramadan' },
    { href: 'ramadan-tadhkir.html', icon: '💡', label: 'تذكير إيماني',          section: 'sec-ramadan' },
    { href: 'ramadan-afdal.html',   icon: '🏆', label: 'أفضل الأعمال',          section: 'sec-ramadan' },
    { href: 'ramadan-plan.html',    icon: '🗂️', label: 'خطة العبادة',           section: 'sec-ramadan' },
    { href: 'ramadan-quran.html',   icon: '📖', label: 'القرآن في رمضان',       section: 'sec-ramadan' },
    { href: 'ramadan-fasting.html', icon: '📋', label: 'أحكام الصيام',          section: 'sec-ramadan' },
    { href: 'ramadan-duas.html',    icon: '🤲', label: 'أدعية رمضان',           section: 'sec-ramadan' },
    { href: 'ramadan-last10.html',  icon: '✨', label: 'العشر الأواخر',         section: 'sec-ramadan' },
    { href: 'ramadan-kids.html',    icon: '🧒', label: 'ركن الأطفال',           section: 'sec-ramadan' },

    { sep: 'الزكاة 💰', id: 'sec-tools' },
    { href: 'zakat-ahkam.html',  icon: '📋', label: 'أحكام الزكاة',          section: 'sec-tools' },
    { href: 'zakat-anwa.html',   icon: '📊', label: 'أنواع الزكاة وحسابها',  section: 'sec-tools' },
    { href: 'zakat.html',        icon: '🧮', label: 'حاسبة الزكاة',          section: 'sec-tools' },

    { sep: 'المكتبة الشاملة 📚', id: 'sec-learn' },
    { href: 'playlist.html',        icon: '🎵', label: 'المكتبة الصوتية', section: 'sec-learn' },
    { href: 'videos.html',          icon: '🎬', label: 'المكتبة المرئية', section: 'sec-learn' },
    { href: 'maktaba-nassiya.html', icon: '📖', label: 'المكتبة النصية',  section: 'sec-learn' },

    { sep: 'ركن الأطفال 🌟', id: 'sec-kids' },
    { href: 'kids.html',             icon: '🌟', label: 'ثُريّا — الرئيسية',  section: 'sec-kids' },
    { href: 'ghars.html',            icon: '🌱', label: 'غرس — قصص للأطفال', section: 'sec-kids' },
    { href: 'kids-heroes.html',      icon: '🦁', label: 'عرين الأبطال',      section: 'sec-kids' },
    { href: 'kids-school.html',      icon: '🏫', label: 'مدرستي الجميلة',    section: 'sec-kids' },
    { href: 'kids-fun.html',         icon: '🎮', label: 'شاشة المرح',        section: 'sec-kids' },
    { href: 'kids-creativity.html',  icon: '🎨', label: 'نادي الإبداع',      section: 'sec-kids' },
    { href: 'kids-parents.html',     icon: '👨‍👧', label: 'دليل المربي',     section: 'sec-kids' },

    { sep: 'المتابعة', id: 'sec-track' },
    { href: 'progress.html',     icon: '📊', label: 'لوحة التقدّم',     section: 'sec-track' },
    { href: 'hasad-month.html',  icon: '🗓️', label: 'حصاد الشهر',       section: 'sec-track' },
    { href: 'summary.html',      icon: '📈', label: 'إحصاء العشر',     section: 'sec-track' },
    { href: 'badges.html',       icon: '🏅', label: 'أوسمتي',           section: 'sec-track' },

    { sep: 'التنافس العائلي 👨‍👩‍👧', id: 'sec-family' },
    { href: 'groups.html',         icon: '👨‍👩‍👧', label: 'المجموعات والمنافسة', section: 'sec-family' },
    { href: 'groups-privacy.html', icon: '🔒', label: 'الخصوصية وكيف يعمل',   section: 'sec-family' },

    { sep: 'الإعدادات', id: 'sec-settings' },
    { href: 'profile.html',      icon: '👤', label: 'حسابي',            section: 'sec-settings' },
    { href: 'settings.html',     icon: '⚙️', label: 'الإعدادات',        section: 'sec-settings' },
    { href: 'report.html',       icon: '🚩', label: 'بلاغ مشكلة',       section: 'sec-settings' },
    { href: 'about.html',        icon: 'ℹ️', label: 'عن التطبيق',       section: 'sec-settings' },
    { href: 'developer.html',    icon: '🎨', label: 'عن المطوّر',       section: 'sec-settings' },

    { sep: 'وضع خاص', id: 'sec-special' },
    { href: 'zahra.html',        icon: '🌸', label: 'زهرة — رفيقةُ العذر',   section: 'sec-special' },
    { href: 'hawwa.html',        icon: '🌙', label: 'حواء — عبادتي في عذري', section: 'sec-special' },
  ];

  /* ── مفاتيح التخزين ──────────────────────────────────────────────────── */
  const STORE_OPEN    = 'zad_menu_open';    /* أقسام مفتوحة */
  const STORE_SCROLL  = 'zad_menu_scroll';  /* موضع التمرير */

  /* ── الأقسام المفتوحة افتراضياً ─────────────────────────────────────── */
  const ALL_SECTIONS = ['sec-prayer','sec-quran','sec-hajj','sec-ramadan','sec-learn','sec-kids','sec-track','sec-family','sec-settings'];
  function getOpenSections() {
    try {
      const stored = localStorage.getItem(STORE_OPEN);
      /* أول زيارة: كل الأقسام مفتوحة لإظهار كل الصفحات */
      if (stored === null) return ALL_SECTIONS.slice();
      return JSON.parse(stored || '[]');
    } catch { return ALL_SECTIONS.slice(); }
  }
  function setOpenSections(arr) {
    try { localStorage.setItem(STORE_OPEN, JSON.stringify(arr)); } catch {}
  }

  /* ── تحديد الصفحة الحالية ────────────────────────────────────────────── */
  function currentFile() {
    let p = (decodeURIComponent(location.pathname).split('/').pop() || 'index.html').toLowerCase();
    return p || 'index.html';
  }

  /* ── ايجاد القسم المحيط بالصفحة الحالية ──────────────────────────────── */
  function activeSectionId() {
    const cur = currentFile();
    const item = MENU.find(m => m.href && m.href.toLowerCase() === cur);
    return item?.section || null;
  }

  /* ══════════════════════════════════════════════════════════════════════
     CSS المحسّن — القائمة الجانبية
     ════════════════════════════════════════════════════════════════════ */
  const CSS = `
  /* ═══ توهّج خارجي + فليرز ═══ */
  .sidebar{
    /* position intentionally omitted — let style.css handle sticky/fixed */
    background:
      radial-gradient(circle 360px at 88% -4%, rgba(201,161,74,.18), transparent 62%),
      radial-gradient(circle 420px at 8% 104%, rgba(11,48,36,.30), transparent 62%),
      linear-gradient(180deg,#0b3024,#1a5d47) !important;
    background-repeat:no-repeat !important;
    background-attachment:local !important;
    box-shadow:-10px 0 44px rgba(14,59,46,.12),inset 1px 0 0 rgba(201,161,74,.14) !important;
    animation:zadGlowPulse 6s ease-in-out infinite;
  }
  html[data-theme="dark"] .sidebar{
    background:
      radial-gradient(circle 360px at 88% -4%, rgba(201,161,74,.13), transparent 62%),
      radial-gradient(circle 420px at 8% 104%, rgba(77,216,102,.12), transparent 62%),
      linear-gradient(180deg,#060e09,#0e1c12) !important;
    box-shadow:-10px 0 50px rgba(0,0,0,.45),inset 1px 0 0 rgba(201,161,74,.12) !important;
  }
  html[data-theme="oled"] .sidebar{
    background:
      radial-gradient(circle 360px at 88% -4%, rgba(201,161,74,.10), transparent 62%),
      linear-gradient(180deg,#000000,#050505) !important;
    box-shadow:-10px 0 50px rgba(0,0,0,.7),inset 1px 0 0 rgba(201,161,74,.08) !important;
  }
  @keyframes zadGlowPulse{
    0%,100%{box-shadow:-10px 0 40px rgba(14,59,46,.10),inset 1px 0 0 rgba(201,161,74,.12)}
    50%    {box-shadow:-12px 0 56px rgba(201,161,74,.18),inset 1px 0 0 rgba(201,161,74,.22)}
  }
  .zad-fx{position:absolute;top:0;left:0;right:0;height:100vh;overflow:hidden;pointer-events:none;z-index:0;border-radius:inherit}
  .zad-orb{position:absolute;border-radius:50%;filter:blur(22px);opacity:.5;will-change:transform}
  .zad-orb.o1{width:130px;height:130px;background:radial-gradient(circle,rgba(201,161,74,.55),transparent 70%);top:6%;right:-30px;animation:zadFloat1 13s ease-in-out infinite}
  .zad-orb.o2{width:160px;height:160px;background:radial-gradient(circle,rgba(42,122,95,.50),transparent 70%);bottom:14%;left:-40px;animation:zadFloat2 17s ease-in-out infinite}
  .zad-orb.o3{width:90px;height:90px;background:radial-gradient(circle,rgba(230,201,122,.45),transparent 70%);top:42%;right:30%;animation:zadFloat3 11s ease-in-out infinite}
  @keyframes zadFloat1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-26px,40px) scale(1.15)}}
  @keyframes zadFloat2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(34px,-46px) scale(1.2)}}
  @keyframes zadFloat3{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-30px,-24px) scale(.85)}}
  .sidebar > *:not(.zad-fx){position:relative;z-index:1}

  /* ═══ محوّل اللغة الثلاثي ═══ */
  /* ═══ محوّل اللغة المنسدل (متعدد اللغات) ═══ */
  .zad-lang-dd{position:relative;margin-bottom:8px}
  .zad-lang-trigger{width:100%;display:flex;align-items:center;gap:9px;padding:10px 13px;border:1.5px solid rgba(255,255,255,.15);border-radius:12px;background:rgba(255,255,255,.08);color:#f4ecd6;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s}
  .zad-lang-trigger:hover{border-color:var(--gold,#c9a14a);background:rgba(255,255,255,.12)}
  .zad-lang-trigger .zll-flag{font-size:18px}
  .zad-lang-trigger .zll-name{flex:1;text-align:right}
  .zad-lang-trigger .zll-arrow{font-size:11px;transition:transform .25s;opacity:.7}
  .zad-lang-dd.open .zad-lang-trigger .zll-arrow{transform:rotate(180deg)}
  .zad-lang-menu{position:absolute;top:calc(100% + 6px);left:0;right:0;background:#0e3b2e;border:1.5px solid rgba(201,161,74,.3);border-radius:13px;padding:6px;box-shadow:0 14px 40px -8px rgba(0,0,0,.55);z-index:50;max-height:0;overflow:hidden;opacity:0;transform:translateY(-8px);pointer-events:none;transition:max-height .28s,opacity .2s,transform .2s}
  .zad-lang-dd.open .zad-lang-menu{max-height:340px;opacity:1;transform:none;pointer-events:auto}
  .zad-lang-opt{width:100%;display:flex;align-items:center;gap:10px;padding:9px 11px;border:none;border-radius:9px;background:transparent;color:#f4ecd6;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:all .18s;text-align:right}
  .zad-lang-opt .zll-flag{font-size:17px}
  .zad-lang-opt span:nth-child(2){flex:1}
  .zad-lang-opt:hover{background:rgba(255,255,255,.1)}
  .zad-lang-opt.active{background:rgba(201,161,74,.18);color:#fff}
  .zad-lang-opt .zll-check{color:var(--gold,#e6c97a);font-weight:900}

  /* ═══ أزرار التثبيت والمشاركة ═══ */
  .zad-install-row{display:flex;gap:6px;margin-bottom:6px}
  .zad-install-row .zad-inst-btn{flex:1;padding:9px 6px;border-radius:11px;border:1.5px solid var(--border);background:var(--sand);font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;color:var(--ink);transition:all .2s;text-align:center;display:flex;align-items:center;justify-content:center;gap:5px}
  html[data-theme="dark"] .zad-inst-btn,html[data-theme="oled"] .zad-inst-btn{background:var(--sand-2)}
  .zad-install-row .zad-inst-btn:hover{border-color:var(--gold);background:var(--gold-pale)}
  .zad-install-row .zad-inst-btn.primary{background:var(--green-deep);color:#fff;border-color:transparent}
  .zad-install-row .zad-inst-btn.primary:hover{background:var(--green-mid)}
  html[data-theme="dark"] .zad-inst-btn.primary,html[data-theme="oled"] .zad-inst-btn.primary{background:var(--sys-green);color:#002208}

  /* ═══ فواصل الأقسام (قابلة للطي) ═══ */
  .nav-sep{
    font-size:13px;font-weight:800;letter-spacing:1px;color:#e6c97a;
    padding:14px 12px 7px;position:relative;display:flex;align-items:center;
    gap:8px;opacity:1;cursor:pointer;user-select:none;
    transition:color .2s;
  }
  .nav-sep:hover{color:#f0d898}
  html[data-theme="dark"] .nav-sep:hover,html[data-theme="oled"] .nav-sep:hover{color:#f0d898}
  .nav-sep::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,rgba(230,201,122,.35),transparent)}
  .nav-sep .sep-arrow{font-size:11px;transition:transform .25s;margin-right:2px;color:#e6c97a}
  .nav-sep.collapsed .sep-arrow{transform:rotate(-90deg)}

  /* Desktop: فتح بـ hover + إشارة بصرية */
  @media(hover:hover) and (pointer:fine) {
    .nav-sep:hover + .nav-group.collapsed,
    .nav-sep:hover + .nav-group.collapsed:hover {
      max-height:1000px !important;
      opacity:1 !important;
      pointer-events:auto !important;
    }
    /* تأثير hover على الـ nav-sep */
    .nav-sep:hover { opacity:1; }
  }

  /* مجموعة العناصر القابلة للطي */
  .nav-group{overflow:hidden;transition:max-height .32s cubic-bezier(.4,0,.2,1),opacity .25s ease}
  .nav-group.collapsed{max-height:0 !important;opacity:0;pointer-events:none}

  /* ═══ روابط المنيو ═══ */
  .sidebar .nav a{
    display:flex;align-items:center;gap:12px;padding:12px 14px;
    border-radius:13px;color:#f4ecd6;text-decoration:none;
    font-size:17px;font-weight:600;position:relative;overflow:hidden;
    transition:transform .2s cubic-bezier(.34,1.56,.64,1),background .25s,color .2s,box-shadow .25s;
    animation:zadNavIn .45s cubic-bezier(.22,.68,0,1) backwards;
  }
  .sidebar .nav a::before{
    content:'';position:absolute;inset:0;border-radius:inherit;
    background:linear-gradient(90deg,transparent,rgba(201,161,74,.16),transparent);
    transform:translateX(120%);transition:transform .5s;pointer-events:none;
  }
  .sidebar .nav a:hover{background:rgba(255,255,255,.1);color:#ffffff;transform:translateX(-4px);box-shadow:0 4px 16px rgba(0,0,0,.18),0 0 0 1px rgba(201,161,74,.30)}
  .sidebar .nav a:hover::before{transform:translateX(-120%)}
  html[data-theme="dark"] .sidebar .nav a:hover,html[data-theme="oled"] .sidebar .nav a:hover{color:#ffffff}
  .sidebar .nav a .ico{font-size:19px;width:34px;height:34px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.1);border-radius:10px;transition:transform .25s cubic-bezier(.34,1.56,.64,1),background .25s}
  .sidebar .nav a:hover .ico{transform:scale(1.12) rotate(-4deg);background:rgba(201,161,74,.3)}
  .sidebar .nav a.active{background:linear-gradient(135deg,rgba(201,161,74,.28),rgba(42,122,95,.20));color:#ffffff;font-weight:800;box-shadow:0 6px 22px rgba(0,0,0,.2),0 0 0 1px rgba(201,161,74,.45),inset 0 0 24px rgba(201,161,74,.12)}
  html[data-theme="dark"] .sidebar .nav a.active,html[data-theme="oled"] .sidebar .nav a.active{color:#ffffff}
  .sidebar .nav a.active::after{content:'';position:absolute;right:0;top:18%;bottom:18%;width:3px;border-radius:3px;background:linear-gradient(var(--gold,#c9a14a),var(--green-mid,#1f5e4b));box-shadow:0 0 10px rgba(201,161,74,.7);animation:zadBarGlow 2.4s ease-in-out infinite}
  .sidebar .nav a.active .ico{background:linear-gradient(135deg,var(--gold,#c9a14a),var(--green-mid,#1f5e4b));box-shadow:0 0 14px rgba(201,161,74,.5);transform:scale(1.06)}
  @keyframes zadBarGlow{0%,100%{opacity:.7}50%{opacity:1}}
  @keyframes zadNavIn{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:none}}

  /* ═══ إخفاء زرّي اللغة/المظهر + الشعار من الشريط العلوي ═══ */
  .main .topbar .lang-btn,
  .main .topbar #topbar-lang-btn,
  .main .topbar .tb-logo,
  .main .topbar .btn-theme{ display:none !important; }

  /* ═══ ضمان وضوح نصوص السايدبار على الخلفية الداكنة ═══ */
  .sidebar .brand-name{ color:#ffffff !important; }
  .sidebar .brand-sub{ color:rgba(244,236,214,.7) !important; }
  .sidebar .theme-row{ color:#f4ecd6 !important; }
  .sidebar .theme-row span{ color:#f4ecd6 !important; }
  .sidebar .side-foot{ color:rgba(244,236,214,.55) !important; }
  /* بطاقة الملف الشخصي على خلفية شفافة فاتحة */
  .sidebar #profile-chip{
    background:rgba(255,255,255,.1) !important;
    border-color:rgba(255,255,255,.15) !important;
    color:#f4ecd6 !important;
  }
  .sidebar #profile-chip span{ color:#f4ecd6 !important; }

  /* ═══ زر التكبير السريع ═══ */
  /* ═══ زر التكبير العائم (FAB) — زي زر الماسنجر ═══ */
  .zad-tkbr-fab{
    position:fixed; z-index:195;
    bottom:84px; left:18px;            /* فوق الشريط السفلي العائم */
    width:58px; height:58px; border-radius:50%;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    border:none; cursor:pointer;
    background:linear-gradient(135deg,#0e3b2e,#1f5e4b);
    box-shadow:0 8px 24px -4px rgba(14,59,46,.5), 0 0 0 4px rgba(201,161,74,.18);
    transition:transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .25s;
    animation:fabPulse 3.5s ease-in-out infinite;
  }
  .zad-tkbr-fab:hover{transform:scale(1.08) translateY(-2px);box-shadow:0 12px 30px -4px rgba(14,59,46,.6),0 0 0 5px rgba(201,161,74,.25)}
  .zad-tkbr-fab:active{transform:scale(.94)}
  .zad-tkbr-fab .zt-ico{font-size:24px;line-height:1}
  .zad-tkbr-fab .zt-n{position:absolute;top:-4px;right:-4px;background:linear-gradient(135deg,#e6c97a,#c9a14a);color:#0e3b2e;border-radius:99px;padding:1px 7px;font-size:11px;font-weight:900;min-width:20px;text-align:center;box-shadow:0 2px 6px rgba(0,0,0,.25);border:2px solid var(--bg-soft,#faf6ec)}
  html[data-theme="dark"] .zad-tkbr-fab,html[data-theme="oled"] .zad-tkbr-fab{background:linear-gradient(135deg,var(--sys-green,#4dd862),#2a7a5f)}
  html[data-theme="dark"] .zad-tkbr-fab .zt-ico,html[data-theme="oled"] .zad-tkbr-fab .zt-ico{filter:none}
  @keyframes fabPulse{0%,100%{box-shadow:0 8px 24px -4px rgba(14,59,46,.5),0 0 0 4px rgba(201,161,74,.18)}50%{box-shadow:0 8px 28px -4px rgba(14,59,46,.6),0 0 0 7px rgba(201,161,74,.10)}}
  /* يختفي عند فتح المنيو */
  body:has(.sidebar.open) .zad-tkbr-fab,
  body.zad-menu-open .zad-tkbr-fab{opacity:0;transform:translateY(40px) scale(.8);pointer-events:none;transition:opacity .25s,transform .25s}
  /* على الديسكتوب: أسفل يمين */
  @media(min-width:769px){
    .zad-tkbr-fab{bottom:24px;left:auto;right:24px}
  }

  .zad-tkbr-pop{position:fixed;inset:0;z-index:10001;display:none;align-items:center;justify-content:center;padding:24px;background:rgba(6,23,15,.72);backdrop-filter:blur(4px)}
  .zad-tkbr-pop.open{display:flex}
  .zt-card{width:100%;max-width:360px;background:radial-gradient(circle at 50% 12%,#1a5d47,#0e3b2e 78%);border-radius:26px;padding:26px 22px 24px;text-align:center;color:#fff;position:relative;box-shadow:0 24px 64px rgba(0,0,0,.5);animation:ztIn .3s cubic-bezier(.22,.68,0,1) both}
  @keyframes ztIn{from{opacity:0;transform:translateY(20px) scale(.96)}to{opacity:1;transform:none}}
  .zt-close{position:absolute;top:14px;left:14px;background:rgba(255,255,255,.14);border:none;color:#fff;width:32px;height:32px;border-radius:50%;font-size:16px;cursor:pointer}
  .zt-phrase{font-size:15px;font-weight:700;line-height:1.9;color:#e6c97a;margin:6px 8px 18px;min-height:54px;font-family:'Amiri','Tajawal',serif;display:flex;align-items:center;justify-content:center}
  .zt-tabs{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:8px 0 4px}
  .zt-tab{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.75);font-family:inherit;font-size:11.5px;font-weight:700;padding:5px 11px;border-radius:99px;cursor:pointer;transition:all .2s}
  .zt-tab:hover{background:rgba(255,255,255,.18);color:#fff}
  .zt-tab.active{background:linear-gradient(135deg,#e6c97a,#c9a14a);color:#0e3b2e;border-color:transparent;box-shadow:0 2px 8px rgba(201,161,74,.4)}
  .zt-ring-wrap{position:relative;width:200px;height:200px;margin:0 auto 18px;cursor:pointer;user-select:none}
  .zt-ring-wrap svg{transform:rotate(-90deg)}
  .zt-count{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
  .zt-count .n{font-size:52px;font-weight:900;line-height:1}
  .zt-count .n.bump{animation:ztBump .15s ease}
  @keyframes ztBump{50%{transform:scale(1.18)}}
  .zt-count .lap{font-size:12px;color:rgba(255,255,255,.65);margin-top:4px}
  .zt-actions{display:flex;gap:10px}
  .zt-btn{flex:1;padding:12px;border-radius:13px;border:none;font-family:inherit;font-size:13px;font-weight:800;cursor:pointer}
  .zt-btn.gold{background:linear-gradient(135deg,#e6c97a,#c9a14a);color:#0e3b2e}
  .zt-btn.ghost{background:rgba(255,255,255,.1);color:#fff}
  .zt-total{font-size:12px;color:rgba(255,255,255,.6);margin-top:14px}
  .zt-total b{color:#e6c97a}

  @media(prefers-reduced-motion:reduce){
    .sidebar,.zad-orb,.sidebar .nav a,.sidebar .nav a.active::after,.nav-group{animation:none !important}
    .sidebar .nav a:hover{transform:none}
    .nav-group{transition:none}
  }

  /* ═══ التوب بار → شريط سفلي عائم دائري بالكامل (موبايل فقط) ═══ */
  @media(max-width:768px){
    .main .topbar{
      position:fixed !important;
      top:auto !important;
      bottom:14px !important;
      left:14px !important;
      right:14px !important;
      width:auto !important;
      margin:0 !important;
      border-radius:999px !important;      /* دائري بالكامل */
      z-index:190 !important;
      padding:8px 16px !important;
      box-shadow:0 10px 32px -6px rgba(14,59,46,.42) !important;
      transition:opacity .3s var(--ease,ease), transform .3s var(--ease,ease) !important;
    }
    /* مساحة أسفل المحتوى حتى لا يغطّي الشريط آخر عنصر */
    .main{ padding-bottom:92px !important; }
    /* يختفي الشريط تماماً عند فتح القائمة الجانبية */
    body:has(.sidebar.open) .main .topbar,
    body.zad-menu-open .main .topbar{
      opacity:0 !important;
      transform:translateY(60px) scale(.96) !important;
      pointer-events:none !important;
    }
    /* إخفاء زر fab-ai القديم لو موجود (ليبقى شريط واحد فقط) */
    .fab-ai{ display:none !important; }

    /* مسافة علوية للمحتوى بعد نقل التوب بار تحت */
    .main{ padding-top:16px !important; }

    /* القائمة المنسدلة للإشعارات تفتح لأعلى (التوب بار صار تحت) */
    .main .topbar .notif-wrap{ position:relative !important; }
    .main .topbar .notif-dropdown{
      position:absolute !important;
      top:auto !important;
      bottom:calc(100% + 12px) !important;
      left:0 !important; right:auto !important;
      transform-origin:bottom center !important;
      max-height:60vh !important;
      overflow-y:auto !important;
      z-index:200 !important;
    }
    /* سهم القائمة يتقلب لأسفل */
    .main .topbar .notif-dropdown::before,
    .main .topbar .notif-dropdown::after{
      top:auto !important;
      bottom:-8px !important;
      transform:rotate(180deg) !important;
    }
  }`;

  /* ══════════════════════════════════════════════════════════════════════
     حقن الستايل
     ════════════════════════════════════════════════════════════════════ */
  function injectStyle() {
    if (document.getElementById('zad-menu-style')) return;
    const s = document.createElement('style');
    s.id = 'zad-menu-style';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ══════════════════════════════════════════════════════════════════════
     بناء القائمة مع الأقسام القابلة للطي
     ════════════════════════════════════════════════════════════════════ */
  function buildNav(navEl) {
    const cur       = currentFile();
    const activeSecId = activeSectionId();
    const openSecs  = getOpenSections();

    /* تأكد إن القسم النشط مفتوح دايماً */
    if (activeSecId && !openSecs.includes(activeSecId)) {
      openSecs.push(activeSecId);
      /* القسم بتاع index مفتوح دايماً */
      setOpenSections(openSecs);
    }

    /* بناء الـ HTML */
    let html = '';
    let currentGroupId = null;
    let groupDelay = 0;

    MENU.forEach((item, i) => {
      if (item.sep) {
        /* أغلق الجروب السابق */
        if (currentGroupId) html += '</div>';
        currentGroupId = item.id;
        const isOpen = openSecs.includes(item.id) || item.id === activeSecId;
        html += `<div class="nav-sep ${isOpen ? '' : 'collapsed'}" data-sec="${item.id}" onclick="window._zadToggleSec('${item.id}')">
          <span class="sep-arrow">▾</span>${item.sep}
        </div>
        <div class="nav-group ${isOpen ? '' : 'collapsed'}" id="grp-${item.id}" style="max-height:${isOpen ? '1000px' : '0'}">`;
        return;
      }
      /* رابط عادي */
      const isActive = item.href.toLowerCase() === cur;
      groupDelay += 22;
      html += `<a href="${item.href}" class="${isActive ? 'active' : ''}" style="animation-delay:${groupDelay}ms">
        <span class="ico">${item.icon}</span><span>${item.label}</span></a>`;
    });
    if (currentGroupId) html += '</div>';
    navEl.innerHTML = html;
  }

  /* تبديل القسم مفتوح/مقفول */
  window._zadToggleSec = function(secId) {
    const sep = document.querySelector(`.nav-sep[data-sec="${secId}"]`);
    const grp = document.getElementById('grp-' + secId);
    if (!sep || !grp) return;
    const isOpen = !sep.classList.contains('collapsed');
    if (isOpen) {
      sep.classList.add('collapsed');
      grp.classList.add('collapsed');
      grp.style.maxHeight = '0';
    } else {
      sep.classList.remove('collapsed');
      grp.classList.remove('collapsed');
      grp.style.maxHeight = '1000px';
    }
    /* حفظ الحالة */
    const open = [];
    document.querySelectorAll('.nav-sep:not(.collapsed)').forEach(el => {
      const s = el.getAttribute('data-sec');
      if (s) open.push(s);
    });
    setOpenSections(open);
  };

  /* ══════════════════════════════════════════════════════════════════════
     محوّل اللغة الثلاثي
     ════════════════════════════════════════════════════════════════════ */
  const ZAD_LANGS = [
    { code:'ar', flag:'🇸🇦', name:'العربية' },
    { code:'en', flag:'🇬🇧', name:'English' },
    { code:'fr', flag:'🇫🇷', name:'Français' },
    { code:'ur', flag:'🇵🇰', name:'اردو' },
    { code:'id', flag:'🇮🇩', name:'Indonesia' },
    { code:'tr', flag:'🇹🇷', name:'Türkçe' },
  ];

  function buildLangSwitcher(targetEl) {
    if (!targetEl || targetEl.dataset.zadLang) return;
    targetEl.dataset.zadLang = '1';

    const cur = (typeof window.I18N !== 'undefined' ? window.I18N.current : null)
               || (document.documentElement.lang || 'ar');
    const curLang = ZAD_LANGS.find(l => l.code === cur) || ZAD_LANGS[0];

    const wrap = document.createElement('div');
    wrap.className = 'zad-lang-dd';
    wrap.innerHTML = `
      <button class="zad-lang-trigger" id="zad-lang-trigger" aria-haspopup="true" aria-expanded="false">
        <span class="zll-flag">${curLang.flag}</span>
        <span class="zll-name">${curLang.name}</span>
        <span class="zll-arrow">▾</span>
      </button>
      <div class="zad-lang-menu" id="zad-lang-menu" role="menu">
        ${ZAD_LANGS.map(l => `
          <button role="menuitem" class="zad-lang-opt ${l.code===cur?'active':''}" data-lang="${l.code}">
            <span class="zll-flag">${l.flag}</span><span>${l.name}</span>
            ${l.code===cur?'<span class="zll-check">✓</span>':''}
          </button>`).join('')}
      </div>`;
    targetEl.replaceWith(wrap);

    const trigger = wrap.querySelector('#zad-lang-trigger');
    const menu = wrap.querySelector('#zad-lang-menu');
    trigger.onclick = (e) => {
      e.stopPropagation();
      const open = wrap.classList.toggle('open');
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    menu.querySelectorAll('.zad-lang-opt').forEach(opt => {
      opt.onclick = () => {
        window._zadSetLang(opt.dataset.lang);
        wrap.classList.remove('open');
      };
    });
    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target)) wrap.classList.remove('open');
    });
  }

  window._zadSetLang = function(lang) {
    const meta = ZAD_LANGS.find(l => l.code === lang) || ZAD_LANGS[0];
    /* تحديث زر العرض */
    const trigger = document.querySelector('#zad-lang-trigger');
    if (trigger) {
      const f = trigger.querySelector('.zll-flag'), n = trigger.querySelector('.zll-name');
      if (f) f.textContent = meta.flag;
      if (n) n.textContent = meta.name;
    }
    /* تحديث علامة الاختيار */
    document.querySelectorAll('.zad-lang-opt').forEach(o => {
      const on = o.dataset.lang === lang;
      o.classList.toggle('active', on);
      let chk = o.querySelector('.zll-check');
      if (on && !chk) { chk = document.createElement('span'); chk.className = 'zll-check'; chk.textContent = '✓'; o.appendChild(chk); }
      else if (!on && chk) chk.remove();
    });
    /* تطبيق اللغة */
    if (lang === 'ar' || lang === 'en') {
      if (typeof toggleLang === 'function') {
        const currentLang = document.documentElement.lang || 'ar';
        if (currentLang !== lang) toggleLang();
      } else {
        document.documentElement.lang = lang;
        document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr';
        try { localStorage.setItem('zad_lang', lang); } catch {}
      }
    } else {
      /* لغات أخرى — قيد الإضافة */
      try { localStorage.setItem('zad_lang', lang); } catch {}
      if (typeof showToast === 'function') showToast('🌐 الترجمة لهذه اللغة قيد الإضافة قريباً');
    }
  };

  /* ══════════════════════════════════════════════════════════════════════
     أزرار التثبيت والمشاركة
     ════════════════════════════════════════════════════════════════════ */
  function buildInstallButtons(sidebar) {
    /* استبدال الزر القديم */
    const oldBtn = sidebar.querySelector('.sidebar-install-btn, #sidebar-install-btn');
    if (!oldBtn || oldBtn.dataset.zadInst) return;
    oldBtn.dataset.zadInst = '1';

    const row = document.createElement('div');
    row.className = 'zad-install-row';
    row.innerHTML = `
      <button class="zad-inst-btn primary" id="zad-install-btn" onclick="installPWA?.()">
        📲 تثبيت التطبيق
      </button>
      <button class="zad-inst-btn" onclick="window._zadShareApp()">
        🔗 مشاركة
      </button>`;
    oldBtn.replaceWith(row);
  }

  window._zadShareApp = function() {
    /* يشارك رابط الموقع — استبدل APP_APK_URL بملف APK فعلي حين يتوفر */
    const APP_URL = 'https://zadullashr.vercel.app';
    if (navigator.share) {
      navigator.share({ title: 'زاد', text: 'رفيقك في عشر ذي الحجة 🌙', url: APP_URL });
    } else {
      navigator.clipboard?.writeText(APP_URL).then(() => {
        if (typeof showToast === 'function') showToast('✅ تم نسخ رابط التطبيق');
      });
    }
  };

  /* ══════════════════════════════════════════════════════════════════════
     حفظ/استعادة موضع التمرير في القائمة
     ════════════════════════════════════════════════════════════════════ */
  function saveScroll(navEl) {
    const sidebar = navEl?.closest('.sidebar');
    if (!sidebar) return;
    try { localStorage.setItem(STORE_SCROLL, sidebar.scrollTop); } catch {}
  }
  function restoreScroll(sidebar) {
    try {
      const saved = parseInt(localStorage.getItem(STORE_SCROLL) || '0', 10);
      if (saved > 0) sidebar.scrollTop = saved;
      /* تمرير إضافي لإظهار الصفحة النشطة */
      const active = sidebar.querySelector('.nav a.active');
      if (active) {
        const top = active.offsetTop - sidebar.clientHeight / 2;
        if (top > saved) sidebar.scrollTop = top;
      }
    } catch {}
  }

  /* ══════════════════════════════════════════════════════════════════════
     الفليرز
     ════════════════════════════════════════════════════════════════════ */
  function injectFlares(sidebar) {
    if (sidebar.querySelector('.zad-fx')) return;
    const fx = document.createElement('div');
    fx.className = 'zad-fx';
    fx.setAttribute('aria-hidden', 'true');
    fx.innerHTML = '<span class="zad-orb o1"></span><span class="zad-orb o2"></span><span class="zad-orb o3"></span>';
    sidebar.insertBefore(fx, sidebar.firstChild);
  }

  /* ══════════════════════════════════════════════════════════════════════
     التكبير السريع
     ════════════════════════════════════════════════════════════════════ */
  const ZKEY = 'zad_v2';
  const TKBR_PHRASES = [
    { label:'التكبير', text:'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، لَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ وَلِلَّهِ الْحَمْدُ' },
    { label:'التهليل', text:'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ' },
    { label:'التسبيح', text:'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ' },
    { label:'الحمد', text:'الْحَمْدُ لِلَّهِ حَمْدًا كَثِيرًا طَيِّبًا مُبَارَكًا فِيهِ' },
    { label:'الاستغفار', text:'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيَّ الْقَيُّومَ وَأَتُوبُ إِلَيْهِ' },
    { label:'الصلاة على النبي', text:'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ أَجْمَعِينَ' },
  ];
  function tkbrRead() { try { return JSON.parse(localStorage.getItem(ZKEY) || '{}') || {}; } catch { return {}; } }
  function tkbrWrite(s) { try { localStorage.setItem(ZKEY, JSON.stringify(s)); } catch {} }
  let _qCount = 0, _qPhrase = 0;

  function buildTakbeerButton() {
    if (document.getElementById('zad-tkbr-fab')) return;
    const s = tkbrRead();
    const total = (s.takbeer && s.takbeer.total) || 0;
    const btn = document.createElement('button');
    btn.className = 'zad-tkbr-fab';
    btn.id = 'zad-tkbr-fab';
    btn.setAttribute('aria-label', 'التكبير السريع');
    btn.innerHTML = `<span class="zt-ico">📿</span><span class="zt-n" id="zad-tkbr-badge">${total}</span>`;
    btn.onclick = openTakbeerPop;
    document.body.appendChild(btn);
  }

  function ensurePopup() {
    let pop = document.getElementById('zad-tkbr-pop');
    if (pop) return pop;
    pop = document.createElement('div');
    pop.id = 'zad-tkbr-pop';
    pop.className = 'zad-tkbr-pop';
    pop.innerHTML = `<div class="zt-card" role="dialog">
      <button class="zt-close" aria-label="إغلاق">✕</button>
      <div class="zt-tabs" id="zt-tabs"></div>
      <div class="zt-phrase" id="zt-phrase"></div>
      <div class="zt-ring-wrap" id="zt-ring-wrap">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="10"/>
          <circle id="zt-ring" cx="100" cy="100" r="90" fill="none" stroke="#e6c97a" stroke-width="10" stroke-linecap="round" stroke-dasharray="565.5" stroke-dashoffset="565.5"/>
        </svg>
        <div class="zt-count"><span class="n" id="zt-n">0</span><span class="lap" id="zt-lap">الدورة 0 · 0/33</span></div>
      </div>
      <div style="font-size:12px;color:rgba(255,255,255,.5);margin-bottom:16px">اضغط الدائرة لتُسبّح</div>
      <div class="zt-actions">
        <button class="zt-btn ghost" id="zt-reset">تصفير</button>
        <button class="zt-btn gold" id="zt-full">المسبحة الكاملة</button>
      </div>
      <div class="zt-total">الإجمالي: <b id="zt-total">0</b></div>
    </div>`;
    document.body.appendChild(pop);
    /* بناء تبويبات الأذكار */
    const tabsEl = pop.querySelector('#zt-tabs');
    TKBR_PHRASES.forEach((p, i) => {
      const chip = document.createElement('button');
      chip.className = 'zt-tab' + (i === _qPhrase ? ' active' : '');
      chip.textContent = p.label;
      chip.onclick = () => {
        _qPhrase = i;
        const el = document.getElementById('zt-phrase');
        if (el) el.textContent = TKBR_PHRASES[_qPhrase].text;
        tabsEl.querySelectorAll('.zt-tab').forEach((c, ci) => c.classList.toggle('active', ci === i));
      };
      tabsEl.appendChild(chip);
    });
    pop.querySelector('.zt-close').onclick = closeTakbeerPop;
    pop.onclick = e => { if (e.target === pop) closeTakbeerPop(); };
    pop.querySelector('#zt-ring-wrap').onclick = doTakbeer;
    pop.querySelector('#zt-reset').onclick = () => { _qCount = 0; refreshPop(); };
    pop.querySelector('#zt-full').onclick = () => location.href = 'takbeer.html';
    return pop;
  }

  function refreshPop() {
    const nEl = document.getElementById('zt-n'), lap = document.getElementById('zt-lap');
    const ring = document.getElementById('zt-ring'), totEl = document.getElementById('zt-total');
    const inl = _qCount % 33, laps = Math.floor(_qCount / 33);
    if (nEl) nEl.textContent = _qCount;
    if (lap) lap.textContent = `الدورة ${laps} · ${inl}/33`;
    if (ring) ring.style.strokeDashoffset = String(565.5 - (565.5 * inl / 33));
    const s = tkbrRead();
    if (totEl) totEl.textContent = ((s.takbeer && s.takbeer.total) || 0).toLocaleString('ar-EG');
  }

  function doTakbeer() {
    _qCount++;
    const s = tkbrRead();
    s.takbeer = s.takbeer || { count: 0, total: 0 };
    s.takbeer.total = (s.takbeer.total || 0) + 1;
    tkbrWrite(s);
    const nEl = document.getElementById('zt-n');
    if (nEl) { nEl.classList.add('bump'); setTimeout(() => nEl.classList.remove('bump'), 150); }
    try { if (navigator.vibrate) navigator.vibrate(15); } catch {}
    if (_qCount % 33 === 0) {
      try { if (navigator.vibrate) navigator.vibrate([30, 40, 60]); } catch {}
      try { if (window.confetti) window.confetti({ particleCount: 50, spread: 60, origin: { y: .4 } }); } catch {}
    }
    refreshPop();
    const badge = document.getElementById('zad-tkbr-badge');
    if (badge) badge.textContent = s.takbeer.total;
  }

  function openTakbeerPop() {
    const pop = ensurePopup();
    const phraseEl = document.getElementById('zt-phrase');
    if (phraseEl) phraseEl.textContent = TKBR_PHRASES[_qPhrase].text;
    refreshPop();
    pop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeTakbeerPop() {
    const pop = document.getElementById('zad-tkbr-pop');
    if (pop) pop.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ══════════════════════════════════════════════════════════════════════
     الدالة الرئيسية
     ════════════════════════════════════════════════════════════════════ */
  /* ════ قالب السايد بار الموحّد (مصدر واحد) ════
     أيّ صفحة فيها <aside class="sidebar"></aside> فارغة أو ناقصة الهيكل،
     يبنيها menu.js تلقائياً — فلا حاجة لتكرار الهيكل في كل صفحة. */
  const SIDEBAR_SHELL =
    '<a href="index.html" class="brand" style="text-decoration:none;color:inherit;display:flex;align-items:center;gap:12px">' +
      '<div class="brand-mark"><img fetchpriority="high" src="icons/icon-192.svg" alt="زاد" style="width:36px;height:36px;border-radius:10px"></div>' +
      '<div><div class="brand-name">زاد</div><div class="brand-sub">أفضل أيام الدنيا</div></div>' +
    '</a>' +
    '<div id="profile-chip" style="display:none;align-items:center;gap:8px;background:var(--sand);border:1px solid var(--border);border-radius:10px;padding:8px 12px;font-size:12px;font-weight:700;color:var(--ink)"></div>' +
    '<div class="theme-seg" id="theme-seg">' +
      '<button type="button" class="theme-opt" data-theme="light" onclick="applyTheme&&applyTheme(\'light\')">☀️ فاتح</button>' +
      '<button type="button" class="theme-opt" data-theme="dark" onclick="applyTheme&&applyTheme(\'dark\')">🌙 داكن</button>' +
      '<button type="button" class="theme-opt" data-theme="oled" onclick="applyTheme&&applyTheme(\'oled\')">⚫ OLED</button>' +
    '</div>' +
    '<button class="sidebar-install-btn" id="sidebar-install-btn" onclick="installPWA?.()">📲 تثبيت / تحميل التطبيق</button>' +
    '<nav class="nav" aria-label="القائمة الرئيسية"><a href="index.html" class="active"><span class="ico">🏠</span><span>لوحة التحكم</span></a></nav>' +
    '<div class="side-foot">زاد 2026 · بدون إعلانات 📴</div>';

  function ensureSidebarShell(sidebar) {
    if (!sidebar) return;
    /* لو الهيكل الأساسي موجود (nav + brand) نسيبه زي ما هو لتفادي أي تعارض */
    if (sidebar.querySelector('.nav') && sidebar.querySelector('.brand')) return;
    sidebar.innerHTML = SIDEBAR_SHELL;
  }

  function init() {
    injectStyle();
    const sidebar = document.querySelector('.sidebar');
    ensureSidebarShell(sidebar);
    const navEl   = document.querySelector('.sidebar .nav') || document.querySelector('.nav');
    if (navEl) {
      buildNav(navEl);
      /* حفظ الـ scroll عند الضغط على أي رابط */
      navEl.addEventListener('click', () => saveScroll(navEl), true);
    }
    if (sidebar) {
      injectFlares(sidebar);
      restoreScroll(sidebar);
      /* محوّل اللغة — يستبدل زر sidebar-lang-btn */
      const langBtn = sidebar.querySelector('.sidebar-lang-btn');
      if (langBtn) buildLangSwitcher(langBtn);
      /* أزرار التثبيت/المشاركة */
      buildInstallButtons(sidebar);
    }
    /* زر التكبير السريع في الشريط العلوي */
    const tbRight = document.querySelector('.main .topbar .tb-right');
    buildTakbeerButton();
    /* مراقبة فتح/إغلاق القائمة لإخفاء التوب بار السفلي (fallback لـ :has) */
    if (sidebar) {
      const sbWatch = new MutationObserver(() => {
        document.body.classList.toggle('zad-menu-open', sidebar.classList.contains('open'));
      });
      sbWatch.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
    }
    /* إعادة تطبيق الترجمة */
    if (window.I18N && typeof window.I18N.apply === 'function' && window.I18N.current !== 'ar') {
      try { window.I18N.apply(); } catch {}
    }
    /* مشاركة عالمية — تُشغَّل بعد تحميل المحتوى */
    setTimeout(initGlobalShare, 1000);
    /* MutationObserver للمحتوى الديناميكي — throttled لمنع الـ layout thrashing */
    let _moTimer = null;
    const mo = new MutationObserver(() => {
      clearTimeout(_moTimer);
      _moTimer = setTimeout(initGlobalShare, 500);
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  /* ══════════════════════════════════════════════════════════════════════
     نظام المشاركة العالمي — يعمل على كل الصفحات من مصدر واحد
     يبحث عن الكاردات المعروفة ويُضيف أزرار مشاركة (نص + PNG) عليها
     ════════════════════════════════════════════════════════════════════ */

  const ZAD_APP_URL = 'https://zadullashr.vercel.app';

  /* ── خريطة أنواع الكاردات المدعومة ─────────────────────────────────── */
  const CARD_MAP = [
    /* adhkar / ذكر */
    { sel: '.az-card',          title: '.az-card-title',   body: '.az-arabic',      src: '.az-src, .az-meta' },
    /* nawawi / حديث */
    { sel: '.nw-card',          title: '.nw-card-title',   body: '.nw-matn',        src: '.nw-card-narrator' },
    /* ruqyah */
    { sel: '.rq-verse-card',    title: '.rh-title',        body: '.rq-arabic',      src: '.rh-src' },
    { sel: '.rq-dua-card',      title: '.rq-dua-title',    body: '.rq-dua-ar',      src: '.rq-dua-src' },
    /* dua-guide */
    { sel: '.dua-hadith',       title: null,               body: '.dua-hadith-ar',  src: '.dua-hadith-src' },
    { sel: '.dua-card',         title: '.dua-card-title',  body: '.dua-card-body',  src: null },
    /* fadael / quran card */
    { sel: '.quran-card',       title: '.qc-src',          body: '.qc-ar',          src: '.qc-note' },
    /* sunan */
    { sel: '.sn-card',          title: '.sn-title',        body: '.sn-hadith',      src: '.sn-src' },
    /* arafah duaa cats */
    { sel: '.duaa-cat',         title: '.dc-title',        body: '.dc-sub',         src: null },
    /* generic quran/arabic card */
    { sel: '.card[data-share]', title: 'h3, h4',           body: '.arabic, [data-quran], .ayah', src: '.tag' },
  ];

  function initGlobalShare() {
    const pageName = (document.title || 'زاد').split('—')[0].trim();
    CARD_MAP.forEach(({ sel, title: tSel, body: bSel, src: sSel }) => {
      document.querySelectorAll(sel).forEach(card => {
        if (card.querySelector('.zad-sr')) return; /* مُضافة مسبقاً */
        const bodyEl  = bSel  ? card.querySelector(bSel)  : null;
        const titleEl = tSel  ? card.querySelector(tSel)  : null;
        const srcEl   = sSel  ? card.querySelector(sSel)  : null;
        if (!bodyEl && !titleEl) return; /* لا يوجد محتوى */

        const row = document.createElement('div');
        row.className = 'zad-sr';
        row.setAttribute('aria-label', 'خيارات المشاركة');
        row.style.cssText =
          'display:flex;gap:8px;margin-top:12px;padding-top:10px;' +
          'border-top:1px solid var(--border)';

        const mkBtn = (ico, lbl) => {
          const b = document.createElement('button');
          b.innerHTML = `${ico} ${lbl}`;
          b.style.cssText =
            'flex:1;padding:8px 10px;border-radius:10px;border:1.5px solid var(--border);' +
            'background:var(--sand);font-family:inherit;font-size:12px;font-weight:700;' +
            'cursor:pointer;color:var(--ink);transition:all .2s';
          b.onmouseover = () => { b.style.borderColor = 'var(--gold)'; };
          b.onmouseout  = () => { b.style.borderColor = 'var(--border)'; };
          return b;
        };

        const btnTxt = mkBtn('💬', 'نص');
        const btnImg = mkBtn('🖼️', 'صورة');

        btnTxt.onclick = () => {
          const t = titleEl?.textContent?.trim() || pageName;
          const b = bodyEl?.textContent?.trim()  || '';
          const s = srcEl?.textContent?.trim()   || '';
          _zadShareText(t, b, s, pageName);
        };
        btnImg.onclick = () => {
          const t = titleEl?.textContent?.trim() || pageName;
          const b = bodyEl?.textContent?.trim()  || '';
          const s = srcEl?.textContent?.trim()   || '';
          _zadSharePng(t, b, s, pageName);
        };

        row.appendChild(btnTxt);
        row.appendChild(btnImg);
        card.appendChild(row);
      });
    });
  }

  /* ── مشاركة كنص ─────────────────────────────────────────────────────── */
  function _zadShareText(title, body, src, pageName) {
    const parts = [];
    if (title && title !== pageName) parts.push('✨ ' + title);
    if (body)  parts.push('\n' + body);
    if (src)   parts.push('📖 ' + src);
    parts.push('\n' + pageName + ' | ' + ZAD_APP_URL);
    const text = parts.join('\n');
    if (navigator.share) {
      navigator.share({ title: title || pageName, text, url: ZAD_APP_URL });
    } else {
      navigator.clipboard?.writeText(text).then(() => {
        if (typeof showToast === 'function') showToast('📋 تم نسخ النص');
      });
    }
  }

  /* ── مشاركة كصورة PNG (Canvas API — RTL Arabic) ──────────────────────── */
  async function _zadSharePng(title, body, src, pageName) {
    if (typeof showToast === 'function') showToast('⏳ جارٍ تجهيز الصورة...');
    try {
      /* ── تحديد الثيم (دارك/لايت) حسب تفضيل المستخدم ── */
      const theme = document.documentElement.getAttribute('data-theme') || 'light';
      const isDark = theme === 'dark' || theme === 'oled';
      const T = isDark ? {
        bg1:'#06140e', bg2:'#0c2a1f', bg3:'#06140e',
        ink:'#f4ecd6', body:'#e6c97a', muted:'rgba(244,236,214,.55)',
        gold:'#d4b063', goldSoft:'rgba(212,176,99,.4)', orn:'rgba(212,176,99,.10)',
        card:'rgba(255,255,255,.03)', line:'rgba(212,176,99,.35)'
      } : {
        bg1:'#0e3b2e', bg2:'#1a5d47', bg3:'#0e3b2e',
        ink:'#ffffff', body:'#f5ecd4', muted:'rgba(255,255,255,.6)',
        gold:'#e6c97a', goldSoft:'rgba(201,161,74,.45)', orn:'rgba(230,201,122,.09)',
        card:'rgba(255,255,255,.05)', line:'rgba(201,161,74,.4)'
      };

      const W = 1000, PAD = 64;
      /* ── حساب ارتفاع ديناميكي ── */
      const tmpC = document.createElement('canvas');
      tmpC.width = W;
      const tmpX = tmpC.getContext('2d');
      tmpX.font = '30px Amiri, serif';
      tmpX.direction = 'rtl';
      const bodyLines = _wrapCanvas(tmpX, body, W - PAD * 2 - 40, 44);
      const bodyH = bodyLines.length * 46;
      const H = Math.max(560, 230 + bodyH + 180);

      const cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      const cx = cv.getContext('2d');
      cx.direction = 'rtl';

      /* ── خلفية متدرّجة قطرية ── */
      const bg = cx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, T.bg1);
      bg.addColorStop(0.5, T.bg2);
      bg.addColorStop(1, T.bg3);
      cx.fillStyle = bg; cx.fillRect(0, 0, W, H);

      /* ── زخرفة: شبكة نقاط إسلامية خفيفة ── */
      cx.save();
      cx.fillStyle = T.orn;
      for (let y = 40; y < H; y += 46) {
        for (let x = 40; x < W; x += 46) {
          cx.beginPath(); cx.arc(x, y, 1.5, 0, Math.PI * 2); cx.fill();
        }
      }
      cx.restore();

      /* ── زخرفة: دوائر متوهّجة بالأركان ── */
      const glow = (gx, gy, r, col) => {
        const g = cx.createRadialGradient(gx, gy, 0, gx, gy, r);
        g.addColorStop(0, col); g.addColorStop(1, 'transparent');
        cx.fillStyle = g; cx.beginPath(); cx.arc(gx, gy, r, 0, Math.PI * 2); cx.fill();
      };
      glow(W - 80, 70, 260, isDark ? 'rgba(212,176,99,.18)' : 'rgba(230,201,122,.22)');
      glow(70, H - 70, 240, isDark ? 'rgba(30,107,82,.35)' : 'rgba(42,122,95,.30)');

      /* ── إطار مزدوج مزخرف ── */
      const frame = (inset, lw, col) => {
        cx.strokeStyle = col; cx.lineWidth = lw;
        cx.beginPath();
        if (cx.roundRect) cx.roundRect(inset, inset, W - inset * 2, H - inset * 2, 24);
        else cx.rect(inset, inset, W - inset * 2, H - inset * 2);
        cx.stroke();
      };
      frame(22, 2.5, T.goldSoft);
      frame(30, 1, T.goldSoft);

      /* ── زخرفة الأركان (نقشة زاوية) ── */
      const corner = (cxp, cyp, dx, dy) => {
        cx.strokeStyle = T.gold; cx.lineWidth = 2.5;
        cx.beginPath();
        cx.moveTo(cxp, cyp + dy * 34); cx.lineTo(cxp, cyp); cx.lineTo(cxp + dx * 34, cyp);
        cx.stroke();
        cx.beginPath(); cx.arc(cxp + dx * 14, cyp + dy * 14, 4, 0, Math.PI * 2);
        cx.fillStyle = T.gold; cx.fill();
      };
      corner(44, 44, 1, 1); corner(W - 44, 44, -1, 1);
      corner(44, H - 44, 1, -1); corner(W - 44, H - 44, -1, -1);

      /* ── الترويسة: شعار + اسم الصفحة ── */
      cx.textAlign = 'right';
      cx.font = 'bold 17px Tajawal, sans-serif';
      cx.fillStyle = T.gold;
      cx.fillText('✦ زاد — ' + pageName, W - PAD, 74);

      /* نقطة زخرفية يسار الترويسة */
      cx.beginPath(); cx.arc(PAD + 6, 68, 5, 0, Math.PI * 2);
      cx.fillStyle = T.gold; cx.fill();
      cx.font = '14px Tajawal, sans-serif';
      cx.fillStyle = T.muted; cx.textAlign = 'left';
      cx.fillText('عشر ذي الحجة', PAD + 22, 74);

      /* ── خط فاصل علوي متدرّج ── */
      cx.save();
      const topLine = cx.createLinearGradient(PAD, 0, W - PAD, 0);
      topLine.addColorStop(0, 'transparent');
      topLine.addColorStop(0.5, T.line);
      topLine.addColorStop(1, 'transparent');
      cx.strokeStyle = topLine; cx.lineWidth = 1.5;
      cx.beginPath(); cx.moveTo(PAD, 100); cx.lineTo(W - PAD, 100); cx.stroke();
      cx.restore();

      let yy = 150;
      /* ── عنوان الكارت ── */
      cx.textAlign = 'right';
      if (title && title !== pageName) {
        cx.font = 'bold 34px Tajawal, sans-serif';
        cx.fillStyle = T.ink;
        cx.fillText(title, W - PAD, yy);
        yy += 56;
      }

      /* ── نص المحتوى (Amiri RTL) ── */
      cx.font = '30px Amiri, serif';
      cx.fillStyle = T.body;
      cx.textAlign = 'right';
      bodyLines.slice(0, 14).forEach(line => {
        cx.fillText(line, W - PAD, yy);
        yy += 46;
      });
      if (bodyLines.length > 14) {
        cx.font = 'italic 18px Tajawal, sans-serif';
        cx.fillStyle = T.muted;
        cx.fillText('…', W - PAD, yy); yy += 30;
      }

      /* ── المصدر في صندوق مزخرف ── */
      if (src) {
        yy += 10;
        const srcText = '📖 ' + src;
        cx.font = 'bold 17px Tajawal, sans-serif';
        const sw = cx.measureText(srcText).width + 36;
        const sx = W - PAD - sw;
        cx.fillStyle = T.card;
        cx.beginPath();
        if (cx.roundRect) cx.roundRect(sx, yy - 26, sw, 40, 12); else cx.rect(sx, yy - 26, sw, 40);
        cx.fill();
        cx.strokeStyle = T.goldSoft; cx.lineWidth = 1; cx.stroke();
        cx.fillStyle = T.gold; cx.textAlign = 'right';
        cx.fillText(srcText, W - PAD - 18, yy);
      }

      /* ── تذييل: خط + رابط + علامة ── */
      const footY = H - 50;
      cx.save();
      const botLine = cx.createLinearGradient(PAD, 0, W - PAD, 0);
      botLine.addColorStop(0, 'transparent');
      botLine.addColorStop(0.5, T.line);
      botLine.addColorStop(1, 'transparent');
      cx.strokeStyle = botLine; cx.lineWidth = 1;
      cx.beginPath(); cx.moveTo(PAD, footY - 22); cx.lineTo(W - PAD, footY - 22); cx.stroke();
      cx.restore();

      cx.font = 'bold 16px Tajawal, sans-serif';
      cx.fillStyle = T.gold; cx.textAlign = 'right';
      cx.fillText('🌙 zadullashr.vercel.app', W - PAD, footY);
      cx.font = '14px Tajawal, sans-serif';
      cx.fillStyle = T.muted; cx.textAlign = 'left';
      cx.fillText(isDark ? '🌑 نسخة داكنة' : '☀️ نسخة فاتحة', PAD, footY);

      /* ── تصدير ── */
      const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
      const file = new File([blob], 'zad-share.png', { type: 'image/png' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: title || pageName });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'zad-' + Date.now() + '.png';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      }
      if (typeof showToast === 'function') showToast('✅ جاهزة للمشاركة');
    } catch (e) {
      console.warn('ZadShare PNG error:', e);
      if (typeof showToast === 'function') showToast('⚠️ تعذّر إنشاء الصورة');
    }
  }

  /* نص-تفاف على Canvas (RTL) */
  function _wrapCanvas(ctx, text, maxW, lineH) {
    if (!text) return [];
    const words = text.split(/\s+/);
    const lines = [];
    let line = '';
    words.forEach(w => {
      const test = w + ' ' + line;
      if (ctx.measureText(test).width > maxW && line) {
        lines.push(line.trim());
        line = w + ' ';
      } else { line = test; }
    });
    if (line.trim()) lines.push(line.trim());
    return lines;
  }

  /* تصدير عام */
  window.ZadShare = { text: _zadShareText, png: _zadSharePng };
})();
/* ═══ شريط التنقل السفلي (bottom-nav) — مُعطَّل بناءً على طلب المستخدم ═══
   الاعتماد على القائمة الجانبية (الهامبرجر) كتنقّل أساسي. لإعادة تفعيله مستقبلاً
   أزِل التعليق عن الكتلة أدناه. لا يُحمَّل js/ui/bottom-nav.js إطلاقاً الآن،
   لذا لا يُحقَن أي CSS ولا padding سفلي على الجسم. */
/*
(function loadZadBottomNav() {
  if (window.__zadBnavWired) return;
  window.__zadBnavWired = true;
  function go() { try { window.ZadBottomNav && window.ZadBottomNav.init(); } catch (e) {} }
  if (window.ZadBottomNav) { go(); return; }
  var s = document.createElement('script');
  s.src = 'js/ui/bottom-nav.js';
  s.defer = true;
  s.onload = go;
  document.head.appendChild(s);
})();
*/
