/* ════════════════════════════════════════════════════════════
   فاحص الكونتراست v3 — أداة تشخيص لمطوّر زاد العشر
   • فحص الصفحة الحالية + فحص كل الموقع (عبر iframe، same-origin)
   • الضغط على مشكلة → سكرول + تحديد واضح
   • تقرير نصّي قابل للنسخ
   ════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  if (window.__ctOpen) {
    document.getElementById('ct-panel')?.remove();
    document.querySelectorAll('[data-ct-marked]').forEach(el=>{ el.style.outline=''; el.style.boxShadow=''; delete el.dataset.ctMarked; });
    window.__ctOpen=false; return;
  }
  window.__ctOpen = true;

  /* قائمة صفحات الموقع للفحص الشامل */
  var SITE_PAGES = ["index.html","prayers.html","qibla.html","hijri.html","taqweem.html","mushaf.html","mushaf-quran.html","tasmee.html","adhkar.html","adhkar-categories.html","adhkar-section.html","hasn.html","du'a.html","dua-guide.html","nawawi.html","ruqyah.html","sunan.html","worship.html","fadael.html","arafah.html","arafah-dua.html","odhiya.html","manasik.html","sadaqah.html","zakat.html","hasad.html","summary.html","badges.html","groups.html","group-board.html","barnamaj.html","playlist.html","Quran-radio.HTML","videos.html","asma.html","ai.html","kids.html","kids-fun.html","kids-creativity.html","kids-school.html","kids-heroes.html","kids-parents.html","ghars.html","zahra.html","profile.html","settings.html","report.html","about.html","developer.html","privacy.html","takbeer.html"];

  /* ── دوال الكونتراست (WCAG 2.1) ── */
  function parseColor(str){
    if(!str || str==='transparent') return null;
    var m = str.match(/rgba?\(([^)]+)\)/); if(!m) return null;
    var p = m[1].split(',').map(function(s){return parseFloat(s.trim());});
    return { r:p[0], g:p[1], b:p[2], a:(p[3]===undefined?1:p[3]) };
  }
  function lum(c){ var f=function(v){ v/=255; return v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055,2.4); }; return 0.2126*f(c.r)+0.7152*f(c.g)+0.0722*f(c.b); }
  function ratio(fg,bg){ var l1=lum(fg),l2=lum(bg),hi=Math.max(l1,l2),lo=Math.min(l1,l2); return (hi+0.05)/(lo+0.05); }
  function blend(fg,bg){ if(fg.a>=1) return fg; return { r:fg.r*fg.a+bg.r*(1-fg.a), g:fg.g*fg.a+bg.g*(1-fg.a), b:fg.b*fg.a+bg.b*(1-fg.a), a:1 }; }

  /* ── فحص مستند (الصفحة الحالية أو داخل iframe) ── */
  function scanDoc(doc, win){
    win = win || window;
    function hasGradient(node){ var bi=win.getComputedStyle(node).backgroundImage; return bi && bi!=='none' && /gradient|url/.test(bi); }
    function effectiveBg(el){
      var node=el;
      while(node && node!==doc.documentElement){
        if(hasGradient(node)) return null;
        var bg=parseColor(win.getComputedStyle(node).backgroundColor);
        if(bg && bg.a>0.5) return bg;
        node=node.parentElement;
      }
      if(hasGradient(doc.body)) return null;
      var bb=parseColor(win.getComputedStyle(doc.body).backgroundColor);
      return (bb && bb.a>0.5) ? bb : {r:255,g:255,b:255,a:1};
    }
    function isMostlyEmoji(t){
      var s=t.replace(/[\s\u0660-\u0669\u0030-\u0039:.،·\-/]/g,'');
      if(!s) return true;
      var e=(s.match(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F1E6}-\u{1F1FF}\u200d\u2190-\u21FF\u25A0-\u25FF\u2B00-\u2BFF]/gu)||[]).length;
      return e >= s.length*0.5;
    }
    function trulyVisible(el){
      var r=el.getBoundingClientRect();
      if(r.width<4 || r.height<4) return false;
      if(r.right<0 || r.left>(win.innerWidth||doc.documentElement.clientWidth)+5) return false;
      var node=el;
      while(node && node!==doc.body){
        var cs=win.getComputedStyle(node);
        if(cs.display==='none'||cs.visibility==='hidden'||parseFloat(cs.opacity)<0.1) return false;
        node=node.parentElement;
      }
      return true;
    }
    var out=[], skipped={emoji:0,gradient:0,hidden:0}, seen={};
    var els=doc.querySelectorAll('p,span,a,h1,h2,h3,h4,h5,h6,li,td,th,label,button,small,b,strong,em');
    Array.prototype.forEach.call(els, function(el){
      var direct=Array.prototype.some.call(el.childNodes,function(n){return n.nodeType===3 && n.textContent.trim().length>1;});
      if(!direct) return;
      var raw=el.textContent.trim();
      if(isMostlyEmoji(raw)){ skipped.emoji++; return; }
      if(!trulyVisible(el)){ skipped.hidden++; return; }
      var cs=win.getComputedStyle(el);
      var fg=parseColor(cs.color); if(!fg) return;
      var bg=effectiveBg(el);
      if(!bg){ skipped.gradient++; return; }
      fg=blend(fg,bg);
      var r=ratio(fg,bg);
      var size=parseFloat(cs.fontSize), bold=(parseInt(cs.fontWeight)||400)>=700;
      var isLarge=size>=24||(size>=18.66&&bold), threshold=isLarge?3.0:4.5;
      if(r<threshold){
        var txt=raw.slice(0,45), key=txt+'|'+Math.round(r*10);
        if(seen[key]) return; seen[key]=1;
        out.push({ el:el, r:r.toFixed(2), threshold:threshold, txt:txt, size:Math.round(size), tag:el.tagName.toLowerCase() });
      }
    });
    out.sort(function(a,b){return parseFloat(a.r)-parseFloat(b.r);});
    return { results:out, skipped:skipped };
  }

  /* ── حدّد عنصراً بصرياً (سكرول + إطار + توهّج) ── */
  function highlight(el){
    el.scrollIntoView({behavior:'smooth',block:'center'});
    el.style.transition='outline .2s,box-shadow .2s';
    el.style.outline='3px solid #ffcc00';
    el.style.boxShadow='0 0 0 6px rgba(255,204,0,.3)';
    setTimeout(function(){ el.style.outline='2px dashed #ff3b30'; el.style.boxShadow=''; }, 1800);
  }

  /* ── فحص الصفحة الحالية وبناء اللوحة ── */
  var scan = scanDoc(document, window);
  var results = scan.results, skipped = scan.skipped;
  results.forEach(function(res){ res.el.style.outline='2px dashed #ff3b30'; res.el.style.outlineOffset='1px'; res.el.dataset.ctMarked='1'; });

  var theme=document.documentElement.getAttribute('data-theme')||'light';
  var excuse=document.documentElement.getAttribute('data-excuse')==='on';
  var modeLabel='الوضع: '+(theme==='light'?'☀️ فاتح':theme==='dark'?'🌙 داكن':'⚫ أوليد')+(excuse?' + 🌸 عذر':'');

  var panel=document.createElement('div');
  panel.id='ct-panel';
  panel.style.cssText='position:fixed;bottom:0;right:0;left:0;max-height:62vh;z-index:999999;background:#0d0d0d;color:#eee;font-family:system-ui,sans-serif;font-size:13px;box-shadow:0 -8px 30px rgba(0,0,0,.5);border-top:3px solid #ff3b30;display:flex;flex-direction:column;direction:rtl';

  function buildHeader(){
    var h=document.createElement('div');
    h.style.cssText='padding:12px 16px;background:#1a1a1a;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;flex-wrap:wrap;gap:8px';
    h.innerHTML='<div><b style="color:#ff6b6b;font-size:15px">🔍 فاحص الكونتراست</b> &nbsp; <span style="color:#aaa">'+modeLabel+'</span></div>'+
      '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">'+
        '<span id="ct-count" style="background:'+(results.length?'#ff3b30':'#1a7d4f')+';padding:4px 12px;border-radius:99px;font-weight:700">'+(results.length?results.length+' مشكلة':'✅ سليم')+'</span>'+
        '<button id="ct-report" style="background:#2a7a5f;border:none;color:#fff;padding:6px 12px;border-radius:8px;cursor:pointer;font-weight:700;font-size:12px">📋 نسخ التقرير</button>'+
        '<button id="ct-scanall" style="background:#c9851a;border:none;color:#fff;padding:6px 12px;border-radius:8px;cursor:pointer;font-weight:700;font-size:12px">🌐 فحص كل الموقع</button>'+
        '<button id="ct-close" style="background:#333;border:none;color:#fff;width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:16px">✕</button>'+
      '</div>';
    return h;
  }
  panel.appendChild(buildHeader());

  var note=document.createElement('div');
  note.style.cssText='padding:7px 16px;background:#11151a;color:#888;font-size:11.5px;flex-shrink:0;border-bottom:1px solid #222';
  note.innerHTML='تُخطّيت: '+skipped.emoji+' إيموجي · '+skipped.gradient+' على تدرّج (تحتاج عيناً) · '+skipped.hidden+' مخفية. <b style="color:#aaa">ليست أخطاءً.</b>';
  panel.appendChild(note);

  var body=document.createElement('div');
  body.id='ct-body';
  body.style.cssText='overflow-y:auto;padding:8px 12px;flex:1';
  renderResults(body, results, true);
  panel.appendChild(body);
  document.body.appendChild(panel);

  function renderResults(container, list, local){
    if(list.length===0){
      container.innerHTML='<div style="padding:24px;text-align:center;color:#4ade80">🎉 مفيش مشاكل كونتراست حقيقية في الوضع الحالي!<br><small style="color:#888">العناصر على الخلفيات المتدرّجة تحتاج فحصاً بالعين.</small></div>';
      return;
    }
    container.innerHTML='';
    list.forEach(function(res){
      var row=document.createElement('div');
      row.style.cssText='padding:10px;border-bottom:1px solid #222;display:flex;gap:10px;align-items:center;'+(local?'cursor:pointer':'');
      var sev=parseFloat(res.r)<res.threshold*0.6?'#ff3b30':'#ff9500';
      row.innerHTML='<span style="background:'+sev+';color:#fff;border-radius:6px;padding:2px 8px;font-weight:700;font-size:12px;white-space:nowrap">'+res.r+'</span>'+
        '<span style="color:#888;font-size:11px;white-space:nowrap">≥'+res.threshold+'</span>'+
        (res.page?'<span style="color:#7ce89a;font-size:11px;white-space:nowrap">'+res.page+'</span>':'')+
        (res.mode?'<span style="color:#f0a830;font-size:11px;white-space:nowrap;background:#2a2310;padding:1px 7px;border-radius:5px">'+res.mode+'</span>':'')+
        '<span style="flex:1;color:#ddd;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">«'+res.txt+'»</span>'+
        '<span style="color:#666;font-size:11px;white-space:nowrap">&lt;'+res.tag+'&gt; '+res.size+'px</span>';
      if(local && res.el){ row.onclick=function(){ highlight(res.el); }; }
      container.appendChild(row);
    });
  }

  /* ── زر الإغلاق ── */
  document.getElementById('ct-close').onclick=function(){
    document.querySelectorAll('[data-ct-marked]').forEach(function(el){ el.style.outline=''; el.style.outlineOffset=''; el.style.boxShadow=''; delete el.dataset.ctMarked; });
    panel.remove(); window.__ctOpen=false;
  };

  /* ── زر التقرير (نسخ) ── */
  var lastReport = { mode:modeLabel, page:location.pathname.split('/').pop()||'index.html', results:results, skipped:skipped, full:null };
  document.getElementById('ct-report').onclick=function(){
    var txt = buildReportText(lastReport);
    copyText(txt);
    var btn=document.getElementById('ct-report');
    var orig=btn.textContent; btn.textContent='✅ تم النسخ'; setTimeout(function(){btn.textContent=orig;},1500);
  };

  function buildReportText(rep){
    var L=[];
    L.push('═══ تقرير فاحص الكونتراست — زاد العشر ═══');
    L.push('التاريخ: '+new Date().toLocaleString('ar-EG'));
    if(rep.full){
      L.push('النطاق: كل الموقع ('+rep.full.pagesScanned+' صفحة)');
      L.push('الأوضاع المفحوصة: '+(rep.full.modesScanned?rep.full.modesScanned.join(' · '):'—'));
      L.push('إجمالي المشاكل: '+rep.full.total);
      L.push('');
      /* جمّع حسب الصفحة */
      var grouped={};
      rep.full.byPage.forEach(function(pg){ pg.results.forEach(function(r){ (grouped[r.page]=grouped[r.page]||[]).push(r); }); });
      Object.keys(grouped).forEach(function(pgName){
        L.push('▼ '+pgName+' ('+grouped[pgName].length+')');
        grouped[pgName].forEach(function(r){ L.push('   ['+(r.mode||'?')+'] '+r.r+' (≥'+r.threshold+') «'+r.txt+'» <'+r.tag+'> '+r.size+'px'); });
      });
      if(rep.full.failed.length){ L.push(''); L.push('تعذّر فحصها: '+rep.full.failed.join(', ')); }
    } else {
      L.push('النطاق: صفحة واحدة ('+rep.page+') · '+rep.mode);
      L.push('مشاكل حقيقية: '+rep.results.length+' · تُخطّي: '+rep.skipped.emoji+' إيموجي، '+rep.skipped.gradient+' تدرّج، '+rep.skipped.hidden+' مخفية');
      L.push('');
      if(rep.results.length===0){ L.push('✅ لا مشاكل.'); }
      rep.results.forEach(function(r){ L.push(r.r+' (يحتاج ≥'+r.threshold+') «'+r.txt+'» <'+r.tag+'> '+r.size+'px'); });
    }
    L.push('');
    L.push('ملاحظة: العناصر على خلفيات متدرّجة مُستثناة (تحتاج فحصاً بالعين).');
    return L.join('\n');
  }
  function copyText(t){
    if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(t).catch(function(){ fallbackCopy(t); }); }
    else fallbackCopy(t);
  }
  function fallbackCopy(t){
    var ta=document.createElement('textarea'); ta.value=t; ta.style.position='fixed'; ta.style.opacity='0';
    document.body.appendChild(ta); ta.select();
    try{ document.execCommand('copy'); }catch(e){}
    document.body.removeChild(ta);
  }

  /* ── زر فحص كل الموقع (عبر iframe، same-origin) ── */
  document.getElementById('ct-scanall').onclick=function(){
    showModePicker();
  };

  /* ── اختيار الأوضاع المراد فحصها ── */
  function showModePicker(){
    var MODES=[
      {id:'light',      theme:'light', excuse:false, label:'☀️ فاتح'},
      {id:'dark',       theme:'dark',  excuse:false, label:'🌙 داكن'},
      {id:'oled',       theme:'oled',  excuse:false, label:'⚫ أوليد'},
      {id:'excuse-light',theme:'light',excuse:true,  label:'🌸 عذر + فاتح'},
      {id:'excuse-dark', theme:'dark', excuse:true,  label:'🌸 عذر + داكن'}
    ];
    var def={light:true,dark:true,oled:true,'excuse-light':true,'excuse-dark':true};
    body.innerHTML='<div style="padding:14px">'+
      '<div style="color:#ffcc00;font-weight:700;margin-bottom:12px">اختر الأوضاع المراد فحصها في كل صفحة:</div>'+
      '<div id="ct-modes" style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">'+
        MODES.map(function(m){ return '<label style="display:flex;align-items:center;gap:10px;background:#1a1a1a;padding:10px 14px;border-radius:10px;cursor:pointer">'+
          '<input type="checkbox" data-mode="'+m.id+'" '+(def[m.id]?'checked':'')+' style="width:18px;height:18px;cursor:pointer">'+
          '<span style="font-size:14px;font-weight:700">'+m.label+'</span></label>'; }).join('')+
      '</div>'+
      '<div style="display:flex;gap:8px">'+
        '<button id="ct-go" style="flex:1;background:#c9851a;border:none;color:#fff;padding:12px;border-radius:10px;font-weight:800;cursor:pointer;font-family:inherit;font-size:14px">▶ ابدأ الفحص الشامل</button>'+
        '<button id="ct-cancel" style="background:#333;border:none;color:#ccc;padding:12px 18px;border-radius:10px;cursor:pointer;font-family:inherit">إلغاء</button>'+
      '</div>'+
      '<div style="color:#888;font-size:12px;margin-top:10px">كل وضع مختار يضاعف زمن الفحص. الفحص يطبّق الوضع على كل صفحة داخلياً (لا يغيّر إعداداتك).</div>'+
    '</div>';
    document.getElementById('ct-cancel').onclick=function(){ renderResults(body, results, true); };
    document.getElementById('ct-go').onclick=function(){
      var chosen=MODES.filter(function(m){ return document.querySelector('[data-mode="'+m.id+'"]').checked; });
      if(!chosen.length){ alert('اختر وضعاً واحداً على الأقل'); return; }
      runFullScan(chosen);
    };
  }

  /* ── الفحص الشامل عبر كل التوليفات المختارة ── */
  function runFullScan(modes){
    var btn=document.getElementById('ct-scanall'); btn.disabled=true; btn.style.opacity='0.6';
    var base=location.href.replace(/[^/]*$/,'').replace(/tools\/$/,'');
    var byPage=[], failed=[], total=0, done=0;
    /* قائمة المهام: كل صفحة × كل وضع */
    var jobs=[];
    SITE_PAGES.forEach(function(page){ modes.forEach(function(mode){ jobs.push({page:page,mode:mode}); }); });

    body.innerHTML='<div style="padding:20px;text-align:center;color:#ffcc00">🌐 فحص '+SITE_PAGES.length+' صفحة × '+modes.length+' وضع = '+jobs.length+' فحص...<br><div id="ct-prog" style="margin-top:10px;color:#888"></div></div>';
    var prog=document.getElementById('ct-prog');

    var iframe=document.createElement('iframe');
    iframe.style.cssText='position:fixed;width:1024px;height:768px;left:-9999px;top:0;border:0';
    document.body.appendChild(iframe);

    var j=0;
    function nextJob(){
      if(j>=jobs.length){ finishAll(); return; }
      var job=jobs[j], page=job.page, mode=job.mode;
      if(prog) prog.textContent='('+(j+1)+'/'+jobs.length+') '+page+' — '+mode.label;
      var to=setTimeout(function(){ if(failed.indexOf(page)<0) failed.push(page); j++; nextJob(); }, 15000);
      iframe.onload=function(){
        clearTimeout(to);
        /* انتظر حتى تكتمل الصفحة + يحقن menu.js و share-button.js الـ CSS الديناميكي.
           هذه السكربتات تعمل async بعد load، فالفحص المبكر يلتقط ستايل المتصفح الخام
           (سبب الأرقام الوهمية 1.08/1.36). ننتظر حقن الـ <style> أو حدّاً زمنياً. */
        var iwinE = iframe.contentWindow, idocE = iframe.contentDocument;
        var waited = 0, STEP = 150, MAX_WAIT = 2500;
        function ready(){
          try{
            if(!idocE || idocE.readyState !== 'complete') return false;
            /* تأكد أن السكربتات الديناميكية حقنت ستايلها (عدد <style> أو وجود زر المشاركة) */
            var styleCount = idocE.querySelectorAll('style').length;
            var hasShare = idocE.querySelector('.zad-share-btn-full, .zad-inst-btn, .zad-install-row');
            return styleCount >= 2 || hasShare !== null || waited >= MAX_WAIT;
          }catch(e){ return true; }
        }
        function waitThenScan(){
          if(!ready() && waited < MAX_WAIT){ waited += STEP; setTimeout(waitThenScan, STEP); return; }
          try{
            var idoc=iframe.contentDocument, iwin=iframe.contentWindow;
            /* طبّق الوضع على الـ iframe مباشرةً */
            idoc.documentElement.setAttribute('data-theme', mode.theme);
            if(mode.excuse) idoc.documentElement.setAttribute('data-excuse','on');
            else idoc.documentElement.removeAttribute('data-excuse');
            /* انتظر إعادة الرسم بعد تبديل الثيم ثم افحص */
            setTimeout(function(){
              try{
                var s=scanDoc(idoc, iwin);
                if(s.results.length){
                  byPage.push({ page:page, mode:mode.label, results:s.results.map(function(r){return {r:r.r,threshold:r.threshold,txt:r.txt,tag:r.tag,size:r.size,page:page,mode:mode.label};}) });
                  total+=s.results.length;
                }
              }catch(e){}
              done++; j++; nextJob();
            }, 500);
          }catch(e){ if(failed.indexOf(page)<0) failed.push(page); j++; nextJob(); }
        }
        waitThenScan();
      };
      /* أعِد تحميل الصفحة فقط عند تغيّر الصفحة (لا الوضع) لتسريع الفحص */
      var needReload = (j===0) || (jobs[j-1].page !== page);
      if(needReload){
        try{ iframe.src = base + encodeURI(page); }
        catch(e){ if(failed.indexOf(page)<0) failed.push(page); j++; nextJob(); }
      } else {
        /* نفس الصفحة، وضع مختلف — طبّق مباشرةً بدون إعادة تحميل */
        iframe.onload();
      }
    }
    function finishAll(){
      iframe.remove(); btn.disabled=false; btn.style.opacity='1';
      var flat=[];
      byPage.forEach(function(pg){ pg.results.forEach(function(r){ flat.push(r); }); });
      flat.sort(function(a,b){return parseFloat(a.r)-parseFloat(b.r);});
      lastReport.full={ pagesScanned:SITE_PAGES.length, modesScanned:modes.map(function(m){return m.label;}), total:total, byPage:byPage, failed:failed };
      document.getElementById('ct-count').textContent=total+' مشكلة';
      document.getElementById('ct-count').style.background = total?'#ff3b30':'#1a7d4f';
      note.innerHTML='🌐 فُحصت '+SITE_PAGES.length+' صفحة × '+modes.length+' وضع'+(failed.length?' · تعذّر '+failed.length:'')+' · اضغط «نسخ التقرير». <b style="color:#aaa">مرتّبة بالأسوأ.</b>';
      renderResults(body, flat, false);
    }
    nextJob();
  }

  console.log('[فاحص الكونتراست v3]', results.length, 'مشكلة | تخطّى:', skipped, '| الوضع:', theme, excuse?'+عذر':'');
})();
