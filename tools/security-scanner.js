/* ═══════════════════════════════════════════════════════════════
   فاحص الأمان v1 — أداة تشخيص لمطوّر زاد
   • فحص Mixed Content · Headers · Forms · Secrets · XSS patterns
   • الضغط على مشكلة → سكرول + تحديد بصري
   • نسخ تقرير نصي كامل + فحص كل الموقع
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  if(window.__stOpen){
    document.getElementById('st-panel')?.remove();
    document.querySelectorAll('[data-st-marked]').forEach(el=>{
      el.style.outline=''; el.style.boxShadow=''; delete el.dataset.stMarked;
    });
    window.__stOpen=false; return;
  }
  window.__stOpen=true;

  /* ── قائمة الصفحات ── */
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
     مُحرك الفحص
  ══════════════════════════════════════════════ */
  function scanDoc(doc, win){
    win = win || window;
    var issues = [];
    var isHTTPS = location.protocol === 'https:';

    /* ── 1. Mixed Content ── */
    if(isHTTPS){
      doc.querySelectorAll('img[src],script[src],link[href],iframe[src],audio[src],video[src],source[src]').forEach(function(el){
        var url = el.src || el.href;
        if(url && url.startsWith('http:')){
          issues.push({ sev:'critical', cat:'Mixed Content', msg:'عنصر يُحمَّل عبر HTTP في صفحة HTTPS', tag:el.tagName.toLowerCase(), detail:url.slice(0,80), el:el });
        }
      });
    }

    /* ── 2. Forms ── */
    doc.querySelectorAll('form').forEach(function(form){
      var action = form.getAttribute('action') || '';
      if(isHTTPS && action.startsWith('http:')){
        issues.push({ sev:'critical', cat:'Insecure Form', msg:'Form يُرسل بيانات عبر HTTP', tag:'form', detail:'action="'+action.slice(0,60)+'"', el:form });
      }
      form.querySelectorAll('input[type=password]').forEach(function(inp){
        var ac = inp.getAttribute('autocomplete');
        if(!ac || ac==='on'){
          issues.push({ sev:'warning', cat:'Autocomplete', msg:'حقل password بدون autocomplete="new-password" أو "current-password"', tag:'input[password]', detail:inp.name||inp.id||'(بدون اسم)', el:inp });
        }
      });
    });

    /* ── 3. External scripts بدون integrity ── */
    var TRUSTED_CDN = /(cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com|unpkg\.com|gstatic\.com|googleapis\.com|w\.soundcloud\.com)/;
    doc.querySelectorAll('script[src]').forEach(function(s){
      var src = s.getAttribute('src') || '';
      if((src.startsWith('http://') || src.startsWith('https://')) && !src.includes(location.hostname)){
        if(!s.getAttribute('integrity')){
          var trusted = TRUSTED_CDN.test(src);
          issues.push({
            sev: trusted ? 'info' : 'warning',
            cat:'Missing SRI',
            msg: trusted ? 'مكتبة من CDN موثوق بدون integrity (يُفضّل إضافته، لكن المصدر موثوق)' : 'Script خارجي من مصدر غير معروف بدون integrity — خطر',
            tag:'script', detail:src.slice(0,80), el:s
          });
        }
      }
    });

    /* ── 4. iframes بدون sandbox ── */
    doc.querySelectorAll('iframe').forEach(function(fr){
      if(!fr.hasAttribute('sandbox')){
        issues.push({ sev:'warning', cat:'iframe بدون Sandbox', msg:'iframe بدون sandbox attribute — خطر XSS', tag:'iframe', detail:(fr.src||'').slice(0,80), el:fr });
      }
    });

    /* ── 5. target=_blank بدون rel=noopener ── */
    doc.querySelectorAll('a[target=_blank]').forEach(function(a){
      var rel = (a.getAttribute('rel')||'');
      if(!rel.includes('noopener') && !rel.includes('noreferrer')){
        issues.push({ sev:'warning', cat:'Tabnapping', msg:'رابط target="_blank" بدون rel="noopener noreferrer"', tag:'a', detail:(a.href||'').slice(0,80), el:a });
      }
    });

    /* ── 6. Inline event handlers (onclick= في HTML) ── */
    /* خطر فعلي فقط إذا احتوى المعالج على دمج نصوص (+) أو قوالب — قد يحقن قيمة غير موثوقة.
       استدعاء دالة ثابتة (onclick="foo()") ممارسة شائعة وآمنة → ملاحظة لا تحذير. */
    var allEls = doc.querySelectorAll('*');
    var inlineEvtCount = 0;
    Array.prototype.forEach.call(allEls, function(el){
      if(inlineEvtCount >= 8) return;
      var attrs = el.attributes;
      for(var i=0; i<attrs.length; i++){
        if(/^on[a-z]+/.test(attrs[i].name)){
          var val = attrs[i].value || '';
          /* دمج نصوص أو قوالب أو innerHTML = خطر فعلي محتمل */
          var risky = /[`]|\+\s*[a-zA-Z_$]|innerHTML|document\.write|eval\(/.test(val);
          inlineEvtCount++;
          issues.push({
            sev: risky ? 'warning' : 'info',
            cat:'Inline Event Handler',
            msg: risky ? 'معالج حدث inline يحتوي دمجاً ديناميكياً — راجِعه (خطر XSS محتمل)' : 'معالج حدث inline (ممارسة شائعة آمنة هنا — يُفضّل addEventListener)',
            tag:el.tagName.toLowerCase(),
            detail:attrs[i].name+'="'+val.slice(0,50)+'"', el:el
          });
          break;
        }
      }
    });

    /* ── 7. Sensitive data patterns في HTML source ── */
    var bodyText = doc.documentElement.innerHTML;
    var sensitivePatterns = [
      { re:/(['"])?(api[_-]?key|apikey|secret[_-]?key)\1\s*[:=]\s*['"]([A-Za-z0-9_\-]{16,})['"]/gi, label:'API Key محتمل مكشوف في HTML' },
      { re:/(['"])?(password|passwd|pwd)\1\s*[:=]\s*['"]([^'"]{4,})['"]/gi, label:'Password في HTML source' },
      { re:/Bearer\s+[A-Za-z0-9\-._~+/]{20,}/gi, label:'Bearer Token مكشوف في HTML' },
    ];
    sensitivePatterns.forEach(function(p){
      var m;
      p.re.lastIndex=0;
      while((m=p.re.exec(bodyText))!==null){
        issues.push({ sev:'critical', cat:'Sensitive Data Exposed', msg:p.label, tag:'html', detail:m[0].slice(0,80), el:null });
        if(issues.filter(function(x){return x.cat==='Sensitive Data Exposed';}).length>=3) break;
      }
    });

    /* ── 8. eval() في scripts ── */
    doc.querySelectorAll('script:not([src])').forEach(function(s){
      var src = s.textContent;
      if(/\beval\s*\(/.test(src)){
        issues.push({ sev:'critical', cat:'eval() Usage', msg:'استخدام eval() — خطر XSS مرتفع', tag:'script', detail:'inline script', el:s });
      }
      if(/document\.write\s*\(/.test(src)){
        issues.push({ sev:'warning', cat:'document.write()', msg:'استخدام document.write() — ممارسة غير آمنة', tag:'script', detail:'inline script', el:s });
      }
    });

    /* ── 9. Hidden inputs مشبوهة ── */
    doc.querySelectorAll('input[type=hidden]').forEach(function(inp){
      var name = (inp.name||'').toLowerCase();
      if(/token|csrf|key|secret|pass/.test(name)){
        issues.push({ sev:'info', cat:'Hidden Input', msg:'Hidden input باسم مشبوه — تحقق من أنه لا يعرض بيانات حساسة', tag:'input[hidden]', detail:'name="'+inp.name+'" value="'+(inp.value||'').slice(0,30)+'"', el:inp });
      }
    });

    /* ── 10. Meta refresh ── */
    doc.querySelectorAll('meta[http-equiv="refresh"]').forEach(function(m){
      issues.push({ sev:'info', cat:'Meta Refresh', msg:'Meta refresh redirect — يمكن استغلاله للتصيّد', tag:'meta', detail:m.getAttribute('content')||'', el:m });
    });

    return issues;
  }

  /* ── تحديد عنصر بصرياً ── */
  function highlight(el){
    if(!el) return;
    el.scrollIntoView({behavior:'smooth',block:'center'});
    el.style.transition='outline .2s,box-shadow .2s';
    el.style.outline='3px solid #ff9500';
    el.style.boxShadow='0 0 0 6px rgba(255,149,0,.3)';
    setTimeout(function(){ el.style.outline='2px dashed #ff3b30'; el.style.boxShadow=''; },1800);
  }

  function sevColor(sev){ return sev==='critical'?'#ff3b30':sev==='warning'?'#ff9500':'#7ce89a'; }
  function sevLabel(sev){ return sev==='critical'?'🔴 حرج':sev==='warning'?'🟠 تحذير':'🟢 ملاحظة'; }

  /* ══════════════════════════════════════════════
     بناء اللوحة
  ══════════════════════════════════════════════ */
  var issues = scanDoc(document, window);

  issues.forEach(function(iss){
    if(iss.el){ iss.el.style.outline='2px dashed #ff9500'; iss.el.style.outlineOffset='1px'; iss.el.dataset.stMarked='1'; }
  });

  var panel = document.createElement('div');
  panel.id='st-panel';
  panel.style.cssText='position:fixed;bottom:0;right:0;left:0;max-height:65vh;z-index:999999;background:#0d0d0d;color:#eee;font-family:system-ui,sans-serif;font-size:13px;box-shadow:0 -8px 30px rgba(0,0,0,.5);border-top:3px solid #ff9500;display:flex;flex-direction:column;direction:rtl';

  var criticals = issues.filter(function(i){return i.sev==='critical';}).length;
  var warnings = issues.filter(function(i){return i.sev==='warning';}).length;
  var infos = issues.filter(function(i){return i.sev==='info';}).length;

  var headerEl = document.createElement('div');
  headerEl.style.cssText='padding:12px 16px;background:#1a1a1a;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;flex-wrap:wrap;gap:8px';
  headerEl.innerHTML=
    '<div><b style="color:#ff9500;font-size:15px">🔐 فاحص الأمان</b> &nbsp; <span style="color:#aaa;font-size:12px">'+location.pathname.split('/').pop()+'</span></div>'+
    '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">'+
      (criticals?'<span style="background:#ff3b30;padding:3px 10px;border-radius:99px;font-weight:700;font-size:12px">🔴 '+criticals+' حرج</span>':'')+
      (warnings?'<span style="background:#c97000;padding:3px 10px;border-radius:99px;font-weight:700;font-size:12px">🟠 '+warnings+' تحذير</span>':'')+
      (infos?'<span style="background:#1a5c3a;padding:3px 10px;border-radius:99px;font-weight:700;font-size:12px">🟢 '+infos+' ملاحظة</span>':'')+
      (!issues.length?'<span style="background:#1a7d4f;padding:3px 10px;border-radius:99px;font-weight:700;font-size:12px">✅ سليم</span>':'')+
      '<button id="st-report" style="background:#2a7a5f;border:none;color:#fff;padding:6px 12px;border-radius:8px;cursor:pointer;font-weight:700;font-size:12px">📋 نسخ التقرير</button>'+
      '<button id="st-scanall" style="background:#c9851a;border:none;color:#fff;padding:6px 12px;border-radius:8px;cursor:pointer;font-weight:700;font-size:12px">🌐 فحص كل الموقع</button>'+
      '<button id="st-close" style="background:#333;border:none;color:#fff;width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:16px">✕</button>'+
    '</div>';
  panel.appendChild(headerEl);

  var noteEl = document.createElement('div');
  noteEl.style.cssText='padding:6px 16px;background:#11151a;color:#888;font-size:11.5px;flex-shrink:0;border-bottom:1px solid #222';
  noteEl.innerHTML='الفحص يعمل على الـ DOM المحلي فقط · بعض المشاكل تحتاج فحصاً يدوياً · <b style="color:#aaa">ليست أخطاء نهائية.</b>';
  panel.appendChild(noteEl);

  var bodyEl = document.createElement('div');
  bodyEl.id='st-body';
  bodyEl.style.cssText='overflow-y:auto;padding:8px 12px;flex:1';
  renderIssues(bodyEl, issues, true);
  panel.appendChild(bodyEl);
  document.body.appendChild(panel);

  function renderIssues(container, list, local){
    if(!list.length){
      container.innerHTML='<div style="padding:28px;text-align:center;color:#4ade80">🎉 لا مشاكل أمنية واضحة في الـ DOM!<br><small style="color:#888">تذكر: بعض الثغرات لا تظهر في الـ DOM (server-side headers, cookies)</small></div>';
      return;
    }
    container.innerHTML='';
    list.forEach(function(iss){
      var row=document.createElement('div');
      row.style.cssText='padding:10px 12px;border-bottom:1px solid #1e2430;display:flex;gap:10px;align-items:flex-start;'+(local&&iss.el?'cursor:pointer':'');
      row.innerHTML=
        '<span style="background:'+sevColor(iss.sev)+';color:#000;border-radius:6px;padding:2px 8px;font-weight:700;font-size:11px;white-space:nowrap;flex-shrink:0;margin-top:2px">'+sevLabel(iss.sev)+'</span>'+
        '<div style="flex:1;min-width:0">'+
          '<div style="font-weight:700;color:#eee;font-size:13px">'+iss.cat+(iss.page?' <span style="color:#7ce89a;font-weight:400;font-size:11px">· '+iss.page+'</span>':'')+'</div>'+
          '<div style="color:#bbb;font-size:12px;margin-top:2px">'+iss.msg+'</div>'+
          (iss.detail?'<div style="color:#7ce89a;font-size:11px;margin-top:3px;font-family:monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+escHtml(iss.detail)+'</div>':'')+
        '</div>'+
        '<span style="color:#555;font-size:11px;white-space:nowrap;flex-shrink:0">&lt;'+iss.tag+'&gt;</span>';
      if(local && iss.el){ row.onclick=function(){highlight(iss.el);}; }
      container.appendChild(row);
    });
  }

  function escHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  /* ── إغلاق ── */
  document.getElementById('st-close').onclick=function(){
    document.querySelectorAll('[data-st-marked]').forEach(function(el){
      el.style.outline=''; el.style.outlineOffset=''; el.style.boxShadow=''; delete el.dataset.stMarked;
    });
    panel.remove(); window.__stOpen=false;
  };

  /* ── نسخ التقرير ── */
  var lastReport = { page: location.pathname.split('/').pop()||'index.html', issues:issues, full:null };

  document.getElementById('st-report').onclick=function(){
    copyText(buildReport(lastReport));
    var btn=document.getElementById('st-report');
    var orig=btn.textContent; btn.textContent='✅ تم النسخ';
    setTimeout(function(){btn.textContent=orig;},1500);
  };

  function buildReport(rep){
    var L=[];
    L.push('═══ تقرير فاحص الأمان — زاد ═══');
    L.push('التاريخ: '+new Date().toLocaleString('ar-EG'));
    if(rep.full){
      L.push('النطاق: كل الموقع ('+rep.full.pagesScanned+' صفحة)');
      L.push('إجمالي المشاكل: '+rep.full.total);
      L.push('');
      var grouped={};
      rep.full.byPage.forEach(function(pg){ pg.issues.forEach(function(iss){ (grouped[iss.page]=grouped[iss.page]||[]).push(iss); }); });
      Object.keys(grouped).forEach(function(pgName){
        L.push('▼ '+pgName+' ('+grouped[pgName].length+' مشكلة)');
        grouped[pgName].forEach(function(iss){
          L.push('  ['+iss.sev.toUpperCase()+'] '+iss.cat+' | '+iss.msg+(iss.detail?' | '+iss.detail:''));
        });
      });
      if(rep.full.failed.length) L.push('\nتعذّر فحصها: '+rep.full.failed.join(', '));
    } else {
      L.push('النطاق: صفحة واحدة ('+rep.page+')');
      L.push('المشاكل: '+rep.issues.length);
      L.push('');
      if(!rep.issues.length){ L.push('✅ لا مشاكل.'); }
      rep.issues.forEach(function(iss){
        L.push('['+iss.sev.toUpperCase()+'] '+iss.cat);
        L.push('  '+iss.msg);
        if(iss.detail) L.push('  '+iss.detail);
        L.push('');
      });
    }
    return L.join('\n');
  }

  function copyText(t){
    if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(t).catch(function(){fallbackCopy(t);}); }
    else fallbackCopy(t);
  }
  function fallbackCopy(t){
    var ta=document.createElement('textarea'); ta.value=t; ta.style.cssText='position:fixed;opacity:0';
    document.body.appendChild(ta); ta.select();
    try{ document.execCommand('copy'); }catch(e){}
    document.body.removeChild(ta);
  }

  /* ── فحص كل الموقع ── */
  document.getElementById('st-scanall').onclick=function(){
    var btn=document.getElementById('st-scanall'); btn.disabled=true; btn.style.opacity='0.6';
    var base=location.href.replace(/[^/]*$/,'').replace(/tools\/$/,'');
    var byPage=[], failed=[], total=0, done=0;
    bodyEl.innerHTML='<div style="padding:20px;text-align:center;color:#ffcc00">🌐 جارٍ فحص '+SITE_PAGES.length+' صفحة...<br><div id="st-prog" style="margin-top:10px;color:#888"></div></div>';
    var prog=document.getElementById('st-prog');
    var iframe=document.createElement('iframe');
    iframe.style.cssText='position:fixed;width:1024px;height:768px;left:-9999px;top:0;border:0';
    document.body.appendChild(iframe);
    var i=0;
    function nextPage(){
      if(i>=SITE_PAGES.length){ finishAll(); return; }
      var page=SITE_PAGES[i];
      if(prog) prog.textContent='('+(i+1)+'/'+SITE_PAGES.length+') '+page;
      var to=setTimeout(function(){ failed.push(page); i++; nextPage(); },8000);
      iframe.onload=function(){
        clearTimeout(to);
        setTimeout(function(){
          try{
            var pg_issues=scanDoc(iframe.contentDocument, iframe.contentWindow);
            byPage.push({ page:page, issues:pg_issues.map(function(iss){return Object.assign({},iss,{el:null,page:page});}) });
            total+=pg_issues.length;
          }catch(e){ failed.push(page); }
          done++; i++; nextPage();
        },700);
      };
      try{ iframe.src=base+encodeURI(page); }
      catch(e){ failed.push(page); i++; nextPage(); }
    }
    function finishAll(){
      iframe.remove(); btn.disabled=false; btn.style.opacity='1';
      var flat=[];
      byPage.forEach(function(pg){ pg.issues.forEach(function(iss){flat.push(iss);}); });
      flat.sort(function(a,b){
        var order={critical:0,warning:1,info:2};
        return (order[a.sev]||9)-(order[b.sev]||9);
      });
      lastReport.full={pagesScanned:done, total:total, byPage:byPage, failed:failed};
      noteEl.innerHTML='🌐 فُحصت '+done+' صفحة'+(failed.length?' · تعذّر '+failed.length:'')+' · اضغط «نسخ التقرير» للتفاصيل الكاملة.';
      renderIssues(bodyEl, flat, false);
    }
    nextPage();
  };

  console.log('[فاحص الأمان v1]',issues.length,'مشكلة | critical:',criticals,'warning:',warnings,'info:',infos);
})();
