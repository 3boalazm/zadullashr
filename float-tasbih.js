/* ═══════════════════════════════════════════════════════════════════════════
   زاد — المسبحة العائمة (Floating Tasbih)
   ─────────────────────────────────────────────────────────────────────────
   زر عائم زي فقاعة ماسنجر — يفتح مسبحة منبثقة في أي صفحة دون مغادرتها.
   يطبّق معايير 2026: Calm UX، حركة وظيفية، لمس 44px+، يحترم prefers-reduced-motion.
   البيانات تُحفظ في نفس STATE.tasbih الموجود (تكامل مع app.js).
   ═══════════════════════════════════════════════════════════════════════════ */

const FLOAT_DHIKR = [
  { id: 'subhan',     ar: 'سُبْحَانَ اللَّهِ',                    target: 33,  color: '#5aabff' },
  { id: 'hamd',       ar: 'الْحَمْدُ لِلَّهِ',                     target: 33,  color: '#4dd866' },
  { id: 'takbir',     ar: 'اللَّهُ أَكْبَرُ',                      target: 33,  color: '#ffba3b' },
  { id: 'tahlil',     ar: 'لَا إِلَهَ إِلَّا اللَّهُ',             target: 100, color: '#e6c97a' },
  { id: 'istighfar',  ar: 'أَسْتَغْفِرُ اللَّهَ',                  target: 100, color: '#d47dff' },
  { id: 'salah',      ar: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ',      target: 100, color: '#ff6b85' },
];

const FloatTasbih = {
  open: false,
  activeIdx: 0,
  count: 0,

  init() {
    if (document.getElementById('float-tasbih-btn')) return;
    this.injectCSS();
    this.injectButton();
    this.injectPanel();
    this.restore();
  },

  /* ── الزر العائم (قابل للسحب) ──────────────────────────────────────────── */
  injectButton() {
    const btn = document.createElement('button');
    btn.id    = 'float-tasbih-btn';
    btn.className = 'float-tasbih-btn';
    btn.setAttribute('aria-label', 'فتح المسبحة — اضغط مطوّلاً للتحريك');
    btn.innerHTML = '<span class="ftb-icon">📿</span><span class="ftb-badge" id="ftb-badge"></span>';
    document.body.appendChild(btn);
    this.restorePosition(btn);
    this.attachDrag(btn);
  },

  /* ── السحب: اضغط مطوّلاً (380ms) ثم اسحب ──────────────────────────────── */
  attachDrag(btn) {
    let pressTimer = null;
    let dragging   = false;
    let moved      = false;
    let startX = 0, startY = 0;
    let originLeft = 0, originBottom = 0;
    const LONG_PRESS = 380;
    const MOVE_THRESHOLD = 6;

    const getPoint = e => e.touches ? e.touches[0] : e;

    const onStart = e => {
      const p = getPoint(e);
      startX = p.clientX; startY = p.clientY;
      moved  = false; dragging = false;

      pressTimer = setTimeout(() => {
        dragging = true;
        btn.classList.add('dragging');
        if (navigator.vibrate) navigator.vibrate(40);
        const rect = btn.getBoundingClientRect();
        originLeft   = rect.left;
        originBottom = window.innerHeight - rect.bottom;
      }, LONG_PRESS);
    };

    const onMove = e => {
      const p  = getPoint(e);
      const dx = p.clientX - startX;
      const dy = p.clientY - startY;

      if (!dragging && (Math.abs(dx) > MOVE_THRESHOLD || Math.abs(dy) > MOVE_THRESHOLD)) {
        clearTimeout(pressTimer);
      }

      if (dragging) {
        e.preventDefault();
        moved = true;
        const sz = 56;
        let newLeft   = Math.max(8, Math.min(originLeft + dx,  window.innerWidth  - sz - 8));
        let newBottom = Math.max(8, Math.min(originBottom - dy, window.innerHeight - sz - 8));
        btn.style.left   = newLeft   + 'px';
        btn.style.bottom = newBottom + 'px';
        btn.style.right  = 'auto';
      }
    };

    const onEnd = () => {
      clearTimeout(pressTimer);
      if (dragging) {
        dragging = false;
        btn.classList.remove('dragging');
        this.savePosition(btn);
        /* امنع toggle بعد السحب */
        moved = true;
        setTimeout(() => { moved = false; }, 100);
      } else if (!moved) {
        /* ضغطة نظيفة — افتح/أغلق اللوحة */
        this.toggle();
      }
    };

    btn.addEventListener('mousedown',  onStart);
    btn.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('mousemove',  onMove);
    window.addEventListener('touchmove',  onMove, { passive: false });
    window.addEventListener('mouseup',   onEnd);
    window.addEventListener('touchend',  onEnd);
  },

  savePosition(btn) {
    try {
      const rect = btn.getBoundingClientRect();
      localStorage.setItem('zad_float_tasbih_pos', JSON.stringify({
        left:   rect.left,
        bottom: window.innerHeight - rect.bottom,
      }));
    } catch {}
    this.syncPanelPosition(btn);
  },

  restorePosition(btn) {
    try {
      const pos = JSON.parse(localStorage.getItem('zad_float_tasbih_pos') || 'null');
      if (pos && typeof pos.left === 'number') {
        const sz = 56;
        btn.style.left   = Math.max(8, Math.min(pos.left,   window.innerWidth  - sz - 8)) + 'px';
        btn.style.bottom = Math.max(8, Math.min(pos.bottom, window.innerHeight - sz - 8)) + 'px';
        btn.style.right  = 'auto';
        setTimeout(() => this.syncPanelPosition(btn), 0);
      }
    } catch {}
  },

  syncPanelPosition(btn) {
    const panel = document.getElementById('float-tasbih-panel');
    if (!panel || !btn) return;
    const rect       = btn.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const panelW     = 300;
    const leftPos    = Math.max(8, Math.min(rect.left, window.innerWidth - panelW - 8));
    panel.style.left  = leftPos + 'px';
    panel.style.right = 'auto';
    if (spaceBelow < 380) {
      panel.style.bottom = (window.innerHeight - rect.top + 12) + 'px';
      panel.style.top    = 'auto';
    } else {
      panel.style.top    = (rect.bottom + 12) + 'px';
      panel.style.bottom = 'auto';
    }
  },

  /* ── اللوحة المنبثقة ─────────────────────────────────────────────────── */
  injectPanel() {
    const panel = document.createElement('div');
    panel.id        = 'float-tasbih-panel';
    panel.className = 'float-tasbih-panel';
    panel.setAttribute('role',       'dialog');
    panel.setAttribute('aria-label', 'المسبحة');
    /* ⚠️ امنع تسرّب الأحداث للعناصر الخلفية */
    panel.addEventListener('touchstart', e => e.stopPropagation(), { passive: true });
    panel.addEventListener('mousedown',  e => e.stopPropagation());

    panel.innerHTML = `
      <div class="ftp-header">
        <span class="ftp-title">📿 المسبحة</span>
        <button class="ftp-close" aria-label="إغلاق" id="ftp-close-btn">✕</button>
      </div>
      <div class="ftp-dhikr-chips" id="ftp-chips"></div>
      <div class="ftp-counter-area">
        <div class="ftp-arabic" id="ftp-arabic"></div>
        <button class="ftp-ring" id="ftp-ring" aria-label="عُدّ" type="button">
          <svg viewBox="0 0 120 120" class="ftp-ring-svg">
            <circle cx="60" cy="60" r="52" class="ftp-ring-bg"></circle>
            <circle cx="60" cy="60" r="52" class="ftp-ring-prog" id="ftp-ring-prog"></circle>
          </svg>
          <span class="ftp-count" id="ftp-count">0</span>
        </button>
        <div class="ftp-target" id="ftp-target">من 33</div>
      </div>
      <div class="ftp-actions">
        <button class="ftp-reset" id="ftp-reset-btn" type="button">↺ تصفير</button>
        <a class="ftp-full" href="takbeer.html">المسبحة الكاملة ←</a>
      </div>`;

    document.body.appendChild(panel);
    this.renderChips();
    this.renderActive();

    /* ربط الأزرار بـ addEventListener (أكثر موثوقية من onclick في innerHTML) */
    document.getElementById('ftp-close-btn').addEventListener('click',  () => this.toggle());
    document.getElementById('ftp-reset-btn').addEventListener('click',  () => this.reset());

    const ring = document.getElementById('ftp-ring');
    /* click للماوس، touchend للتاتش — بدون passive حتى نمنع scroll عرضي */
    ring.addEventListener('click', () => this.tick());
    ring.addEventListener('touchend', e => { e.preventDefault(); this.tick(); }, { passive: false });
    ring.addEventListener('keydown',  e => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); this.tick(); }
    });
  },

  renderChips() {
    const wrap = document.getElementById('ftp-chips');
    if (!wrap) return;
    wrap.innerHTML = '';
    FLOAT_DHIKR.forEach((d, i) => {
      const chip = document.createElement('button');
      chip.className = 'ftp-chip' + (i === this.activeIdx ? ' active' : '');
      chip.type      = 'button';
      chip.textContent = d.ar.split(' ').slice(0, 2).join(' ');
      chip.addEventListener('click', () => this.select(i));
      wrap.appendChild(chip);
    });
  },

  renderActive() {
    const d     = FLOAT_DHIKR[this.activeIdx];
    const arEl  = document.getElementById('ftp-arabic');
    const cntEl = document.getElementById('ftp-count');
    const tgtEl = document.getElementById('ftp-target');
    if (arEl)  { arEl.textContent = d.ar; arEl.style.color = d.color; }
    if (cntEl) cntEl.textContent = this.count;
    if (tgtEl) tgtEl.textContent = 'من ' + d.target;
    this.updateRing();
  },

  updateRing() {
    const d    = FLOAT_DHIKR[this.activeIdx];
    const prog = document.getElementById('ftp-ring-prog');
    if (!prog) return;
    const R = 52, C = 2 * Math.PI * R;
    const pct = this.count > 0
      ? (Math.min((this.count % d.target) / d.target, 1) || 1)
      : 0;
    prog.style.strokeDasharray  = C;
    prog.style.strokeDashoffset = C - C * pct;
    prog.style.stroke           = d.color;
  },

  select(i) {
    this.activeIdx = i;
    this.count     = 0;
    this.renderChips();
    this.renderActive();
    this.save();
  },

  tick() {
    const d = FLOAT_DHIKR[this.activeIdx];
    this.count++;
    if (navigator.vibrate) navigator.vibrate(15);

    const cntEl = document.getElementById('ftp-count');
    if (cntEl) {
      cntEl.textContent = this.count;
      cntEl.classList.remove('bump');
      requestAnimationFrame(() => {
        cntEl.classList.add('bump');
        setTimeout(() => cntEl.classList.remove('bump'), 150);
      });
    }
    this.updateRing();

    if (window.STATE?.takbeer && d.id === 'takbir') {
      window.STATE.takbeer.total = (window.STATE.takbeer.total || 0) + 1;
      if (typeof window.saveState === 'function') window.saveState();
    }

    if (this.count % d.target === 0) {
      if (navigator.vibrate) navigator.vibrate([40, 30, 40]);
      if (typeof showToast === 'function') showToast(`✅ ${d.ar} — دورة مكتملة`);
    }
    this.save();
    this.updateBadge();
  },

  reset() {
    this.count = 0;
    this.renderActive();
    this.save();
    this.updateBadge();
  },

  toggle() {
    this.open = !this.open;
    const panel = document.getElementById('float-tasbih-panel');
    const btn   = document.getElementById('float-tasbih-btn');
    if (this.open && btn) this.syncPanelPosition(btn);
    if (panel) {
      panel.classList.toggle('open', this.open);
      /* نضمن pointer-events بشكل صريح في inline style */
      panel.style.pointerEvents = this.open ? 'auto' : 'none';
    }
    if (btn) btn.classList.toggle('active', this.open);
  },

  updateBadge() {
    const badge = document.getElementById('ftb-badge');
    if (badge) {
      badge.textContent    = this.count > 0 ? this.count : '';
      badge.style.display  = this.count > 0 ? 'flex' : 'none';
    }
  },

  save() {
    try {
      sessionStorage.setItem('zad_float_tasbih', JSON.stringify({
        idx: this.activeIdx, count: this.count,
      }));
    } catch {}
  },

  restore() {
    try {
      const s = JSON.parse(sessionStorage.getItem('zad_float_tasbih') || 'null');
      if (s) {
        this.activeIdx = s.idx   || 0;
        this.count     = s.count || 0;
        this.renderChips();
        this.renderActive();
        this.updateBadge();
      }
    } catch {}
    /* مغلقة دائماً عند التحميل */
    this.open = false;
    const panel = document.getElementById('float-tasbih-panel');
    const btn   = document.getElementById('float-tasbih-btn');
    if (panel) { panel.classList.remove('open'); panel.style.pointerEvents = 'none'; }
    if (btn)   btn.classList.remove('active');
  },

  /* ── الأنماط ───────────────────────────────────────────────────────────── */
  injectCSS() {
    if (document.getElementById('float-tasbih-css')) return;
    const s = document.createElement('style');
    s.id = 'float-tasbih-css';
    s.textContent = `
      .float-tasbih-btn {
        position: fixed; bottom: 88px; left: 20px; z-index: 9500;
        width: 56px; height: 56px; border-radius: 50%; border: none;
        background: linear-gradient(135deg, #0e3b2e, #1a5d47);
        color: #fff; font-size: 24px; cursor: pointer;
        box-shadow: 0 4px 16px rgba(14,59,46,.35);
        display: flex; align-items: center; justify-content: center;
        transition: transform .25s cubic-bezier(.4,0,.2,1), box-shadow .25s;
        -webkit-tap-highlight-color: transparent;
        touch-action: none;
      }
      .float-tasbih-btn:hover  { transform: scale(1.08); box-shadow: 0 6px 22px rgba(14,59,46,.45); }
      .float-tasbih-btn:active { transform: scale(.95); }
      .float-tasbih-btn.active { transform: rotate(8deg) scale(1.05); }
      .float-tasbih-btn.dragging {
        transform: scale(1.15); cursor: grabbing;
        box-shadow: 0 8px 28px rgba(14,59,46,.55); opacity: .92; transition: none;
      }
      .ftb-icon  { line-height: 1; pointer-events: none; }
      .ftb-badge {
        position: absolute; top: -4px; right: -4px; min-width: 22px; height: 22px;
        background: var(--zad-gold-500, #c9a14a); color: #fff; border-radius: 11px;
        font-size: 11px; font-weight: 700; display: none; align-items: center;
        justify-content: center; padding: 0 6px; border: 2px solid #fff;
        pointer-events: none;
      }
      .float-tasbih-panel {
        position: fixed; bottom: 156px; left: 20px; z-index: 9501;
        width: 300px; max-width: calc(100vw - 40px);
        background: var(--card, #fff); border-radius: 20px;
        box-shadow: 0 12px 40px rgba(0,0,0,.22);
        border: 1px solid var(--border, #e5e5e5);
        opacity: 0; transform: translateY(16px) scale(.96);
        pointer-events: none;
        transition: opacity .28s cubic-bezier(.4,0,.2,1), transform .28s cubic-bezier(.4,0,.2,1);
        overflow: hidden;
        -webkit-tap-highlight-color: transparent;
      }
      .float-tasbih-panel.open {
        opacity: 1 !important;
        transform: translateY(0) scale(1) !important;
        pointer-events: auto !important;
      }
      .ftp-header {
        display: flex; justify-content: space-between; align-items: center;
        padding: 14px 16px;
        background: linear-gradient(135deg, #0e3b2e, #1a5d47); color: #fff;
      }
      .ftp-title { font-size: 16px; font-weight: 800; }
      .ftp-close {
        background: rgba(255,255,255,.2); border: none; color: #fff;
        width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-size: 14px;
        display: flex; align-items: center; justify-content: center;
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
      }
      .ftp-close:active { background: rgba(255,255,255,.4); }
      .ftp-dhikr-chips {
        display: flex; gap: 6px; overflow-x: auto; padding: 12px;
        -webkit-overflow-scrolling: touch; scrollbar-width: none;
      }
      .ftp-dhikr-chips::-webkit-scrollbar { display: none; }
      .ftp-chip {
        flex-shrink: 0; padding: 8px 14px; border-radius: 16px;
        border: 1.5px solid var(--border, #ddd); background: var(--sand, #faf9f6);
        font-family: inherit; font-size: 12px; font-weight: 700; cursor: pointer;
        white-space: nowrap; min-height: 40px; transition: all .2s;
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
      }
      .ftp-chip.active {
        background: var(--zad-green-900, #0e3b2e);
        color: #fff; border-color: var(--zad-green-900, #0e3b2e);
      }
      .ftp-chip:active { opacity: .8; }
      .ftp-counter-area { text-align: center; padding: 8px 16px 16px; }
      .ftp-arabic {
        font-family: var(--font-quran, 'Amiri', serif);
        font-size: 20px; font-weight: 700; margin-bottom: 12px; min-height: 28px;
      }
      .ftp-ring {
        position: relative; width: 140px; height: 140px; margin: 0 auto;
        background: none; border: none; cursor: pointer; display: block;
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
      }
      .ftp-ring:active { opacity: .85; }
      .ftp-ring-svg   { width: 140px; height: 140px; transform: rotate(-90deg); }
      .ftp-ring-bg    { fill: none; stroke: var(--border, #eee); stroke-width: 8; }
      .ftp-ring-prog  {
        fill: none; stroke-width: 8; stroke-linecap: round;
        transition: stroke-dashoffset .3s ease;
      }
      .ftp-count {
        position: absolute; top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        font-size: 40px; font-weight: 900; color: var(--ink, #222);
        pointer-events: none;
      }
      .ftp-count.bump { animation: ftp-bump .15s ease; }
      @keyframes ftp-bump { 50% { transform: translate(-50%, -50%) scale(1.18); } }
      .ftp-target { font-size: 13px; color: var(--muted, #888); margin-top: 8px; }
      .ftp-actions {
        display: flex; gap: 8px; padding: 0 16px 16px;
      }
      .ftp-reset, .ftp-full {
        flex: 1; padding: 12px; border-radius: 12px; text-align: center;
        font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer;
        text-decoration: none; min-height: 44px;
        display: flex; align-items: center; justify-content: center;
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
      }
      .ftp-reset {
        background: var(--sand, #f0f0ec);
        border: 1.5px solid var(--border, #ddd); color: var(--ink, #444);
      }
      .ftp-reset:active { opacity: .75; }
      .ftp-full  { background: var(--zad-green-900, #0e3b2e); color: #fff; border: none; }
      .ftp-full:active { opacity: .85; }

      @media (prefers-reduced-motion: reduce) {
        .float-tasbih-btn, .float-tasbih-panel,
        .ftp-ring-prog, .ftp-count { transition: none !important; animation: none !important; }
      }
      body[data-page="takbeer"] .float-tasbih-btn,
      body[data-page="takbeer"] .float-tasbih-panel { display: none !important; }
    `;
    document.head.appendChild(s);
  },
};

window.FloatTasbih = FloatTasbih;

document.addEventListener('DOMContentLoaded', () => {
  const page = window.location.pathname.split('/').pop().replace('.html', '');
  if (page === 'takbeer') return;
  FloatTasbih.init();
  console.log('[FloatTasbih] ✅ المسبحة العائمة جاهزة');
});
