if (typeof gsap === 'undefined') {
  console.warn('[ZadAnim] GSAP not loaded');
}
(function initWhenReady() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAnimInit, { once: true });
  } else {
    runAnimInit();
  }
})();
function runAnimInit() {
  if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    initPageEnter();
    initScrollReveal();
    initInteractiveGSAP();
    initHoverSparks();
  }
  initAmbientOrbs();
  initGlassTopbar();
  overrideConfetti();
  initCounterAnimations();
}
function initPageEnter() {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  const main = document.querySelector('.main');
  if (main) {
    main.style.animation = 'none';
    main.style.opacity   = '0';
    tl.to(main, { opacity: 1, y: 0, duration: 0.45 }, 0);
  }
  if (window.innerWidth > 768) {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      tl.from(sidebar, { x: 40, opacity: 0, duration: 0.5 }, 0.05);
    }
  }
  const navLinks = document.querySelectorAll('.nav a');
  navLinks.forEach(a => { a.style.animation = 'none'; a.style.opacity = '0'; });
  tl.to(navLinks, { opacity: 1, x: 0, duration: 0.35, stagger: 0.04,
    ease: 'back.out(1.2)' }, 0.15);
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.style.animation = 'none';
    tl.from(hero, { scale: 0.94, opacity: 0, duration: 0.6, ease: 'back.out(1.3)' }, 0.1);
  }
  const title = document.querySelector('.page-title');
  if (title) {
    tl.from(title, { opacity: 0, y: -18, duration: 0.4, ease: 'back.out(1.4)' }, 0.18);
  }
  const brand = document.querySelector('.brand-mark');
  if (brand) {
    brand.style.animation = 'none';
    tl.from(brand, { scale: 0, rotation: -20, duration: 0.6, ease: 'elastic.out(1.2, 0.5)' }, 0.1);
    tl.to(brand, { animation: 'float 4s ease-in-out infinite', clearProps: 'all' }, 0.7);
  }
}
function initScrollReveal() {
gsap.utils.toArray('.card, .tl-item, .info-step, .af-milestone').forEach((el, i) => {
    el.style.animation = 'none';
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      y: 32, opacity: 0, duration: 0.55,
      ease: 'back.out(1.3)', delay: (i % 5) * 0.05
    });
  });
  document.querySelectorAll('.grid:not(.no-stagger)').forEach(grid => {
    [...grid.children].forEach((el, i) => {
      el.style.animation = 'none';
      gsap.from(el, {
        scrollTrigger: { trigger: grid, start: 'top 85%', once: true },
        y: 28, opacity: 0, scale: 0.95,
        duration: 0.5, ease: 'back.out(1.4)', delay: i * 0.07
      });
    });
  });
  gsap.utils.toArray('.badge').forEach((el, i) => {
    el.style.animation = 'none';
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      scale: 0.7, opacity: 0, duration: 0.45,
      ease: 'back.out(2)', delay: i * 0.04
    });
  });
  gsap.utils.toArray('.section-title').forEach(el => {
    el.style.animation = 'none';
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      x: 24, opacity: 0, duration: 0.4, ease: 'expo.out'
    });
  });
}
function initInteractiveGSAP() {
  document.querySelectorAll('.check[data-key]').forEach(el => {
    if (el._gsapBound) return;
    el._gsapBound = true;
    el.addEventListener('click', () => {
      if (el.classList.contains('done')) {
        const box = el.querySelector('.box');
        if (box) {
          gsap.from(box, { scale: 0, rotation: -25, duration: 0.5, ease: 'elastic.out(1.4, 0.5)' });
        }
        gsap.fromTo(el, { boxShadow: '0 0 0 0 rgba(77,216,102,.5)' },
          { boxShadow: '0 0 0 14px rgba(77,216,102,0)', duration: 0.6, ease: 'expo.out' });
      }
    });
  });
  const _origBadge = window.updateBadgeUI;
  window.updateBadgeUI = function(id) {
    if (_origBadge) _origBadge(id);
    const el = document.querySelector(`[data-badge="${id}"]`);
    if (!el) return;
    const medal = el.querySelector('.medal');
    gsap.timeline()
      .from(el, { scale: 0.5, opacity: 0, duration: 0.5, ease: 'elastic.out(1.3, 0.5)' })
      .fromTo(el,
        { boxShadow: '0 0 0 0 rgba(201,161,74,.7)' },
        { boxShadow: '0 0 32px 8px rgba(201,161,74,0)', duration: 1, ease: 'expo.out' }, '-=0.2')
      .from(medal, { scale: 0, rotation: 360, duration: 0.6, ease: 'back.out(1.5)' }, '-=0.5');
  };
  const tsRing = document.getElementById('ts-ring');
  if (tsRing) {
    tsRing.addEventListener('click', () => {
      gsap.timeline()
        .to(tsRing, { scale: 0.91, duration: 0.07, ease: 'power2.in' })
        .to(tsRing, { scale: 1, duration: 0.4, ease: 'elastic.out(1.6, 0.5)' });
      spawnRippleRing(tsRing);
    });
  }
  document.querySelectorAll('.dhikr-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const cx = (e.clientX - r.left) / r.width  - 0.5;
      const cy = (e.clientY - r.top)  / r.height - 0.5;
      gsap.to(card, { rotateY: cx * 8, rotateX: -cy * 8, duration: 0.3, ease: 'power2.out', transformPerspective: 800 });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.4, ease: 'elastic.out(1.2, 0.5)' });
    });
  });
  document.querySelectorAll('.fast-day').forEach(el => {
    if (el._gsapBound) return;
    el._gsapBound = true;
    el.addEventListener('click', () => {
      if (el.classList.contains('done')) {
        gsap.timeline()
          .to(el, { scale: 1.25, duration: 0.18, ease: 'power2.out' })
          .to(el, { scale: 1, duration: 0.5, ease: 'elastic.out(1.5, 0.5)' });
      }
    });
  });
  document.querySelectorAll('.af-ms-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.af-milestone');
      if (card && card.classList.contains('af-done')) {
        gsap.fromTo(card,
          { boxShadow: '0 0 0 0 rgba(77,216,102,.5)' },
          { boxShadow: '0 0 0 20px rgba(77,216,102,0)', duration: 0.7, ease: 'expo.out' });
      }
    });
  });
}
function initHoverSparks() {
  document.querySelectorAll('.btn-gold').forEach(btn => {
    btn.addEventListener('mouseenter', e => {
      spawnGoldSparks(btn, 6);
    });
  });
}
function spawnGoldSparks(parent, count) {
  const r = parent.getBoundingClientRect();
  for (let i = 0; i < count; i++) {
    const dot = document.createElement('div');
    dot.style.cssText = `position:fixed;width:5px;height:5px;border-radius:50%;
      background:${Math.random()>.5?'#e6c97a':'#c9a14a'};pointer-events:none;z-index:9000;
      left:${r.left + Math.random()*r.width}px;top:${r.top + r.height/2}px`;
    document.body.appendChild(dot);
    gsap.to(dot, {
      x: (Math.random()-0.5)*60, y: -30 - Math.random()*40,
      opacity: 0, scale: Math.random()*1.5+0.5,
      duration: 0.6 + Math.random()*0.4,
      ease: 'power2.out',
      onComplete: () => dot.remove()
    });
  }
}
function spawnRippleRing(target) {
  const svg = target.closest('svg');
  if (!svg) return;
  const circle = document.createElementNS('http://www.w3.org/2000/svg','circle');
  circle.setAttribute('cx', '100'); circle.setAttribute('cy', '100'); circle.setAttribute('r', '80');
  circle.setAttribute('fill','none'); circle.setAttribute('stroke','rgba(201,161,74,.6)');
  circle.setAttribute('stroke-width','2');
  svg.appendChild(circle);
  gsap.to(circle, {
    attr: { r: 95, 'stroke-width': 0.5 },
    opacity: 0, duration: 0.6, ease: 'expo.out',
    onComplete: () => circle.remove()
  });
}
function initAmbientOrbs() {
  const canvas = document.createElement('canvas');
  canvas.id = 'ambient-bg';
  canvas.style.cssText = `
    position:fixed;inset:0;width:100%;height:100%;
    pointer-events:none;z-index:0;
    transition:opacity .5s`;
  document.body.insertAdjacentElement('afterbegin', canvas);
  const ctx  = canvas.getContext('2d');
  let t = 0, rafId, orbs = [];
  function resize() { canvas.width=innerWidth; canvas.height=innerHeight; }
  resize();
  window.addEventListener('resize', resize, { passive:true });
  function buildOrbs() {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    const dark = theme === 'dark' || theme === 'oled';
    const oled = theme === 'oled';
    orbs = [
      { ox:0.78,oy:0.12, r: dark?380:320, a: dark?0.08:0.05,
        color: dark?'77,216,102':'14,59,46', sp:0.00045 },
      { ox:0.12,oy:0.78, r: dark?320:260, a: dark?0.06:0.04,
        color: dark?'201,161,74':'180,130,50', sp:0.00065 },
      { ox:0.65,oy:0.55, r: dark?280:220, a: dark?0.05:0.03,
        color: dark?'90,171,255':'42,122,95', sp:0.0003 },
    ];
    if (oled) orbs.forEach(o => o.a *= 2.5);
    canvas.style.opacity = dark ? '1' : '0.7';
  }
  buildOrbs();
  new MutationObserver(buildOrbs).observe(
    document.documentElement, { attributes:true, attributeFilter:['data-theme'] }
  );
  function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const w=canvas.width, h=canvas.height;
    orbs.forEach(o => {
      const x = (o.ox + Math.sin(t * o.sp * 0.9) * 0.09) * w;
      const y = (o.oy + Math.cos(t * o.sp)        * 0.07) * h;
      const g = ctx.createRadialGradient(x,y,0, x,y,o.r);
      g.addColorStop(0, `rgba(${o.color},${o.a})`);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g; ctx.beginPath();
      ctx.arc(x,y,o.r,0,Math.PI*2); ctx.fill();
    });
    t++;
    rafId = requestAnimationFrame(draw);
  }
  draw();
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(rafId);
    else { t=0; draw(); }
  });
}
function initGlassTopbar() {
  const topbar = document.querySelector('.topbar');
  if (!topbar) return;
  const scroller = document.querySelector('.main');
  const onScroll = () => {
    const y = (scroller && scroller !== window)
      ? scroller.scrollTop
      : window.scrollY;
    topbar.classList.toggle('glass-active', y > 30);
  };
  if (scroller) scroller.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();
}
function overrideConfetti() {
  if (typeof confetti === 'undefined') return;
  window.triggerConfetti = function() {
    const duration = 2200;
    const end = Date.now() + duration;
    const colors = ['#c9a14a','#e6c97a','#4dd866','#ffffff','#5aabff','#ff6b85'];
    const frame = () => {
      confetti({ particleCount: 4, angle: 60, spread: 55,
        origin: { x: 0 }, colors,
        gravity: 1.1, scalar: 1.1, drift: 0 });
      confetti({ particleCount: 4, angle: 120, spread: 55,
        origin: { x: 1 }, colors,
        gravity: 1.1, scalar: 1.1, drift: 0 });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
    confetti({ particleCount: 80, spread: 120, origin: { x:0.5, y:0.55 },
      colors, gravity: 1, scalar: 1.2 });
  };
}
function initCounterAnimations() {
  if (typeof gsap === 'undefined') return;
  const statEls = document.querySelectorAll(
    '#stat-takbeer,#stat-juz,#stat-pray,#stat-prog,.metric-val,.zad-pts'
  );
  statEls.forEach(el => {
    const raw = el.textContent.replace(/[^\d.]/g,'');
    const num = parseFloat(raw);
    if (!num || isNaN(num)) return;
    ScrollTrigger.create({
      trigger: el, start:'top 85%', once:true,
      onEnter: () => {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: num, duration: 1.4, ease: 'power3.out',
          onUpdate() {
            el.textContent = el.textContent.includes('%')
              ? Math.round(obj.val) + '%'
              : Math.round(obj.val).toLocaleString('ar-EG');
          }
        });
      }
    });
  });
}
const _origApplyTheme = window.applyTheme;
window.applyTheme = function(theme) {
  const flash = document.createElement('div');
  flash.style.cssText = `position:fixed;inset:0;background:${
    theme==='light'?'rgba(250,246,236,1)':'rgba(0,0,0,1)'
  };z-index:10000;pointer-events:none;opacity:0`;
  document.body.appendChild(flash);
  if (typeof gsap !== 'undefined') {
    gsap.timeline()
      .to(flash, { opacity: 0.8, duration: 0.12, ease: 'power2.in' })
      .call(() => { if (_origApplyTheme) _origApplyTheme(theme); })
      .to(flash, { opacity: 0, duration: 0.3, ease: 'power2.out',
        onComplete: () => flash.remove() });
  } else {
    if (_origApplyTheme) _origApplyTheme(theme);
    flash.remove();
  }
};