/* ════════════════════════════════════════════════════════════
   فاحص الكونتراست — أداة تشخيص لمطوّر زاد العشر
   تفحص كل عناصر النص في الصفحة الحالية وتقيس نسبة الكونتراست
   الفعلية (WCAG) بين لون النص والخلفية، وتُبرز العناصر الضعيفة.
   تعمل في أي صفحة وأي وضع (لايت/دارك/أوليد + عذر).
   ════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  if (window.__ctOpen) { document.getElementById('ct-panel')?.remove(); window.__ctOpen=false; return; }
  window.__ctOpen = true;

  /* ── حساب اللمعان والكونتراست (WCAG 2.1) ── */
  function parseColor(str){
    if(!str) return null;
    const m = str.match(/rgba?\(([^)]+)\)/);
    if(!m) return null;
    const p = m[1].split(',').map(s=>parseFloat(s.trim()));
    return { r:p[0], g:p[1], b:p[2], a:(p[3]===undefined?1:p[3]) };
  }
  function lum(c){
    const f = v => { v/=255; return v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055,2.4); };
    return 0.2126*f(c.r)+0.7152*f(c.g)+0.0722*f(c.b);
  }
  function ratio(fg,bg){
    const l1=lum(fg), l2=lum(bg);
    const hi=Math.max(l1,l2), lo=Math.min(l1,l2);
    return (hi+0.05)/(lo+0.05);
  }
  /* ادمج لون نص شبه-شفاف فوق الخلفية */
  function blend(fg,bg){
    if(fg.a>=1) return fg;
    return { r: fg.r*fg.a + bg.r*(1-fg.a), g: fg.g*fg.a + bg.g*(1-fg.a), b: fg.b*fg.a + bg.b*(1-fg.a), a:1 };
  }
  /* لاقي الخلفية الفعلية (اصعد للأب لو شفاف) */
  function effectiveBg(el){
    let node = el;
    while(node && node !== document.documentElement){
      const bg = parseColor(getComputedStyle(node).backgroundColor);
      if(bg && bg.a > 0.05) return bg;
      node = node.parentElement;
    }
    const bodyBg = parseColor(getComputedStyle(document.body).backgroundColor);
    return (bodyBg && bodyBg.a>0.05) ? bodyBg : {r:255,g:255,b:255,a:1};
  }

  /* ── افحص كل عنصر نص مرئي ── */
  const results = [];
  const seen = new Set();
  document.querySelectorAll('p,span,a,h1,h2,h3,h4,h5,h6,li,td,th,label,button,div,small,b,strong,em').forEach(el=>{
    /* لازم يكون فيه نص مباشر (مش بس عناصر أبناء) */
    const directText = Array.from(el.childNodes).some(n=>n.nodeType===3 && n.textContent.trim().length>1);
    if(!directText) return;
    const cs = getComputedStyle(el);
    if(cs.display==='none' || cs.visibility==='hidden' || parseFloat(cs.opacity)<0.1) return;
    const rect = el.getBoundingClientRect();
    if(rect.width<4 || rect.height<4) return;

    let fg = parseColor(cs.color);
    if(!fg) return;
    const bg = effectiveBg(el);
    fg = blend(fg, bg);
    const r = ratio(fg, bg);

    /* عتبة WCAG: نص كبير (≥18.66px أو ≥14px غامق) = 3.0، عادي = 4.5 */
    const size = parseFloat(cs.fontSize);
    const bold = (parseInt(cs.fontWeight)||400) >= 700;
    const isLarge = size>=24 || (size>=18.66 && bold);
    const threshold = isLarge ? 3.0 : 4.5;

    if(r < threshold){
      const txt = el.textContent.trim().slice(0,40);
      const key = txt + '|' + Math.round(r*10);
      if(seen.has(key)) return;
      seen.add(key);
      results.push({ el, r:r.toFixed(2), threshold, txt, size:Math.round(size), tag:el.tagName.toLowerCase() });
      /* علّم العنصر بصرياً */
      el.style.outline = '2px dashed #ff3b30';
      el.style.outlineOffset = '1px';
      el.dataset.ctMarked = '1';
    }
  });

  results.sort((a,b)=>parseFloat(a.r)-parseFloat(b.r));

  /* ── ابنِ لوحة التقرير ── */
  const theme = document.documentElement.getAttribute('data-theme')||'light';
  const excuse = document.documentElement.getAttribute('data-excuse')==='on';
  const panel = document.createElement('div');
  panel.id = 'ct-panel';
  panel.style.cssText = 'position:fixed;bottom:0;right:0;left:0;max-height:55vh;z-index:999999;background:#0d0d0d;color:#eee;font-family:system-ui,sans-serif;font-size:13px;box-shadow:0 -8px 30px rgba(0,0,0,.5);border-top:3px solid #ff3b30;display:flex;flex-direction:column;direction:rtl';

  const header = document.createElement('div');
  header.style.cssText='padding:12px 16px;background:#1a1a1a;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;flex-wrap:wrap;gap:8px';
  const modeLabel = 'الوضع: '+(theme==='light'?'☀️ فاتح':theme==='dark'?'🌙 داكن':'⚫ أوليد')+(excuse?' + 🌸 عذر':'');
  header.innerHTML = '<div><b style="color:#ff6b6b;font-size:15px">🔍 فاحص الكونتراست</b> &nbsp; <span style="color:#aaa">'+modeLabel+'</span></div>'+
    '<div style="display:flex;gap:8px;align-items:center">'+
      '<span style="background:'+(results.length?'#ff3b30':'#1a7d4f')+';padding:4px 12px;border-radius:99px;font-weight:700">'+(results.length? results.length+' مشكلة':'✅ سليم')+'</span>'+
      '<button id="ct-close" style="background:#333;border:none;color:#fff;width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:16px">✕</button>'+
    '</div>';
  panel.appendChild(header);

  const body = document.createElement('div');
  body.style.cssText='overflow-y:auto;padding:8px 12px';
  if(results.length===0){
    body.innerHTML = '<div style="padding:24px;text-align:center;color:#4ade80">🎉 مفيش مشاكل كونتراست في الصفحة دي بالوضع الحالي!<br><small style="color:#888">جرّب باقي الأوضاع (لايت/دارك/أوليد/عذر) وباقي الصفحات.</small></div>';
  } else {
    results.forEach((res,i)=>{
      const row = document.createElement('div');
      row.style.cssText='padding:10px;border-bottom:1px solid #222;display:flex;gap:10px;align-items:center;cursor:pointer';
      row.innerHTML =
        '<span style="background:#ff3b30;color:#fff;border-radius:6px;padding:2px 8px;font-weight:700;font-size:12px;white-space:nowrap">'+res.r+'</span>'+
        '<span style="color:#888;font-size:11px;white-space:nowrap">يحتاج ≥'+res.threshold+'</span>'+
        '<span style="flex:1;color:#ddd;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">«'+res.txt+'»</span>'+
        '<span style="color:#666;font-size:11px;white-space:nowrap">&lt;'+res.tag+'&gt; '+res.size+'px</span>';
      row.onclick = ()=>{ res.el.scrollIntoView({behavior:'smooth',block:'center'}); res.el.style.outline='3px solid #ffcc00'; setTimeout(()=>{res.el.style.outline='2px dashed #ff3b30';},1500); };
      body.appendChild(row);
    });
  }
  panel.appendChild(body);
  document.body.appendChild(panel);

  document.getElementById('ct-close').onclick = ()=>{
    document.querySelectorAll('[data-ct-marked]').forEach(el=>{ el.style.outline=''; el.style.outlineOffset=''; delete el.dataset.ctMarked; });
    panel.remove(); window.__ctOpen=false;
  };

  console.log('[فاحص الكونتراست]', results.length, 'مشكلة في', location.pathname, '| الوضع:', theme, excuse?'+عذر':'');
})();
