/* ═══════════════════════════════════════════════════════════════════════════
   زاد — إثراء «آية اليوم»
   ─────────────────────────────────────────────────────────────────────────
   ملاحظة: التطبيق يستخدم 8 آيات منتقاة بعناية لموضوع العشر (DAILY_VERSES).
   هذا ليس عيباً — الانتقاء مقصود. لكن التحليل اقترح إثراءها بتفسير من API.
   
   الحل: نضيف زر «تفسير موسّع» اختياري يجلب التفسير من Quran.com عند الطلب،
   مع الإبقاء على الآيات المنتقاة كما هي. لا نستبدل المحلي — نُثريه.
   ═══════════════════════════════════════════════════════════════════════════ */

/* خريطة آيات DAILY_VERSES إلى مواضعها (سورة:آية) لجلب التفسير */
const VERSE_REFS = {
  'سورة الفجر 1-2':    { surah: 89, ayah: 2 },
  'سورة الحج 28':      { surah: 22, ayah: 28 },
  'سورة البقرة 197':   { surah: 2,  ayah: 197 },
  'سورة الكوثر 1-2':   { surah: 108, ayah: 2 },
  'سورة الأنعام 162':  { surah: 6,  ayah: 162 },
  'سورة البقرة 286':   { surah: 2,  ayah: 286 },
  'سورة آل عمران 133': { surah: 3,  ayah: 133 },
  'سورة الذاريات 56':  { surah: 51, ayah: 56 },
};

/* ── إضافة زر «تفسير موسّع» تحت آية اليوم ────────────────────────────────── */
function injectVerseExpandButton() {
  const verseCard = document.querySelector('#verse-ar')?.closest('.card, .verse-card, section');
  if (!verseCard || document.getElementById('verse-expand-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'verse-expand-btn';
  btn.className = 'verse-expand-btn';
  btn.innerHTML = '📖 تفسير موسّع';
  btn.onclick = loadExpandedTafsir;

  const srcEl = document.getElementById('verse-src');
  if (srcEl && srcEl.parentNode) {
    srcEl.parentNode.appendChild(btn);
  }
}

/* ── جلب التفسير الموسّع من Quran.com عند الطلب ──────────────────────────── */
async function loadExpandedTafsir() {
  const srcText = document.getElementById('verse-src')?.textContent?.trim();
  const ref = VERSE_REFS[srcText];
  const btn = document.getElementById('verse-expand-btn');

  if (!ref) {
    if (typeof showToast === 'function') showToast('التفسير المختصر متاح أعلاه');
    return;
  }

  if (btn) { btn.disabled = true; btn.innerHTML = '⏳ جارٍ التحميل...'; }

  try {
    /* تفسير السعدي (id=91) أو ابن كثير (id=169) من Quran.com */
    const url = `https://api.quran.com/api/v4/tafsirs/91/by_ayah/${ref.surah}:${ref.ayah}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = await res.json();

    let tafsirText = data?.tafsir?.text || '';
    /* نظّف HTML tags */
    tafsirText = tafsirText.replace(/<[^>]*>/g, '').trim();

    if (tafsirText) {
      showTafsirModal(srcText, tafsirText);
    } else {
      if (typeof showToast === 'function') showToast('التفسير غير متاح حالياً');
    }
  } catch (e) {
    if (typeof showToast === 'function') showToast('تعذّر جلب التفسير — تحقق من الاتصال');
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '📖 تفسير موسّع'; }
  }
}

/* ── عرض التفسير في نافذة ─────────────────────────────────────────────────── */
function showTafsirModal(verseSrc, tafsir) {
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.innerHTML = `
    <div style="background:var(--card,#fff);border-radius:20px;padding:24px;max-width:440px;max-height:75vh;overflow:auto">
      <div style="font-size:13px;color:var(--zad-gold-700,#b87200);font-weight:700;margin-bottom:4px">تفسير السعدي</div>
      <h3 style="margin:0 0 16px;font-size:15px;color:var(--muted,#888)">${verseSrc}</h3>
      <div style="font-size:15px;line-height:2;color:var(--ink)">${tafsir}</div>
      <div style="font-size:12px;color:var(--muted,#888);margin-top:16px">المصدر: Quran.com — تفسير السعدي</div>
      <button onclick="this.closest('[style*=fixed]').remove()" 
              class="btn btn-primary" style="width:100%;margin-top:16px">إغلاق</button>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

const VERSE_EXPAND_CSS = `
.verse-expand-btn { background: rgba(201,161,74,.12); border: 1px solid rgba(201,161,74,.3);
  color: var(--zad-gold-700, #b87200); padding: 6px 14px; border-radius: 20px;
  font-family: inherit; font-size: 12px; font-weight: 700; cursor: pointer; margin-top: 8px; }
.verse-expand-btn:disabled { opacity: 0.6; cursor: wait; }
`;

function injectVerseExpandCSS() {
  if (document.getElementById('verse-expand-css')) return;
  const s = document.createElement('style');
  s.id = 'verse-expand-css'; s.textContent = VERSE_EXPAND_CSS;
  document.head.appendChild(s);
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('verse-ar')) {
    injectVerseExpandCSS();
    setTimeout(injectVerseExpandButton, 800); /* انتظر verse rotator */
    console.log('[VerseEnrich] ✅ إثراء آية اليوم جاهز');
  }
});
