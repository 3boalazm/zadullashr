/* ══════════════════════════════════════════════════════════
   زاد العشر — Complete i18n System (AR / EN)
   ══════════════════════════════════════════════════════════ */

const TRANSLATIONS = {
ar: {
  /* ─ App shell ─────────────────────────────────────────── */
  'brand.name': 'زاد العشر', 'brand.sub': 'أفضل أيام الدنيا',
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
  'about.title':'عن التطبيق','about.sub':'زاد العشر — رفيقك الذكي في أفضل أيام الدنيا',
  'about.dev':'مصطفى أبو العزم',
  'about.dev.title':'مصمم واجهات · مطور تطبيقات ويب · مبتكر تجربة المستخدم',
  'about.contact':'تواصل معي','about.social':'تابعني على',
  'about.app.title':'عن زاد العشر','about.sources':'المصادر الشرعية',
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
};

/* ── Dhikr transliterations ─────────────────────────────────── */
const DHIKR_DB = [
  { ar:'سُبْحَانَ اللَّهِ', translit:'Subḥāna Allāh', en:'Glory be to Allah' },
  { ar:'الْحَمْدُ لِلَّهِ', translit:'Al-Ḥamdu lillāh', en:'All praise is due to Allah' },
  { ar:'لَا إِلَهَ إِلَّا اللَّهُ', translit:"Lā ilāha illa Allāh", en:'There is no god but Allah' },
  { ar:'اللَّهُ أَكْبَرُ', translit:'Allāhu Akbar', en:'Allah is the Greatest' },
  { ar:'سبحان الله', translit:'Subhan Allah', en:'Glory be to Allah' },
  { ar:'الحمد لله', translit:'Alhamdulillah', en:'All praise is to Allah' },
  { ar:'لا إله إلا الله', translit:'La ilaha illa Allah', en:'There is no god but Allah' },
  { ar:'الله أكبر', translit:'Allahu Akbar', en:'Allah is the Greatest' },
  { ar:'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', translit:'Lā ḥawla wa lā quwwata illā billāh', en:'There is no power except with Allah' },
  { ar:'أَسْتَغْفِرُ اللَّهَ', translit:'Astaghfiru Allāh', en:'I seek forgiveness from Allah' },
  { ar:'أستغفر الله', translit:'Astaghfirullah', en:'I seek forgiveness from Allah' },
  { ar:'لا حول ولا قوة إلا بالله', translit:'La hawla wa la quwwata illa billah', en:'No power except with Allah' },
  { ar:'بسم الله الرحمن الرحيم', translit:'Bismillāhi r-raḥmāni r-raḥīm', en:'In the name of Allah, the Most Gracious, the Most Merciful' },
  { ar:'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', translit:'Subḥāna Allāhi wa biḥamdih', en:'Glory be to Allah and praise be to Him' },
];
window.DHIKR_DB = DHIKR_DB;

/* ── i18n Engine ─────────────────────────────────────────────── */
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
    this._updateButtons(lang);
  },

  _updateButtons(lang) {
    const label = lang === 'en' ? 'عربي' : 'EN';
    const tb = document.getElementById('topbar-lang-btn');
    if (tb) tb.textContent = label;
    const sb = document.getElementById('sidebar-lang-val');
    if (sb) sb.textContent = label;
    const ar = document.getElementById('lang-ar-btn');
    const en = document.getElementById('lang-en-btn');
    if (ar) ar.classList.toggle('active', lang === 'ar');
    if (en) en.classList.toggle('active', lang === 'en');
  },

  apply() {
    /* Static data-i18n elements */
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const v = this.t(el.dataset.i18n);
      if (v && v !== el.dataset.i18n) el.textContent = v;
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      el.placeholder = this.t(el.dataset.i18nPh);
    });
    /* Inject transliterations under Arabic dhikr */
    if (this.current === 'en') {
      document.querySelectorAll('.az-arabic,.adhkar-arabic,.tl-dua,.af-ms-dua,.ts-dhikr-text,.dc-arabic').forEach(el => {
        if (el.nextElementSibling?.classList.contains('i18n-translit')) return;
        const ar = el.textContent.trim();
        const match = DHIKR_DB.find(d => ar.includes(d.ar));
        if (!match) return;
        const t = document.createElement('div');
        t.className = 'i18n-translit';
        t.innerHTML = `<span class="az-translit">${match.translit}</span><span class="az-meaning">${match.en}</span>`;
        el.after(t);
      });
    } else {
      document.querySelectorAll('.i18n-translit').forEach(el => el.remove());
    }
  },

  toggle() { this.setLang(this.current === 'ar' ? 'en' : 'ar'); },

  init() {
    document.documentElement.setAttribute('lang', this.current);
    if (this.current === 'en') document.documentElement.setAttribute('dir', 'ltr');
    this.apply();
    this._updateButtons(this.current);
  }
};

window.I18N = I18N;
window.toggleLang = () => I18N.toggle();
document.addEventListener('DOMContentLoaded', () => I18N.init());
