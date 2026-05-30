/* ═══════════════════════════════════════════════════════════════════════════
   زاد — زر المسبحة العائم (FAB → takbeer.html)
   بديل بسيط عن المسبحة المنبثقة — زر يوجّه لصفحة المسبحة الكاملة
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  /* لا يظهر في صفحة المسبحة نفسها */
  const page = window.location.pathname.split('/').pop().replace('.html', '');
  if (page === 'takbeer') return;
  if (document.getElementById('tasbih-fab')) return;

  /* ── CSS ── */
  const style = document.createElement('style');
  style.textContent = `
    #tasbih-fab {
      position: fixed;
      bottom: 88px;
      left: 20px;
      z-index: 900;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0e3b2e, #1a5d47);
      color: #fff;
      font-size: 24px;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(14,59,46,.35);
      display: flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      transition: transform .2s, box-shadow .2s;
      -webkit-tap-highlight-color: transparent;
    }
    #tasbih-fab:hover  { transform: scale(1.08); box-shadow: 0 6px 22px rgba(14,59,46,.45); }
    #tasbih-fab:active { transform: scale(.93); }

    #tasbih-fab-tip {
      position: fixed;
      bottom: 154px;
      left: 12px;
      z-index: 901;
      background: var(--card, #fff);
      color: var(--ink, #222);
      border: 1px solid var(--border, #e0e0e0);
      border-radius: 12px;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 700;
      box-shadow: 0 4px 14px rgba(0,0,0,.12);
      white-space: nowrap;
      opacity: 0;
      transform: translateY(6px);
      transition: opacity .25s, transform .25s;
      pointer-events: none;
    }
    #tasbih-fab-tip.show { opacity: 1; transform: translateY(0); }
  `;
  document.head.appendChild(style);

  /* ── الزر ── */
  const fab = document.createElement('a');
  fab.id   = 'tasbih-fab';
  fab.href = 'takbeer.html';
  fab.setAttribute('aria-label', 'المسبحة');
  fab.textContent = '📿';
  document.body.appendChild(fab);

  /* ── tooltip عند أول ظهور فقط ── */
  const SEEN_KEY = 'zad_tasbih_fab_seen';
  if (!localStorage.getItem(SEEN_KEY)) {
    const tip = document.createElement('div');
    tip.id = 'tasbih-fab-tip';
    tip.textContent = 'المسبحة';
    document.body.appendChild(tip);

    requestAnimationFrame(() => {
      setTimeout(() => tip.classList.add('show'), 600);
      setTimeout(() => {
        tip.classList.remove('show');
        setTimeout(() => tip.remove(), 300);
        localStorage.setItem(SEEN_KEY, '1');
      }, 3000);
    });
  }
})();
