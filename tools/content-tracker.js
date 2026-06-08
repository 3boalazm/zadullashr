/* ════════════════════════════════════════════════════════════
   متتبّع المحتوى الناقص — أداة تشخيص لمطوّر زاد
   • فحص آلي: placeholders + أقسام فاضية + نصوص قصيرة مشبوهة
   • تتبّع يدوي: تسجّل نواقص وتعلّم حالتها (تُحفظ في localStorage)
   • تقرير قابل للنسخ + فحص كل الموقع عبر iframe
   ════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  if (window.__mtOpen) {
    document.getElementById('mt-panel')?.remove();
    document.querySelectorAll('[data-mt-marked]').forEach(el=>{ el.style.outline=''; el.style.boxShadow=''; delete el.dataset.mtMarked; });
    window.__mtOpen=false; return;
  }
  window.__mtOpen = true;

  var STORE_KEY = 'zad_content_tracker';
  var SITE_PAGES = ["index.html","prayers.html","qibla.html","hijri.html","taqweem.html","mushaf.html","mushaf-quran.html","tasmee.html","adhkar.html","adhkar-categories.html","adhkar-section.html","hasn.html","du'a.html","dua-guide.html","nawawi.html","ruqyah.html","sunan.html","worship.html","fadael.html","arafah.html","arafah-dua.html","odhiya.html","manasik.html","sadaqah.html","zakat.html","hasad.html","summary.html","badges.html","groups.html","group-board.html","barnamaj.html","playlist.html","Quran-radio.HTML","videos.html","asma.html","ai.html","kids.html","kids-fun.html","kids-creativity.html","kids-school.html","kids-heroes.html","kids-parents.html","ghars.html","zahra.html","profile.html","settings.html","report.html","about.html","developer.html","privacy.html","takbeer.html"];

  /* أنماط placeholder للبحث عنها */
  var PLACEHOLDER_RX = /(?<![ء-ي])(قريباً|قريبا|تحت الإنشاء|قيد التطوير|قيد الإنشاء|سيتم إضافة|سيُضاف|لاحقاً|coming soon|lorem ipsum)|\b(TODO|FIXME|placeholder|todo:)\b|—{3,}/i;

  function load(){ try{ return JSON.parse(localStorage.getItem(STORE_KEY)||'{}')||{}; }catch(e){ return {}; } }
  function save(o){ try{ localStorage.setItem(STORE_KEY, JSON.stringify(o)); }catch(e){} }

  /* ── الفحص الآلي لمستند ── */
  function autoScan(doc, win, pageName){
    win = win || window;
    var findings = [];

    /* 1. نصوص فيها placeholder */
    var textEls = doc.querySelectorAll('p,span,div,li,td,h1,h2,h3,h4,small,a,button');
    Array.prototype.forEach.call(textEls, function(el){
      var direct = Array.prototype.filter.call(el.childNodes, function(n){return n.nodeType===3;})
                    .map(function(n){return n.textContent;}).join('').trim();
      if(!direct || direct.length<2) return;
      /* تجاهل لو داخل سكربت/ستايل */
      if(el.closest('script,style')) return;
      if(PLACEHOLDER_RX.test(direct)){
        /* استثنِ التوست/الأزرار التفاعلية المقصودة لو واضح إنها onclick */
        var inToast = /toast|showToast/i.test(el.getAttribute('onclick')||'') || /toast/i.test(el.className||'');
        findings.push({
          type:'placeholder',
          page:pageName,
          txt:direct.slice(0,60),
          tag:el.tagName.toLowerCase(),
          note: inToast ? 'داخل زر/توست (قد يكون مقصوداً)' : 'placeholder ظاهر',
          el: el,
          severity: inToast ? 'low' : 'mid'
        });
      }
    });

    /* 2. أقسام/كروت فاضية فعلاً (تتجاهل التفاعلية والمتولّدة بـ JS) */
    var cards = doc.querySelectorAll('.card,.section,[class*="-card"],[class*="-section"]');
    Array.prototype.forEach.call(cards, function(el){
      var txt = (el.textContent||'').trim();
      var hasMedia = el.querySelector('img,canvas,svg,iframe,input,select,textarea,audio,video');
      var cs = win.getComputedStyle(el);
      if(cs.display==='none') return;
      /* تجاهل: عناصر تفاعلية (onclick/href) = مقصودة، ليست نقصاً */
      if(el.hasAttribute('onclick') || el.closest('a,button') || el.querySelector('a,button')) return;
      /* تجاهل: عناصر لها أبناء (محتواها ليس نصّياً مباشراً — قد يكون بطاقة مركّبة) */
      if(el.children.length > 0) return;
      /* تجاهل: عناصر لها data-* (تُملأ بـ JS لاحقاً) */
      var hasData=false;
      for(var a=0;a<el.attributes.length;a++){ if(el.attributes[a].name.indexOf('data-')===0){hasData=true;break;} }
      if(hasData) return;
      /* تجاهل: داخل حاوية ديناميكية (id فيه grid/list/container/wrap) */
      var p=el.parentElement;
      if(p && /grid|list|container|wrap|results|items|cards/i.test((p.id||'')+' '+(p.className||''))) return;
      if(txt.length < 3 && !hasMedia){
        var r=el.getBoundingClientRect();
        if(r.width>20 && r.height>10){
          findings.push({ type:'empty', page:pageName, txt:'(عنصر بلا محتوى نصّي)', tag:(el.className||el.tagName).toString().split(' ')[0], note:'كارت/قسم فاضي', el:el, severity:'mid' });
        }
      }
    });

    /* 3. روابط مكسورة (href لصفحة .html مش موجودة في القائمة) */
    var pagesLower = SITE_PAGES.map(function(p){return p.toLowerCase();});
    var links = doc.querySelectorAll('a[href]');
    var brokenSeen = {};
    Array.prototype.forEach.call(links, function(a){
      var href = a.getAttribute('href')||'';
      var m = href.match(/^([a-zA-Z0-9_'-]+\.html?)(#.*)?$/);
      if(m){
        var target = m[1].toLowerCase();
        if(pagesLower.indexOf(target)===-1 && !brokenSeen[target]){
          brokenSeen[target]=1;
          findings.push({ type:'broken', page:pageName, txt:href, tag:'a', note:'رابط لصفحة غير موجودة', el:a, severity:'high' });
        }
      }
    });

    return findings;
  }

  function highlight(el){
    if(!el) return;
    el.scrollIntoView({behavior:'smooth',block:'center'});
    el.style.transition='outline .2s,box-shadow .2s';
    el.style.outline='3px solid #ffcc00';
    el.style.boxShadow='0 0 0 6px rgba(255,204,0,.3)';
    setTimeout(function(){ el.style.outline='2px dashed #c9851a'; el.style.boxShadow=''; }, 1800);
  }

  /* ── فحص الصفحة الحالية ── */
  var pageName = location.pathname.split('/').pop() || 'index.html';
  var autoFindings = autoScan(document, window, pageName);
  autoFindings.forEach(function(f){ if(f.el){ f.el.style.outline='2px dashed #c9851a'; f.el.dataset.mtMarked='1'; } });

  /* ── بناء اللوحة ── */
  var panel=document.createElement('div');
  panel.id='mt-panel';
  panel.style.cssText='position:fixed;bottom:0;right:0;left:0;max-height:65vh;z-index:999999;background:#0d0d0d;color:#eee;font-family:system-ui,sans-serif;font-size:13px;box-shadow:0 -8px 30px rgba(0,0,0,.5);border-top:3px solid #c9851a;display:flex;flex-direction:column;direction:rtl';

  var header=document.createElement('div');
  header.style.cssText='padding:12px 16px;background:#1a1a1a;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;flex-wrap:wrap;gap:8px';
  header.innerHTML='<div><b style="color:#f0a830;font-size:15px">📋 متتبّع المحتوى الناقص</b> &nbsp; <span style="color:#aaa">'+pageName+'</span></div>'+
    '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">'+
      '<span id="mt-count" style="background:'+(autoFindings.length?'#c9851a':'#1a7d4f')+';padding:4px 12px;border-radius:99px;font-weight:700">'+(autoFindings.length?autoFindings.length+' ملاحظة':'✅ نظيف')+'</span>'+
      '<button id="mt-report" style="background:#2a7a5f;border:none;color:#fff;padding:6px 12px;border-radius:8px;cursor:pointer;font-weight:700;font-size:12px">📋 نسخ التقرير</button>'+
      '<button id="mt-scanall" style="background:#3a6ea5;border:none;color:#fff;padding:6px 12px;border-radius:8px;cursor:pointer;font-weight:700;font-size:12px">🌐 فحص كل الموقع</button>'+
      '<button id="mt-close" style="background:#333;border:none;color:#fff;width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:16px">✕</button>'+
    '</div>';
  panel.appendChild(header);

  /* تبويبات */
  var tabs=document.createElement('div');
  tabs.style.cssText='display:flex;gap:4px;padding:8px 12px 0;background:#141414;flex-shrink:0';
  tabs.innerHTML='<button class="mt-tab" data-tab="auto" style="flex:1;padding:9px;border:none;border-radius:8px 8px 0 0;background:#0d0d0d;color:#f0a830;font-weight:700;cursor:pointer;font-family:inherit">🔍 فحص آلي ('+autoFindings.length+')</button>'+
    '<button class="mt-tab" data-tab="manual" style="flex:1;padding:9px;border:none;border-radius:8px 8px 0 0;background:#1a1a1a;color:#888;font-weight:700;cursor:pointer;font-family:inherit">✍️ تتبّع يدوي</button>';
  panel.appendChild(tabs);

  var body=document.createElement('div');
  body.id='mt-body';
  body.style.cssText='overflow-y:auto;padding:10px 12px;flex:1';
  panel.appendChild(body);
  document.body.appendChild(panel);

  var fullReport = null;
  var currentTab = 'auto';

  function renderAuto(list, local){
    if(!list.length){
      body.innerHTML='<div style="padding:24px;text-align:center;color:#4ade80">✅ مفيش placeholders أو أقسام فاضية أو روابط مكسورة في '+(local?'الصفحة دي':'الموقع')+'!<br><small style="color:#888">الفحص الآلي بيرصد المؤشرات الظاهرة فقط — النقص الشرعي (آية ناقصة) محتاج مراجعتك أنت.</small></div>';
      return;
    }
    body.innerHTML='';
    var typeLabels = { placeholder:'🏷️ Placeholder', empty:'📭 فاضي', broken:'🔗 رابط مكسور' };
    var sevColor = { high:'#ff3b30', mid:'#c9851a', low:'#888' };
    list.forEach(function(f){
      var row=document.createElement('div');
      row.style.cssText='padding:10px;border-bottom:1px solid #222;display:flex;gap:10px;align-items:center;'+(local && f.el?'cursor:pointer':'');
      row.innerHTML='<span style="background:'+(sevColor[f.severity]||'#888')+';color:#fff;border-radius:6px;padding:2px 8px;font-size:11px;font-weight:700;white-space:nowrap">'+(typeLabels[f.type]||f.type)+'</span>'+
        (f.page&&!local?'<span style="color:#7ce89a;font-size:11px;white-space:nowrap">'+f.page+'</span>':'')+
        '<span style="flex:1;color:#ddd;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">«'+f.txt+'»</span>'+
        '<span style="color:#666;font-size:11px;white-space:nowrap">'+f.note+'</span>';
      if(local && f.el){ row.onclick=function(){ highlight(f.el); }; }
      body.appendChild(row);
    });
  }

  function renderManual(){
    var data = load();
    var items = data.items || [];
    var html = '<div style="margin-bottom:12px;display:flex;gap:6px;flex-wrap:wrap">'+
      '<input id="mt-new-page" placeholder="الصفحة (مثلاً adhkar.html)" value="'+pageName+'" style="flex:1;min-width:120px;padding:9px;border-radius:8px;border:1px solid #333;background:#1a1a1a;color:#eee;font-family:inherit;font-size:12px">'+
      '<input id="mt-new-desc" placeholder="وصف النقص (مثلاً: آية الكرسي مقصوصة)" style="flex:2;min-width:160px;padding:9px;border-radius:8px;border:1px solid #333;background:#1a1a1a;color:#eee;font-family:inherit;font-size:12px">'+
      '<button id="mt-add" style="background:#2a7a5f;border:none;color:#fff;padding:9px 16px;border-radius:8px;cursor:pointer;font-weight:700;font-family:inherit;font-size:12px">+ إضافة</button>'+
      '</div>';
    if(!items.length){
      html += '<div style="padding:18px;text-align:center;color:#888">لسه مفيش نواقص مسجّلة يدوياً.<br><small>سجّل أي محتوى ناقص لقيته (زي أذكار مقصوصة) وتابع حالته هنا.</small></div>';
    } else {
      var pending = items.filter(function(i){return !i.done;}).length;
      html += '<div style="color:#aaa;font-size:12px;margin-bottom:8px">'+items.length+' مسجّلة · '+pending+' متبقّية</div>';
      items.forEach(function(it,idx){
        html += '<div style="padding:10px;border-bottom:1px solid #222;display:flex;gap:10px;align-items:center">'+
          '<input type="checkbox" '+(it.done?'checked':'')+' data-idx="'+idx+'" class="mt-chk" style="width:18px;height:18px;cursor:pointer;flex-shrink:0">'+
          '<span style="background:#3a3a3a;color:#9db8d0;border-radius:6px;padding:2px 8px;font-size:11px;white-space:nowrap">'+it.page+'</span>'+
          '<span style="flex:1;color:'+(it.done?'#666':'#ddd')+';'+(it.done?'text-decoration:line-through':'')+';overflow:hidden;text-overflow:ellipsis">'+it.desc+'</span>'+
          '<button data-del="'+idx+'" class="mt-del" style="background:#5a2020;border:none;color:#ff9a9a;width:26px;height:26px;border-radius:6px;cursor:pointer;flex-shrink:0">🗑️</button>'+
          '</div>';
      });
    }
    body.innerHTML = html;

    document.getElementById('mt-add').onclick=function(){
      var p=document.getElementById('mt-new-page').value.trim();
      var d=document.getElementById('mt-new-desc').value.trim();
      if(!d){ document.getElementById('mt-new-desc').focus(); return; }
      var data=load(); data.items=data.items||[];
      data.items.unshift({ page:p||'?', desc:d, done:false, ts:Date.now() });
      save(data); renderManual();
    };
    Array.prototype.forEach.call(document.querySelectorAll('.mt-chk'), function(chk){
      chk.onchange=function(){ var data=load(); data.items[+chk.dataset.idx].done=chk.checked; save(data); renderManual(); };
    });
    Array.prototype.forEach.call(document.querySelectorAll('.mt-del'), function(btn){
      btn.onclick=function(){ var data=load(); data.items.splice(+btn.dataset.del,1); save(data); renderManual(); };
    });
  }

  function switchTab(t){
    currentTab=t;
    Array.prototype.forEach.call(document.querySelectorAll('.mt-tab'), function(b){
      var on=b.dataset.tab===t;
      b.style.background=on?'#0d0d0d':'#1a1a1a';
      b.style.color=on?'#f0a830':'#888';
    });
    if(t==='auto') renderAuto(fullReport?fullReport.flat:autoFindings, !fullReport);
    else renderManual();
  }
  Array.prototype.forEach.call(tabs.querySelectorAll('.mt-tab'), function(b){ b.onclick=function(){ switchTab(b.dataset.tab); }; });

  switchTab('auto');

  /* إغلاق */
  document.getElementById('mt-close').onclick=function(){
    document.querySelectorAll('[data-mt-marked]').forEach(function(el){ el.style.outline=''; el.style.boxShadow=''; delete el.dataset.mtMarked; });
    panel.remove(); window.__mtOpen=false;
  };

  /* تقرير */
  document.getElementById('mt-report').onclick=function(){
    var L=['═══ تقرير المحتوى الناقص — زاد ═══','التاريخ: '+new Date().toLocaleString('ar-EG'),''];
    if(fullReport){
      L.push('النطاق: كل الموقع ('+fullReport.pagesScanned+' صفحة)');
      L.push('إجمالي الملاحظات الآلية: '+fullReport.flat.length); L.push('');
      var byPage={};
      fullReport.flat.forEach(function(f){ (byPage[f.page]=byPage[f.page]||[]).push(f); });
      Object.keys(byPage).forEach(function(pg){
        L.push('▼ '+pg+' ('+byPage[pg].length+')');
        byPage[pg].forEach(function(f){ L.push('   ['+f.type+'] «'+f.txt+'» — '+f.note); });
      });
      if(fullReport.failed.length){ L.push(''); L.push('تعذّر فحصها: '+fullReport.failed.join(', ')); }
    } else {
      L.push('النطاق: صفحة واحدة ('+pageName+')');
      L.push('ملاحظات آلية: '+autoFindings.length); L.push('');
      autoFindings.forEach(function(f){ L.push('['+f.type+'] «'+f.txt+'» — '+f.note); });
    }
    /* النواقص اليدوية */
    var data=load(); var items=(data.items||[]);
    if(items.length){
      L.push(''); L.push('── النواقص اليدوية ('+items.filter(function(i){return !i.done;}).length+' متبقّية) ──');
      items.forEach(function(it){ L.push((it.done?'[✓] ':'[ ] ')+it.page+': '+it.desc); });
    }
    L.push(''); L.push('ملاحظة: الفحص الآلي يرصد المؤشرات الظاهرة فقط. النقص الشرعي يحتاج مراجعةً بشريّة.');
    var txt=L.join('\n');
    if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(txt).catch(function(){fb(txt);}); } else fb(txt);
    var btn=document.getElementById('mt-report'),o=btn.textContent; btn.textContent='✅ تم'; setTimeout(function(){btn.textContent=o;},1500);
    function fb(t){ var ta=document.createElement('textarea'); ta.value=t; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select(); try{document.execCommand('copy');}catch(e){} document.body.removeChild(ta); }
  };

  /* فحص كل الموقع */
  document.getElementById('mt-scanall').onclick=function(){
    var btn=document.getElementById('mt-scanall'); btn.disabled=true; btn.style.opacity='0.6';
    switchTab('auto');
    var base=location.href.replace(/[^/]*$/,'').replace(/tools\/$/,'');
    var flat=[], failed=[], done=0;
    body.innerHTML='<div style="padding:20px;text-align:center;color:#f0a830">🌐 جارٍ فحص '+SITE_PAGES.length+' صفحة...<br><div id="mt-prog" style="margin-top:10px;color:#888"></div></div>';
    var prog=document.getElementById('mt-prog');
    var iframe=document.createElement('iframe');
    iframe.style.cssText='position:fixed;width:1024px;height:768px;left:-9999px;top:0;border:0';
    document.body.appendChild(iframe);
    var i=0;
    function next(){
      if(i>=SITE_PAGES.length){ finish(); return; }
      var page=SITE_PAGES[i];
      if(prog) prog.textContent='('+(i+1)+'/'+SITE_PAGES.length+') '+page;
      var to=setTimeout(function(){ failed.push(page); i++; next(); }, 8000);
      iframe.onload=function(){
        clearTimeout(to);
        setTimeout(function(){
          try{
            var f=autoScan(iframe.contentDocument, iframe.contentWindow, page);
            f.forEach(function(x){ delete x.el; flat.push(x); }); /* شيل مرجع DOM من iframe */
            done++;
          }catch(e){ failed.push(page); }
          i++; next();
        }, 700);
      };
      try{ iframe.src=base+encodeURI(page); }catch(e){ failed.push(page); i++; next(); }
    }
    function finish(){
      iframe.remove(); btn.disabled=false; btn.style.opacity='1';
      var order={high:0,mid:1,low:2};
      flat.sort(function(a,b){ return (order[a.severity]||9)-(order[b.severity]||9); });
      fullReport={ pagesScanned:done, flat:flat, failed:failed };
      document.getElementById('mt-count').textContent=flat.length+' ملاحظة (كل الموقع)';
      renderAuto(flat, false);
    }
    next();
  };

  console.log('[متتبّع المحتوى v1]', autoFindings.length, 'ملاحظة في', pageName);
})();
