/* ═══════════════════════════════════════════════════════════════════════════
   زاد — ui/design-tokens.js
   Design System 2026 — Tokens + Components + Utilities
   ─────────────────────────────────────────────────────────────────────────
   يوسّع design-system.js الحالي بـ:
   - Design tokens كاملة (CSS custom properties)
   - Component builder (Card, Badge, Toast, Modal, Button)
   - Typography scale
   - Motion system (Calm UX)
   - Accessibility utilities
   ═══════════════════════════════════════════════════════════════════════════ */

const ZadDesign = (() => {
  'use strict';

  /* ── Tokens ─────────────────────────────────────────────────────────────
     جميع القيم مُعرَّفة هنا ومُطبَّقة كـ CSS custom properties
     على :root — يمكن تجاوزها بـ data-theme             */
  const TOKENS = {
    light: {
      /* Greens */
      '--green-deep':    '#0e3b2e',
      '--green-mid':     '#1a5d47',
      '--green-soft':    '#2a7a5e',
      '--green-pale':    '#e8f4ef',
      '--green-faint':   '#f0f9f5',
      /* Golds */
      '--gold-500':      '#c9a14a',
      '--gold-300':      '#e6c97a',
      '--gold-100':      '#fdf5e6',
      /* Neutrals */
      '--bg':            '#f5f4f0',
      '--card':          '#ffffff',
      '--sand':          '#faf9f6',
      '--border':        '#e5e4de',
      '--ink':           '#1a1a18',
      '--muted':         '#757570',
      '--subtle':        '#b0b0aa',
      /* Semantic */
      '--success':       '#30d158',
      '--warning':       '#ffba3b',
      '--error':         '#ff453a',
      '--info':          '#34aadc',
      /* Typography */
      '--font-body':     "'IBM Plex Sans Arabic', 'Tajawal', sans-serif",
      '--font-quran':    "'Amiri', 'Scheherazade New', serif",
      '--text-xs':       '11px',
      '--text-sm':       '13px',
      '--text-base':     '15px',
      '--text-lg':       '17px',
      '--text-xl':       '20px',
      '--text-2xl':      '24px',
      '--text-3xl':      '30px',
      /* Spacing (4px grid) */
      '--sp-1': '4px',  '--sp-2': '8px',  '--sp-3': '12px',
      '--sp-4': '16px', '--sp-5': '20px', '--sp-6': '24px',
      '--sp-8': '32px', '--sp-10': '40px','--sp-12': '48px',
      /* Radius */
      '--r-sm':  '8px',  '--r-md': '12px', '--r-lg': '16px',
      '--r-xl':  '20px', '--r-2xl': '24px','--r-full': '9999px',
      /* Shadow */
      '--shadow-sm':  '0 1px 3px rgba(0,0,0,.08)',
      '--shadow-md':  '0 4px 12px rgba(0,0,0,.10)',
      '--shadow-lg':  '0 8px 28px rgba(0,0,0,.14)',
      '--shadow-xl':  '0 16px 48px rgba(0,0,0,.18)',
      /* Motion (Calm UX) */
      '--ease-out':   'cubic-bezier(0.4, 0, 0.2, 1)',
      '--ease-spring':'cubic-bezier(0.34, 1.56, 0.64, 1)',
      '--dur-fast':   '150ms',
      '--dur-base':   '250ms',
      '--dur-slow':   '400ms',
    },
    dark: {
      '--bg':         '#0a1410',
      '--card':       '#141f1a',
      '--sand':       '#1a2820',
      '--border':     '#2a3830',
      '--ink':        '#f0f0ea',
      '--muted':      '#8a9a90',
      '--subtle':     '#4a5a50',
      '--green-pale': '#0e2a1e',
      '--green-faint':'#0a1e16',
    },
    oled: {
      '--bg':   '#000000',
      '--card': '#0a0f0d',
      '--sand': '#0f1a14',
    },
  };

  /* ── طبّق الـ tokens ─────────────────────────────────────────────────── */
  function applyTokens(theme = 'light') {
    const root = document.documentElement;
    const base = TOKENS.light;
    const override = TOKENS[theme] || {};
    const merged = { ...base, ...override };
    Object.entries(merged).forEach(([k, v]) => root.style.setProperty(k, v));
  }

  /* ── مراقب الـ theme ─────────────────────────────────────────────────── */
  function watchTheme() {
    const obs = new MutationObserver(muts => {
      muts.forEach(m => {
        if (m.attributeName === 'data-theme') {
          applyTokens(document.documentElement.getAttribute('data-theme') || 'light');
        }
      });
    });
    obs.observe(document.documentElement, { attributes: true });
  }

  /* ── Component Builders ──────────────────────────────────────────────── */
  const Components = {
    /* بطاقة */
    card({ title, body, icon = '', color = 'var(--green-deep)', href = null, onClick = null } = {}) {
      const el = document.createElement(href ? 'a' : 'div');
      el.className = 'zd-card';
      if (href) el.href = href;
      if (onClick) el.onclick = onClick;
      el.innerHTML = `
        ${icon ? `<div class="zd-card-icon" style="color:${color}">${icon}</div>` : ''}
        ${title ? `<div class="zd-card-title">${title}</div>` : ''}
        ${body  ? `<div class="zd-card-body">${body}</div>` : ''}`;
      return el;
    },

    /* شارة */
    badge({ text, color = 'var(--green-deep)', bg = 'var(--green-pale)' } = {}) {
      const el = document.createElement('span');
      el.className = 'zd-badge';
      el.textContent = text;
      el.style.cssText = `color:${color};background:${bg}`;
      return el;
    },

    /* زرار */
    button({ text, variant = 'primary', icon = '', onClick = null, disabled = false } = {}) {
      const el = document.createElement('button');
      el.className = `zd-btn zd-btn-${variant}`;
      el.disabled = disabled;
      el.innerHTML = `${icon ? `<span>${icon}</span>` : ''}<span>${text}</span>`;
      if (onClick) el.onclick = onClick;
      return el;
    },

    /* مودال */
    modal({ title, body, onConfirm = null, confirmText = 'تأكيد', cancelText = 'إلغاء' } = {}) {
      const wrap = document.createElement('div');
      wrap.className = 'zd-modal-wrap';
      wrap.innerHTML = `
        <div class="zd-modal-backdrop"></div>
        <div class="zd-modal" role="dialog" aria-modal="true">
          <div class="zd-modal-header">${title}</div>
          <div class="zd-modal-body">${body}</div>
          <div class="zd-modal-footer">
            <button class="zd-btn zd-btn-ghost" onclick="this.closest('.zd-modal-wrap').remove()">${cancelText}</button>
            ${onConfirm ? `<button class="zd-btn zd-btn-primary" id="zd-modal-confirm">${confirmText}</button>` : ''}
          </div>
        </div>`;
      if (onConfirm) {
        wrap.querySelector('#zd-modal-confirm').onclick = () => { onConfirm(); wrap.remove(); };
      }
      wrap.querySelector('.zd-modal-backdrop').onclick = () => wrap.remove();
      document.body.appendChild(wrap);
      requestAnimationFrame(() => wrap.classList.add('open'));
      return wrap;
    },
  };

  /* ── CSS للكومبوننتس ─────────────────────────────────────────────────── */
  function injectComponentCSS() {
    if (document.getElementById('zad-design-tokens-css')) return;
    const s = document.createElement('style');
    s.id = 'zad-design-tokens-css';
    s.textContent = `
      /* ── Cards ── */
      .zd-card { display:flex;flex-direction:column;gap:8px;padding:16px;
        border-radius:var(--r-lg,16px);background:var(--card);
        border:1.5px solid var(--border);transition:transform var(--dur-fast) var(--ease-out),
        box-shadow var(--dur-fast) var(--ease-out);text-decoration:none;color:inherit; }
      .zd-card:hover { transform:translateY(-2px);box-shadow:var(--shadow-md); }
      .zd-card:active { transform:scale(.98); }
      .zd-card-icon { font-size:28px;line-height:1; }
      .zd-card-title { font-size:var(--text-base,15px);font-weight:800; }
      .zd-card-body { font-size:var(--text-sm,13px);color:var(--muted); }

      /* ── Badges ── */
      .zd-badge { display:inline-flex;align-items:center;padding:4px 10px;
        border-radius:var(--r-full);font-size:var(--text-xs,11px);font-weight:700; }

      /* ── Buttons ── */
      .zd-btn { display:inline-flex;align-items:center;gap:8px;padding:12px 20px;
        border-radius:var(--r-md,12px);border:none;font-family:inherit;
        font-size:var(--text-base,15px);font-weight:700;cursor:pointer;
        min-height:44px;transition:all var(--dur-fast) var(--ease-out);
        -webkit-tap-highlight-color:transparent;touch-action:manipulation; }
      .zd-btn-primary { background:var(--green-deep);color:#fff; }
      .zd-btn-primary:hover { background:var(--green-mid); }
      .zd-btn-primary:active { transform:scale(.97); }
      .zd-btn-secondary { background:var(--sand);color:var(--ink);border:1.5px solid var(--border); }
      .zd-btn-ghost { background:transparent;color:var(--muted); }
      .zd-btn-gold { background:var(--gold-500);color:#fff; }
      .zd-btn:disabled { opacity:.45;cursor:not-allowed; }

      /* ── Modal ── */
      .zd-modal-wrap { position:fixed;inset:0;z-index:9700;display:flex;
        align-items:flex-end;justify-content:center;
        opacity:0;transition:opacity var(--dur-base) var(--ease-out); }
      .zd-modal-wrap.open { opacity:1; }
      .zd-modal-backdrop { position:absolute;inset:0;background:rgba(0,0,0,.5); }
      .zd-modal { position:relative;background:var(--card);border-radius:20px 20px 0 0;
        width:100%;max-width:500px;padding:20px 20px calc(env(safe-area-inset-bottom,0px) + 20px);
        transform:translateY(100%);transition:transform var(--dur-slow) var(--ease-out); }
      .zd-modal-wrap.open .zd-modal { transform:translateY(0); }
      .zd-modal-header { font-size:var(--text-lg,17px);font-weight:900;margin-bottom:12px; }
      .zd-modal-body { font-size:var(--text-base,15px);color:var(--ink);margin-bottom:20px;line-height:1.7; }
      .zd-modal-footer { display:flex;gap:10px;justify-content:flex-end; }

      /* ── Typography ── */
      .zd-heading-1 { font-size:var(--text-3xl);font-weight:900;line-height:1.2; }
      .zd-heading-2 { font-size:var(--text-2xl);font-weight:800;line-height:1.3; }
      .zd-heading-3 { font-size:var(--text-xl);font-weight:700;line-height:1.4; }
      .zd-body-lg { font-size:var(--text-lg);line-height:1.7; }
      .zd-body { font-size:var(--text-base);line-height:1.7; }
      .zd-body-sm { font-size:var(--text-sm);line-height:1.6;color:var(--muted); }
      .zd-arabic { font-family:var(--font-quran);font-size:var(--text-2xl);line-height:2.2; }

      /* ── Skeleton Loading ── */
      .zd-skeleton { background:linear-gradient(90deg,var(--border) 25%,var(--sand) 50%,var(--border) 75%);
        background-size:200% 100%;animation:skeleton-wave 1.5s infinite;border-radius:var(--r-sm); }
      @keyframes skeleton-wave { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      
      @media (prefers-reduced-motion:reduce) {
        .zd-card,.zd-btn,.zd-modal-wrap,.zd-modal { transition:none!important; }
        .zd-skeleton { animation:none!important; }
      }
    `;
    document.head.appendChild(s);
  }

  /* ── Accessibility helpers ────────────────────────────────────────────── */
  const A11y = {
    focusTrap(container) {
      const els = container.querySelectorAll('button,a,[tabindex]:not([tabindex="-1"])');
      if (!els.length) return;
      const first = els[0], last = els[els.length - 1];
      container.addEventListener('keydown', e => {
        if (e.key !== 'Tab') return;
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      });
    },
    announce(msg, priority = 'polite') {
      let el = document.getElementById('zad-a11y-live');
      if (!el) {
        el = document.createElement('div');
        el.id = 'zad-a11y-live';
        el.setAttribute('aria-live', priority);
        el.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)';
        document.body.appendChild(el);
      }
      el.textContent = msg;
      setTimeout(() => { el.textContent = ''; }, 1000);
    },
  };

  /* ── Init ─────────────────────────────────────────────────────────────── */
  function init() {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    applyTokens(theme);
    watchTheme();
    injectComponentCSS();
    console.log('[ZadDesign] ✅ Design System 2026 جاهز');
  }

  return { init, applyTokens, Components, A11y, TOKENS };
})();

window.ZadDesign = ZadDesign;
document.addEventListener('DOMContentLoaded', () => ZadDesign.init());
