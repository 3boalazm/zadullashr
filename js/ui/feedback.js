/* ═══════════════════════════════════════════════════════════════════════════
   زاد — ui/feedback.js
   ─────────────────────────────────────────────────────────────────────────
   نظام Micro-feedback موحّد: toast, loading, haptics, success
   يحل مشكلة "click بدون رد فعل" — كل action له استجابة مرئية
   ═══════════════════════════════════════════════════════════════════════════ */

const ZadFeedback = (() => {
  'use strict';

  let toastTimer = null;

  /* ── Toast ───────────────────────────────────────────────────────────── */
  function toast(msg, type = 'info', duration = 2600) {
    let el = document.getElementById('zad-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'zad-toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    const icons = { info: 'ℹ️', success: '✅', error: '⚠️', warn: '🔔' };
    el.innerHTML = `<span class="zt-icon">${icons[type] || ''}</span><span>${msg}</span>`;
    el.className = `zad-toast zt-${type} show`;

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), duration);

    /* haptic خفيف */
    if (type === 'success' && navigator.vibrate) navigator.vibrate(20);
    if (type === 'error' && navigator.vibrate) navigator.vibrate([30, 20, 30]);
  }

  /* ── Loading overlay ─────────────────────────────────────────────────── */
  function showLoading(msg = 'جارٍ التحميل...') {
    let el = document.getElementById('zad-loading');
    if (!el) {
      el = document.createElement('div');
      el.id = 'zad-loading';
      el.className = 'zad-loading';
      el.innerHTML = `<div class="zl-box"><div class="zl-spinner"></div><div class="zl-msg"></div></div>`;
      document.body.appendChild(el);
    }
    el.querySelector('.zl-msg').textContent = msg;
    el.classList.add('show');
  }

  function hideLoading() {
    document.getElementById('zad-loading')?.classList.remove('show');
  }

  /* ── Skeleton placeholder ─────────────────────────────────────────────── */
  function skeleton(container, count = 3) {
    if (typeof container === 'string') container = document.getElementById(container);
    if (!container) return;
    container.innerHTML = Array.from({ length: count }, () =>
      `<div class="zad-skel-card">
        <div class="zad-skel zad-skel-line" style="width:60%"></div>
        <div class="zad-skel zad-skel-line" style="width:90%"></div>
        <div class="zad-skel zad-skel-line" style="width:75%"></div>
      </div>`
    ).join('');
  }

  /* ── Success pulse (للإنجازات) ───────────────────────────────────────── */
  function successPulse(element) {
    if (!element) return;
    element.classList.add('zad-success-pulse');
    setTimeout(() => element.classList.remove('zad-success-pulse'), 600);
    if (navigator.vibrate) navigator.vibrate([20, 30, 40]);
  }

  /* ── Button loading state ────────────────────────────────────────────── */
  function buttonLoading(btn, loading = true) {
    if (typeof btn === 'string') btn = document.getElementById(btn);
    if (!btn) return;
    if (loading) {
      btn.dataset.origText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<span class="zad-btn-spinner"></span>';
    } else {
      btn.disabled = false;
      if (btn.dataset.origText) btn.innerHTML = btn.dataset.origText;
    }
  }

  /* ── CSS ─────────────────────────────────────────────────────────────── */
  function injectCSS() {
    if (document.getElementById('zad-feedback-css')) return;
    const s = document.createElement('style');
    s.id = 'zad-feedback-css';
    s.textContent = `
      /* Toast */
      .zad-toast {
        position: fixed; bottom: 92px; left: 50%; transform: translateX(-50%) translateY(20px);
        background: var(--ink,#1a1a18); color: #fff; padding: 12px 20px;
        border-radius: var(--r-full,9999px); font-size: 14px; font-weight: 700;
        display: flex; align-items: center; gap: 8px; z-index: 9900;
        box-shadow: 0 8px 28px rgba(0,0,0,.3); opacity: 0; pointer-events: none;
        max-width: calc(100vw - 32px); transition: opacity .3s, transform .3s;
      }
      .zad-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
      .zad-toast.zt-success { background: var(--green-mid,#1a5d47); }
      .zad-toast.zt-error { background: #b3261e; }
      @media (max-width: 768px) { .zad-toast { bottom: 140px; } }

      /* Loading overlay */
      .zad-loading {
        position: fixed; inset: 0; z-index: 9950; display: flex;
        align-items: center; justify-content: center; background: rgba(0,0,0,.4);
        opacity: 0; pointer-events: none; transition: opacity .25s;
      }
      .zad-loading.show { opacity: 1; pointer-events: auto; }
      .zl-box { background: var(--card,#fff); border-radius: 16px; padding: 24px 32px;
        display: flex; flex-direction: column; align-items: center; gap: 14px; }
      .zl-spinner { width: 36px; height: 36px; border: 3px solid var(--border,#eee);
        border-top-color: var(--green-deep,#0e3b2e); border-radius: 50%;
        animation: zad-spin .7s linear infinite; }
      .zl-msg { font-size: 14px; font-weight: 700; color: var(--ink,#222); }
      @keyframes zad-spin { to { transform: rotate(360deg); } }

      /* Skeleton */
      .zad-skel-card { background: var(--card,#fff); border-radius: 12px;
        padding: 16px; margin-bottom: 10px; border: 1px solid var(--border,#eee); }
      .zad-skel { background: linear-gradient(90deg, var(--border,#eee) 25%,
        var(--sand,#f5f5f0) 50%, var(--border,#eee) 75%);
        background-size: 200% 100%; animation: zad-shimmer 1.4s infinite; border-radius: 6px; }
      .zad-skel-line { height: 14px; margin-bottom: 8px; }
      @keyframes zad-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

      /* Button spinner */
      .zad-btn-spinner { display: inline-block; width: 16px; height: 16px;
        border: 2px solid rgba(255,255,255,.4); border-top-color: #fff;
        border-radius: 50%; animation: zad-spin .6s linear infinite; }

      /* Success pulse */
      .zad-success-pulse { animation: zad-pulse .6s var(--ease-spring,ease); }
      @keyframes zad-pulse { 0%{transform:scale(1)} 40%{transform:scale(1.08)} 100%{transform:scale(1)} }

      @media (prefers-reduced-motion: reduce) {
        .zad-toast, .zad-loading, .zl-spinner, .zad-skel, .zad-btn-spinner, .zad-success-pulse {
          animation: none !important; transition: opacity .15s !important;
        }
      }
    `;
    document.head.appendChild(s);
  }

  function init() {
    injectCSS();
    /* استبدل showToast القديم بالنظام الجديد (متوافق) */
    const oldToast = window.showToast;
    window.showToast = (msg, type) => {
      /* اكتشف النوع من الإيموجي لو مش محدد */
      if (!type) {
        if (/✅|تم|نجح/.test(msg)) type = 'success';
        else if (/⚠️|خطأ|فشل|تعذّر/.test(msg)) type = 'error';
        else type = 'info';
      }
      toast(msg, type);
    };
  }

  return { init, toast, showLoading, hideLoading, skeleton, successPulse, buttonLoading };
})();

window.ZadFeedback = ZadFeedback;
document.addEventListener('DOMContentLoaded', () => ZadFeedback.init());
