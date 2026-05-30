/* ═══════════════════════════════════════════════════════════════════════════
   زاد — ui/daily-hub.js
   ─────────────────────────────────────────────────────────────────────────
   Daily Entry Point — يحل مشكلة "Too many features, not enough guidance"
   كارت ترحيبي يلخّص يوم المستخدم ويوجّهه لأول خطوة (One Tap to Spiritual Action)
   ═══════════════════════════════════════════════════════════════════════════ */

const ZadDailyHub = (() => {
  'use strict';

  /* تحية حسب الوقت */
  function greeting() {
    const h = new Date().getHours();
    if (h < 5)  return { text: 'تهجّد مبارك', icon: '🌙' };
    if (h < 12) return { text: 'صباح الخير', icon: '🌅' };
    if (h < 15) return { text: 'يومك مبارك', icon: '☀️' };
    if (h < 19) return { text: 'مساء الخير', icon: '🌇' };
    return { text: 'ليلة طيبة', icon: '🌙' };
  }

  /* اقتراح الخطوة التالية حسب الوقت والتقدم */
  function suggestedAction() {
    const h = new Date().getHours();
    const st = window.STATE || window.ZadState?.get?.() || {};

    /* أذكار الصباح/المساء حسب الوقت */
    if (h >= 4 && h < 11) {
      return { label: 'ابدأ بأذكار الصباح', href: 'adhkar.html', icon: '🌅' };
    }
    if (h >= 15 && h < 20) {
      return { label: 'ابدأ بأذكار المساء', href: 'adhkar.html', icon: '🌇' };
    }
    /* الورد القرآني */
    if (!st.worship?.quran_done) {
      return { label: 'تابع وردك القرآني', href: 'mushaf.html', icon: '📖' };
    }
    /* التسبيح */
    return { label: 'سبّح الله الآن', href: 'takbeer.html', icon: '📿' };
  }

  /* حساب تقدم اليوم */
  function dayProgress() {
    const st = window.STATE || {};
    const worship = st.worship || {};
    const total = 5; /* أهداف اليوم: ورد، أذكار صباح، أذكار مساء، تسبيح، صدقة */
    const done = Object.values(worship).filter(Boolean).length;
    const pct = Math.min(Math.round((done / total) * 100), 100);
    return { done, total, pct, streak: st.streak || 0 };
  }

  /* بناء الـ Hub */
  function build() {
    const main = document.querySelector('main.main, #main-content');
    if (!main || document.getElementById('zad-daily-hub')) return;

    const g = greeting();
    const action = suggestedAction();
    const prog = dayProgress();

    const hub = document.createElement('div');
    hub.id = 'zad-daily-hub';
    hub.className = 'zad-daily-hub';
    hub.innerHTML = `
      <div class="zdh-top">
        <div class="zdh-greeting">
          <span class="zdh-greet-icon">${g.icon}</span>
          <div>
            <div class="zdh-greet-text">${g.text}</div>
            <div class="zdh-greet-sub">${prog.streak > 0 ? `🔥 ${prog.streak} يوم متتالٍ` : 'ابدأ سلسلتك اليوم'}</div>
          </div>
        </div>
        <div class="zdh-ring" role="img" aria-label="تقدم اليوم ${prog.pct}%">
          <svg viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" class="zdh-ring-bg"/>
            <circle cx="24" cy="24" r="20" class="zdh-ring-fg"
              style="stroke-dasharray:${2*Math.PI*20};stroke-dashoffset:${2*Math.PI*20*(1-prog.pct/100)}"/>
          </svg>
          <span class="zdh-ring-pct">${prog.pct}%</span>
        </div>
      </div>
      <a href="${action.href}" class="zdh-cta">
        <span class="zdh-cta-icon">${action.icon}</span>
        <span class="zdh-cta-text">${action.label}</span>
        <span class="zdh-cta-arrow">←</span>
      </a>
    `;

    /* أدرجه بعد الـ topbar/hijri-bar مباشرة */
    const hijriBar = main.querySelector('.hijri-bar');
    const anchor = hijriBar || main.querySelector('.topbar');
    if (anchor && anchor.nextSibling) {
      main.insertBefore(hub, anchor.nextSibling);
    } else {
      main.prepend(hub);
    }
  }

  function injectCSS() {
    if (document.getElementById('zdh-css')) return;
    const s = document.createElement('style');
    s.id = 'zdh-css';
    s.textContent = `
      .zad-daily-hub {
        background: linear-gradient(135deg, var(--green-deep,#0e3b2e), var(--green-mid,#1a5d47));
        border-radius: var(--r-xl,20px); padding: 20px; margin: 16px 0 20px;
        color: #fff; box-shadow: 0 8px 28px rgba(14,59,46,.3);
        position: relative; overflow: hidden;
      }
      .zad-daily-hub::before {
        content: ''; position: absolute; top: -40%; left: -10%;
        width: 200px; height: 200px; border-radius: 50%;
        background: radial-gradient(circle, rgba(201,161,74,.18), transparent 70%);
      }
      .zdh-top { display: flex; align-items: center; justify-content: space-between;
        margin-bottom: 16px; position: relative; z-index: 1; }
      .zdh-greeting { display: flex; align-items: center; gap: 12px; }
      .zdh-greet-icon { font-size: 36px; line-height: 1; }
      .zdh-greet-text { font-size: 19px; font-weight: 900; }
      .zdh-greet-sub { font-size: 12px; opacity: .85; margin-top: 2px; }
      .zdh-ring { position: relative; width: 56px; height: 56px; flex-shrink: 0; }
      .zdh-ring svg { width: 56px; height: 56px; transform: rotate(-90deg); }
      .zdh-ring-bg { fill: none; stroke: rgba(255,255,255,.2); stroke-width: 4; }
      .zdh-ring-fg { fill: none; stroke: var(--gold-300,#e6c97a); stroke-width: 4;
        stroke-linecap: round; transition: stroke-dashoffset 1s var(--ease-out,ease); }
      .zdh-ring-pct { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
        font-size: 13px; font-weight: 800; }
      .zdh-cta { display: flex; align-items: center; gap: 12px;
        background: rgba(255,255,255,.15); backdrop-filter: blur(8px);
        border-radius: var(--r-md,12px); padding: 14px 16px; text-decoration: none;
        color: #fff; position: relative; z-index: 1;
        transition: background .2s, transform .2s; min-height: 44px;
        -webkit-tap-highlight-color: transparent; }
      .zdh-cta:hover { background: rgba(255,255,255,.25); transform: translateX(-3px); }
      .zdh-cta:active { transform: scale(.98); }
      .zdh-cta-icon { font-size: 24px; }
      .zdh-cta-text { flex: 1; font-size: 15px; font-weight: 800; }
      .zdh-cta-arrow { font-size: 18px; opacity: .8; }
      @media (prefers-reduced-motion: reduce) {
        .zdh-ring-fg, .zdh-cta { transition: none !important; }
      }
    `;
    document.head.appendChild(s);
  }

  function init() {
    /* الصفحة الرئيسية فقط */
    const page = window.location.pathname.split('/').pop() || 'index.html';
    if (page !== 'index.html' && page !== '') return;
    injectCSS();
    /* انتظر STATE */
    setTimeout(build, 300);
  }

  return { init, build, dayProgress, suggestedAction };
})();

window.ZadDailyHub = ZadDailyHub;
document.addEventListener('DOMContentLoaded', () => ZadDailyHub.init());
