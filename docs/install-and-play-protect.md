# حل تحذير Google Play Protect: «Unsafe app blocked / built for an older version of Android»

## ما سبب التحذير؟
هذا التحذير **ليس مشكلةً في كود التطبيق أو محتواه** — إنه ظهر لأن الـ PWA تمّ **تغليفه في ملف APK** بأداة تغليف (PWABuilder / Bubblewrap / TWA) باستخدام **`targetSdkVersion` قديم**. منذ أغسطس 2024 يحجب Play Protect أي APK يستهدف إصدار أندرويد قديماً (أقل من Android 13 / API 33). الرسالة الحرفية: «built for an older version of Android and doesn't include the latest privacy protections».

## الحل الأفضل (بلا تغليف) — تثبيت WebAPK عبر Chrome
أبسط وأأمن طريقة، ولا تُطلق تحذير Play Protect إطلاقاً:
1. افتح الموقع في **Chrome على أندرويد** (مثلاً `https://zadullashr.web.app`).
2. القائمة (⋮) → **Add to Home screen / Install app**.
3. Chrome يولّد **WebAPK** تلقائياً باستخدام أحدث `targetSdkVersion` الخاص به — فلا يظهر التحذير، ويعمل أوفلاين وكتطبيقٍ كامل.

> هذا هو المسار المُوصى به للنشر السريع. المانيفست هنا مكتمل (id/scope/icons/shortcuts) لدعم WebAPK.

## إن كنت تُصدِّر APK فعلاً (Bubblewrap / PWABuilder)
يجب رفع إصدار الاستهداف في إعدادات التغليف:

**Bubblewrap** — في `twa-manifest.json`:
```
"targetSdkVersion": 35,
"minSdkVersion": 23
```
ثم: `bubblewrap build` لإعادة التوليد.

**PWABuilder** — حمّل الحزمة من جديد؛ النسخة الحالية تستهدف Android 14/15 افتراضياً. تأكّد في `build.gradle` المُولَّد:
```
compileSdkVersion 35
targetSdkVersion 35
```

**عام:** أعد توقيع الـ APK بمفتاحك، وارفع نسخةً جديدة. بعد رفع `targetSdkVersion` لـ 33+ يختفي حجب Play Protect.

## ملاحظات
- التطبيق **بلا أيِّ SDK إعلاني أو تتبّع** (سبب آخر شائع لتحذيرات Play Protect — غير موجود هنا).
- للنشر على متجر Play لاحقاً: استخدم **Android App Bundle (.aab)** بـ `targetSdkVersion` حديث.
