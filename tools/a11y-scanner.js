/* ═══════════════════════════════════════════════════════════════
   فاحص إمكانية الوصول (a11y) v1 — أداة تشخيص لمطوّر زاد
   • يفحص معايير WCAG: alt، ARIA، labels، ترتيب العناوين، الأزرار الفارغة
   • تنقّل لوحة المفاتيح، lang، اتجاه RTL
   • الضغط على مشكلة → سكرول + تحديد · نسخ تقرير · فحص كل الموقع
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  if(window.__a11yOpen){
    document.getElementById('a11y-panel')?.remove();
    document.querySelectorAll('[data-a11y-marked]').forEach(function(el){ el.style.outline=''; el.style.boxShadow=''; delete el.dataset.a11yMarked; });
    window.__a11yOpen=false; return;
  }
  window.__a11yOpen=true;

  var SITE_PAGES = ["index.html","prayers.html","qibla.html","hijri.html","taqweem.html",
    "mushaf.html","mushaf-quran.html","tasmee.html","adhkar.html","adhkar-categories.html",
    "adhkar-section.html","hasn.html","du'a.html","dua-guide.html","nawawi.html","ruqyah.html",
    "sunan.html","worship.html","fadael.html","arafah.html","arafah-dua.html","odhiya.html",
    "manasik.html","sadaqah.html","zakat.html","hasad.html","summary.html","badges.html",
    "groups.html","group-board.html","barnamaj.html","playlist.html","Quran-radio.HTML",
    "videos.html","asma.html","ai.html","kids.html","kids-fun.html","kids-creativity.html",
    "kids-school.html","kids-heroes.html","kids-parents.html","ghars.html","zahra.html",
    "profile.html","settings.html","report.html","about.html","developer.html","privacy.html",
    "takbeer.html"];

  /* ══════════════════════════════════════════════
     مُحرك فحص a11y
  ══════════════════════════════════════════════ */
  function scanDoc(doc, win){
    win = win || window;
    var issues = [];

    /* 1. صور بدون alt */
    doc.querySelectorAll('img').forEach(function(img){
      if(!img.hasAttribute('alt')){
        issues.push({ sev:'serious', cat:'صورة بدون alt', msg:'كل صورة تحتاج alt (نص بديل، أو alt="" للزخرفية)', tag:'img', detail:(img.src||'').split('/').pop().slice(0,50), el:img });
      }
    });

    /* 2. أزرار/روابط فارغة (بدون نص ولا aria-label) */
    doc.querySelectorAll('button,a').forEach(function(el){
      var txt=(el.textContent||'').trim();
      var aria=el.getAttribute('aria-label')||el.getAttribute('title')||'';
      var hasImg=el.querySelector('img,svg');
      if(!txt && !aria && !hasImg){
        issues.push({ sev:'serious', cat:'عنصر تفاعلي فارغ', msg:(el.tagName==='A'?'رابط':'زر')+' بلا نص ولا aria-label — قارئ الشاشة لن يفهمه', tag:el.tagName.toLowerCase(), detail:(el.className||'').toString().split(' ')[0]||'(بلا كلاس)', el:el });
      }
    });

    /* 3. حقول إدخال بدون label */
    doc.querySelectorAll('input,select,textarea').forEach(function(inp){
      var type=inp.type||'';
      if(type==='hidden'||type==='submit'||type==='button') return;
      var id=inp.id;
      var hasLabel = id && doc.querySelector('label[for="'+id+'"]');
      var aria=inp.getAttribute('aria-label')||inp.getAttribute('aria-labelledby')||inp.getAttribute('placeholder');
      var wrapped = inp.closest('label');
      if(!hasLabel && !aria && !wrapped){
        issues.push({ sev:'serious', cat:'حقل بدون label', msg:'حقل إدخال بلا label أو aria-label — غير واضح لقارئ الشاشة', tag:(inp.tagName.toLowerCase())+(type?'['+type+']':''), detail:inp.name||inp.id||'(بلا اسم)', el:inp });
      }
    });

    /* 4. ترتيب العناوين (heading hierarchy) */
    var headings = Array.prototype.slice.call(doc.querySelectorAll('h1,h2,h3,h4,h5,h6'));
    var lastLevel=0, h1Count=0;
    headings.forEach(function(h){
      var level=parseInt(h.tagName[1]);
      if(level===1) h1Count++;
      if(lastLevel && level>lastLevel+1){
        issues.push({ sev:'moderate', cat:'قفزة في ترتيب العناوين', msg:'انتقال من h'+lastLevel+' إلى h'+level+' (تخطّى مستوى) — يربك قارئ الشاشة', tag:'h'+level, detail:(h.textContent||'').trim().slice(0,40), el:h });
      }
      lastLevel=level;
    });
    if(h1Count===0){
      issues.push({ sev:'moderate', cat:'لا يوجد h1', msg:'الصفحة بلا عنوان رئيسي h1', tag:'html', detail:'كل صفحة تحتاج h1 واحد', el:null });
    } else if(h1Count>1){
      issues.push({ sev:'minor', cat:'h1 متعدد', msg:'يوجد '+h1Count+' عناصر h1 — يُفضّل واحد فقط', tag:'html', detail:h1Count+' × h1', el:null });
    }

    /* 5. lang على html */
    var htmlLang = doc.documentElement.getAttribute('lang');
    if(!htmlLang){
      issues.push({ sev:'serious', cat:'lang مفقود', msg:'<html> بدون سمة lang — قارئ الشاشة لن يعرف اللغة', tag:'html', detail:'أضف lang="ar"', el:null });
    }

    /* 6. اتجاه RTL */
    var htmlDir = doc.documentElement.getAttribute('dir');
    if(!htmlDir){
      issues.push({ sev:'minor', cat:'dir مفقود', msg:'<html> بدون dir="rtl" — قد يؤثر على اتجاه المحتوى', tag:'html', detail:'أضف dir="rtl"', el:null });
    }

    /* 7. روابط بنص غامض ("اضغط هنا") */
    doc.querySelectorAll('a').forEach(function(a){
      var txt=(a.textContent||'').trim();
      if(/^(اضغط هنا|هنا|اقرأ المزيد|المزيد|click here|here|read more)$/i.test(txt)){
        issues.push({ sev:'minor', cat:'نص رابط غامض', msg:'نص الرابط «'+txt+'» غير وصفي — قارئ الشاشة يقرأ الروابط منفصلة', tag:'a', detail:txt, el:a });
      }
    });

    /* 8. tabindex موجب (مضاد لأفضل الممارسات) */
    doc.querySelectorAll('[tabindex]').forEach(function(el){
      var ti=parseInt(el.getAttribute('tabindex'));
      if(ti>0){
        issues.push({ sev:'moderate', cat:'tabindex موجب', msg:'tabindex='+ti+' يكسر ترتيب التنقّل الطبيعي — استخدم 0 أو -1', tag:el.tagName.toLowerCase(), detail:'tabindex='+ti, el:el });
      }
    });

    /* 9. ARIA roles غير صحيحة (role فارغ) */
    doc.querySelectorAll('[role]').forEach(function(el){
      var role=el.getAttribute('role').trim();
      if(!role){
        issues.push({ sev:'minor', cat:'role فارغ', msg:'سمة role فارغة', tag:el.tagName.toLowerCase(), detail:'', el:el });
      }
    });

    /* 10. عناصر onclick على div/span (بدلاً من button) */
    var clickableNonInteractive=0;
    doc.querySelectorAll('div[onclick],span[onclick]').forEach(function(el){
      if(clickableNonInteractive>=5) return;
      var role=el.getAttribute('role');
      var ti=el.getAttribute('tabindex');
      if(!role && ti===null){
        clickableNonInteractive++;
        issues.push({ sev:'moderate', cat:'عنصر قابل للنقر غير تفاعلي', msg:'<'+el.tagName.toLowerCase()+'> بـ onclick بلا role أو tabindex — لا يُوصَل بلوحة المفاتيح', tag:el.tagName.toLowerCase(), detail:(el.textContent||'').trim().slice(0,40), el:el });
      }
    });

    return issues;
  }

  function highlight(el){
    if(!el) return;
    el.scrollIntoView({behavior:'smooth',block:'center'});
    el.style.transition='outline .2s,box-shadow .2s';
    el.style.outline='3px solid #a35cc7';
    el.style.boxShadow='0 0 0 6px rgba(163,92,199,.3)';
    setTimeout(function(){ el.style.outline='2px dashed #a35cc7'; el.style.boxShadow=''; },1800);
  }

  function sevColor(s){ return s==='serious'?'#ff3b30':s==='moderate'?'#ff9500':'#7ce89a'; }
  function sevLabel(s){ return s==='serious'?'🔴 خطير':s==='moderate'?'🟠 متوسط':'🟢 طفيف'; }

  /* ── بناء اللوحة ── */
  var issues = scanDoc(document, window);
  issues.forEach(function(iss){ if(iss.el){ iss.el.style.outline='2px dashed #a35cc7'; iss.el.dataset.a11yMarked='1'; } });

  var panel=document.createElement('div');
  panel.id='a11y-panel';
  panel.style.cssText='position:fixed;bottom:0;right:0;left:0;max-height:65vh;z-index:999999;background:#0d0d0d;color:#eee;font-family:system-ui,sans-serif;font-size:13px;box-shadow:0 -8px 30px rgba(0,0,0,.5);border-top:3px solid #a35cc7;display:flex;flex-direction:column;direction:rtl';

  var serious=issues.filter(function(i){return i.sev==='serious';}).length;
  var moderate=issues.filter(function(i){return i.sev==='moderate';}).length;
  var minor=issues.filter(function(i){return i.sev==='minor';}).length;

  var header=document.createElement('div');
  header.style.cssText='padding:12px 16px;background:#1a1a1a;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;flex-wrap:wrap;gap:8px';
  header.innerHTML='<div><b style="color:#c77fd4;font-size:15px">♿ فاحص الوصول</b> &nbsp; <span style="color:#aaa;font-size:12px">'+(location.pathname.split('/').pop()||'index.html')+'</span></div>'+
    '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">'+
      (serious?'<span style="background:#ff3b30;padding:3px 10px;border-radius:99px;font-weight:700;font-size:12px">🔴 '+serious+'</span>':'')+
      (moderate?'<span style="background:#c97000;padding:3px 10px;border-radius:99px;font-weight:700;font-size:12px">🟠 '+moderate+'</span>':'')+
      (minor?'<span style="background:#1a5c3a;padding:3px 10px;border-radius:99px;font-weight:700;font-size:12px">🟢 '+minor+'</span>':'')+
      (!issues.length?'<span style="background:#1a7d4f;padding:3px 10px;border-radius:99px;font-weight:700;font-size:12px">✅ سليم</span>':'')+
      '<button id="a11y-report" style="background:#2a7a5f;border:none;color:#fff;padding:6px 12px;border-radius:8px;cursor:pointer;font-weight:700;font-size:12px">📋 نسخ</button>'+
      '<button id="a11y-scanall" style="background:#c9851a;border:none;color:#fff;padding:6px 12px;border-radius:8px;cursor:pointer;font-weight:700;font-size:12px">🌐 كل الموقع</button>'+
      '<button id="a11y-close" style="background:#333;border:none;color:#fff;width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:16px">✕</button>'+
    '</div>';
  panel.appendChild(header);

  var note=document.createElement('div');
  note.style.cssText='padding:6px 16px;background:#11151a;color:#888;font-size:11.5px;flex-shrink:0;border-bottom:1px solid #222';
  note.innerHTML='يفحص معايير WCAG في الـ DOM · بعض الأمور تحتاج اختباراً يدوياً (قارئ شاشة فعلي) · <b style="color:#aaa">ليست أخطاء نهائية.</b>';
  panel.appendChild(note);

  var body=document.createElement('div');
  body.id='a11y-body';
  body.style.cssText='overflow-y:auto;padding:8px 12px;flex:1';
  renderIssues(body, issues, true);
  panel.appendChild(body);
  document.body.appendChild(panel);

  function renderIssues(container, list, local){
    if(!list.length){
      container.innerHTML='<div style="padding:28px;text-align:center;color:#4ade80">♿ لا مشاكل وصول واضحة في الـ DOM!<br><small style="color:#888">تذكّر: الاختبار الكامل يحتاج قارئ شاشة فعلي + تجربة لوحة مفاتيح.</small></div>';
      return;
    }
    container.innerHTML='';
    list.forEach(function(iss){
      var row=document.createElement('div');
      row.style.cssText='padding:10px 12px;border-bottom:1px solid #1e2430;display:flex;gap:10px;align-items:flex-start;'+(local&&iss.el?'cursor:pointer':'');
      row.innerHTML='<span style="background:'+sevColor(iss.sev)+';color:#000;border-radius:6px;padding:2px 8px;font-weight:700;font-size:11px;white-space:nowrap;flex-shrink:0;margin-top:2px">'+sevLabel(iss.sev)+'</span>'+
        '<div style="flex:1;min-width:0">'+
          '<div style="font-weight:700;color:#eee;font-size:13px">'+iss.cat+(iss.page?' <span style="color:#7ce89a;font-weight:400;font-size:11px">· '+iss.page+'</span>':'')+'</div>'+
          '<div style="color:#bbb;font-size:12px;margin-top:2px">'+iss.msg+'</div>'+
          (iss.detail?'<div style="color:#7ce89a;font-size:11px;margin-top:3px;font-family:monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+iss.detail+'</div>':'')+
        '</div>'+
        '<span style="color:#555;font-size:11px;white-space:nowrap;flex-shrink:0">&lt;'+iss.tag+'&gt;</span>';
      if(local && iss.el){ row.onclick=function(){highlight(iss.el);}; }
      container.appendChild(row);
    });
  }

  document.getElementById('a11y-close').onclick=function(){
    document.querySelectorAll('[data-a11y-marked]').forEach(function(el){ el.style.outline=''; el.style.boxShadow=''; delete el.dataset.a11yMarked; });
    panel.remove(); window.__a11yOpen=false;
  };

  var lastReport={ page:location.pathname.split('/').pop()||'index.html', issues:issues, full:null };

  document.getElementById('a11y-report').onclick=function(){
    var L=['═══ تقرير إمكانية الوصول — زاد ═══','التاريخ: '+new Date().toLocaleString('ar-EG'),''];
    if(lastReport.full){
      L.push('النطاق: كل الموقع ('+lastReport.full.pagesScanned+' صفحة)');
      L.push('إجمالي المشاكل: '+lastReport.full.total); L.push('');
      var grouped={};
      lastReport.full.byPage.forEach(function(pg){ pg.issues.forEach(function(iss){ (grouped[iss.page]=grouped[iss.page]||[]).push(iss); }); });
      Object.keys(grouped).forEach(function(pg){
        L.push('▼ '+pg+' ('+grouped[pg].length+')');
        grouped[pg].forEach(function(iss){ L.push('  ['+iss.sev+'] '+iss.cat+' — '+iss.msg); });
      });
      if(lastReport.full.failed.length){ L.push(''); L.push('تعذّر: '+lastReport.full.failed.join(', ')); }
    } else {
      L.push('النطاق: صفحة واحدة ('+lastReport.page+')');
      L.push('خطير: '+serious+' · متوسط: '+moderate+' · طفيف: '+minor); L.push('');
      issues.forEach(function(iss){ L.push('['+iss.sev+'] '+iss.cat+': '+iss.msg+(iss.detail?' ('+iss.detail+')':'')); });
    }
    var txt=L.join('\n');
    if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(txt).catch(function(){fb(txt);});
    else fb(txt);
    var btn=document.getElementById('a11y-report'),o=btn.textContent;btn.textContent='✅';setTimeout(function(){btn.textContent=o;},1500);
    function fb(t){var ta=document.createElement('textarea');ta.value=t;ta.style.cssText='position:fixed;opacity:0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');}catch(e){}document.body.removeChild(ta);}
  };

  /* ── فحص كل الموقع ── */
  document.getElementById('a11y-scanall').onclick=function(){
    var btn=document.getElementById('a11y-scanall'); btn.disabled=true; btn.style.opacity='0.6';
    var base=location.href.replace(/[^/]*$/,'').replace(/tools\/$/,'');
    var byPage=[], failed=[], total=0, done=0;
    body.innerHTML='<div style="padding:20px;text-align:center;color:#c77fd4">🌐 فحص '+SITE_PAGES.length+' صفحة...<br><div id="a11y-prog" style="margin-top:10px;color:#888"></div></div>';
    var prog=document.getElementById('a11y-prog');
    var iframe=document.createElement('iframe');
    iframe.style.cssText='position:fixed;width:1024px;height:768px;left:-9999px;top:0;border:0';
    document.body.appendChild(iframe);
    var i=0;
    function next(){
      if(i>=SITE_PAGES.length){ finish(); return; }
      var page=SITE_PAGES[i];
      if(prog) prog.textContent='('+(i+1)+'/'+SITE_PAGES.length+') '+page;
      var to=setTimeout(function(){ failed.push(page); i++; next(); },8000);
      iframe.onload=function(){
        clearTimeout(to);
        setTimeout(function(){
          try{
            var pgIssues=scanDoc(iframe.contentDocument, iframe.contentWindow);
            byPage.push({ page:page, issues:pgIssues.map(function(iss){return Object.assign({},iss,{el:null,page:page});}) });
            total+=pgIssues.length;
          }catch(e){ failed.push(page); }
          done++; i++; next();
        },600);
      };
      try{ iframe.src=base+encodeURI(page); }catch(e){ failed.push(page); i++; next(); }
    }
    function finish(){
      iframe.remove(); btn.disabled=false; btn.style.opacity='1';
      var flat=[];
      byPage.forEach(function(pg){ pg.issues.forEach(function(iss){flat.push(iss);}); });
      var order={serious:0,moderate:1,minor:2};
      flat.sort(function(a,b){return (order[a.sev]||9)-(order[b.sev]||9);});
      lastReport.full={ pagesScanned:done, total:total, byPage:byPage, failed:failed };
      note.innerHTML='🌐 فُحصت '+done+' صفحة'+(failed.length?' · تعذّر '+failed.length:'')+' · اضغط «نسخ».';
      renderIssues(body, flat, false);
    }
    next();
  };

  console.log('[فاحص الوصول v1]', issues.length, 'مشكلة | خطير:',serious,'متوسط:',moderate,'طفيف:',minor);
})();
