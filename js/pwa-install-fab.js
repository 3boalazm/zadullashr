/**
 * pwa-install-fab.js — زرار تثبيت التطبيق العائم
 * ملف مستقل بالكامل: يحقن الـ CSS والـ HTML تلقائيًا
 * لا يحتاج أي تعديل في صفحات HTML
 *
 * كيف يشتغل:
 *  - يستخدم window.deferredInstall من app.js لو موجود
 *  - أو يشتغل مستقل بالكامل لو شُغِّل بدون app.js
 *  - يختفي تلقائيًا لو التطبيق مثبّت (standalone mode)
 */
(function () {
  'use strict';

  /* ── 1. لو التطبيق مثبّت بالفعل — لا تفعل شيئًا ── */
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
  if (isStandalone) return;

  /* ── 2. تحقق لو الزرار اتعمل قبل كده (لو الملف اتحمل مرتين) ── */
  if (document.getElementById('pwa-fab')) return;

  /* ── 3. حقن الـ CSS ── */
  const style = document.createElement('style');
  style.textContent = `
    #pwa-fab {
      position: fixed;
      bottom: 88px;
      /* دايمًا على اليسار في RTL */
      left: 20px;
      right: auto;
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--green-deep, #0e3b2e);
      color: #fff;
      border: none;
      border-radius: 50px;
      padding: 13px 20px 13px 16px;
      font-family: 'IBM Plex Sans Arabic', 'Tajawal', sans-serif;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 24px rgba(14,59,46,.45), 0 1px 4px rgba(0,0,0,.2);
      transition: transform .2s ease, box-shadow .2s ease, opacity .3s ease;
      opacity: 0;
      transform: translateY(16px) scale(.95);
      pointer-events: none;
      white-space: nowrap;
      direction: rtl;
      text-align: right;
    }
    #pwa-fab.fab-visible {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }
    #pwa-fab:hover {
      transform: translateY(-2px) scale(1.03);
      box-shadow: 0 8px 32px rgba(14,59,46,.55);
    }
    #pwa-fab:active {
      transform: scale(.97);
    }
    #pwa-fab .fab-icon {
      font-size: 20px;
      line-height: 1;
      flex-shrink: 0;
    }
    #pwa-fab .fab-text {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }
    #pwa-fab .fab-title {
      font-size: 13px;
      font-weight: 700;
      line-height: 1.2;
    }
    #pwa-fab .fab-sub {
      font-size: 11px;
      opacity: .75;
      font-weight: 400;
    }
    #pwa-fab-close {
      position: absolute;
      top: -8px;
      left: -8px;
      width: 22px;
      height: 22px;
      background: rgba(0,0,0,.55);
      border: none;
      border-radius: 50%;
      color: #fff;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      padding: 0;
      transition: background .15s;
      z-index: 1;
    }
    #pwa-fab-close:hover { background: rgba(0,0,0,.8); }

    /* iOS modal */
    #pwa-ios-modal {
      position: fixed;
      inset: 0;
      z-index: 10000;
      background: rgba(0,0,0,.6);
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding: 16px;
      opacity: 0;
      pointer-events: none;
      transition: opacity .25s ease;
    }
    #pwa-ios-modal.modal-open {
      opacity: 1;
      pointer-events: auto;
    }
    #pwa-ios-modal-inner {
      background: var(--bg, #fff);
      color: var(--ink, #1a1a1a);
      border-radius: 20px;
      padding: 24px;
      width: 100%;
      max-width: 400px;
      text-align: center;
      font-family: 'IBM Plex Sans Arabic', 'Tajawal', sans-serif;
      direction: rtl;
      box-shadow: 0 -4px 40px rgba(0,0,0,.3);
    }
    #pwa-ios-modal-inner h3 {
      margin: 0 0 8px;
      font-size: 17px;
      font-weight: 700;
    }
    #pwa-ios-modal-inner p {
      margin: 0 0 20px;
      font-size: 14px;
      opacity: .75;
      line-height: 1.7;
    }
    #pwa-ios-modal-inner .ios-steps {
      background: var(--sand, #f5f0e8);
      border-radius: 12px;
      padding: 14px 16px;
      text-align: right;
      font-size: 14px;
      line-height: 2;
      margin-bottom: 16px;
    }
    #pwa-ios-modal-close {
      width: 100%;
      padding: 12px;
      background: var(--green-deep, #0e3b2e);
      color: #fff;
      border: none;
      border-radius: 12px;
      font-family: inherit;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
    }

    /* تكيّف مع الشاشات الصغيرة */
    @media (max-width: 400px) {
      #pwa-fab { bottom: 80px; left: 12px; padding: 11px 16px 11px 12px; }
      #pwa-fab .fab-sub { display: none; }
    }
  `;
  document.head.appendChild(style);

  /* ── 4. حقن الـ FAB ── */
  const fab = document.createElement('button');
  fab.id = 'pwa-fab';
  fab.setAttribute('aria-label', 'تثبيت التطبيق');
  fab.innerHTML = `
    <button id="pwa-fab-close" aria-label="إغلاق">✕</button>
    <span class="fab-icon">📲</span>
    <span class="fab-text">
      <span class="fab-title">ثبّت التطبيق</span>
      <span class="fab-sub">يعمل بدون إنترنت</span>
    </span>
  `;
  document.body.appendChild(fab);

  /* ── 5. iOS modal ── */
  const iosModal = document.createElement('div');
  iosModal.id = 'pwa-ios-modal';
  iosModal.innerHTML = `
    <div id="pwa-ios-modal-inner">
      <h3>📲 أضف التطبيق لشاشتك</h3>
      <p>ثبّت زاد العشر مجانًا بدون متجر تطبيقات</p>
      <div class="ios-steps">
        1️⃣ اضغط على زر المشاركة <strong>⬆️</strong><br>
        2️⃣ اختر <strong>"إضافة إلى الشاشة الرئيسية"</strong><br>
        3️⃣ اضغط <strong>إضافة</strong> ✅
      </div>
      <button id="pwa-ios-modal-close">فهمت، شكرًا!</button>
    </div>
  `;
  document.body.appendChild(iosModal);

  /* ── 6. منطق الظهور والإخفاء ── */
  const DISMISS_KEY = 'pwa_fab_dismissed';

  function showFab() {
    /* لو المستخدم أغلقه من قبل — لا تعرضه في نفس الجلسة */
    if (sessionStorage.getItem(DISMISS_KEY)) return;
    setTimeout(() => fab.classList.add('fab-visible'), 1500);
  }

  function hideFab() {
    fab.classList.remove('fab-visible');
  }

  /* ── زر الإغلاق ── */
  document.getElementById('pwa-fab-close').addEventListener('click', function (e) {
    e.stopPropagation();
    hideFab();
    sessionStorage.setItem(DISMISS_KEY, '1');
  });

  /* ── iOS modal close ── */
  document.getElementById('pwa-ios-modal-close').addEventListener('click', function () {
    iosModal.classList.remove('modal-open');
    hideFab();
    sessionStorage.setItem(DISMISS_KEY, '1');
  });

  /* ── 7. كشف النوع: Android/Chrome vs iOS ── */
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  /* ── 8. Android/Chrome — beforeinstallprompt ── */
  let _deferredEvent = null;

  function handleInstallPrompt(e) {
    e.preventDefault();
    _deferredEvent = e;
    /* لو app.js موجود، شارك معه الـ event */
    if (typeof window !== 'undefined') window._pwaFabEvent = e;
    showFab();
  }

  /* استمع للـ event مباشرة ── */
  window.addEventListener('beforeinstallprompt', handleInstallPrompt);

  /* لو app.js سبقنا وخزّن deferredInstall، استخدمه ── */
  if (window.deferredInstall) {
    _deferredEvent = window.deferredInstall;
    showFab();
  }

  /* ── iOS Safari ── */
  if (isIOS && isSafari) {
    showFab();
  }

  /* ── 9. النقر على الزرار ── */
  fab.addEventListener('click', function (e) {
    /* تجاهل لو النقر على زر الإغلاق */
    if (e.target.id === 'pwa-fab-close') return;

    /* Android/Chrome */
    const prompt = _deferredEvent || window.deferredInstall || null;
    if (prompt) {
      prompt.prompt();
      prompt.userChoice.then(function (result) {
        if (result.outcome === 'accepted') {
          hideFab();
          if (typeof showToast === 'function') showToast('✅ تم تثبيت التطبيق!');
        }
        _deferredEvent = null;
        if (window.deferredInstall !== undefined) window.deferredInstall = null;
      });
      return;
    }

    /* iOS Safari */
    if (isIOS && isSafari) {
      iosModal.classList.add('modal-open');
      return;
    }

    /* Fallback */
    if (typeof showToast === 'function') {
      showToast('📲 افتح القائمة ← "إضافة للشاشة الرئيسية"');
    }
  });

  /* ── 10. اختفاء تلقائي لو اتثبّت ── */
  window.matchMedia('(display-mode: standalone)').addEventListener('change', function (e) {
    if (e.matches) hideFab();
  });

})();
