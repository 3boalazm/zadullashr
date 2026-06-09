/* ═══════════════════════════════════════════════════════════════════════════
   زاد — ui/daily-hub.js
   ─────────────────────────────────────────────────────────────────────────
   طبقة «الآن» — كارت واحد على الصفحة الرئيسية يجيب عن سؤال: «أعمل إيه دلوقتي؟»
   يجمّع بياناتٍ موجودةً أصلًا فقط (لا ميزات جديدة):
     • الصلاة القادمة + المتبقّي   ← localStorage.zad_prayer_cache
     • أذكار الوقت (صباح/مساء)      ← الساعة + zad_v2.worship
     • مناسبة اليوم                ← Intl Umm-al-Qura (نفس منطق barnamaj)
     • الورد القرآني / السلسلة      ← zad_v2.worship / streak
   يختار خطوةً رئيسيةً واحدة + قائمة «لاحقًا اليوم» قصيرة، ويتدرّج بأمان عند نقص البيانات.
   ═══════════════════════════════════════════════════════════════════════════ */

const ZadDailyHub = (() => {
  'use strict';

  const AR_PRAYER = { Fajr:'الفجر', Dhuhr:'الظهر', Asr:'العصر', Maghrib:'المغرب', Isha:'العشاء' };
  const OBLIG = ['Fajr','Dhuhr','Asr','Maghrib','Isha'];

  function state() { return window.STATE || window.ZadState?.get?.() || {}; }

  /* تحية حسب الوقت */
  function greeting() {
    const h = new Date().getHours();
    if (h < 5)  return { text: 'تهجّد مبارك', icon: '🌙' };
    if (h < 12) return { text: 'صباح الخير', icon: '🌅' };
    if (h < 15) return { text: 'يومك مبارك', icon: '☀️' };
    if (h < 19) return { text: 'مساء الخير', icon: '🌇' };
    return { text: 'ليلة طيبة', icon: '🌙' };
  }

  /* الصلاة القادمة من الكاش المحفوظ (بدون شبكة) */
  function nextPrayer() {
    let timings = null;
    try { timings = (JSON.parse(localStorage.getItem('zad_prayer_cache') || 'null') || {}).timings || null; } catch (e) {}
    if (!timings) return null;
    const now = new Date();
    for (const k of OBLIG) {
      const v = timings[k]; if (!v) continue;
      const [hh, mm] = String(v).split(':').map(Number);
      if (isNaN(hh)) continue;
      const t = new Date(); t.setHours(hh, mm, 0, 0);
      if (t > now) {
        const mins = Math.round((t - now) / 60000);
        return { key: k, name: AR_PRAYER[k], time: String(v).substring(0, 5), mins };
      }
    }
    /* كلها فاتت → الفجر غدًا */
    const f = timings.Fajr;
    if (f) { const [hh, mm] = String(f).split(':').map(Number); const t = new Date(); t.setDate(t.getDate()+1); t.setHours(hh, mm, 0, 0); return { key:'Fajr', name:AR_PRAYER.Fajr, time:String(f).substring(0,5), mins: Math.round((t-now)/60000) }; }
    return null;
  }

  /* التاريخ الهجري (Umm al-Qura) — نفس منطق barnamaj */
  function hijri() {
    try {
      const p = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { day:'numeric', month:'numeric' }).formatToParts(new Date());
      return { d: +(p.find(x => x.type==='day').value), m: +(p.find(x => x.type==='month').value) };
    } catch (e) { return null; }
  }

  /* مناسبات اليوم — نفس منطق barnamaj، لكن بصيغة خطوات قصيرة قابلة للنقر */
  function occasions(worship) {
    const now = new Date(), dow = now.getDay(), h = hijri(), out = [];
    const fasting = !!worship.fasting;
    if (h) {
      if (h.m === 12 && h.d === 9) out.push({ e:'🌄', label:'صيام يوم عرفة — يكفّر سنتين', href:'arafah.html', score:96 });
      if (h.m === 1  && h.d === 10) out.push({ e:'🤍', label:'صيام عاشوراء — يكفّر السنة الماضية', href:'barnamaj.html', score:92 });
      if (h.m === 1  && h.d === 9)  out.push({ e:'🤍', label:'صيام تاسوعاء (التاسع)', href:'barnamaj.html', score:70 });
      if (h.m === 9)                out.push({ e:'🌙', label:'رمضان — اغتنم القرآن والقيام', href:'barnamaj.html', score:48 });
      if (h.m !== 12 && h.d >= 13 && h.d <= 15 && !fasting) out.push({ e:'🤍', label:`الأيام البيض (${h.d}) — صيام مستحب`, href:'barnamaj.html', score:62 });
    }
    if ((dow === 1 || dow === 4) && !fasting) out.push({ e:'🌿', label:`صيام ${dow===1?'الاثنين':'الخميس'} — تُعرض فيه الأعمال`, href:'barnamaj.html', score:66 });
    if (dow === 5) out.push({ e:'🕌', label:'سورة الكهف وكثرة الصلاة على النبي ﷺ', href:'mushaf-quran.html', score:85 });
    return out;
  }

  /* بناء أجندة مرتّبة بالأولوية */
  function buildAgenda() {
    const h = new Date().getHours();
    const st = state();
    const worship = st.worship || {};
    const items = [];

    const np = nextPrayer();
    if (np) {
      const urgent = np.mins <= 45;
      items.push({ icon:'🕌', label:`صلاة ${np.name} · ${np.time}`,
                   sub: np.mins <= 120 ? `بعد ${np.mins} دقيقة` : null,
                   href:'prayers.html', score: urgent ? 100 : 55 });
    }
    if (h >= 4 && h < 11 && !worship.morning_dhikr)  items.push({ icon:'🌅', label:'أذكار الصباح', href:'adhkar.html', score:90 });
    else if (h >= 15 && h < 20 && !worship.evening_dhikr) items.push({ icon:'🌇', label:'أذكار المساء', href:'adhkar.html', score:90 });

    occasions(worship).forEach(o => items.push({ icon:o.e, label:o.label, href:o.href, score:o.score }));

    items.push({ icon:'📖', label:'وردك القرآني', href:'mushaf.html', score:50 });

    const doneCount = Object.values(worship).filter(Boolean).length;
    if (doneCount === 0) items.push({ icon:'📿', label:'ابدأ سلسلتك بالتسبيح', href:'takbeer.html', score:44 });
    else                 items.push({ icon:'📿', label:'سبّح الله', href:'takbeer.html', score:20 });

    /* dedupe حسب الوجهة (نُبقي الأعلى)، ثم ترتيب تنازلي */
    const byHref = {};
    for (const it of items) { if (!byHref[it.href] || it.score > byHref[it.href].score) byHref[it.href] = it; }
    const list = Object.values(byHref).sort((a, b) => b.score - a.score);
    return { primary: list[0], later: list.slice(1, 4) };
  }

  /* للتوافق مع الاستدعاءات القديمة */
  function suggestedAction() { const a = buildAgenda().primary; return { label:a.label, href:a.href, icon:a.icon }; }

  /* حساب تقدم اليوم (كما كان) */
  function dayProgress() {
    const st = state();
    const worship = st.worship || {};
    const total = 5;
    const done = Object.values(worship).filter(Boolean).length;
    const pct = Math.min(Math.round((done / total) * 100), 100);
    return { done, total, pct, streak: st.streak || 0 };
  }

  /* بناء الكارت */
  function build() {
    const main = document.querySelector('main.main, #main-content');
    if (!main || document.getElementById('zad-daily-hub')) return;

    const g = greeting();
    const prog = dayProgress();
    const { primary, later } = buildAgenda();

    const laterHTML = later.length ? `
      <div class="zdh-later">
        <div class="zdh-later-title">لاحقًا اليوم</div>
        ${later.map(it => `
          <a href="${it.href}" class="zdh-later-item">
            <span class="zdh-li-icon" aria-hidden="true">${it.icon}</span>
            <span class="zdh-li-label">${it.label}</span>
            <span class="zdh-li-arrow" aria-hidden="true">←</span>
          </a>`).join('')}
      </div>` : '';

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
      <div class="zdh-now-label">✨ الآن</div>
      <a href="${primary.href}" class="zdh-cta">
        <span class="zdh-cta-icon">${primary.icon}</span>
        <span class="zdh-cta-text">${primary.label}${primary.sub ? `<span class="zdh-cta-sub">${primary.sub}</span>` : ''}</span>
        <span class="zdh-cta-arrow">←</span>
      </a>
      ${laterHTML}
    `;

    const hijriBar = main.querySelector('.hijri-bar');
    const anchor = hijriBar || main.querySelector('.topbar');
    if (anchor && anchor.nextSibling) main.insertBefore(hub, anchor.nextSibling);
    else main.prepend(hub);
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
        margin-bottom: 14px; position: relative; z-index: 1; }
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
      .zdh-now-label { font-size: 11px; font-weight: 800; letter-spacing: .5px;
        opacity: .8; margin-bottom: 8px; position: relative; z-index: 1; }
      .zdh-cta { display: flex; align-items: center; gap: 12px;
        background: rgba(255,255,255,.15); backdrop-filter: blur(8px);
        border-radius: var(--r-md,12px); padding: 14px 16px; text-decoration: none;
        color: #fff; position: relative; z-index: 1;
        transition: background .2s, transform .2s; min-height: 44px;
        -webkit-tap-highlight-color: transparent; }
      .zdh-cta:hover { background: rgba(255,255,255,.25); transform: translateX(-3px); }
      .zdh-cta:active { transform: scale(.98); }
      .zdh-cta-icon { font-size: 24px; }
      .zdh-cta-text { flex: 1; font-size: 15px; font-weight: 800; display:flex; flex-direction:column; gap:2px; }
      .zdh-cta-sub { font-size: 11.5px; font-weight: 600; opacity: .85; }
      .zdh-cta-arrow { font-size: 18px; opacity: .8; }
      .zdh-later { margin-top: 12px; position: relative; z-index: 1; display: flex; flex-direction: column; gap: 6px; }
      .zdh-later-title { font-size: 11px; font-weight: 700; opacity: .7; margin-bottom: 2px; }
      .zdh-later-item { display: flex; align-items: center; gap: 10px;
        background: rgba(255,255,255,.07); border-radius: 10px; padding: 9px 12px;
        text-decoration: none; color: #fff; min-height: 40px;
        transition: background .2s; -webkit-tap-highlight-color: transparent; }
      .zdh-later-item:hover { background: rgba(255,255,255,.14); }
      .zdh-later-item:active { transform: scale(.99); }
      .zdh-li-icon { font-size: 17px; flex-shrink: 0; }
      .zdh-li-label { flex: 1; font-size: 13px; font-weight: 700; opacity: .95; }
      .zdh-li-arrow { font-size: 14px; opacity: .55; }
      @media (prefers-reduced-motion: reduce) {
        .zdh-ring-fg, .zdh-cta, .zdh-later-item { transition: none !important; }
      }
    `;
    document.head.appendChild(s);
  }

  function init() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    if (page !== 'index.html' && page !== '') return;
    injectCSS();
    setTimeout(build, 300);
    /* أعد البناء مرة بعد ثانيتين إن تأخّر كاش الصلاة/الحالة (مرة واحدة) */
    setTimeout(() => {
      const hub = document.getElementById('zad-daily-hub');
      if (hub && !hub.dataset.refreshed) { hub.dataset.refreshed = '1'; hub.remove(); build(); }
    }, 2200);
  }

  return { init, build, dayProgress, suggestedAction, buildAgenda };
})();

window.ZadDailyHub = ZadDailyHub;
document.addEventListener('DOMContentLoaded', () => ZadDailyHub.init());
