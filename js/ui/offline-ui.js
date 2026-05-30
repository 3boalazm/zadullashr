/* ═══════════════════════════════════════════════════════════════════════════
   زاد — ui/offline-ui.js
   ─────────────────────────────────────────────────────────────────────────
   كشف الاتصال + Offline fallback UI
   - بانر "لا يوجد اتصال" عند انقطاع النت
   - تعطيل ذكي للميزات التي تحتاج إنترنت (AI، الإذاعة، المزامنة)
   ═══════════════════════════════════════════════════════════════════════════ */

const ZadOffline = (() => {
  'use strict';

  /* الميزات التي تحتاج إنترنت */
  const ONLINE_ONLY = {
    'ai.html':          'المساعد الذكي يحتاج اتصالاً بالإنترنت',
    'Quran-radio.HTML': 'الإذاعة تحتاج اتصالاً بالإنترنت',
    'playlist.html':    'البلاي ليست تحتاج اتصالاً بالإنترنت',
  };

  let isOnline = navigator.onLine;

  /* ── بانر الحالة ─────────────────────────────────────────────────────── */
  function showBanner(online) {
    let banner = document.getElementById('zad-offline-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'zad-offline-banner';
      banner.setAttribute('role', 'status');
      document.body.appendChild(banner);
    }
    if (online) {
      banner.className = 'zad-offline-banner online';
      banner.innerHTML = '<span>✅</span><span>عاد الاتصال بالإنترنت</span>';
      setTimeout(() => banner.classList.remove('show'), 2500);
    } else {
      banner.className = 'zad-offline-banner offline show';
      banner.innerHTML = '<span>📡</span><span>لا يوجد اتصال — المحتوى المحفوظ متاح</span>';
    }
    requestAnimationFrame(() => banner.classList.add('show'));
  }

  /* ── تعطيل الميزات الأونلاين ──────────────────────────────────────────── */
  function blockOnlineFeatures(offline) {
    /* عطّل روابط الميزات الأونلاين في الـ nav والصفحة */
    Object.keys(ONLINE_ONLY).forEach(href => {
      document.querySelectorAll(`a[href="${href}"]`).forEach(link => {
        if (offline) {
          link.classList.add('zad-disabled-offline');
          link.dataset.offlineMsg = ONLINE_ONLY[href];
          link.addEventListener('click', preventOfflineNav);
        } else {
          link.classList.remove('zad-disabled-offline');
          link.removeEventListener('click', preventOfflineNav);
        }
      });
    });

    /* لو المستخدم في صفحة أونلاين أصلاً وقطع النت */
    const page = window.location.pathname.split('/').pop();
    if (offline && ONLINE_ONLY[page]) {
      showFeatureBlock(ONLINE_ONLY[page]);
    }
  }

  function preventOfflineNav(e) {
    e.preventDefault();
    const msg = e.currentTarget.dataset.offlineMsg || 'هذه الميزة تحتاج إنترنت';
    if (window.ZadFeedback) ZadFeedback.toast(msg, 'warn');
    else if (window.showToast) showToast('📡 ' + msg);
  }

  function showFeatureBlock(msg) {
    if (document.getElementById('zad-feature-block')) return;
    const block = document.createElement('div');
    block.id = 'zad-feature-block';
    block.className = 'zad-feature-block';
    block.innerHTML = `
      <div class="zfb-icon">📡</div>
      <div class="zfb-title">لا يوجد اتصال بالإنترنت</div>
      <div class="zfb-msg">${msg}</div>
      <button class="zfb-btn" onclick="location.href='index.html'">العودة للرئيسية</button>
    `;
    document.body.appendChild(block);
  }

  /* ── CSS ─────────────────────────────────────────────────────────────── */
  function injectCSS() {
    if (document.getElementById('zad-offline-css')) return;
    const s = document.createElement('style');
    s.id = 'zad-offline-css';
    s.textContent = `
      .zad-offline-banner {
        position: fixed; top: 0; left: 0; right: 0; z-index: 9990;
        display: flex; align-items: center; justify-content: center; gap: 8px;
        padding: 10px 16px; font-size: 13px; font-weight: 700; color: #fff;
        transform: translateY(-100%); transition: transform .3s var(--ease-out,ease);
        padding-top: calc(10px + env(safe-area-inset-top, 0px));
      }
      .zad-offline-banner.show { transform: translateY(0); }
      .zad-offline-banner.offline { background: #b3261e; }
      .zad-offline-banner.online { background: var(--green-mid,#1a5d47); }

      .zad-disabled-offline { opacity: .45; position: relative; }
      .zad-disabled-offline::after {
        content: '📡'; position: absolute; top: 4px; left: 4px; font-size: 11px;
      }

      .zad-feature-block {
        position: fixed; inset: 0; z-index: 9980; background: var(--bg,#f5f4f0);
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        gap: 14px; padding: 32px; text-align: center;
      }
      .zfb-icon { font-size: 56px; }
      .zfb-title { font-size: 20px; font-weight: 900; color: var(--ink,#222); }
      .zfb-msg { font-size: 14px; color: var(--muted,#888); max-width: 320px; line-height: 1.7; }
      .zfb-btn { margin-top: 12px; padding: 12px 28px; border-radius: 12px; border: none;
        background: var(--green-deep,#0e3b2e); color: #fff; font-family: inherit;
        font-size: 15px; font-weight: 700; cursor: pointer; min-height: 44px; }

      @media (prefers-reduced-motion: reduce) {
        .zad-offline-banner { transition: none !important; }
      }
    `;
    document.head.appendChild(s);
  }

  /* ── Event handlers ──────────────────────────────────────────────────── */
  function handleOnline() {
    isOnline = true;
    showBanner(true);
    blockOnlineFeatures(false);
    /* أزل feature block لو موجود */
    document.getElementById('zad-feature-block')?.remove();
  }

  function handleOffline() {
    isOnline = false;
    showBanner(false);
    blockOnlineFeatures(true);
  }

  function init() {
    injectCSS();
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    /* الحالة الأولية */
    if (!navigator.onLine) {
      setTimeout(handleOffline, 500);
    }
  }

  return { init, isOnline: () => isOnline };
})();

window.ZadOffline = ZadOffline;
document.addEventListener('DOMContentLoaded', () => ZadOffline.init());
