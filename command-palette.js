/* ═══════════════════════════════════════════════════════════════
   command-palette.js — شريط الأوامر (Ctrl+K) + اختصارات لوحة المفاتيح
   لتطبيق زاد · بحث سريع في الصفحات + أوامر + اختصارات
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  if(window.__zadPalette) return;
  window.__zadPalette = true;

  /* ── قائمة الصفحات (للبحث) ── */
  var PAGES = [
    {h:'index.html',i:'🏠',t:'لوحة التحكم'},
    {h:'prayers.html',i:'🕌',t:'مواقيت الصلاة'},
    {h:'qibla.html',i:'🧭',t:'اتجاه القبلة'},
    {h:'hijri.html',i:'🗓️',t:'التقويم الهجري'},
    {h:'barnamaj.html',i:'📅',t:'برنامج اليوم'},
    {h:'mushaf.html',i:'📖',t:'ورد العشر'},
    {h:'mushaf-quran.html',i:'🕋',t:'المصحف الشريف'},
    {h:'Quran-radio.HTML',i:'📻',t:'إذاعات القرآن'},
    {h:'takbeer.html',i:'📿',t:'المسبحة والتكبير'},
    {h:'adhkar.html',i:'🤲',t:'الأذكار'},
    {h:'nawawi.html',i:'📜',t:'الأربعون النووية'},
    {h:'dua-guide.html',i:'🙏',t:'قيم الدعاء'},
    {h:'ruqyah.html',i:'🛡️',t:'الرقية الشرعية'},
    {h:'sunan.html',i:'🌙',t:'السنن المهجورة'},
    {h:'worship.html',i:'✅',t:'جدول العبادات'},
    {h:'fadael.html',i:'✨',t:'فضائل العشر'},
    {h:'manasik.html',i:'🕋',t:'مناسك الحج'},
    {h:'arafah.html',i:'🌄',t:'يوم عرفة'},
    {h:'arafah-dua.html',i:'🤲',t:'دعاء يوم عرفة'},
    {h:'odhiya.html',i:'🐏',t:'دليل الأضحية'},
    {h:'sadaqah.html',i:'💚',t:'صدقة العشر'},
    {h:'zakat.html',i:'🧮',t:'حاسبة الزكاة'},
    {h:'videos.html',i:'🎬',t:'محاضرات العشر'},
    {h:'playlist.html',i:'🎵',t:'قائمة التشغيل'},
    {h:'asma.html',i:'🌺',t:'أسماء الله الحسنى'},
    {h:'kids.html',i:'🌟',t:'ثُريّا — الأطفال'},
    {h:'ghars.html',i:'🌱',t:'غرس — قصص الأطفال'},
    {h:'kids-heroes.html',i:'🦁',t:'عرين الأبطال'},
    {h:'kids-school.html',i:'🏫',t:'مدرستي الجميلة'},
    {h:'kids-fun.html',i:'🎮',t:'شاشة المرح'},
    {h:'kids-creativity.html',i:'🎨',t:'نادي الإبداع'},
    {h:'kids-parents.html',i:'👨‍👧',t:'دليل المربي'},
    {h:'hasad.html',i:'📊',t:'حصاد العشر'},
    {h:'summary.html',i:'📈',t:'إحصاء العشر'},
    {h:'groups.html',i:'👨‍👩‍👧',t:'التنافس العائلي'},
    {h:'badges.html',i:'🏅',t:'أوسمتي'},
    {h:'profile.html',i:'👤',t:'حسابي'},
    {h:'settings.html',i:'⚙️',t:'الإعدادات'},
    {h:'about.html',i:'ℹ️',t:'عن التطبيق'},
  ];

  /* ── أوامر سريعة ── */
  var ACTIONS = [
    {i:'☀️',t:'الوضع الفاتح',act:function(){ setTheme('light'); }},
    {i:'🌙',t:'الوضع الداكن',act:function(){ setTheme('dark'); }},
    {i:'⚫',t:'وضع OLED',act:function(){ setTheme('oled'); }},
    {i:'⚙️',t:'فتح الإعدادات',act:function(){ go('settings.html'); }},
    {i:'🔝',t:'العودة لأعلى الصفحة',act:function(){ window.scrollTo({top:0,behavior:'smooth'}); close(); }},
  ];

  function setTheme(t){
    try{
      document.documentElement.setAttribute('data-theme', t);
      var k='zad_v2', d=JSON.parse(localStorage.getItem(k)||'{}'); d.theme=t; localStorage.setItem(k,JSON.stringify(d));
    }catch(e){}
    toast('تم تغيير الوضع');
    close();
  }
  function go(href){ location.href=href; }

  /* ── إنشاء واجهة الـ palette ── */
  var overlay, input, list, items=[], activeIdx=0, filtered=[];

  function build(){
    overlay=document.createElement('div');
    overlay.id='zad-cmd-overlay';
    overlay.style.cssText='position:fixed;inset:0;z-index:2000000;background:rgba(0,0,0,.5);backdrop-filter:blur(3px);display:none;align-items:flex-start;justify-content:center;padding-top:12vh;direction:rtl';
    overlay.innerHTML=
      '<div id="zad-cmd-box" style="background:var(--card,#fff);color:var(--ink,#222);width:min(560px,92vw);max-height:70vh;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.4);overflow:hidden;display:flex;flex-direction:column;font-family:inherit">'+
        '<div style="padding:14px 16px;border-bottom:1px solid var(--border,#eee);display:flex;align-items:center;gap:10px">'+
          '<span style="font-size:18px">🔍</span>'+
          '<input id="zad-cmd-input" placeholder="ابحث عن صفحة أو أمر..." style="flex:1;border:none;background:none;outline:none;font-size:16px;font-family:inherit;color:var(--ink,#222)">'+
          '<kbd style="font-size:11px;color:var(--muted,#999);border:1px solid var(--border,#ddd);border-radius:5px;padding:2px 6px">Esc</kbd>'+
        '</div>'+
        '<div id="zad-cmd-list" style="overflow-y:auto;flex:1;padding:6px"></div>'+
        '<div style="padding:8px 16px;border-top:1px solid var(--border,#eee);font-size:11px;color:var(--muted,#999);display:flex;gap:14px;flex-wrap:wrap">'+
          '<span>↑↓ تنقّل</span><span>↵ فتح</span><span>Esc إغلاق</span>'+
        '</div>'+
      '</div>';
    document.body.appendChild(overlay);
    input=document.getElementById('zad-cmd-input');
    list=document.getElementById('zad-cmd-list');
    overlay.onclick=function(e){ if(e.target===overlay) close(); };
    input.oninput=function(){ render(input.value); };
    input.onkeydown=function(e){
      if(e.key==='ArrowDown'){ e.preventDefault(); activeIdx=Math.min(activeIdx+1,filtered.length-1); paint(); }
      else if(e.key==='ArrowUp'){ e.preventDefault(); activeIdx=Math.max(activeIdx-1,0); paint(); }
      else if(e.key==='Enter'){ e.preventDefault(); exec(filtered[activeIdx]); }
      else if(e.key==='Escape'){ close(); }
    };
  }

  function allItems(){
    var pageItems=PAGES.map(function(p){return {type:'page',i:p.i,t:p.t,sub:p.h,act:function(){go(p.h);}};});
    var actItems=ACTIONS.map(function(a){return {type:'action',i:a.i,t:a.t,sub:'أمر سريع',act:a.act};});
    return actItems.concat(pageItems);
  }

  function render(q){
    q=(q||'').trim().toLowerCase();
    var all=allItems();
    filtered = q ? all.filter(function(it){return it.t.toLowerCase().indexOf(q)>=0 || (it.sub||'').toLowerCase().indexOf(q)>=0;}) : all;
    activeIdx=0;
    paint();
  }

  function paint(){
    if(!filtered.length){ list.innerHTML='<div style="padding:24px;text-align:center;color:var(--muted,#999)">لا نتائج</div>'; return; }
    list.innerHTML='';
    filtered.forEach(function(it,idx){
      var row=document.createElement('div');
      row.style.cssText='padding:10px 12px;border-radius:10px;display:flex;align-items:center;gap:12px;cursor:pointer;'+(idx===activeIdx?'background:var(--green-pale,#e8f4ef)':'');
      row.innerHTML='<span style="font-size:18px;width:24px;text-align:center">'+it.i+'</span>'+
        '<span style="flex:1;font-weight:600;font-size:14px">'+it.t+'</span>'+
        '<span style="font-size:11px;color:var(--muted,#999)">'+it.sub+'</span>';
      row.onmouseenter=function(){ activeIdx=idx; paint(); };
      row.onclick=function(){ exec(it); };
      list.appendChild(row);
    });
    var active=list.children[activeIdx];
    if(active) active.scrollIntoView({block:'nearest'});
  }

  function exec(it){ if(it&&it.act) it.act(); }

  function open(){
    if(!overlay) build();
    overlay.style.display='flex';
    input.value='';
    render('');
    setTimeout(function(){ input.focus(); },50);
  }
  function close(){ if(overlay) overlay.style.display='none'; }

  function toast(msg){
    var t=document.createElement('div');
    t.textContent=msg;
    t.style.cssText='position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.85);color:#fff;padding:10px 20px;border-radius:99px;z-index:2000001;font-size:13px;font-family:system-ui';
    document.body.appendChild(t);
    setTimeout(function(){ t.remove(); },1600);
  }

  /* ══════════════════════════════════════════════
     اختصارات لوحة المفاتيح
  ══════════════════════════════════════════════ */
  var seqBuffer='', seqTimer=null;
  var SEQUENCES = {
    'gh':'index.html', 'gp':'prayers.html', 'gm':'mushaf-quran.html',
    'ga':'adhkar.html', 'gs':'settings.html', 'gt':'takbeer.html',
  };

  document.addEventListener('keydown', function(e){
    /* تجاهل لو بيكتب في حقل */
    var tag=(e.target.tagName||'').toLowerCase();
    var typing = tag==='input'||tag==='textarea'||tag==='select'||e.target.isContentEditable;

    /* Ctrl/Cmd + K → فتح الـ palette */
    if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='k'){
      e.preventDefault();
      if(overlay && overlay.style.display==='flex') close(); else open();
      return;
    }

    /* ? → فتح الـ palette (لو مش بيكتب) */
    if(e.key==='?' && !typing && !e.ctrlKey && !e.metaKey){
      e.preventDefault(); open(); return;
    }

    if(typing) return;

    /* تسلسل g ثم حرف */
    if(e.key==='g' && !e.ctrlKey && !e.metaKey && !e.altKey){
      seqBuffer='g';
      clearTimeout(seqTimer);
      seqTimer=setTimeout(function(){ seqBuffer=''; },1000);
      return;
    }
    if(seqBuffer==='g'){
      var combo='g'+e.key.toLowerCase();
      if(SEQUENCES[combo]){ e.preventDefault(); location.href=SEQUENCES[combo]; }
      seqBuffer='';
      clearTimeout(seqTimer);
    }
  });

  /* زر عائم صغير للموبايل (مفيش كيبورد) */
  function addFab(){
    var fab=document.createElement('button');
    fab.id='zad-cmd-fab';
    fab.setAttribute('aria-label','شريط الأوامر — بحث سريع');
    fab.innerHTML='🔍';
    fab.style.cssText='position:fixed;bottom:168px;left:20px;z-index:9498;width:46px;height:46px;border-radius:50%;border:none;background:var(--green-deep,#0e3b2e);color:#fff;font-size:18px;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;opacity:.85;transition:opacity .2s';
    fab.onmouseenter=function(){ fab.style.opacity='1'; };
    fab.onmouseleave=function(){ fab.style.opacity='.85'; };
    fab.onclick=open;
    document.body.appendChild(fab);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',addFab);
  else addFab();

  console.log('[شريط الأوامر] جاهز — Ctrl+K للفتح، g ثم حرف للتنقّل السريع');
})();
