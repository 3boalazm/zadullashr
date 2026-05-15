/* ══════════════════════════════════════════════════════════
   زاد العشر — i18n System (AR / EN)
   Usage: <span data-i18n="key"></span>
   ══════════════════════════════════════════════════════════ */
const TRANSLATIONS = {
  ar: {
    /* Nav */
    'nav.dashboard':    'لوحة التحكم',
    'nav.virtues':      'فضائل العشر',
    'nav.worship':      'جدول العبادات',
    'nav.mushaf':       'مصحف العشر',
    'nav.tasbih':       'المُسبِّح والمُكبِّر',
    'nav.adhkar':       'الأذكار والدعاء',
    'nav.odhiya':       'دليل الأضحية',
    'nav.arafah':       'يوم عرفة',
    'nav.sadaqah':      'صدقة العشر',
    'nav.badges':       'أوسمتي',
    'nav.hasad':        'حصاد العشر',
    'nav.kids':         'وضع الأطفال',
    'nav.tasmee':       'تسميع القرآن',
    'nav.ai':           'تدبّر بالذكاء',
    'nav.settings':     'الإعدادات',
    'nav.report':       'بلاغ مشكلة',
    'nav.about':        'عن التطبيق',
    /* Common */
    'common.darkMode':  'الوضع الداكن',
    'common.search':    'ابحث في التطبيق...',
    'common.done':      '✅ تم',
    'common.reset':     'إعادة',
    'common.save':      'حفظ',
    'common.send':      'إرسال',
    'common.noAds':     'يعمل بدون إنترنت 📴',
    /* Worship */
    'worship.title':    'جدول العبادات',
    'worship.sub':      'تابع يومك العبادي في العشر المباركة',
    'worship.fajr':     'صلاة الفجر جماعةً',
    'worship.zuhr':     'صلاة الظهر',
    'worship.asr':      'صلاة العصر',
    'worship.maghrib':  'صلاة المغرب',
    'worship.isha':     'صلاة العشاء',
    'worship.qiyam':    'قيام الليل',
    'worship.duha':     'صلاة الضحى',
    'worship.fasting':  'صيام اليوم',
    'worship.quran':    'ورد القرآن',
    'worship.takbeer':  'التكبير',
    'worship.morning':  'أذكار الصباح',
    'worship.evening':  'أذكار المساء',
    'worship.sadaqah':  'الصدقة',
    /* Tasbih */
    'tasbih.title':     'المُسبِّح والمُكبِّر',
    'tasbih.tap':       'اضغط للعدّ',
    'tasbih.sessions':  'جلسة',
    'tasbih.total':     'المجموع',
    /* Badges */
    'badges.title':     'أوسمتي',
    'badges.sub':       'أعمال البر — الأجر عند الله',
    'badges.earned':    'المكتسبة',
    'badges.streak':    'يوم متتالي من الالتزام 🔥',
    /* AI */
    'ai.title':         'تدبّر بالذكاء',
    'ai.sub':           'اسأل عن آيات وأحكام العشر — إجابات من المصادر الشرعية',
    'ai.placeholder':   'اكتب سؤالك هنا...',
    'ai.greeting':      'مرحباً في مساعد العشر 🕌',
    'ai.intro':         'اسألني عن أي آية، حديث، أو حكم فقهي يخص عشر ذي الحجة — وسأجيبك من ابن كثير والطبري وكتب الفقه المعتمدة.',
    /* Hasad */
    'hasad.title':      'حصاد العشر',
    'hasad.sub':        'إحصائيات أدائك خلال أفضل أيام الدنيا',
    'hasad.streak':     'الشريط الزمني',
    'hasad.zad':        'رصيد الزاد',
    /* Arafah */
    'arafah.title':     'يوم عرفة',
    'arafah.sub':       'برنامجك الكامل في اليوم الموعود',
    /* Settings */
    'settings.title':   'الإعدادات',
    'settings.theme':   'المظهر',
    'settings.font':    'حجم الخط',
    'settings.notif':   'الإشعارات',
    'settings.data':    'البيانات',
  },
  en: {
    /* Nav */
    'nav.dashboard':    'Dashboard',
    'nav.virtues':      'Virtues of the Ten Days',
    'nav.worship':      'Worship Tracker',
    'nav.mushaf':       'Quran Recitation',
    'nav.tasbih':       'Tasbih Counter',
    'nav.adhkar':       'Dhikr & Supplications',
    'nav.odhiya':       'Sacrifice Guide',
    'nav.arafah':       'Day of Arafah',
    'nav.sadaqah':      'Charity',
    'nav.badges':       'My Badges',
    'nav.hasad':        'Harvest Summary',
    'nav.kids':         'Kids Mode',
    'nav.tasmee':       'Quran Memorization',
    'nav.ai':           'AI Reflection',
    'nav.settings':     'Settings',
    'nav.report':       'Report Issue',
    'nav.about':        'About',
    /* Common */
    'common.darkMode':  'Dark Mode',
    'common.search':    'Search the app...',
    'common.done':      '✅ Done',
    'common.reset':     'Reset',
    'common.save':      'Save',
    'common.send':      'Send',
    'common.noAds':     'Works offline 📴',
    /* Worship */
    'worship.title':    'Worship Tracker',
    'worship.sub':      'Track your daily worship in the blessed ten days',
    'worship.fajr':     'Fajr Prayer (in congregation)',
    'worship.zuhr':     'Dhuhr Prayer',
    'worship.asr':      "Asr Prayer",
    'worship.maghrib':  'Maghrib Prayer',
    'worship.isha':     'Isha Prayer',
    'worship.qiyam':    'Night Prayer (Qiyam)',
    'worship.duha':     'Duha Prayer',
    'worship.fasting':  'Fasting Today',
    'worship.quran':    'Quran Daily Portion',
    'worship.takbeer':  'Takbeer',
    'worship.morning':  'Morning Adhkar',
    'worship.evening':  'Evening Adhkar',
    'worship.sadaqah':  'Charity',
    /* Tasbih */
    'tasbih.title':     'Tasbih & Takbeer',
    'tasbih.tap':       'Tap to count',
    'tasbih.sessions':  'session',
    'tasbih.total':     'Total',
    /* Badges */
    'badges.title':     'My Badges',
    'badges.sub':       'Righteous deeds — Reward with Allah',
    'badges.earned':    'Earned',
    'badges.streak':    'consecutive days 🔥',
    /* AI */
    'ai.title':         'AI Reflection',
    'ai.sub':           'Ask about verses and rulings of the Ten Days — answers from Islamic sources',
    'ai.placeholder':   'Ask your question here...',
    'ai.greeting':      'Welcome to the Ashur Assistant 🕌',
    'ai.intro':         'Ask me about any verse, hadith, or ruling related to the Ten Days of Dhul Hijjah — I\'ll answer from Ibn Kathir, al-Tabari, and trusted fiqh books.',
    /* Hasad */
    'hasad.title':      'Harvest Summary',
    'hasad.sub':        'Your performance stats across the best days on Earth',
    'hasad.streak':     'Streak',
    'hasad.zad':        'Zad Balance',
    /* Arafah */
    'arafah.title':     'Day of Arafah',
    'arafah.sub':       'Your complete program for the promised day',
    /* Settings */
    'settings.title':   'Settings',
    'settings.theme':   'Theme',
    'settings.font':    'Font Size',
    'settings.notif':   'Notifications',
    'settings.data':    'Data',
  }
};

/* ── Dhikr transliterations + meanings ─────────────────── */
const DHIKR_TRANSLATIONS = {
  'سُبْحَانَ اللَّهِ': {
    translit: 'Subḥāna Allāh',
    meaning:  'Glory be to Allah'
  },
  'الْحَمْدُ لِلَّهِ': {
    translit: 'Al-Ḥamdu lillāh',
    meaning:  'All praise is due to Allah'
  },
  'لَا إِلَهَ إِلَّا اللَّهُ': {
    translit: "Lā ilāha illa Allāh",
    meaning:  'There is no god but Allah'
  },
  'اللَّهُ أَكْبَرُ': {
    translit: 'Allāhu Akbar',
    meaning:  'Allah is the Greatest'
  },
  'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ': {
    translit: 'Lā ḥawla wa lā quwwata illā billāh',
    meaning:  'There is no power or might except with Allah'
  },
  'أَسْتَغْفِرُ اللَّهَ': {
    translit: 'Astaghfiru Allāh',
    meaning:  'I seek forgiveness from Allah'
  },
  'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ': {
    translit: 'Allāhumma ṣalli ʿalā Muḥammad',
    meaning:  'O Allah, send blessings upon Muhammad'
  },
  'اللَّهُ أَكْبَرُ كَبِيرًا وَالْحَمْدُ لِلَّهِ كَثِيرًا': {
    translit: "Allāhu Akbaru kabīran wal-ḥamdu lillāhi kathīran",
    meaning:  'Allah is the Greatest, greatly. Abundant praise be to Allah.'
  },
  'بِسْمِ اللهِ وَاللهُ أَكْبَرُ اللَّهُمَّ هَذَا مِنْكَ وَلَكَ': {
    translit: "Bismillāhi wallāhu Akbar, Allāhumma hādhā minka wa lak",
    meaning:  'In the name of Allah, Allah is the Greatest. O Allah, this is from You and for You.'
  },
  'خَيْرُ الدُّعَاءِ دُعَاءُ يَوْمِ عَرَفَةَ': {
    translit: "Khayru ad-du'ā'i du'ā'u yawmi 'Arafah",
    meaning:  'The best of supplications is the supplication of the Day of Arafah.'
  }
};
window.DHIKR_TRANSLATIONS = DHIKR_TRANSLATIONS;

/* ── i18n Engine ─────────────────────────────────────────── */
const I18N = {
  current: localStorage.getItem('zad_lang') || 'ar',

  t(key) {
    return TRANSLATIONS[this.current]?.[key]
        || TRANSLATIONS['ar']?.[key]
        || key;
  },

  setLang(lang) {
    this.current = lang;
    localStorage.setItem('zad_lang', lang);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'en' ? 'ltr' : 'rtl');
    this.apply();
    /* Update language toggle buttons */
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.textContent = lang === 'en' ? 'عربي' : 'EN';
    });
  },

  apply() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const text = this.t(key);
      if (text) el.textContent = text;
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      el.placeholder = this.t(el.dataset.i18nPh);
    });
    /* Inject transliteration rows under Arabic dhikr */
    if (this.current === 'en') {
      document.querySelectorAll('.az-arabic, .adhkar-arabic, .tl-dua, .af-ms-dua').forEach(el => {
        const arabic = el.textContent.trim().split('«').pop().split('»')[0].trim()
                    || el.textContent.trim();
        const info = Object.entries(DHIKR_TRANSLATIONS).find(([k]) => arabic.includes(k));
        if (!info) return;
        const [, {translit, meaning}] = info;
        /* Add translit if not already present */
        if (!el.nextElementSibling?.classList.contains('az-translit')) {
          const t = document.createElement('div');
          t.className = 'az-translit';
          t.textContent = translit;
          el.after(t);
          const m = document.createElement('div');
          m.className = 'az-meaning';
          m.textContent = meaning;
          t.after(m);
        }
      });
    } else {
      document.querySelectorAll('.az-translit,.az-meaning').forEach(el => el.remove());
    }
  },

  toggle() {
    this.setLang(this.current === 'ar' ? 'en' : 'ar');
  },

  init() {
    document.documentElement.setAttribute('lang', this.current);
    if (this.current === 'en') {
      document.documentElement.setAttribute('dir', 'ltr');
    }
    this.apply();
  }
};
window.I18N = I18N;
window.toggleLang = () => I18N.toggle();

document.addEventListener('DOMContentLoaded', () => I18N.init());
