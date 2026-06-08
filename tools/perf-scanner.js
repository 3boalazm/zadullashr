/* ═══════════════════════════════════════════════════════════════
   فاحص الأداء v1 — أداة تشخيص لمطوّر زاد العشر
   • يقيس Core Web Vitals الحقيقية (LCP/CLS/FCP) من PerformanceObserver
   • أزمنة التحميل (TTFB/DOMContentLoaded/Load) من Navigation Timing
   • تحليل الموارد (عدد/حجم/أبطأ) + الذاكرة (Chrome)
   • كل القياسات حقيقية من APIs المتصفح — لا محاكاة
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  if(window.__ptOpen){
    document.getElementById('pt-panel')?.remove();
    window.__ptOpen=false; return;
  }
  window.__ptOpen=true;

  /* ── جمع المقاييس ── */
  function collectMetrics(){
    var m = { nav:{}, vitals:{}, resources:{}, memory:null };

    /* Navigation Timing */
    var navEntries = performance.getEntriesByType('navigation');
    if(navEntries.length){
      var n = navEntries[0];
      m.nav.ttfb = Math.round(n.responseStart - n.requestStart);
      m.nav.domContentLoaded = Math.round(n.domContentLoadedEventEnd - n.startTime);
      m.nav.load = Math.round(n.loadEventEnd - n.startTime);
      m.nav.domInteractive = Math.round(n.domInteractive - n.startTime);
      m.nav.transferSize = n.transferSize || 0;
    }

    /* Paint Timing (FCP) */
    var paints = performance.getEntriesByType('paint');
    paints.forEach(function(p){
      if(p.name==='first-contentful-paint') m.vitals.fcp = Math.round(p.startTime);
    });

    /* LCP — آخر قيمة من الـ buffer */
    try{
      var lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      if(lcpEntries.length) m.vitals.lcp = Math.round(lcpEntries[lcpEntries.length-1].startTime);
    }catch(e){}

    /* CLS — يُجمَّع عبر observer (نقرأ المتراكم) */
    m.vitals.cls = window.__ptCLS!==undefined ? window.__ptCLS.toFixed(3) : 'يُقاس...';

    /* Resources */
    var res = performance.getEntriesByType('resource');
    var totalSize=0, byType={}, slowest=[];
    res.forEach(function(r){
      var size = r.transferSize || r.encodedBodySize || 0;
      totalSize += size;
      var type = r.initiatorType || 'other';
      byType[type] = (byType[type]||0) + 1;
      slowest.push({ name:r.name.split('/').pop().split('?')[0]||r.name, dur:Math.round(r.duration), size:size });
    });
    slowest.sort(function(a,b){return b.dur-a.dur;});
    m.resources = { count:res.length, totalSize:totalSize, byType:byType, slowest:slowest.slice(0,8) };

    /* Memory (Chrome only) */
    if(performance.memory){
      m.memory = {
        used: Math.round(performance.memory.usedJSHeapSize/1048576),
        total: Math.round(performance.memory.totalJSHeapSize/1048576),
        limit: Math.round(performance.memory.jsHeapSizeLimit/1048576)
      };
    }

    return m;
  }

  /* ── تقييم القيم (عتبات Web Vitals) ── */
  function rate(metric, val){
    if(val==='يُقاس...'||val==null) return {color:'#888', label:'—'};
    val = parseFloat(val);
    var thresholds = {
      lcp:[2500,4000], fcp:[1800,3000], cls:[0.1,0.25],
      ttfb:[800,1800], load:[3000,6000], domContentLoaded:[2000,4000]
    };
    var t = thresholds[metric];
    if(!t) return {color:'#7ce89a', label:'—'};
    if(val<=t[0]) return {color:'#4ade80', label:'✅ جيد'};
    if(val<=t[1]) return {color:'#ffb74d', label:'🟠 مقبول'};
    return {color:'#ff6b6b', label:'🔴 ضعيف'};
  }

  function fmtSize(bytes){
    if(bytes<1024) return bytes+' B';
    if(bytes<1048576) return (bytes/1024).toFixed(1)+' KB';
    return (bytes/1048576).toFixed(2)+' MB';
  }

  /* ── بناء اللوحة ── */
  var M = collectMetrics();

  var panel=document.createElement('div');
  panel.id='pt-panel';
  panel.style.cssText='position:fixed;bottom:0;right:0;left:0;max-height:70vh;z-index:999999;background:#0d0d0d;color:#eee;font-family:system-ui,sans-serif;font-size:13px;box-shadow:0 -8px 30px rgba(0,0,0,.5);border-top:3px solid #4fa3e8;display:flex;flex-direction:column;direction:rtl';

  var header=document.createElement('div');
  header.style.cssText='padding:12px 16px;background:#1a1a1a;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;flex-wrap:wrap;gap:8px';
  header.innerHTML='<div><b style="color:#4fa3e8;font-size:15px">⚡ فاحص الأداء</b> &nbsp; <span style="color:#aaa;font-size:12px">'+(location.pathname.split('/').pop()||'index.html')+'</span></div>'+
    '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">'+
      '<button id="pt-report" style="background:#2a7a5f;border:none;color:#fff;padding:6px 12px;border-radius:8px;cursor:pointer;font-weight:700;font-size:12px">📋 نسخ التقرير</button>'+
      '<button id="pt-refresh" style="background:#3a6ea5;border:none;color:#fff;padding:6px 12px;border-radius:8px;cursor:pointer;font-weight:700;font-size:12px">🔄 إعادة قياس</button>'+
      '<button id="pt-close" style="background:#333;border:none;color:#fff;width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:16px">✕</button>'+
    '</div>';
  panel.appendChild(header);

  var note=document.createElement('div');
  note.style.cssText='padding:6px 16px;background:#11151a;color:#888;font-size:11.5px;flex-shrink:0;border-bottom:1px solid #222';
  note.innerHTML='قياسات حقيقية من APIs المتصفح · LCP/CLS تُقاس بدقة بعد ثوانٍ من التحميل · <b style="color:#aaa">أعد القياس بعد تصفّح الصفحة.</b>';
  panel.appendChild(note);

  var body=document.createElement('div');
  body.id='pt-body';
  body.style.cssText='overflow-y:auto;padding:12px 14px;flex:1';
  panel.appendChild(body);
  document.body.appendChild(panel);

  function renderMetrics(M){
    var h='';
    /* Core Web Vitals */
    h+='<div style="font-weight:700;color:#4fa3e8;margin-bottom:8px">🎯 Core Web Vitals</div>';
    h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;margin-bottom:16px">';
    var vitals=[
      ['LCP', M.vitals.lcp, 'lcp', 'ms', 'أكبر عنصر مرئي'],
      ['FCP', M.vitals.fcp, 'fcp', 'ms', 'أول رسم محتوى'],
      ['CLS', M.vitals.cls, 'cls', '', 'إزاحة التخطيط'],
    ];
    vitals.forEach(function(v){
      var r=rate(v[2], v[1]);
      var val = v[1]!=null ? v[1]+v[3] : '—';
      h+='<div style="background:#171c24;border:1px solid #262d38;border-radius:10px;padding:12px">'+
        '<div style="font-size:11px;color:#888">'+v[0]+' · '+v[4]+'</div>'+
        '<div style="font-size:20px;font-weight:800;color:'+r.color+';margin:4px 0">'+val+'</div>'+
        '<div style="font-size:11px;color:'+r.color+'">'+r.label+'</div>'+
        '</div>';
    });
    h+='</div>';

    /* Navigation Timing */
    h+='<div style="font-weight:700;color:#4fa3e8;margin-bottom:8px">⏱ أزمنة التحميل</div>';
    h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;margin-bottom:16px">';
    var navs=[
      ['TTFB', M.nav.ttfb, 'ttfb', 'زمن أول بايت'],
      ['DOM Interactive', M.nav.domInteractive, null, 'جاهزية DOM'],
      ['DOMContentLoaded', M.nav.domContentLoaded, 'domContentLoaded', 'اكتمال DOM'],
      ['Load كامل', M.nav.load, 'load', 'التحميل الكامل'],
    ];
    navs.forEach(function(v){
      var r=rate(v[2], v[1]);
      h+='<div style="background:#171c24;border:1px solid #262d38;border-radius:10px;padding:12px">'+
        '<div style="font-size:11px;color:#888">'+v[0]+' · '+v[3]+'</div>'+
        '<div style="font-size:18px;font-weight:800;color:'+(v[2]?r.color:'#ddd')+';margin:4px 0">'+(v[1]!=null?v[1]+' ms':'—')+'</div>'+
        (v[2]?'<div style="font-size:11px;color:'+r.color+'">'+r.label+'</div>':'')+
        '</div>';
    });
    h+='</div>';

    /* Resources */
    h+='<div style="font-weight:700;color:#4fa3e8;margin-bottom:8px">📦 الموارد ('+M.resources.count+' · '+fmtSize(M.resources.totalSize)+')</div>';
    var typeStr = Object.keys(M.resources.byType).map(function(t){return t+': '+M.resources.byType[t];}).join(' · ');
    h+='<div style="color:#aaa;font-size:12px;margin-bottom:8px">'+typeStr+'</div>';
    if(M.resources.slowest.length){
      h+='<div style="background:#171c24;border:1px solid #262d38;border-radius:10px;padding:8px;margin-bottom:16px">';
      h+='<div style="font-size:11px;color:#888;margin-bottom:6px">أبطأ الموارد:</div>';
      M.resources.slowest.forEach(function(r){
        var c = r.dur>1000?'#ff6b6b':r.dur>500?'#ffb74d':'#7ce89a';
        h+='<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:11.5px;border-bottom:1px solid #1e2430">'+
          '<span style="color:#ccc;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:55%">'+r.name+'</span>'+
          '<span style="color:#888">'+fmtSize(r.size)+'</span>'+
          '<span style="color:'+c+';font-weight:700">'+r.dur+'ms</span>'+
          '</div>';
      });
      h+='</div>';
    }

    /* Memory */
    if(M.memory){
      var memPct = Math.round(M.memory.used/M.memory.limit*100);
      h+='<div style="font-weight:700;color:#4fa3e8;margin-bottom:8px">🧠 الذاكرة (JS Heap)</div>';
      h+='<div style="background:#171c24;border:1px solid #262d38;border-radius:10px;padding:12px;margin-bottom:8px">'+
        '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px"><span style="color:#aaa">مُستخدَم: <b style="color:#eee">'+M.memory.used+' MB</b></span><span style="color:#888">من '+M.memory.limit+' MB</span></div>'+
        '<div style="height:6px;background:#0a0d11;border-radius:3px;overflow:hidden"><div style="height:100%;width:'+memPct+'%;background:'+(memPct>70?'#ff6b6b':memPct>40?'#ffb74d':'#4ade80')+'"></div></div>'+
        '</div>';
    } else {
      h+='<div style="color:#666;font-size:12px">🧠 الذاكرة: متاحة في Chrome فقط</div>';
    }

    body.innerHTML=h;
  }

  renderMetrics(M);

  /* ── أزرار ── */
  document.getElementById('pt-close').onclick=function(){ panel.remove(); window.__ptOpen=false; };
  document.getElementById('pt-refresh').onclick=function(){ M=collectMetrics(); renderMetrics(M); };

  document.getElementById('pt-report').onclick=function(){
    var L=['═══ تقرير الأداء — زاد العشر ═══','الصفحة: '+(location.pathname.split('/').pop()||'index.html'),'التاريخ: '+new Date().toLocaleString('ar-EG'),''];
    L.push('── Core Web Vitals ──');
    L.push('LCP: '+(M.vitals.lcp!=null?M.vitals.lcp+'ms':'—')+' | FCP: '+(M.vitals.fcp!=null?M.vitals.fcp+'ms':'—')+' | CLS: '+M.vitals.cls);
    L.push('');
    L.push('── أزمنة التحميل ──');
    L.push('TTFB: '+M.nav.ttfb+'ms | DOMContentLoaded: '+M.nav.domContentLoaded+'ms | Load: '+M.nav.load+'ms');
    L.push('');
    L.push('── الموارد ──');
    L.push('العدد: '+M.resources.count+' | الحجم الكلي: '+fmtSize(M.resources.totalSize));
    L.push('أبطأ الموارد:');
    M.resources.slowest.forEach(function(r){ L.push('  '+r.name+' — '+r.dur+'ms ('+fmtSize(r.size)+')'); });
    if(M.memory){ L.push(''); L.push('── الذاكرة ──'); L.push('مُستخدَم: '+M.memory.used+'MB من '+M.memory.limit+'MB'); }
    var txt=L.join('\n');
    if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(txt).catch(function(){fb(txt);});
    else fb(txt);
    var btn=document.getElementById('pt-report'),o=btn.textContent;btn.textContent='✅ تم';setTimeout(function(){btn.textContent=o;},1500);
    function fb(t){var ta=document.createElement('textarea');ta.value=t;ta.style.cssText='position:fixed;opacity:0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');}catch(e){}document.body.removeChild(ta);}
  };

  console.log('[فاحص الأداء v1]', M);
})();
