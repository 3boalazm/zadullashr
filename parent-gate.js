/* ═══════════════════════════════════════════════════════════════════════════
   زاد — js/parent-gate.js  (P1: أمان الأطفال — بوابة ولي الأمر)
   ─────────────────────────────────────────────────────────────────────────
   الفكرة (نمط Apple/Google لتطبيقات الأطفال):
   البوابة تحمي *المخارج* من المنطقة الآمنة — لا تقفل المنطقة نفسها.
   الطفل يتنقّل بحرية بين صفحات القسم الآمن (kids / ghars / ramadan-kids)، لكن أي رابط
   يخرج لخارج هذه المنطقة (لوحة التحكم، شات الذكاء الاصطناعي، أي رابط خارجي)
   يمرّ ببوابة تحدٍّ بسيط لا يجتازه طفل صغير ويجتازه البالغ في ثانية.

   ملاحظة معمارية: حالة "فترة السماح" مؤقتة وأمنية، وليست بيانات مستخدم —
   لذلك تُحفظ في sessionStorage (تُمحى بإغلاق التبويب) ولا تُكتب في zad_v2.
   هذا مقصود: البوابة يجب أن تُعيد التحدي في كل جلسة جديدة.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var GRACE_KEY = 'zad_pg_grace';
  var GRACE_MS  = 60000; /* بعد اجتياز ولي الأمر: 60 ثانية بلا إعادة تحدٍّ */
  var pendingURL = null;

  /* ── تصنيف الروابط ─────────────────────────────────────────────────────── */
  function isKidSafe(name) {
    if (!name) return false;
    return name === 'kids.html'
        || name.indexOf('kids-') === 0
        || name === 'ghars.html'
        || name === 'ramadan-kids.html';
  }
  /* true = آمن (بدون بوابة) ، false = يحتاج بوابة */
  function isSafeHref(href) {
    if (!href) return true;
    var h = href.trim();
    if (h.charAt(0) === '#') return true;                 /* مرساة داخل الصفحة */
    if (/^(javascript:|mailto:|tel:)/i.test(h)) return true;
    if (/^https?:\/\//i.test(h)) return false;            /* رابط خارجي → بوابة */
    var file = h.split(/[?#]/)[0].split('/').pop();
    if (!file) return false;                              /* الجذر "/" → لوحة التحكم → بوابة */
    return isKidSafe(file);
  }

  /* ── فترة السماح ───────────────────────────────────────────────────────── */
  function inGrace() {
    try { return (Date.now() - (+sessionStorage.getItem(GRACE_KEY) || 0)) < GRACE_MS; }
    catch (e) { return false; }
  }
  function setGrace() {
    try { sessionStorage.setItem(GRACE_KEY, String(Date.now())); } catch (e) {}
  }

  /* ── تطبيع الأرقام العربية الهندية (٠-٩) إلى لاتينية ───────────────────── */
  function normNum(s) {
    return String(s).replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); }).trim();
  }
  function ai(n) {
    return String(n).replace(/[0-9]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'[+d]; });
  }

  /* ── التحدّي: ضرب رقمين (يصعب على طفل صغير، سهل على البالغ) ─────────────── */
  function newChallenge() {
    var a = 2 + Math.floor(Math.random() * 8); /* 2..9 */
    var b = 2 + Math.floor(Math.random() * 8);
    return { a: a, b: b, ans: a * b };
  }

  /* ── حقن الستايل مرة واحدة ─────────────────────────────────────────────── */
  function injectStyle() {
    if (document.getElementById('pg-style')) return;
    var st = document.createElement('style');
    st.id = 'pg-style';
    st.textContent =
      '.pg-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:22px;' +
      'background:rgba(8,30,22,.6);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);animation:pgFade .2s ease}' +
      '@keyframes pgFade{from{opacity:0}to{opacity:1}}' +
      '@keyframes pgPop{0%{transform:scale(.9);opacity:0}100%{transform:scale(1);opacity:1}}' +
      '@keyframes pgShake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-7px)}40%,80%{transform:translateX(7px)}}' +
      '.pg-card{background:var(--card,#fff);color:var(--ink,#111);border:1.5px solid var(--border,#e5e5e5);border-radius:22px;' +
      'padding:24px 22px;max-width:360px;width:100%;box-shadow:0 24px 60px -16px rgba(0,0,0,.4);animation:pgPop .28s cubic-bezier(.34,1.56,.64,1);text-align:center}' +
      '.pg-card.shake{animation:pgShake .4s}' +
      '.pg-lock{width:58px;height:58px;border-radius:50%;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;font-size:28px;' +
      'background:linear-gradient(135deg,var(--green-deep,#0e3b2e),var(--green-mid,#1a5d47))}' +
      '.pg-tag{font-size:11px;font-weight:800;letter-spacing:1px;color:var(--gold-dark,#9a7b2e);background:var(--gold-pale,#f7efda);' +
      'display:inline-block;padding:4px 12px;border-radius:99px;margin-bottom:10px}' +
      '.pg-q{font-size:13px;color:var(--muted,#666);line-height:1.7;margin-bottom:6px}' +
      '.pg-eq{font-family:"ThmanyahSans",monospace;font-size:30px;font-weight:900;color:var(--green-deep,#0e3b2e);margin:6px 0 14px}' +
      'html[data-theme="dark"] .pg-eq,html[data-theme="oled"] .pg-eq{color:var(--sys-green,#4dd866)}' +
      '.pg-input{width:100%;box-sizing:border-box;text-align:center;font-size:22px;font-weight:800;font-family:inherit;padding:12px;' +
      'border:2px solid var(--border,#e5e5e5);border-radius:14px;background:var(--sand,#f5f5f5);color:var(--ink,#111);margin-bottom:12px;-webkit-appearance:none}' +
      '.pg-input:focus{outline:none;border-color:var(--green-soft,#4dd866)}' +
      '.pg-err{color:#ff3b30;font-size:12px;font-weight:700;min-height:16px;margin-bottom:8px}' +
      '.pg-btns{display:flex;gap:10px}' +
      '.pg-btn{flex:1;padding:13px;border-radius:13px;font-family:inherit;font-size:14px;font-weight:800;cursor:pointer;border:1.5px solid var(--border,#e5e5e5);background:transparent;color:var(--muted,#666)}' +
      '.pg-btn.primary{border-color:var(--green-deep,#0e3b2e);background:var(--green-deep,#0e3b2e);color:#fff}' +
      '.pg-hint{font-size:11px;color:var(--muted,#888);margin-top:12px;line-height:1.6}';
    document.head.appendChild(st);
  }

  /* ── بناء وعرض البوابة ─────────────────────────────────────────────────── */
  function showGate(url) {
    pendingURL = url;
    injectStyle();
    var ch = newChallenge();

    var ov = document.createElement('div');
    ov.className = 'pg-overlay';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-label', 'بوابة ولي الأمر');
    ov.innerHTML =
      '<div class="pg-card" id="pg-card">' +
        '<div class="pg-lock">🔒</div>' +
        '<div class="pg-tag">👨‍👩‍👧 للأهل فقط</div>' +
        '<div class="pg-q">للمتابعة خارج ركن الأطفال، من فضلك اكتب ناتج:</div>' +
        '<div class="pg-eq" id="pg-eq">' + ai(ch.a) + ' × ' + ai(ch.b) + ' = ؟</div>' +
        '<input class="pg-input" id="pg-input" inputmode="numeric" autocomplete="off" aria-label="ناتج الضرب" placeholder="؟">' +
        '<div class="pg-err" id="pg-err"></div>' +
        '<div class="pg-btns">' +
          '<button class="pg-btn" id="pg-cancel" type="button">إلغاء</button>' +
          '<button class="pg-btn primary" id="pg-ok" type="button">متابعة</button>' +
        '</div>' +
        '<div class="pg-hint">هذا السؤال يحمي طفلك من الخروج من القسم الآمن دون قصد.</div>' +
      '</div>';
    document.body.appendChild(ov);

    var card  = ov.querySelector('#pg-card');
    var input = ov.querySelector('#pg-input');
    var err   = ov.querySelector('#pg-err');
    var ansRef = { v: ch.ans };

    function close() { ov.remove(); pendingURL = null; }
    function regen() {
      var c = newChallenge(); ansRef.v = c.ans;
      ov.querySelector('#pg-eq').textContent = ai(c.a) + ' × ' + ai(c.b) + ' = ؟';
      input.value = '';
    }
    function fail() {
      err.textContent = 'إجابة غير صحيحة، حاول مرة أخرى';
      card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
      regen(); input.focus();
    }
    function submit() {
      var val = normNum(input.value);
      if (val === '' ) { input.focus(); return; }
      if (parseInt(val, 10) === ansRef.v) {
        setGrace();
        var go = pendingURL;
        close();
        if (go) window.location.href = go;
      } else {
        fail();
      }
    }

    ov.querySelector('#pg-ok').addEventListener('click', submit);
    ov.querySelector('#pg-cancel').addEventListener('click', close);
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); submit(); }
      else if (e.key === 'Escape') { close(); }
    });
    setTimeout(function () { input.focus(); }, 60);
  }

  /* ── اعتراض النقر (مرحلة الالتقاط: قبل menu.js/app.js) ─────────────────── */
  document.addEventListener('click', function (e) {
    var t = e.target;
    var a = t && t.closest ? t.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href');
    if (isSafeHref(href)) return;     /* داخل المنطقة الآمنة → اسمح */
    if (inGrace()) return;            /* ولي الأمر اجتاز مؤخراً → اسمح */
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    showGate(a.href);                 /* a.href = مطلق */
  }, true);

})();
