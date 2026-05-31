# 🧰 دليل أدوات الاختبار — زاد العشر
**مخصّص لمشروعك:** PWA · Vanilla JS · Multi-page · Vercel · Service Worker

> القاعدة: ابدأ بالمجاني والمدمج في المتصفح، وما تروحش لأدوات احترافية إلا لو احتجت. معظم اللي محتاجه موجود في **Chrome DevTools** اللي في إيدك دلوقتي.

---

## 0. الأداة الأهم: Chrome DevTools (مجاني، مدمج)

افتحها بـ **F12** أو **Ctrl+Shift+I**. دي بتغطّي 70% من اختباراتك.

| التبويب | بيعمل إيه |
|---------|----------|
| **Lighthouse** | تقييم Performance/PWA/Accessibility/SEO |
| **Performance** | تسجيل session + كشف الـ lag |
| **Memory** | كشف الـ memory leaks (Heap snapshots) |
| **Network** | محاكاة بطء/قطع الإنترنت |
| **Application** | فحص Service Worker + localStorage + الكاش |
| **Console** | الأخطاء الحقيقية وقت التشغيل |

---

## 1. Performance + Core Web Vitals

### 🥇 Lighthouse (الأسهل والأهم)
**مدمج في Chrome DevTools** — مش محتاج تثبيت.

**الطريقة:**
1. افتح الموقع المنشور (zadullashr.vercel.app)
2. F12 → تبويب **Lighthouse**
3. اختر **Mobile** + كل الفئات (Performance, PWA, Accessibility, Best Practices, SEO)
4. **Analyze page load**
5. هيديك تقرير بأرقام حقيقية + اقتراحات إصلاح

**الهدف:** Performance > 80، PWA يعدّي كل الـ checks.

### 🥈 PageSpeed Insights (online، أدق للموبايل)
الرابط: `pagespeed.web.dev` — حط الـ URL بتاعك.
**ميزته:** بيقيس بـ **بيانات حقيقية من مستخدمين فعليين** (CrUX) + lab data. بيديك INP و LCP و CLS الحقيقيين.

### 🥉 WebPageTest (للمحترفين)
`webpagetest.org` — اختبار من مواقع جغرافية مختلفة + أجهزة حقيقية + فيديو للتحميل. مجاني مع حدود.

---

## 2. Memory Leaks (الأخطر)

### Chrome DevTools — Memory tab (الطريقة الصح)
**الطريقة خطوة بخطوة:**
1. افتح الموقع → F12 → تبويب **Memory**
2. اختر **Heap snapshot** → خد snapshot أول (سمّيه "البداية")
3. استخدم التطبيق بقوة 5-10 دقائق (تنقّل، تسبيح، أذكار، افتح/اقفل الإذاعة)
4. ارجع → خد snapshot تاني
5. **قارن:** من القائمة فوق اختر "Comparison" بين الاتنين
6. لو فيه objects بتزيد باستمرار وما بتتحذفش = **leak**

**علامة الخطر:** الـ JS Heap Size بيزيد باستمرار وما بيرجعش حتى بعد ما تضغط 🗑️ (force garbage collection).

### Performance Monitor (مراقبة لحظية)
F12 → اضغط **Esc** → من القائمة (⋮) → **Performance monitor**
بيوريك live: JS heap, DOM nodes, **Event listeners** — راقبهم وانت بتستخدم. لو الـ listeners بتزيد بلا توقف = leak.

**الأماكن المشكوك فيها في مشروعك:** صفحة الإذاعة (audio + intervals) و GSAP animations.

---

## 3. Chaos Testing (قطع الإنترنت، بطء)

### Chrome DevTools — Network tab
**محاكاة قطع الإنترنت:**
1. F12 → **Network** → القائمة المنسدلة (No throttling)
2. اختر **Offline** — جرّب التطبيق
3. أو **Slow 3G** لاختبار البطء
4. أو **Custom** لسرعات محددة

**محاكاة API بطيء/فاشل:**
- تبويب **Network** → كليك يمين على أي request → **Block request URL**
- جرّب تبلوك `api.aladhan.com` وشوف هل المواقيت بتظهر من الكاش

### الـ Service Worker testing
F12 → **Application** → **Service Workers**:
- **Offline** checkbox — يحاكي عدم الاتصال
- **Update on reload** — يجبر تحديث الـ SW
- **Unregister** — لمسح الـ SW القديم (اللي قلتلك عليه قبل كده)

---

## 4. Stress Testing (التسبيح، الضغط)

### للـ vanilla JS — الأسهل: Console script
بدل ما تضغط 10000 مرة بإيدك، شغّل ده في الـ **Console**:

```javascript
// محاكاة 10000 ضغطة تسبيح
console.time('stress');
const ring = document.querySelector('.ring, #tasbih-ring, [onclick*="doCount"]');
for (let i = 0; i < 10000; i++) { ring?.click(); }
console.timeEnd('stress');
// شوف الوقت — لو أقل من ثانية = ممتاز
```

راقب وانت بتعمل ده: تبويب **Performance** بيسجّل، وشوف لو فيه frames بتسقط (jank).

### Artillery (لو عايز تختبر الـ /api/gemini تحت ضغط)
أداة CLI مجانية لـ load testing على الـ APIs:
```bash
npm install -g artillery
artillery quick --count 50 --num 10 https://zadullashr.vercel.app/api/gemini
```
بيبعت 500 request ويقولك متوسط الاستجابة + الفشل. **مهم:** Vercel Edge عنده حدود، فمتبالغش عشان ما تستهلكش الـ quota.

---

## 5. End-to-End Testing (أتمتة — لو عايز تأتمت الـ regression)

### 🥇 Playwright (الأنسب لمشروعك — مجاني من Microsoft)
**ليه:** يدعم vanilla JS، multi-page، PWA، offline mode، موبايل emulation. أفضل من Cypress لمشروعك لأنه أسرع ويدعم RTL وعدة متصفحات.

**التثبيت والاستخدام:**
```bash
npm init playwright@latest
```
مثال test لمشروعك:
```javascript
const { test, expect } = require('@playwright/test');

test('الأذكار تفتح وتعمل', async ({ page }) => {
  await page.goto('https://zadullashr.vercel.app/adhkar.html');
  await page.click('.adh-head >> nth=0');  // افتح أول قسم
  await expect(page.locator('.adh-body').first()).toBeVisible();
});

test('التطبيق يعمل offline', async ({ page, context }) => {
  await page.goto('https://zadullashr.vercel.app/');
  await context.setOffline(true);  // اقطع النت
  await page.goto('https://zadullashr.vercel.app/adhkar.html');
  await expect(page.locator('#adhkar-accordion')).toBeVisible();
});
```
**ميزة قوية:** `npx playwright codegen URL` — بيسجّل اللي بتعمله ويحوّله كود test تلقائياً.

### 🥈 Cypress (أسهل للمبتدئين، واجهة أحلى)
`npm install cypress` — واجهة رسومية بتوريك الـ test بيحصل live. أبطأ من Playwright ودعم الموبايل أضعف، بس أسهل في التعلّم.

---

## 6. Mobile + RTL Testing

### Chrome DevTools — Device Mode
F12 → أيقونة الموبايل 📱 (Ctrl+Shift+M):
- اختر أجهزة: iPhone SE (375px), Galaxy (360px), iPad
- جرّب **320px** (أصغر شاشة) — أكتر مكان بيكسر
- دوّر الشاشة (landscape)

### BrowserStack (أجهزة حقيقية — مجاني محدود)
`browserstack.com` — يشغّل موقعك على **أجهزة iOS/Android حقيقية** في السحابة. مهم لأن محاكي الـ DevTools مش 100% زي الجهاز الحقيقي. خطة مجانية محدودة.

---

## 7. Accessibility (إمكانية الوصول)

### axe DevTools (إضافة مجانية)
ثبّت extension **axe DevTools** في Chrome → F12 → تبويب axe → Scan.
بيكشف مشاكل: contrast، ARIA، alt نصوص ناقصة، tab order. مهم للـ WCAG.

### Lighthouse Accessibility
نفس Lighthouse فوق — فيه قسم Accessibility بيديك score + مشاكل.

---

## 📋 خطة عملية مرتّبة (ابدأ من هنا)

**المرحلة 1 — فوري (15 دقيقة، صفر تثبيت):**
1. Lighthouse على الموقع المنشور (Mobile)
2. Device Mode على 320px + 375px
3. Network → Offline → جرّب الأذكار والمواقيت

**المرحلة 2 — متوسط (ساعة):**
4. Memory snapshots قبل/بعد 10 دقائق استخدام
5. Console stress script للتسبيح
6. PageSpeed Insights للأرقام الحقيقية

**المرحلة 3 — لو عايز تأتمت (يوم):**
7. Playwright لكتابة 10-15 test للميزات الأساسية
8. شغّلهم بعد كل تحديث (regression تلقائي)

---

## ملاحظات مهمة لمشروعك تحديداً

- **الـ Service Worker** بيخبّي بيانات قديمة — قبل أي اختبار اعمل **Unregister + Clear site data** عشان تختبر النسخة الحقيقية.
- **`/api/gemini`** — لو هتعمل load testing، خلّي بالك من حدود Vercel Edge (مش مجاني للاستهلاك العالي).
- **الموبايل الحقيقي > المحاكي** — خصوصاً للـ PWA install و البوصلة و الإشعارات، دي مابتشتغلش صح في المحاكي.
- **مفيش backend معقّد** — فمش محتاج أدوات DB testing. تركيزك على Frontend + الـ APIs الخارجية + الـ offline.
