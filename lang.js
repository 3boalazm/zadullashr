/* ══════════════════════════════════════════════════════════
   زاد — Complete i18n System (AR / EN / FR)
   • واجهة المستخدم: ترجمة ثابتة (بدون API، تعمل أوفلاين).
   • الأذكار: ترانزليتريشن + معنى منسوخ يدوياً (لا ترجمة آلية للنص الشرعي).
   • القرآن/الحديث: استخدم تراجم معتمدة عبر API (alquran.cloud) — لا تُترجم آلياً.
   ══════════════════════════════════════════════════════════ */

const TRANSLATIONS = {
ar: {
  /* ─ App shell ─────────────────────────────────────────── */
  'brand.name': 'زاد', 'brand.sub': 'أفضل أيام الدنيا',
  'common.darkMode': '🌙 الوضع الداكن', 'common.language': '🌐 اللغة',
  'common.search': 'ابحث في التطبيق...', 'common.noAds': 'يعمل بدون إنترنت 📴',
  'common.done': '✅ تم', 'common.reset': 'إعادة', 'common.save': 'حفظ', 'common.send': 'إرسال',
  /* ─ Nav ────────────────────────────────────────────────── */
  'nav.dashboard':'لوحة التحكم','nav.virtues':'فضائل العشر',
  'nav.worship':'جدول العبادات','nav.mushaf':'مصحف العشر',
  'nav.tasbih':'المُسبِّح والمُكبِّر','nav.adhkar':'الأذكار والدعاء',
  'nav.odhiya':'دليل الأضحية','nav.arafah':'يوم عرفة',
  'nav.sadaqah':'صدقة العشر','nav.badges':'أوسمتي',
  'nav.hasad':'حصاد العشر','nav.kids':'وضع الأطفال',
  'nav.tasmee':'تسميع القرآن','nav.ai':'تدبّر بالذكاء',
  'nav.settings':'الإعدادات','nav.report':'بلاغ مشكلة','nav.about':'عن التطبيق',
  /* ─ Index ──────────────────────────────────────────────── */
  'index.title':'أفضل أيام الدنيا','index.sub':'تابع وردك اليومي وفضائل العشر في مكان واحد',
  'index.install.title':'ثبّت التطبيق','index.install.sub':'يعمل بدون إنترنت في المصلى',
  'index.notif.title':'فعّل تذكيرات الصلاة','index.notif.sub':'لا تفوّت وردك في هذه الأيام المباركة',
  'index.countdown':'العد التنازلي',
  'index.hours':'ساعات','index.mins':'دقائق','index.secs':'ثوانٍ',
  'index.stat.takbeer':'إجمالي التكبيرات','index.stat.juz':'أجزاء من الختمة',
  'index.stat.pray':'صلوات في جماعة','index.stat.wird':'إنجاز الورد',
  'index.start':'ابدأ يومك الآن',
  'index.grid.worship':'ورد اليوم','index.grid.worship.sub':'تابع جدول عباداتك',
  'index.grid.mushaf':'اقرأ القرآن','index.grid.mushaf.sub':'متابعة خطة الختمة',
  'index.grid.tasbih':'كبّر الله','index.grid.tasbih.sub':'عداد التكبير المطلق',
  'index.grid.tasmee':'تسميع القرآن','index.grid.tasmee.sub':'تصحيح التلاوة بالذكاء',
  'index.grid.ai':'تدبّر بالذكاء','index.grid.ai.sub':'اسأل عن آيات وأحكام',
  'index.grid.badges':'أوسمتي','index.grid.badges.sub':'إنجازاتك الروحانية',
  /* ─ Worship ────────────────────────────────────────────── */
  'worship.title':'ورد العشر اليومي','worship.sub':'الله يرى كل خير تعمله',
  'worship.label':'عبادة',
  'worship.fajr':'صلاة الفجر في جماعة','worship.zuhr':'صلاة الظهر في جماعة',
  'worship.asr':'صلاة العصر في جماعة','worship.maghrib':'صلاة المغرب في جماعة',
  'worship.isha':'صلاة العشاء في جماعة','worship.rawatib':'السنن الرواتب',
  'worship.duha':'صلاة الضحى','worship.qiyam':'قيام الليل',
  'worship.morning':'أذكار الصباح','worship.evening':'أذكار المساء',
  'worship.takbeer':'تكبير','worship.tawbah':'تجديد التوبة والنية',
  'worship.fasting.title':'الأيام التسعة','worship.fasting.sub':'انقر لتسجيل الصيام',
  'worship.save':'حفظ التقدم','worship.notif':'تذكيرات الورد',
  /* ─ Tasbih ─────────────────────────────────────────────── */
  'tasbih.title':'المُسبِّح والمُكبِّر','tasbih.tap':'اضغط للذكر',
  'tasbih.reset.current':'إعادة الحالي','tasbih.reset.all':'إعادة الكل',
  'tasbih.hint1':'المسبحة تعدّ له تلقائياً','tasbih.hint2':'مفتاح المسافة يُسبّح',
  'tasbih.subhan':'سبحان الله','tasbih.hamd':'الحمد لله',
  'tasbih.tahlil':'لا إله إلا الله','tasbih.takbir':'الله أكبر',
  'tasbih.hawqala':'لا حول ولا قوة','tasbih.istigfar':'أستغفر الله',
  'tasbih.salawat':'الصلاة على النبي',
  'tasbih.laps':'إجمالي الدورات',

  /* ─ Index extra ──────────────────────────────────────────── */
  'index.stats':'إحصائيات اليوم',
  'index.days':'أيام','index.hero.heading':'إلى يوم عرفة المبارك',
  'index.hero.sub':'اغتنم ساعات هذه الأيام — فما من أيام العمل الصالح أحبّ إلى الله من هذه الأيام العشر.',
  'index.progress.title':'مؤشر الالتزام الروحاني','index.progress.lbl':'إنجاز',
  'index.progress.heading':'ورد العشر اليومي',
  'index.progress.li1':'الصلوات الخمس في جماعة','index.progress.li2':'السنن الرواتب والذكر',
  'index.progress.li3':'صيام النهار','index.progress.li4':'التكبير والاستغفار',
  'index.verse.title':'آية اليوم','common.install':'تثبيت',
  /* ─ Fadael ────────────────────────────────────────────────── */
  'fadael.title':'لماذا هذه الأيام؟','fadael.sub':'أدلة الفضل من القرآن والسنة الصحيحة',
  'fadael.q1.src':'سورة الفجر 1-2','fadael.q1.note':'أقسم الله بها — والله لا يُقسم إلا بعظيم.',
  'fadael.q2.src':'سورة الحج — 28','fadael.q2.note':'قال المفسرون: هي عشر ذي الحجة.',
  'fadael.sunnah':'من السنة النبوية',
  'fadael.h1.title':'أحبّ الأيام إلى الله','fadael.h1.src':'رواه البخاري (969)',
  'fadael.h2.title':'يوم النحر أعظم الأيام','fadael.h2.src':'رواه أبو داود (1765) وصححه الألباني',
  'fadael.compare':'مقارنة فقهية',
  'fadael.day.title':'نهار العشر','fadael.day.desc':'أفضل أيام السنة مطلقاً لاجتماع أمهات العبادات.',
  'fadael.day.tag':'الأفضل نهاراً',
  'fadael.night.title':'ليالي رمضان الأواخر','fadael.night.desc':'أفضل ليالي السنة لما فيها من ليلة القدر.',
  'fadael.night.tag':'الأفضل ليلاً',
  'fadael.features':'الخصائص الكبرى',
  'fadael.feat1':'أقسم الله بها في كتابه الكريم.',
  'fadael.feat2':'فيها يوم عرفة — يوم إكمال الدين وإتمام النعمة.',
  'fadael.feat3':'فيها يوم النحر — أعظم الأيام عند الله.',
  'fadael.feat4':'العمل الصالح فيها أحبّ إلى الله حتى من الجهاد.',
  'fadael.feat5':'اجتماع الصلاة والصيام والحج والأضحية لا يكون إلا فيها.',
  'fadael.feat6':'صيام يوم عرفة يكفّر ذنوب سنتين — ماضية وقادمة.',
  /* ─ Worship extra ─────────────────────────────────────────── */
  'worship.obligatory':'الفرائض','worship.sunnah':'السنن والنوافل',
  'worship.dhikr.title':'الذكر والصيام',
  'worship.sub':'اعقد النية وابدأ — الله يرى كل خير تعمله',
  'worship.fajr.meta':'فجر','worship.zuhr.meta':'ظهر','worship.asr.meta':'عصر',
  'worship.maghrib.meta':'مغرب','worship.isha.meta':'عشاء',
  'worship.duha.meta':'4 ركعات','worship.qiyam.meta':'يعدل قيام ليلة القدر',
  'worship.rawatib':'السنن الرواتب — 12 ركعة',
  'worship.takbeer100':'تكبير 100 مرة',
  'worship.fasting.hint':'⭐ = يوم عرفة · انقر لتسجيل الصيام',
  'worship.day':'يوم','worship.arafah.lbl':'عرفة',
  'worship.prog.prefix':'0 من',
  /* ─ Mushaf extra ──────────────────────────────────────────── */
  'mushaf.plans.title':'خطط الختمة','mushaf.wird.title':'ورد اليوم',
  'mushaf.tomorrow.title':'ورد الغد','mushaf.reset.title':'إعادة تعيين',
  /* ─ Tasbih extra ──────────────────────────────────────────── */
  'tasbih.sub':'أحط نفسك بذكر الله في كل لحظة',
  'tasbih.formulas.title':'صيغ التكبير المأثورة',
  'tasbih.daily.title':'أذكار اليوم',
  /* ─ Adhkar ─────────────────────────────────────────────── */
  'adhkar.title':'الأذكار والدعاء','adhkar.sub':'ذكر الله شفاء القلوب',
  'adhkar.tab.morning':'الصباح','adhkar.tab.evening':'المساء',
  'adhkar.tab.ashra':'العشر','adhkar.tab.custom':'مخصص',
  'adhkar.count':'عدّ','adhkar.reset':'إعادة',
  'adhkar.add.title':'أضف ذكراً مخصصاً',
  'adhkar.add.placeholder':'اكتب الذكر بالعربية...',
  'adhkar.add.name':'الاسم','adhkar.add.target':'الهدف',
  'adhkar.add.btn':'إضافة',
  /* ─ Mushaf ─────────────────────────────────────────────── */
  'mushaf.title':'مصحف العشر','mushaf.sub':'انقر على الخطة للاختيار',
  'mushaf.plan.full':'الختمة الكاملة','mushaf.plan.juz':'جزء يومياً',
  'mushaf.plan.pages':'صفحات يومياً',
  'mushaf.complete.btn':'أنهيت وردي اليوم',
  'mushaf.complete.done':'أحسنت — وردك اليوم مكتمل ✅',
  'mushaf.tomorrow':'ورد الغد','mushaf.locked':'يُفتح بعد إتمام ورد اليوم',
  'mushaf.font':'حجم الخط','mushaf.add.juz':'أضف جزءاً مكتملاً',
  /* ─ Arafah ─────────────────────────────────────────────── */
  'arafah.title':'يوم عرفة','arafah.sub':'البرنامج الكامل',
  'arafah.countdown.h':'ساعة','arafah.countdown.m':'دقيقة','arafah.countdown.s':'ثانية',
  'arafah.loading':'جارٍ التحميل','arafah.approx':'تقريبي',
  'arafah.milestones':'المسار الزمني التفاعلي',
  'arafah.dhikr.tap':'انقر للذكر','arafah.done':'محطات مكتملة',
  'arafah.virtue.title':'فضل صيام يوم عرفة',
  'arafah.bonus':'أعمال جانبية مستحبة',
  'arafah.share':'مشاركة إنجاز يوم عرفة',
  /* ─ Odhiya ─────────────────────────────────────────────── */
  'odhiya.title':'دليل الأضحية','odhiya.sub':'أحكام مصوّرة للمضحّي',
  'odhiya.reminder.title':'تذكير المضحّي — أهم نقطة!',
  'odhiya.reminder.btn':'فعّل تذكير عدم القص 🔔',
  'odhiya.guide.title':'خطوات الأضحية — دليل مصوّر',
  'odhiya.step1':'النية والعزم','odhiya.step2':'اختيار الأضحية السليمة',
  'odhiya.step3':'وقت الذبح','odhiya.step4':'دعاء الذبح',
  'odhiya.step5':'توزيع الأضحية','odhiya.age.title':'السن الشرعي للأضحية',
  'odhiya.defects':'العيوب المانعة من الإجزاء',
  /* ─ Sadaqah ────────────────────────────────────────────── */
  'sadaqah.title':'صدقة العشر','sadaqah.sub':'اختر بابك اليوم',
  'sadaqah.log':'سجّل هذا العمل','sadaqah.done':'تم التسجيل ✅',
  /* ─ Badges ─────────────────────────────────────────────── */
  'badges.title':'أوسمتي والإنجازات','badges.sub':'أعمال البر — الأجر عند الله',
  'badges.earned':'المكتسبة','badges.streak':'يوم متتالي من الالتزام 🔥',
  /* ─ Hasad ──────────────────────────────────────────────── */
  'hasad.title':'حصاد العشر','hasad.sub':'إحصائيات أدائك خلال أفضل أيام الدنيا',
  'hasad.zad':'رصيد الزاد','hasad.streak':'الشريط الزمني',
  'hasad.streak.cta':'ابدأ Streak لزيادة نقاطك!',
  'hasad.heatmap':'مسار الأداء خلال العشر',
  'hasad.share':'مشاركة الحصاد','hasad.share.btn':'شارك حصادك',
  'hasad.complete':'مكتمل','hasad.days.left':'أيام متبقية',
  /* ─ Kids ───────────────────────────────────────────────── */
  'kids.title':'وضع الأطفال','kids.story':'قصة العشر',
  'kids.prev':'السابقة','kids.next':'التالية',
  'kids.quiz.title':'مسابقة العشر','kids.quiz.sub':'أسئلة ممتعة للصغار',
  'kids.tasbih.title':'تكبيرات للصغار',
  /* ─ Tasmee ─────────────────────────────────────────────── */
  'tasmee.title':'تسميع القرآن','tasmee.sub':'اختر الآية للتسميع',
  'tasmee.start':'اضغط الميكروفون وابدأ التسميع',
  'tasmee.accuracy':'دقة التلاوة',
  'tasmee.tip1.title':'تأكد من إخراج الحروف','tasmee.tip2.title':'بيئة هادئة',
  'tasmee.tip3.title':'الصوت العادي','tasmee.tip4.title':'المتصفح المناسب',
  /* ─ AI ──────────────────────────────────────────────────── */
  'ai.title':'تدبّر بالذكاء','ai.sub':'اسأل عن آيات وأحكام العشر',
  'ai.placeholder':'اكتب سؤالك هنا...','ai.send':'إرسال',
  'ai.greeting':'مرحبًا في مساعد العشر 🕌',
  'ai.questions.title':'أسئلة مقترحة',
  /* ─ Report ─────────────────────────────────────────────── */
  'report.title':'بلاغ مشكلة','report.sub':'أعنّا على تحسين زادك الروحي',
  'report.type':'نوع البلاغ','report.type.select':'— اختر نوع المشكلة —',
  'report.type.content':'خطأ في المحتوى (ذكر، حديث، آية)',
  'report.type.tech':'مشكلة تقنية (الصفحة لا تفتح، عطل في الأداة)',
  'report.type.ui':'مشكلة في الواجهة (خط، ألوان، تنسيق)',
  'report.type.feature':'اقتراح ميزة جديدة',
  'report.type.perf':'بطء في التحميل أو الأداء',
  'report.type.other':'أخرى',
  'report.page':'أين واجهتك المشكلة؟',
  'report.desc':'وصف المشكلة بالتفصيل',
  'report.screenshot':'لقطة شاشة (اختياري)',
  'report.email':'بريدك الإلكتروني (اختياري)',
  'report.submit':'إرسال التقرير','report.copy':'نسخ التقرير',
  'report.privacy':'الأمانة الرقمية',
  /* ─ Settings ────────────────────────────────────────────── */
  'settings.title':'الإعدادات','settings.sub':'التخصيص لك وحدك',
  'settings.lang':'اللغة / Language','settings.langSub':'اختر لغة التطبيق',
  'settings.theme.title':'المظهر','settings.dark':'الوضع الداكن',
  'settings.dark.sub':'مريح للعين أثناء قيام الليل',
  'settings.oled':'OLED أسود حقيقي','settings.oled.sub':'يوفّر بطارية الشاشات',
  'settings.font.title':'حجم الخط','settings.font.quran':'حجم خط القرآن',
  'settings.notif.toggle':'تفعيل الإشعارات','settings.notif.wird':'تذكير ورد العشر',
  'settings.notif.arafah':'تذكير ساعة إجابة عرفة',
  'settings.pwa':'تثبيت التطبيق','settings.pwa.sub':'يعمل بدون إنترنت في المصلى',
  'settings.data.title':'البيانات','settings.data.encrypted':'بياناتك مشفّرة محلياً',
  'settings.data.noads':'صفر إعلانات','settings.data.noads.sub':'خشوع رقمي بلا مشتّتات',
  'settings.data.reset':'مسح جميع البيانات',
  /* ─ About ───────────────────────────────────────────────── */
  'about.title':'عن التطبيق','about.sub':'زاد — رفيقك الذكي في أفضل أيام الدنيا',
  'about.dev':'مصطفى أبو العزم',
  'about.dev.title':'مصمم واجهات · مطور تطبيقات ويب · مبتكر تجربة المستخدم',
  'about.contact':'تواصل معي','about.social':'تابعني على',
  'about.app.title':'عن زاد','about.sources':'المصادر الشرعية',
  'about.tech':'التقنيات المستخدمة',
},
en: {
  /* ─ App shell ─────────────────────────────────────────── */
  'brand.name': 'Zad Al-Ashr', 'brand.sub': 'The Best Days on Earth',
  'common.darkMode': '🌙 Dark Mode', 'common.language': '🌐 Language',
  'common.search': 'Search the app...', 'common.noAds': 'Works offline 📴',
  'common.done': '✅ Done', 'common.reset': 'Reset', 'common.save': 'Save', 'common.send': 'Send',
  /* ─ Nav ─────────────────────────────────────────────────── */
  'nav.dashboard':'Dashboard','nav.virtues':'Virtues of the 10 Days',
  'nav.worship':'Worship Tracker','nav.mushaf':'Quran Recitation',
  'nav.tasbih':'Tasbih Counter','nav.adhkar':'Dhikr & Supplications',
  'nav.odhiya':'Sacrifice Guide','nav.arafah':'Day of Arafah',
  'nav.sadaqah':'Charity','nav.badges':'My Badges',
  'nav.hasad':'Harvest Summary','nav.kids':'Kids Mode',
  'nav.tasmee':'Quran Memorization','nav.ai':'AI Reflection',
  'nav.settings':'Settings','nav.report':'Report Issue','nav.about':'About',
  /* ─ Index ──────────────────────────────────────────────── */
  'index.title':'The Best Days on Earth','index.sub':'Track your daily worship and virtues of the Ten Days — all in one place',
  'index.install.title':'Install App','index.install.sub':'Works offline in the mosque',
  'index.notif.title':'Enable Prayer Reminders','index.notif.sub':'Don\'t miss your daily worship in these blessed days',
  'index.countdown':'Countdown',
  'index.hours':'Hours','index.mins':'Minutes','index.secs':'Seconds',
  'index.stat.takbeer':'Total Takbeer','index.stat.juz':'Juz of Quran',
  'index.stat.pray':'Prayers in Congregation','index.stat.wird':'Daily Wird',
  'index.start':'Start Your Day',
  'index.grid.worship':'Daily Wird','index.grid.worship.sub':'Track your worship schedule',
  'index.grid.mushaf':'Read Quran','index.grid.mushaf.sub':'Follow your completion plan',
  'index.grid.tasbih':'Takbeer','index.grid.tasbih.sub':'Dhikr counter',
  'index.grid.tasmee':'Quran Recitation','index.grid.tasmee.sub':'AI pronunciation check',
  'index.grid.ai':'AI Reflection','index.grid.ai.sub':'Ask about verses & rulings',
  'index.grid.badges':'My Badges','index.grid.badges.sub':'Your spiritual achievements',
  /* ─ Worship ────────────────────────────────────────────── */
  'worship.title':'Daily Worship Tracker','worship.sub':'Allah sees every good deed you do',
  'worship.label':'Worship',
  'worship.fajr':'Fajr Prayer (congregation)','worship.zuhr':'Dhuhr Prayer (congregation)',
  'worship.asr':'Asr Prayer (congregation)','worship.maghrib':'Maghrib Prayer (congregation)',
  'worship.isha':'Isha Prayer (congregation)','worship.rawatib':'Sunnah Prayers (Rawatib)',
  'worship.duha':'Duha Prayer','worship.qiyam':'Night Prayer (Qiyam al-Layl)',
  'worship.morning':'Morning Adhkar','worship.evening':'Evening Adhkar',
  'worship.takbeer':'Takbeer','worship.tawbah':'Renew Intention & Repentance',
  'worship.fasting.title':'The Nine Days','worship.fasting.sub':'Tap to record your fast',
  'worship.save':'Save Progress','worship.notif':'Worship Reminders',
  /* ─ Tasbih ─────────────────────────────────────────────── */
  'tasbih.title':'Tasbih & Takbeer Counter','tasbih.tap':'Tap to count',
  'tasbih.reset.current':'Reset Current','tasbih.reset.all':'Reset All',
  'tasbih.hint1':'Beads count automatically','tasbih.hint2':'Spacebar counts too',
  'tasbih.subhan':'Subhan Allah','tasbih.hamd':'Alhamdulillah',
  'tasbih.tahlil':'La ilaha illa Allah','tasbih.takbir':'Allahu Akbar',
  'tasbih.hawqala':'La hawla wa la quwwata','tasbih.istigfar':'Astaghfirullah',
  'tasbih.salawat':'Salawat on the Prophet ﷺ',
  'tasbih.laps':'Total Rounds',

  /* ─ Index extra ──────────────────────────────────────────── */
  'index.stats':'Today\'s Statistics',
  'index.days':'Days','index.hero.heading':'Until the Blessed Day of Arafah',
  'index.hero.sub':'Seize these precious hours — no days have righteous deeds more beloved to Allah than these Ten Days.',
  'index.progress.title':'Spiritual Commitment Tracker','index.progress.lbl':'Complete',
  'index.progress.heading':'Daily Wird of the Ten Days',
  'index.progress.li1':'Five daily prayers in congregation','index.progress.li2':'Sunnah prayers and dhikr',
  'index.progress.li3':'Fasting during the day','index.progress.li4':'Takbeer and Istighfar',
  'index.verse.title':'Verse of the Day','common.install':'Install',
  /* ─ Fadael ────────────────────────────────────────────────── */
  'fadael.title':'Why These Days?','fadael.sub':'Evidence from the Quran and authentic Sunnah',
  'fadael.q1.src':'Surah Al-Fajr 1-2','fadael.q1.note':'Allah swears by them — and Allah only swears by something great.',
  'fadael.q2.src':'Surah Al-Hajj — 28','fadael.q2.note':'Scholars of tafsir said: these are the Ten Days of Dhul Hijjah.',
  'fadael.sunnah':'From the Prophetic Sunnah',
  'fadael.h1.title':'The Most Beloved Days to Allah','fadael.h1.src':'Narrated by Al-Bukhari (969)',
  'fadael.h2.title':'The Day of Sacrifice is the Greatest','fadael.h2.src':'Narrated by Abu Dawud (1765), authenticated by Al-Albani',
  'fadael.compare':'Scholarly Comparison',
  'fadael.day.title':'Days of the Ten','fadael.day.desc':'The best days of the year absolutely — all pillars of worship converge.',
  'fadael.day.tag':'Best by Day',
  'fadael.night.title':'Last Nights of Ramadan','fadael.night.desc':'The best nights of the year for containing Laylat al-Qadr.',
  'fadael.night.tag':'Best by Night',
  'fadael.features':'The Great Distinctions',
  'fadael.feat1':'Allah swore by them in the Holy Quran.',
  'fadael.feat2':'They contain the Day of Arafah — day when the religion was perfected.',
  'fadael.feat3':'They contain the Day of Sacrifice — the greatest day with Allah.',
  'fadael.feat4':'Good deeds in them are more beloved to Allah than even jihad.',
  'fadael.feat5':'Prayer, fasting, Hajj and sacrifice all converge only in these days.',
  'fadael.feat6':'Fasting the Day of Arafah expiates two years of sins — past and future.',
  /* ─ Worship extra ─────────────────────────────────────────── */
  'worship.obligatory':'Obligatory Prayers','worship.sunnah':'Sunnah & Voluntary Prayers',
  'worship.dhikr.title':'Dhikr & Fasting',
  'worship.sub':'Set your intention and begin — Allah sees every good you do',
  'worship.fajr.meta':'Fajr','worship.zuhr.meta':'Dhuhr','worship.asr.meta':'Asr',
  'worship.maghrib.meta':'Maghrib','worship.isha.meta':'Isha',
  'worship.duha.meta':'4 rak\'ahs','worship.qiyam.meta':'Equals Laylat al-Qadr',
  'worship.rawatib':'Sunnah Rawatib — 12 rak\'ahs',
  'worship.takbeer100':'Takbeer 100 times',
  'worship.fasting.hint':'⭐ = Day of Arafah · Tap to record fast',
  'worship.day':'Day','worship.arafah.lbl':'Arafah',
  'worship.prog.prefix':'0 of',
  /* ─ Mushaf extra ──────────────────────────────────────────── */
  'mushaf.plans.title':'Completion Plans','mushaf.wird.title':'Today\'s Portion',
  'mushaf.tomorrow.title':'Tomorrow\'s Portion','mushaf.reset.title':'Reset',
  /* ─ Tasbih extra ──────────────────────────────────────────── */
  'tasbih.sub':'Surround yourself with the remembrance of Allah in every moment',
  'tasbih.formulas.title':'Authentic Takbeer Formulas',
  'tasbih.daily.title':'Daily Dhikr',
  /* ─ Adhkar ─────────────────────────────────────────────── */
  'adhkar.title':'Dhikr & Supplications','adhkar.sub':'Remembrance of Allah is the cure of hearts',
  'adhkar.tab.morning':'Morning','adhkar.tab.evening':'Evening',
  'adhkar.tab.ashra':'The Ten Days','adhkar.tab.custom':'Custom',
  'adhkar.count':'Count','adhkar.reset':'Reset',
  'adhkar.add.title':'Add Custom Dhikr',
  'adhkar.add.placeholder':'Write the dhikr in Arabic...',
  'adhkar.add.name':'Name','adhkar.add.target':'Target',
  'adhkar.add.btn':'Add',
  /* ─ Mushaf ─────────────────────────────────────────────── */
  'mushaf.title':'Quran Recitation','mushaf.sub':'Select a plan to begin',
  'mushaf.plan.full':'Full Quran','mushaf.plan.juz':'One Juz per Day',
  'mushaf.plan.pages':'Pages per Day',
  'mushaf.complete.btn':'I completed my portion today',
  'mushaf.complete.done':'Well done — today\'s portion complete ✅',
  'mushaf.tomorrow':'Tomorrow\'s Portion','mushaf.locked':'Unlocks after completing today',
  'mushaf.font':'Font Size','mushaf.add.juz':'Add completed Juz',
  /* ─ Arafah ─────────────────────────────────────────────── */
  'arafah.title':'Day of Arafah','arafah.sub':'Your complete program for the promised day',
  'arafah.countdown.h':'hrs','arafah.countdown.m':'min','arafah.countdown.s':'sec',
  'arafah.loading':'Loading','arafah.approx':'approx.',
  'arafah.milestones':'Interactive Timeline',
  'arafah.dhikr.tap':'Tap for Dhikr','arafah.done':'milestones completed',
  'arafah.virtue.title':'Virtue of Fasting Arafah',
  'arafah.bonus':'Recommended Additional Acts',
  'arafah.share':'Share Arafah Achievement',
  /* ─ Odhiya ─────────────────────────────────────────────── */
  'odhiya.title':'Sacrifice Guide','odhiya.sub':'Visual rulings for the udhiya',
  'odhiya.reminder.title':'Important Reminder for the Sacrificer!',
  'odhiya.reminder.btn':'Enable No-Cutting Reminder 🔔',
  'odhiya.guide.title':'Steps of Udhiya — Visual Guide',
  'odhiya.step1':'Intention & Resolve','odhiya.step2':'Choosing a Valid Animal',
  'odhiya.step3':'Time of Slaughter','odhiya.step4':'Prayer at Slaughter',
  'odhiya.step5':'Distribution of Meat','odhiya.age.title':'Minimum Age Requirements',
  'odhiya.defects':'Defects That Invalidate',
  /* ─ Sadaqah ────────────────────────────────────────────── */
  'sadaqah.title':'Charity','sadaqah.sub':'Choose your act of giving today',
  'sadaqah.log':'Record This Act','sadaqah.done':'Recorded ✅',
  /* ─ Badges ─────────────────────────────────────────────── */
  'badges.title':'My Badges & Achievements','badges.sub':'Righteous deeds — reward with Allah',
  'badges.earned':'Earned','badges.streak':'consecutive days 🔥',
  /* ─ Hasad ──────────────────────────────────────────────── */
  'hasad.title':'Harvest Summary','hasad.sub':'Your performance across the best days on Earth',
  'hasad.zad':'Zad Balance','hasad.streak':'Streak',
  'hasad.streak.cta':'Start your Streak to earn more points!',
  'hasad.heatmap':'Performance Across the Ten Days',
  'hasad.share':'Share Harvest','hasad.share.btn':'Share My Harvest',
  'hasad.complete':'Complete','hasad.days.left':'days remaining',
  /* ─ Kids ───────────────────────────────────────────────── */
  'kids.title':'Kids Mode','kids.story':'Story of the Ten Days',
  'kids.prev':'Previous','kids.next':'Next',
  'kids.quiz.title':'Ten Days Quiz','kids.quiz.sub':'Fun questions for kids',
  'kids.tasbih.title':'Takbeer for Kids',
  /* ─ Tasmee ─────────────────────────────────────────────── */
  'tasmee.title':'Quran Memorization Check','tasmee.sub':'Select a verse to recite',
  'tasmee.start':'Press the microphone and begin reciting',
  'tasmee.accuracy':'Recitation Accuracy',
  'tasmee.tip1.title':'Correct pronunciation','tasmee.tip2.title':'Quiet environment',
  'tasmee.tip3.title':'Natural voice','tasmee.tip4.title':'Recommended browser',
  /* ─ AI ──────────────────────────────────────────────────── */
  'ai.title':'AI Reflection','ai.sub':'Ask about verses and rulings of the Ten Days',
  'ai.placeholder':'Ask your question here...','ai.send':'Send',
  'ai.greeting':'Welcome to the Ashur Assistant 🕌',
  'ai.questions.title':'Suggested Questions',
  /* ─ Report ─────────────────────────────────────────────── */
  'report.title':'Report an Issue','report.sub':'Help us improve your spiritual companion',
  'report.type':'Issue Type','report.type.select':'— Select issue type —',
  'report.type.content':'Content Error (dhikr, hadith, verse)',
  'report.type.tech':'Technical Issue (page won\'t open, broken tool)',
  'report.type.ui':'UI Issue (font, colors, layout)',
  'report.type.feature':'Feature Suggestion',
  'report.type.perf':'Slow loading or performance',
  'report.type.other':'Other',
  'report.page':'Where did you encounter the issue?',
  'report.desc':'Describe the issue in detail',
  'report.screenshot':'Screenshot (optional)',
  'report.email':'Your email (optional)',
  'report.submit':'Submit Report','report.copy':'Copy Report',
  'report.privacy':'Digital Trust',
  /* ─ Settings ────────────────────────────────────────────── */
  'settings.title':'Settings','settings.sub':'Personalized just for you',
  'settings.lang':'Language','settings.langSub':'Choose app language',
  'settings.theme.title':'Theme','settings.dark':'Dark Mode',
  'settings.dark.sub':'Easy on the eyes during night prayer',
  'settings.oled':'True OLED Black','settings.oled.sub':'Saves battery on OLED screens',
  'settings.font.title':'Font Size','settings.font.quran':'Quran Font Size',
  'settings.notif.toggle':'Enable Notifications','settings.notif.wird':'Daily Wird Reminder',
  'settings.notif.arafah':'Arafah Golden Hour Alert',
  'settings.pwa':'Install App','settings.pwa.sub':'Works offline in the mosque',
  'settings.data.title':'Data','settings.data.encrypted':'Data encrypted locally',
  'settings.data.noads':'Zero Ads','settings.data.noads.sub':'Digital khushu\' free from distractions',
  'settings.data.reset':'Clear All Data',
  /* ─ About ───────────────────────────────────────────────── */
  'about.title':'About the App','about.sub':'Zad Al-Ashr — Your smart companion for the best days on Earth',
  'about.dev':'Mustafa Abu Al-Azm',
  'about.dev.title':'UI Designer · Web Developer · UX Innovator',
  'about.contact':'Contact Me','about.social':'Follow Me On',
  'about.app.title':'About Zad Al-Ashr','about.sources':'Islamic Sources',
  'about.tech':'Technologies Used',
}
,
fr: {
  /* ─ App shell ─ */
  'brand.name': 'Zad Al-Ashr', 'brand.sub': 'Les meilleurs jours sur terre',
  'common.darkMode': '🌙 Mode sombre', 'common.language': '🌐 Langue',
  'common.search': "Rechercher dans l'application...", 'common.noAds': 'Fonctionne hors ligne 📴',
  'common.done': '✅ Fait', 'common.reset': 'Réinitialiser', 'common.save': 'Enregistrer', 'common.send': 'Envoyer',
  /* ─ Nav ─ */
  'nav.dashboard':'Tableau de bord','nav.virtues':'Mérites des 10 jours',
  'nav.worship':'Suivi des adorations','nav.mushaf':'Récitation du Coran',
  'nav.tasbih':'Compteur de Tasbih','nav.adhkar':'Dhikr et invocations',
  'nav.odhiya':'Guide du sacrifice','nav.arafah':'Jour de Arafah',
  'nav.sadaqah':'Aumône','nav.badges':'Mes badges',
  'nav.hasad':'Bilan des adorations','nav.kids':'Mode enfants',
  'nav.tasmee':'Mémorisation du Coran','nav.ai':'Réflexion par IA',
  'nav.settings':'Paramètres','nav.report':'Signaler un problème','nav.about':'À propos',
  /* ─ Index ─ */
  'index.title':'Les meilleurs jours sur terre','index.sub':'Suivez vos adorations quotidiennes et les mérites des dix jours — au même endroit',
  'index.install.title':"Installer l'application",'index.install.sub':'Fonctionne hors ligne à la mosquée',
  'index.notif.title':'Activer les rappels de prière','index.notif.sub':'Ne manquez pas vos adorations en ces jours bénis',
  'index.countdown':'Compte à rebours',
  'index.hours':'Heures','index.mins':'Minutes','index.secs':'Secondes',
  'index.stat.takbeer':'Total des Takbir','index.stat.juz':'Juz du Coran',
  'index.stat.pray':'Prières en groupe','index.stat.wird':'Wird quotidien',
  'index.start':'Commencez votre journée',
  'index.grid.worship':'Wird quotidien','index.grid.worship.sub':"Suivez votre programme d'adoration",
  'index.grid.mushaf':'Lire le Coran','index.grid.mushaf.sub':'Suivez votre plan de lecture',
  'index.grid.tasbih':'Takbir','index.grid.tasbih.sub':'Compteur de dhikr',
  'index.grid.tasmee':'Récitation du Coran','index.grid.tasmee.sub':'Vérification par IA',
  'index.grid.ai':'Réflexion par IA','index.grid.ai.sub':'Questions sur versets et règles',
  'index.grid.badges':'Mes badges','index.grid.badges.sub':'Vos réalisations spirituelles',
  /* ─ Worship ─ */
  'worship.title':'Suivi des adorations quotidiennes','worship.sub':'Allah voit chaque bonne action que vous accomplissez',
  'worship.label':'Adoration',
  'worship.fajr':'Prière du Fajr (en groupe)','worship.zuhr':'Prière du Dhuhr (en groupe)',
  'worship.asr':'Prière du Asr (en groupe)','worship.maghrib':'Prière du Maghrib (en groupe)',
  'worship.isha':'Prière du Isha (en groupe)','worship.rawatib':'Prières surérogatoires (Rawatib)',
  'worship.duha':'Prière du Duha','worship.qiyam':'Prière de nuit (Qiyam al-Layl)',
  'worship.morning':'Adhkar du matin','worship.evening':'Adhkar du soir',
  'worship.takbeer':'Takbir','worship.tawbah':"Renouveler l'intention et le repentir",
  'worship.fasting.title':'Les neuf jours','worship.fasting.sub':'Touchez pour enregistrer le jeûne',
  'worship.save':'Enregistrer la progression','worship.notif':'Rappels des adorations',
  /* ─ Tasbih ─ */
  'tasbih.title':'Compteur de Tasbih et Takbir','tasbih.tap':'Touchez pour compter',
  'tasbih.reset.current':'Réinitialiser','tasbih.reset.all':'Tout réinitialiser',
  'tasbih.hint1':'Les grains comptent automatiquement','tasbih.hint2':"La barre d'espace compte aussi",
  'tasbih.subhan':'Subhan Allah','tasbih.hamd':'Alhamdulillah',
  'tasbih.tahlil':'La ilaha illa Allah','tasbih.takbir':'Allahu Akbar',
  'tasbih.hawqala':'La hawla wa la quwwata','tasbih.istigfar':'Astaghfirullah',
  'tasbih.salawat':'Salawat sur le Prophète ﷺ',
  'tasbih.laps':'Total des tours',
  /* ─ Index extra ─ */
  'index.stats':"Statistiques d'aujourd'hui",
  'index.days':'Jours','index.hero.heading':'Jusqu’au jour béni de Arafah',
  'index.hero.sub':'Saisissez ces heures précieuses — aucune action vertueuse n’est plus aimée d’Allah que durant ces dix jours.',
  'index.progress.title':"Suivi de l'engagement spirituel",'index.progress.lbl':'Terminé',
  'index.progress.heading':'Wird quotidien des dix jours',
  'index.progress.li1':'Les cinq prières en groupe','index.progress.li2':'Prières surérogatoires et dhikr',
  'index.progress.li3':'Jeûne durant la journée','index.progress.li4':'Takbir et Istighfar',
  'index.verse.title':'Verset du jour','common.install':'Installer',
  /* ─ Fadael ─ */
  'fadael.title':'Pourquoi ces jours ?','fadael.sub':'Preuves du Coran et de la Sunna authentique',
  'fadael.q1.src':'Sourate Al-Fajr 1-2','fadael.q1.note':'Allah jure par eux — et Allah ne jure que par ce qui est grand.',
  'fadael.q2.src':'Sourate Al-Hajj — 28','fadael.q2.note':'Les exégètes ont dit : ce sont les dix jours de Dhul Hijja.',
  'fadael.sunnah':'De la Sunna prophétique',
  'fadael.h1.title':'Les jours les plus aimés d’Allah','fadael.h1.src':'Rapporté par Al-Bukhari (969)',
  'fadael.h2.title':'Le jour du Sacrifice est le plus grand','fadael.h2.src':'Rapporté par Abu Dawud (1765), authentifié par Al-Albani',
  'fadael.compare':'Comparaison savante',
  'fadael.day.title':'Jours des dix','fadael.day.desc':'Les meilleurs jours de l’année — toutes les adorations s’y rejoignent.',
  'fadael.day.tag':'Meilleurs en jours',
  'fadael.night.title':'Dernières nuits du Ramadan','fadael.night.desc':'Les meilleures nuits de l’année car elles contiennent Laylat al-Qadr.',
  'fadael.night.tag':'Meilleures en nuits',
  'fadael.features':'Les grandes distinctions',
  'fadael.feat1':'Allah a juré par eux dans le Saint Coran.',
  'fadael.feat2':'Ils contiennent le jour de Arafah — jour où la religion fut parachevée.',
  'fadael.feat3':'Ils contiennent le jour du Sacrifice — le plus grand jour auprès d’Allah.',
  'fadael.feat4':'Les bonnes actions y sont plus aimées d’Allah que même le jihad.',
  'fadael.feat5':'Prière, jeûne, Hajj et sacrifice ne se rejoignent qu’en ces jours.',
  'fadael.feat6':'Jeûner le jour de Arafah expie deux années de péchés — passée et à venir.',
  /* ─ Worship extra ─ */
  'worship.obligatory':'Prières obligatoires','worship.sunnah':'Prières surérogatoires',
  'worship.dhikr.title':'Dhikr et jeûne',
  'worship.fajr.meta':'Fajr','worship.zuhr.meta':'Dhuhr','worship.asr.meta':'Asr',
  'worship.maghrib.meta':'Maghrib','worship.isha.meta':'Isha',
  'worship.duha.meta':'4 rak\'ahs','worship.qiyam.meta':'Équivaut à Laylat al-Qadr',
  'worship.takbeer100':'Takbir 100 fois',
  'worship.fasting.hint':'⭐ = Jour de Arafah · Touchez pour enregistrer',
  'worship.day':'Jour','worship.arafah.lbl':'Arafah',
  'worship.prog.prefix':'0 sur',
  /* ─ Mushaf extra ─ */
  'mushaf.plans.title':'Plans de lecture','mushaf.wird.title':"Portion d'aujourd'hui",
  'mushaf.tomorrow.title':'Portion de demain','mushaf.reset.title':'Réinitialiser',
  /* ─ Tasbih extra ─ */
  'tasbih.sub':"Entourez-vous du rappel d'Allah à chaque instant",
  'tasbih.formulas.title':'Formules de Takbir authentiques',
  'tasbih.daily.title':'Dhikr quotidien',
  /* ─ Adhkar ─ */
  'adhkar.title':'Dhikr et invocations','adhkar.sub':'Le rappel d’Allah est le remède des cœurs',
  'adhkar.tab.morning':'Matin','adhkar.tab.evening':'Soir',
  'adhkar.tab.ashra':'Les dix jours','adhkar.tab.custom':'Personnalisé',
  'adhkar.count':'Compte','adhkar.reset':'Réinitialiser',
  'adhkar.add.title':'Ajouter un dhikr personnalisé',
  'adhkar.add.placeholder':'Écrivez le dhikr en arabe...',
  'adhkar.add.name':'Nom','adhkar.add.target':'Objectif',
  'adhkar.add.btn':'Ajouter',
  /* ─ Mushaf ─ */
  'mushaf.title':'Récitation du Coran','mushaf.sub':'Choisissez un plan pour commencer',
  'mushaf.plan.full':'Coran complet','mushaf.plan.juz':'Un Juz par jour',
  'mushaf.plan.pages':'Pages par jour',
  'mushaf.complete.btn':"J'ai terminé ma portion aujourd'hui",
  'mushaf.complete.done':'Bravo — portion du jour terminée ✅',
  'mushaf.tomorrow':'Portion de demain','mushaf.locked':"Se débloque après celle d'aujourd'hui",
  'mushaf.font':'Taille de police','mushaf.add.juz':'Ajouter un Juz terminé',
  /* ─ Arafah ─ */
  'arafah.title':'Jour de Arafah','arafah.sub':'Votre programme complet pour le jour promis',
  'arafah.countdown.h':'h','arafah.countdown.m':'min','arafah.countdown.s':'s',
  'arafah.loading':'Chargement','arafah.approx':'env.',
  'arafah.milestones':'Chronologie interactive',
  'arafah.dhikr.tap':'Touchez pour le dhikr','arafah.done':'étapes terminées',
  'arafah.virtue.title':'Mérite du jeûne de Arafah',
  'arafah.bonus':'Actes additionnels recommandés',
  'arafah.share':'Partager la réussite de Arafah',
  /* ─ Odhiya ─ */
  'odhiya.title':'Guide du sacrifice','odhiya.sub':"Règles illustrées de l'Udhiya",
  'odhiya.reminder.title':'Rappel important pour celui qui sacrifie !',
  'odhiya.reminder.btn':'Activer le rappel (ne pas couper) 🔔',
  'odhiya.guide.title':"Étapes de l'Udhiya — guide illustré",
  'odhiya.step1':'Intention et résolution','odhiya.step2':"Choix d'un animal valide",
  'odhiya.step3':'Moment de l’abattage','odhiya.step4':'Invocation lors de l’abattage',
  'odhiya.step5':'Distribution de la viande','odhiya.age.title':'Âge minimum requis',
  'odhiya.defects':'Défauts qui invalident',
  /* ─ Sadaqah ─ */
  'sadaqah.title':'Aumône','sadaqah.sub':'Choisissez votre acte de don aujourd’hui',
  'sadaqah.log':'Enregistrer cet acte','sadaqah.done':'Enregistré ✅',
  /* ─ Badges ─ */
  'badges.title':'Mes badges et réalisations','badges.sub':'Bonnes actions — récompense auprès d’Allah',
  'badges.earned':'Obtenu','badges.streak':'jours consécutifs 🔥',
  /* ─ Hasad ─ */
  'hasad.title':'Bilan des adorations','hasad.sub':'Votre performance durant les meilleurs jours sur terre',
  'hasad.zad':'Solde Zad','hasad.streak':'Série',
  'hasad.streak.cta':'Commencez votre série pour gagner plus de points !',
  'hasad.heatmap':'Performance durant les dix jours',
  'hasad.share':'Partager le bilan','hasad.share.btn':'Partager mon bilan',
  'hasad.complete':'Terminé','hasad.days.left':'jours restants',
  /* ─ Kids ─ */
  'kids.title':'Mode enfants','kids.story':'Histoire des dix jours',
  'kids.prev':'Précédent','kids.next':'Suivant',
  'kids.quiz.title':'Quiz des dix jours','kids.quiz.sub':'Questions amusantes pour enfants',
  'kids.tasbih.title':'Takbir pour enfants',
  /* ─ Tasmee ─ */
  'tasmee.title':'Vérification de la mémorisation','tasmee.sub':'Choisissez un verset à réciter',
  'tasmee.start':'Appuyez sur le micro et commencez à réciter',
  'tasmee.accuracy':'Précision de la récitation',
  'tasmee.tip1.title':'Prononciation correcte','tasmee.tip2.title':'Environnement calme',
  'tasmee.tip3.title':'Voix naturelle','tasmee.tip4.title':'Navigateur recommandé',
  /* ─ AI ─ */
  'ai.title':'Réflexion par IA','ai.sub':'Posez des questions sur les versets et les règles des dix jours',
  'ai.placeholder':'Posez votre question ici...','ai.send':'Envoyer',
  'ai.greeting':'Bienvenue dans l’assistant des dix jours 🕌',
  'ai.questions.title':'Questions suggérées',
  /* ─ Report ─ */
  'report.title':'Signaler un problème','report.sub':'Aidez-nous à améliorer votre compagnon spirituel',
  'report.type':'Type de problème','report.type.select':'— Choisir le type —',
  'report.type.content':'Erreur de contenu (dhikr, hadith, verset)',
  'report.type.tech':'Problème technique (page, outil cassé)',
  'report.type.ui':'Problème d’affichage (police, couleurs, mise en page)',
  'report.type.feature':'Suggestion de fonctionnalité',
  'report.type.perf':'Lenteur ou performance',
  'report.type.other':'Autre',
  'report.page':'Où avez-vous rencontré le problème ?',
  'report.desc':'Décrivez le problème en détail',
  'report.screenshot':'Capture d’écran (optionnel)',
  'report.email':'Votre e-mail (optionnel)',
  'report.submit':'Envoyer le rapport','report.copy':'Copier le rapport',
  'report.privacy':'Confiance numérique',
  /* ─ Settings ─ */
  'settings.title':'Paramètres','settings.sub':'Personnalisé rien que pour vous',
  'settings.lang':'Langue','settings.langSub':'Choisissez la langue de l’application',
  'settings.theme.title':'Thème','settings.dark':'Mode sombre',
  'settings.dark.sub':'Reposant pour les yeux pendant la prière nocturne',
  'settings.oled':'Noir OLED véritable','settings.oled.sub':'Économise la batterie sur écrans OLED',
  'settings.font.title':'Taille de police','settings.font.quran':'Taille de police du Coran',
  'settings.notif.toggle':'Activer les notifications','settings.notif.wird':'Rappel du Wird quotidien',
  'settings.notif.arafah':'Alerte heure d’or de Arafah',
  'settings.pwa':"Installer l'application",'settings.pwa.sub':'Fonctionne hors ligne à la mosquée',
  'settings.data.title':'Données','settings.data.encrypted':'Données chiffrées localement',
  'settings.data.noads':'Zéro publicité','settings.data.noads.sub':'Khushu’ numérique sans distractions',
  'settings.data.reset':'Effacer toutes les données',
  /* ─ About ─ */
  'about.title':'À propos de l’application','about.sub':'Zad Al-Ashr — Votre compagnon intelligent pour les meilleurs jours sur terre',
  'about.dev':'Mustafa Abu Al-Azm',
  'about.dev.title':'Designer UI · Développeur web · Innovateur UX',
  'about.contact':'Me contacter','about.social':'Suivez-moi sur',
  'about.app.title':'À propos de Zad Al-Ashr','about.sources':'Sources islamiques',
  'about.tech':'Technologies utilisées',
}
};

/* ── Dhikr transliterations (translit + meaning per language) ─────────── */
const DHIKR_DB = [
  { ar:'سُبْحَانَ اللَّهِ', translit:'Subḥāna Allāh', en:'Glory be to Allah', fr:'Gloire à Allah' },
  { ar:'الْحَمْدُ لِلَّهِ', translit:'Al-Ḥamdu lillāh', en:'All praise is due to Allah', fr:'Louange à Allah' },
  { ar:'لَا إِلَهَ إِلَّا اللَّهُ', translit:"Lā ilāha illa Allāh", en:'There is no god but Allah', fr:"Il n'y a de divinité qu'Allah" },
  { ar:'اللَّهُ أَكْبَرُ', translit:'Allāhu Akbar', en:'Allah is the Greatest', fr:'Allah est le plus grand' },
  { ar:'سبحان الله', translit:'Subhan Allah', en:'Glory be to Allah', fr:'Gloire à Allah' },
  { ar:'الحمد لله', translit:'Alhamdulillah', en:'All praise is to Allah', fr:'Louange à Allah' },
  { ar:'لا إله إلا الله', translit:'La ilaha illa Allah', en:'There is no god but Allah', fr:"Il n'y a de divinité qu'Allah" },
  { ar:'الله أكبر', translit:'Allahu Akbar', en:'Allah is the Greatest', fr:'Allah est le plus grand' },
  { ar:'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', translit:'Lā ḥawla wa lā quwwata illā billāh', en:'There is no power except with Allah', fr:"Il n'y a de force ni de puissance qu'en Allah" },
  { ar:'أَسْتَغْفِرُ اللَّهَ', translit:'Astaghfiru Allāh', en:'I seek forgiveness from Allah', fr:'Je demande pardon à Allah' },
  { ar:'أستغفر الله', translit:'Astaghfirullah', en:'I seek forgiveness from Allah', fr:'Je demande pardon à Allah' },
  { ar:'لا حول ولا قوة إلا بالله', translit:'La hawla wa la quwwata illa billah', en:'No power except with Allah', fr:"Pas de puissance sauf en Allah" },
  { ar:'بسم الله الرحمن الرحيم', translit:'Bismillāhi r-raḥmāni r-raḥīm', en:'In the name of Allah, the Most Gracious, the Most Merciful', fr:'Au nom d’Allah, le Tout Miséricordieux, le Très Miséricordieux' },
  { ar:'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', translit:'Subḥāna Allāhi wa biḥamdih', en:'Glory be to Allah and praise be to Him', fr:'Gloire et louange à Allah' },
];

/* ── ترتيب اللغات للتدوير: عربي → إنجليزي → فرنسي → عربي ─────────────── */
const LANG_CYCLE = ['ar', 'en', 'fr'];
const LANG_NEXT_LABEL = { ar: 'EN', en: 'FR', fr: 'عربي' };

/* ── i18n Engine ─────────────────────────────────────────────── */
const I18N = {
  current: localStorage.getItem('zad_lang') || 'ar',

  t(key) {
    return TRANSLATIONS[this.current]?.[key]
        || TRANSLATIONS['ar']?.[key]
        || key;
  },

  isRTL() { return this.current === 'ar'; },

  setLang(lang) {
    if (!LANG_CYCLE.includes(lang)) lang = 'ar';
    this.current = lang;
    localStorage.setItem('zad_lang', lang);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', this.isRTL() ? 'rtl' : 'ltr');
    this.apply();
    this._updateButtons(lang);
  },

  _updateButtons(lang) {
    const label = LANG_NEXT_LABEL[lang] || 'EN';
    const tb = document.getElementById('topbar-lang-btn');
    if (tb) tb.textContent = label;
    const sb = document.getElementById('sidebar-lang-val');
    if (sb) sb.textContent = label;
    /* أزرار اختيار صريحة إن وُجدت */
    ['ar','en','fr'].forEach(L => {
      const b = document.getElementById('lang-'+L+'-btn');
      if (b) b.classList.toggle('active', lang === L);
    });
  },

  apply() {
    const lang = this.current;
    const isAr = lang === 'ar';

    /* 1) عناصر data-i18n */
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const v = this.t(el.dataset.i18n);
      if (v && v !== el.dataset.i18n) el.textContent = v;
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      el.placeholder = this.t(el.dataset.i18nPh);
    });

    /* 2) الترانزليتريشن تحت الأذكار العربية (للغات غير العربية) */
    if (!isAr) {
      document.querySelectorAll('.az-arabic,.adhkar-arabic,.tl-dua,.af-ms-dua,.ts-dhikr-text,.dc-arabic').forEach(el => {
        if (el.nextElementSibling?.classList.contains('i18n-translit')) {
          /* حدّث المعنى عند تبديل اللغة */
          const exist = el.nextElementSibling;
          const arTxt = el.textContent.trim();
          const m = DHIKR_DB.find(d => arTxt.includes(d.ar));
          if (m) exist.querySelector('.az-meaning').textContent = (m[lang] || m.en);
          return;
        }
        const arTxt = el.textContent.trim();
        const match = DHIKR_DB.find(d => arTxt.includes(d.ar));
        if (!match) return;
        const t = document.createElement('div');
        t.className = 'i18n-translit';
        t.innerHTML = `<span class="az-translit">${match.translit}</span><span class="az-meaning">${match[lang] || match.en}</span>`;
        el.after(t);
      });
    } else {
      document.querySelectorAll('.i18n-translit').forEach(el => el.remove());
    }

    /* 3) عناصر النصوص العامة عبر UI_MAP (الشريط الجانبي/الأقسام/الأزرار) */
    const swap = (el) => {
      const txt = el.textContent.trim();
      if (!el.dataset.ar) el.dataset.ar = txt;
      if (isAr) { el.textContent = el.dataset.ar; return; }
      const entry = UI_MAP[el.dataset.ar];
      if (entry) el.textContent = (typeof entry === 'string' ? entry : (entry[lang] || entry.en || el.dataset.ar));
    };

    /* العلامة التجارية */
    const bn = document.querySelector('.brand-name');
    const bs = document.querySelector('.brand-sub');
    if (bn) bn.textContent = isAr ? 'زاد' : 'Zad Al-Ashr';
    if (bs) bs.textContent = isAr ? 'أفضل أيام الدنيا' : (lang==='fr' ? 'Les meilleurs jours sur terre' : 'The Best Days on Earth');

    /* روابط القائمة + الفواصل */
    document.querySelectorAll('.nav a span:last-child, .nav .nav-sep').forEach(swap);
    /* عناوين الأقسام */
    document.querySelectorAll('.section-title, .kids-title').forEach(el => { if (el.children.length === 0) swap(el); });
    /* الأزرار العامة */
    document.querySelectorAll('button:not([data-i18n]):not(.hamburger):not(.notif-btn):not(.btn-theme)').forEach(swap);

    /* 4) عنوان الصفحة (وسط الشريط العلوي) */
    const pageTitleEl = document.querySelector('.page-title');
    if (pageTitleEl && pageTitleEl.childNodes.length) {
      const page = (location.pathname.split('/').pop() || 'index.html');
      const map  = PAGE_TITLES[page];
      if (map) {
        const pair = map[lang] || map.en || map.ar;
        if (pair) {
          if (pageTitleEl.childNodes[0]) pageTitleEl.childNodes[0].textContent = pair[0] + ' ';
          const span = pageTitleEl.querySelector('span');
          if (span && pair[1] != null) span.textContent = pair[1];
        }
      }
    }

    /* 5) زر التثبيت + صف الوضع الداكن */
    const instBtn = document.getElementById('sidebar-install-btn');
    if (instBtn) instBtn.textContent = isAr ? '📲 تثبيت / تحميل التطبيق' : (lang==='fr' ? "📲 Installer l'application" : '📲 Install App');
    document.querySelectorAll('.theme-row span:first-child').forEach(el => {
      if (!el.dataset.ar) el.dataset.ar = el.textContent;
      el.textContent = isAr ? (el.dataset.ar || '🌙 الوضع الداكن') : (lang==='fr' ? '🌙 Mode sombre' : '🌙 Dark Mode');
    });

    /* 6) الاتجاه + لغة الصفحة */
    document.documentElement.dir  = isAr ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.body && document.body.setAttribute('data-lang', lang);
  },

  toggle() {
    const i = LANG_CYCLE.indexOf(this.current);
    this.setLang(LANG_CYCLE[(i + 1) % LANG_CYCLE.length]);
  },

  init() {
    document.documentElement.setAttribute('lang', this.current);
    document.documentElement.setAttribute('dir', this.isRTL() ? 'rtl' : 'ltr');
    document.body && document.body.setAttribute('data-lang', this.current);
    this.apply();
    this._updateButtons(this.current);
  }
};

window.I18N = I18N;
window.toggleLang = () => I18N.toggle();
document.addEventListener('DOMContentLoaded', () => I18N.init());

/* ════════════════════════════════════════════════════════════
   UI_MAP — نصوص عامة (عربي → {إنجليزي، فرنسي})
   ════════════════════════════════════════════════════════════ */
const UI_MAP = {
  /* روابط القائمة */
  'لوحة التحكم':          { en:'Dashboard', fr:'Tableau de bord' },
  'مواقيت الصلاة':        { en:'Prayer Times', fr:'Heures de prière' },
  'اتجاه القبلة':         { en:'Qibla Direction', fr:'Direction de la Qibla' },
  'التقويم الهجري':       { en:'Hijri Calendar', fr:'Calendrier Hégirien' },
  'ورد العشر':            { en:'Daily Quran Wird', fr:'Wird quotidien du Coran' },
  'المصحف الشريف':        { en:'Holy Quran', fr:'Saint Coran' },
  'تسميع القرآن':         { en:'Quran Memorization', fr:'Mémorisation du Coran' },
  'إذاعات القرآن':        { en:'Quran Radio', fr:'Radios du Coran' },
  'المسبحة':              { en:'Tasbih Counter', fr:'Compteur de Tasbih' },
  'الأذكار والدعاء':      { en:'Dhikr & Supplications', fr:'Dhikr et invocations' },
  'الأربعون النووية':     { en:'The Forty Nawawi', fr:'Les Quarante de Nawawi' },
  'الأدعية':              { en:'Supplications', fr:'Invocations' },
  'جدول العبادات':        { en:'Worship Tracker', fr:'Suivi des adorations' },
  'فضائل العشر':          { en:'Virtues of the 10 Days', fr:'Mérites des 10 jours' },
  'يوم عرفة':             { en:'Day of Arafah', fr:'Jour de Arafah' },
  'دليل الأضحية':         { en:'Sacrifice Guide', fr:'Guide du sacrifice' },
  'صدقة العشر':           { en:'Charity in the 10 Days', fr:'Aumône des 10 jours' },
  'حصاد العشر':           { en:'Worship Harvest', fr:'Bilan des adorations' },
  'إحصاء العشر':          { en:'Ten Days Summary', fr:'Récapitulatif des dix jours' },
  'أوسمتي':               { en:'My Badges', fr:'Mes badges' },
  'محاضرات العشر':        { en:'Lectures of the 10 Days', fr:'Conférences des 10 jours' },
  'قائمة التشغيل':        { en:'Playlist', fr:'Liste de lecture' },
  'ثُريّا — وضع الأطفال': { en:'Thuraya — Kids Mode', fr:'Thuraya — Mode enfants' },
  'غرس — رحلة الحج':     { en:'Ghars — Hajj Journey', fr:'Ghars — Voyage du Hajj' },
  'أسماء الله الحسنى':    { en:'The 99 Names of Allah', fr:'Les 99 noms d’Allah' },
  'تدبّر بالذكاء':        { en:'AI Reflection', fr:'Réflexion par IA' },
  'حسابي':                { en:'My Account', fr:'Mon compte' },
  'الإعدادات':            { en:'Settings', fr:'Paramètres' },
  'بلاغ مشكلة':          { en:'Report Issue', fr:'Signaler un problème' },
  'عن التطبيق':          { en:'About', fr:'À propos' },
  /* فواصل الأقسام */
  'الصلاة والتقويم':     { en:'Prayer & Calendar', fr:'Prière et calendrier' },
  'القرآن والعبادة':     { en:'Quran & Worship', fr:'Coran et adoration' },
  'الحج والمناسك':       { en:'Hajj & Rites', fr:'Hajj et rites' },
  'المتابعة':            { en:'Tracking', fr:'Suivi' },
  'التعلم والترفيه':    { en:'Learning & Entertainment', fr:'Apprentissage et loisirs' },
  'التعلّم والترفيه':   { en:'Learning & Entertainment', fr:'Apprentissage et loisirs' },
  /* عامة */
  'الوضع الداكن':        { en:'Dark Mode', fr:'Mode sombre' },
  'تثبيت / تحميل التطبيق': { en:'Install App', fr:"Installer l'application" },
  /* عناوين أقسام */
  'ابدأ يومك الآن':              { en:'Start Your Day Now', fr:'Commencez votre journée' },
  'مؤشر الالتزام الروحاني':      { en:'Spiritual Commitment Index', fr:'Indice d’engagement spirituel' },
  '📖 آية اليوم':                { en:'📖 Verse of the Day', fr:'📖 Verset du jour' },
  '⚡ عبادات سريعة':             { en:'⚡ Quick Worship', fr:'⚡ Adorations rapides' },
  '🕌 الفرائض':                  { en:'🕌 Obligatory Prayers', fr:'🕌 Prières obligatoires' },
  '⭐ السنن والنوافل':           { en:'⭐ Sunnah & Optional Prayers', fr:'⭐ Prières surérogatoires' },
  '📿 الذكر والاستغفار':        { en:'📿 Dhikr & Repentance', fr:'📿 Dhikr et repentir' },
  '🌙 الصيام والعطاء':          { en:'🌙 Fasting & Giving', fr:'🌙 Jeûne et don' },
  '📅 تتبع الصيام — الأيام التسعة': { en:'📅 Fasting Tracker — Nine Days', fr:'📅 Suivi du jeûne — neuf jours' },
  '📖 خطة الختمة — 10 أيام':   { en:'📖 Quran Completion Plan — 10 Days', fr:'📖 Plan de lecture — 10 jours' },
  '🤲 تحدي الدعاء والعطاء':    { en:'🤲 Dua & Giving Challenge', fr:'🤲 Défi invocation et don' },
  '✨ إحياء السنن اليومية':     { en:'✨ Daily Sunnah Revival', fr:'✨ Raviver les sunnas quotidiennes' },
  '🚫 لصوص العشر':              { en:'🚫 Time Thieves', fr:'🚫 Les voleurs de temps' },
  '📊 إحصائيات اليوم':         { en:"📊 Today's Stats", fr:'📊 Statistiques du jour' },
  '🏅 أوسمتي':                  { en:'🏅 My Badges', fr:'🏅 Mes badges' },
  '🎬 محاضرات العشر':          { en:'🎬 Lectures of the 10 Days', fr:'🎬 Conférences des 10 jours' },
  /* أزرار */
  'تفعيل':     { en:'Activate', fr:'Activer' },
  'مشاركة':    { en:'Share', fr:'Partager' },
  'تحميل':     { en:'Download', fr:'Télécharger' },
  'تثبيت':     { en:'Install', fr:'Installer' },
  'إرسال':     { en:'Send', fr:'Envoyer' },
  'إغلاق':     { en:'Close', fr:'Fermer' },
  'عرض الكل ←': { en:'View all ←', fr:'Voir tout ←' },
  'ملخص العشر ←': { en:'Summary ←', fr:'Récapitulatif ←' },
  'تذكيرات':   { en:'Reminders', fr:'Rappels' },
  'تغيير':     { en:'Change', fr:'Changer' },
  /* أيام/أوقات */
  'يتجدد في':  { en:'Resets at', fr:'Réinitialisé à' },
  'صفحة':      { en:'Page', fr:'Page' },
  'الجزء':     { en:'Juz', fr:'Juz' },
  'آية':        { en:'Verse', fr:'Verset' },
};

/* ── خريطة عناوين الصفحات (عربي/إنجليزي/فرنسي) ─────────────── */
const PAGE_TITLES = {
  'index.html':       { ar:['زاد','العشر'], en:['Zad','Al-Ashr'], fr:['Zad','Al-Ashr'] },
  'prayers.html':     { ar:['مواقيت','الصلاة'], en:['Prayer','Times'], fr:['Heures de','prière'] },
  'worship.html':     { ar:['جدول','العبادات'], en:['Worship','Tracker'], fr:['Suivi des','adorations'] },
  'adhkar.html':      { ar:['الأذكار','والدعاء'], en:['Dhikr &','Supplications'], fr:['Dhikr et','invocations'] },
  'fadael.html':      { ar:['فضائل','العشر'], en:['Virtues of the','10 Days'], fr:['Mérites des','10 jours'] },
  'hasad.html':       { ar:['حصاد','العشر'], en:['Worship','Harvest'], fr:['Bilan des','adorations'] },
  'badges.html':      { ar:['أوسمتي',''], en:['My','Badges'], fr:['Mes','badges'] },
  'ai.html':          { ar:['تدبّر','بالذكاء'], en:['AI','Reflection'], fr:['Réflexion','par IA'] },
  'videos.html':      { ar:['محاضرات','العشر'], en:['Lectures of','the 10 Days'], fr:['Conférences','des 10 jours'] },
  'settings.html':    { ar:['الإعدادات',''], en:['','Settings'], fr:['','Paramètres'] },
  'about.html':       { ar:['عن','التطبيق'], en:['About','the App'], fr:['À propos de','l’app'] },
  'mushaf.html':      { ar:['ورد','العشر'], en:['Daily','Wird'], fr:['Wird','quotidien'] },
  'takbeer.html':     { ar:['المسبحة',''], en:['','Tasbih'], fr:['','Tasbih'] },
  'mushaf-quran.html':{ ar:['المصحف','الشريف'], en:['Holy','Quran'], fr:['Saint','Coran'] },
  'arafah.html':      { ar:['يوم','عرفة'], en:['Day of','Arafah'], fr:['Jour de','Arafah'] },
  'odhiya.html':      { ar:['دليل','الأضحية'], en:['Sacrifice','Guide'], fr:['Guide du','sacrifice'] },
  'sadaqah.html':     { ar:['صدقة','العشر'], en:['Charity in the','10 Days'], fr:['Aumône des','10 jours'] },
  'hijri.html':       { ar:['التقويم','الهجري'], en:['Hijri','Calendar'], fr:['Calendrier','Hégirien'] },
  'kids.html':        { ar:['ثُريّا',''], en:['','Thuraya'], fr:['','Thuraya'] },
  'ghars.html':       { ar:['غرس',''], en:['','Ghars'], fr:['','Ghars'] },
  'report.html':      { ar:['بلاغ','مشكلة'], en:['Report','Issue'], fr:['Signaler un','problème'] },
  'profile.html':     { ar:['حسابي','وبياناتي'], en:['My','Account'], fr:['Mon','compte'] },
};

/* ── CSS لتعديلات اتجاه LTR (إنجليزي + فرنسي) ──────────────── */
(function(){
  const style = document.createElement('style');
  style.id = 'i18n-ltr-css';
  style.textContent = `
    body[data-lang="en"], body[data-lang="fr"] { direction: ltr; text-align: left; }
    body[data-lang="en"] .sidebar, body[data-lang="fr"] .sidebar { right: auto; left: -290px; }
    body[data-lang="en"] .sidebar.open, body[data-lang="fr"] .sidebar.open { left: 0; right: auto; }
    body[data-lang="en"] .nav a, body[data-lang="fr"] .nav a { flex-direction: row-reverse; justify-content: flex-end; }
    body[data-lang="en"] .notif-dropdown, body[data-lang="fr"] .notif-dropdown { left: 0; right: auto; }
    body[data-lang="en"] .hijri-bar, body[data-lang="fr"] .hijri-bar { direction: ltr; }
    body[data-lang="en"] .quran-text, body[data-lang="fr"] .quran-text,
    body[data-lang="en"] .ts-ayah-text, body[data-lang="fr"] .ts-ayah-text,
    body[data-lang="en"] .basmala-txt, body[data-lang="fr"] .basmala-txt { direction: rtl !important; }
    .i18n-translit { margin-top:4px; line-height:1.5 }
    .i18n-translit .az-translit { display:block; font-style:italic; color:var(--gold-dark,#9a7b2e); font-size:.92em }
    .i18n-translit .az-meaning  { display:block; color:var(--muted); font-size:.9em }
  `;
  document.head.appendChild(style);
  const setBodyLang = () => {
    const L = localStorage.getItem('zad_lang') || 'ar';
    if (document.body) document.body.setAttribute('data-lang', L);
  };
  setBodyLang();
  document.addEventListener('DOMContentLoaded', setBodyLang);
})();
