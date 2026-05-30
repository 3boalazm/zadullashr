/* ═══════════════════════════════════════════════════════════════════════════
   زاد — المسبحة العائمة (Floating Tasbih)
   ─────────────────────────────────────────────────────────────────────────
   زر عائم زي فقاعة ماسنجر — يفتح مسبحة منبثقة في أي صفحة دون مغادرتها.
   يطبّق معايير 2026: Calm UX، حركة وظيفية، لمس 44px+، يحترم prefers-reduced-motion.
   البيانات تُحفظ في نفس STATE.tasbih الموجود (تكامل مع app.js).
   ═══════════════════════════════════════════════════════════════════════════ */

/* أذكار المسبحة السريعة (نفس DHIKR_LIST في app.js لو متاح) */
const FLOAT_DHIKR = [
  { id: 'subhan',  ar: 'سُبْحَانَ اللَّهِ',                       target: 33,  color: '#5aabff' },
  { id: 'hamd',    ar: 'الْحَمْدُ لِلَّهِ',                        target: 33,  color: '#4dd866' },
  { id: 'takbir',  ar: 'اللَّهُ أَكْبَرُ',                         target: 33,  color: '#ffba3b' },
  { id: 'tahlil',  ar: 'لَا إِلَهَ إِلَّا اللَّهُ',                target: 100, color: '#e6c97a' },
  { id: 'istighfar', ar: 'أَسْتَغْفِرُ اللَّهَ',                   target: 100, color: '#d47dff' },
  { id: 'salah',   ar: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ',         target: 100, color: '#ff6b85' },
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
    btn.id = 'float-tasbih-btn';
    btn.className = 'float-tasbih-btn';
    btn.setAttribute('aria-label', 'فتح المسبحة — اضغط مطوّلاً للتحريك');
    btn.innerHTML = '<span class="ftb-icon">📿</span><span class="ftb-badge" id="ftb-badge"></span>';
    document.body.appendChild(btn);

    /* استعادة الموضع المحفوظ */
    this.restorePosition(btn);

    /* منطق السحب بعد الضغط المطوّل */
    this.attachDrag(btn);
  },

  /* ── السحب: اضغط مطوّلاً (350ms) ثم اسحب ثم اترك ليثبت ──────────────── */
  attachDrag(btn) {
    let pressTimer = null;
    let dragging = false;
    let moved = false;
    let startX = 0, startY = 0;
    let originLeft = 0, originBottom = 0;

    const LONG_PRESS = 350; /* مدة الضغط المطوّل */

    const getPoint = (e) => e.touches ? e.touches[0] : e;

    const onStart = (e) => {
      const p = getPoint(e);
      startX = p.clientX; startY = p.clientY;
      moved = false;

      /* بعد ضغط مطوّل → فعّل وضع السحب */
      pressTimer = setTimeout(() => {
        dragging = true;
        btn.classList.add('dragging');
        if (navigator.vibrate) navigator.vibrate(40);
        const rect = btn.getBoundingClientRect();
        originLeft = rect.left;
        originBottom = window.innerHeight - rect.bottom;
      }, LONG_PRESS);
    };

    const onMove = (e) => {
      const p = getPoint(e);
      const dx = p.clientX - startX;
      const dy = p.clientY - startY;

      /* لو اتحرك قبل الضغط المطوّل → ألغِ المؤقّت (مش سحب) */
      if (!dragging && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        clearTimeout(pressTimer);
      }

      if (dragging) {
        e.preventDefault();
        moved = true;
        /* الزر على left + bottom */
        let newLeft = originLeft + dx;
        let newBottom = originBottom - dy;
        /* حدود الشاشة (هامش 8px) */
        const sz = 56;
        newLeft = Math.max(8, Math.min(newLeft, window.innerWidth - sz - 8));
        newBottom = Math.max(8, Math.min(newBottom, window.innerHeight - sz - 8));
        btn.style.left = newLeft + 'px';
        btn.style.bottom = newBottom + 'px';
        btn.style.right = 'auto';
      }
    };

    const onEnd = () => {
      clearTimeout(pressTimer);
      if (dragging) {
        dragging = false;
        btn.classList.remove('dragging');
        /* ثبّت الموضع واحفظه */
        this.savePosition(btn);
        /* امنع فتح اللوحة بعد السحب مباشرة */
        setTimeout(() => { moved = false; }, 50);
      } else if (!moved) {
        /* ضغطة عادية (مش سحب) → افتح اللوحة */
        this.toggle();
      }
    };

    btn.addEventListener('mousedown', onStart);
    btn.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchend', onEnd);
  },

  savePosition(btn) {
    try {
      const rect = btn.getBoundingClientRect();
      const pos = { left: rect.left, bottom: window.innerHeight - rect.bottom };
      localStorage.setItem('zad_float_tasbih_pos', JSON.stringify(pos));
    } catch {}
    /* حرّك اللوحة لتتبع الزر */
    this.syncPanelPosition(btn);
  },

  restorePosition(btn) {
    try {
      const pos = JSON.parse(localStorage.getItem('zad_float_tasbih_pos') || 'null');
      if (pos && typeof pos.left === 'number') {
        /* تأكد إنه داخل الشاشة (لو اتغيّر حجمها) */
        const sz = 56;
        const left = Math.max(8, Math.min(pos.left, window.innerWidth - sz - 8));
        const bottom = Math.max(8, Math.min(pos.bottom, window.innerHeight - sz - 8));
        btn.style.left = left + 'px';
        btn.style.bottom = bottom + 'px';
        btn.style.right = 'auto';
        setTimeout(() => this.syncPanelPosition(btn), 0);
      }
    } catch {}
  },

  /* اللوحة تظهر فوق أو تحت الزر حسب موضعه */
  syncPanelPosition(btn) {
    const panel = document.getElementById('float-tasbih-panel');
    if (!panel || !btn) return;
    const rect = btn.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    panel.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - 308)) + 'px';
    panel.style.right = 'auto';
    /* لو الزر في النص لتحت → اللوحة فوقه، والعكس */
    if (spaceBelow < 360) {
      panel.style.bottom = (window.innerHeight - rect.top + 12) + 'px';
      panel.style.top = 'auto';
    } else {
      panel.style.top = (rect.bottom + 12) + 'px';
      panel.style.bottom = 'auto';
    }
  },

  /* ── اللوحة المنبثقة ─────────────────────────────────────────────────── */
  injectPanel() {
    const panel = document.createElement('div');
    panel.id = 'float-tasbih-panel';
    panel.className = 'float-tasbih-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'المسبحة');
    panel.innerHTML = `
      <div class="ftp-header">
        <span class="ftp-title">📿 المسبحة</span>
        <button class="ftp-close" aria-label="إغلاق" onclick="window.FloatTasbih.toggle()">✕</button>
      </div>
      <div class="ftp-dhikr-chips" id="ftp-chips"></div>
      <div class="ftp-counter-area">
        <div class="ftp-arabic" id="ftp-arabic"></div>
        <button class="ftp-ring" id="ftp-ring" aria-label="عُدّ">
          <svg viewBox="0 0 120 120" class="ftp-ring-svg">
            <circle cx="60" cy="60" r="52" class="ftp-ring-bg"></circle>
            <circle cx="60" cy="60" r="52" class="ftp-ring-prog" id="ftp-ring-prog"></circle>
          </svg>
          <span class="ftp-count" id="ftp-count">0</span>
        </button>
        <div class="ftp-target" id="ftp-target">من 33</div>
      </div>
      <div class="ftp-actions">
        <button class="ftp-reset" onclick="window.FloatTasbih.reset()">↺ تصفير</button>
        <a class="ftp-full" href="takbeer.html">المسبحة الكاملة ←</a>
      </div>`;
    document.body.appendChild(panel);
    this.renderChips();
    this.renderActive();

    const ring = document.getElementById('ftp-ring');
    ring.addEventListener('click', () => this.tick());
    ring.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); this.tick(); } });
  },

  renderChips() {
    const wrap = document.getElementById('ftp-chips');
    if (!wrap) return;
    wrap.innerHTML = FLOAT_DHIKR.map((d, i) =>
      `<button class="ftp-chip ${i === this.activeIdx ? 'active' : ''}" 
               onclick="window.FloatTasbih.select(${i})">${d.ar.split(' ').slice(0,2).join(' ')}</button>`
    ).join('');
  },

  renderActive() {
    const d = FLOAT_DHIKR[this.activeIdx];
    const arEl = document.getElementById('ftp-arabic');
    const cntEl = document.getElementById('ftp-count');
    const tgtEl = document.getElementById('ftp-target');
    if (arEl) { arEl.textContent = d.ar; arEl.style.color = d.color; }
    if (cntEl) cntEl.textContent = this.count;
    if (tgtEl) tgtEl.textContent = 'من ' + d.target;
    this.updateRing();
  },

  updateRing() {
    const d = FLOAT_DHIKR[this.activeIdx];
    const prog = document.getElementById('ftp-ring-prog');
    if (!prog) return;
    const R = 52, C = 2 * Math.PI * R;
    const pct = Math.min((this.count % d.target) / d.target, 1) || (this.count > 0 ? 1 : 0);
    prog.style.strokeDasharray = C;
    prog.style.strokeDashoffset = C - C * pct;
    prog.style.stroke = d.color;
  },

  select(i) {
    this.activeIdx = i;
    this.count = 0;
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
      requestAnimationFrame(() => { cntEl.classList.add('bump'); setTimeout(() => cntEl.classList.remove('bump'), 150); });
    }
    this.updateRing();

    /* تكامل مع STATE العام لو موجود */
    if (window.STATE?.takbeer && (d.id === 'takbir')) {
      window.STATE.takbeer.total = (window.STATE.takbeer.total || 0) + 1;
      if (typeof window.saveState === 'function') window.saveState();
    }

    /* عند إكمال الدورة */
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
    const btn = document.getElementById('float-tasbih-btn');
    if (this.open && btn) this.syncPanelPosition(btn);
    if (panel) panel.classList.toggle('open', this.open);
    if (btn) btn.classList.toggle('active', this.open);
  },

  updateBadge() {
    const badge = document.getElementById('ftb-badge');
    if (badge) {
      badge.textContent = this.count > 0 ? this.count : '';
      badge.style.display = this.count > 0 ? 'flex' : 'none';
    }
  },

  save() {
    try { sessionStorage.setItem('zad_float_tasbih', JSON.stringify({ idx: this.activeIdx, count: this.count })); } catch {}
  },

  restore() {
    try {
      const s = JSON.parse(sessionStorage.getItem('zad_float_tasbih') || 'null');
      if (s) { this.activeIdx = s.idx || 0; this.count = s.count || 0; this.renderChips(); this.renderActive(); this.updateBadge(); }
    } catch {}
  },

  /* ── الأنماط (Calm UX + reduced motion + 44px touch) ──────────────────── */
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
      }
      .float-tasbih-btn:hover { transform: scale(1.08); box-shadow: 0 6px 22px rgba(14,59,46,.45); }
      .float-tasbih-btn:active { transform: scale(.95); }
      .float-tasbih-btn.active { transform: rotate(8deg) scale(1.05); }
      .float-tasbih-btn.dragging { transform: scale(1.15); cursor: grabbing;
        box-shadow: 0 8px 28px rgba(14,59,46,.55); opacity: .92; transition: none; touch-action: none; }
      .ftb-icon { line-height: 1; }
      .ftb-badge {
        position: absolute; top: -4px; right: -4px; min-width: 22px; height: 22px;
        background: var(--zad-gold-500, #c9a14a); color: #fff; border-radius: 11px;
        font-size: 11px; font-weight: 700; display: none; align-items: center;
        justify-content: center; padding: 0 6px; border: 2px solid #fff;
      }
      .float-tasbih-panel {
        position: fixed; bottom: 156px; left: 20px; z-index: 9499;
        width: 300px; max-width: calc(100vw - 40px);
        background: var(--card, #fff); border-radius: 20px;
        box-shadow: 0 12px 40px rgba(0,0,0,.22);
        border: 1px solid var(--border, #e5e5e5);
        opacity: 0; transform: translateY(16px) scale(.96); pointer-events: none;
        transition: opacity .28s cubic-bezier(.4,0,.2,1), transform .28s cubic-bezier(.4,0,.2,1);
        overflow: hidden;
      }
      .float-tasbih-panel.open { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
      .ftp-header { display: flex; justify-content: space-between; align-items: center;
        padding: 14px 16px; background: linear-gradient(135deg, #0e3b2e, #1a5d47); color: #fff; }
      .ftp-title { font-size: 16px; font-weight: 800; }
      .ftp-close { background: rgba(255,255,255,.2); border: none; color: #fff;
        width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: 14px; }
      .ftp-dhikr-chips { display: flex; gap: 6px; overflow-x: auto; padding: 12px;
        -webkit-overflow-scrolling: touch; }
      .ftp-chip { flex-shrink: 0; padding: 8px 12px; border-radius: 16px;
        border: 1.5px solid var(--border, #ddd); background: var(--sand, #faf9f6);
        font-family: inherit; font-size: 12px; font-weight: 700; cursor: pointer;
        white-space: nowrap; min-height: 36px; transition: all .2s; }
      .ftp-chip.active { background: var(--zad-green-900, #0e3b2e); color: #fff; border-color: var(--zad-green-900, #0e3b2e); }
      .ftp-counter-area { text-align: center; padding: 8px 16px 16px; }
      .ftp-arabic { font-family: var(--font-quran, serif); font-size: 20px; font-weight: 700; margin-bottom: 12px; min-height: 28px; }
      .ftp-ring { position: relative; width: 140px; height: 140px; margin: 0 auto;
        background: none; border: none; cursor: pointer; display: block; }
      .ftp-ring-svg { width: 140px; height: 140px; transform: rotate(-90deg); }
      .ftp-ring-bg { fill: none; stroke: var(--border, #eee); stroke-width: 8; }
      .ftp-ring-prog { fill: none; stroke-width: 8; stroke-linecap: round;
        transition: stroke-dashoffset .3s ease; }
      .ftp-count { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
        font-size: 40px; font-weight: 900; color: var(--ink, #222); }
      .ftp-count.bump { animation: ftp-bump .15s ease; }
      @keyframes ftp-bump { 50% { transform: translate(-50%, -50%) scale(1.15); } }
      .ftp-target { font-size: 13px; color: var(--muted, #888); margin-top: 8px; }
      .ftp-actions { display: flex; gap: 8px; padding: 0 16px 16px; }
      .ftp-reset, .ftp-full { flex: 1; padding: 12px; border-radius: 12px; text-align: center;
        font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer; text-decoration: none;
        min-height: 44px; display: flex; align-items: center; justify-content: center; }
      .ftp-reset { background: var(--sand, #f0f0ec); border: 1.5px solid var(--border, #ddd); color: var(--ink, #444); }
      .ftp-full { background: var(--zad-green-900, #0e3b2e); color: #fff; }

      @media (prefers-reduced-motion: reduce) {
        .float-tasbih-btn, .float-tasbih-panel, .ftp-ring-prog, .ftp-count { transition: none !important; animation: none !important; }
      }
      /* لا تظهر في صفحة المسبحة الكاملة */
      body[data-page="takbeer"] .float-tasbih-btn,
      body[data-page="takbeer"] .float-tasbih-panel { display: none; }
    `;
    document.head.appendChild(s);
  },
};

window.FloatTasbih = FloatTasbih;

document.addEventListener('DOMContentLoaded', () => {
  /* لا تشغّلها في صفحة المسبحة الكاملة */
  const page = window.location.pathname.split('/').pop().replace('.html', '');
  if (page === 'takbeer') return;
  FloatTasbih.init();
  console.log('[FloatTasbih] ✅ المسبحة العائمة جاهزة');
});
