/* ═══════════════════════════════════════════════════════════════════════════
   زاد — زر نشر المحتوى / مشاركة الصفحة
   ─────────────────────────────────────────────────────────────────────────
   زر مشاركة يستخدم Web Share API (مدعوم على الموبايل) مع fallback لنسخ الرابط
   ونشر على واتساب/تيليجرام/تويتر. يحترم Calm UX (هادئ، غير مزعج).
   ═══════════════════════════════════════════════════════════════════════════ */

const ZadShare = {

  /* بيانات المشاركة حسب الصفحة */
  getPageShareData() {
    const page = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    const url = window.location.href;
    const title = document.title || 'زاد العشر';

    /* وصف مخصّص لكل صفحة */
    const descriptions = {
      index:    'زاد العشر — رفيقك الروحاني في أفضل أيام الدنيا',
      adhkar:   'أذكار موثّقة من زاد العشر — الصباح والمساء وأكثر',
      'adhkar-categories': 'كل الأذكار في مكان واحد — زاد العشر',
      mushaf:   'تابع ختمتك في زاد العشر',
      takbeer:  'سبّح وكبّر مع زاد العشر',
      hasad:    'حصاد عبادتي في زاد العشر',
      arafah:   'برنامج يوم عرفة — زاد العشر',
      taqweem:  'التقويم الإسلامي السنوي — زاد العشر',
      fadael:   'فضائل عشر ذي الحجة — زاد العشر',
    };

    return {
      url,
      title,
      text: descriptions[page] || 'اكتشف زاد العشر — رفيقك في عشر ذي الحجة',
    };
  },

  /* ── المشاركة الرئيسية ───────────────────────────────────────────────── */
  async share() {
    const data = this.getPageShareData();

    /* Web Share API (الأفضل على الموبايل) */
    if (navigator.share) {
      try {
        await navigator.share({ title: data.title, text: data.text, url: data.url });
        return;
      } catch (e) {
        if (e.name === 'AbortError') return; /* المستخدم ألغى */
      }
    }

    /* Fallback: قائمة منصات */
    this.showShareSheet(data);
  },

  /* ── قائمة المنصات (fallback) ────────────────────────────────────────── */
  showShareSheet(data) {
    if (document.getElementById('zad-share-sheet')) return;

    const enc = encodeURIComponent;
    const shareLinks = [
      { name: 'واتساب',   icon: '💬', url: `https://wa.me/?text=${enc(data.text + ' ' + data.url)}` },
      { name: 'تيليجرام', icon: '✈️', url: `https://t.me/share/url?url=${enc(data.url)}&text=${enc(data.text)}` },
      { name: 'تويتر / X', icon: '𝕏', url: `https://twitter.com/intent/tweet?text=${enc(data.text)}&url=${enc(data.url)}` },
      { name: 'فيسبوك',   icon: '📘', url: `https://www.facebook.com/sharer/sharer.php?u=${enc(data.url)}` },
    ];

    const sheet = document.createElement('div');
    sheet.id = 'zad-share-sheet';
    sheet.className = 'zad-share-overlay';
    sheet.innerHTML = `
      <div class="zad-share-panel">
        <div class="zad-share-handle"></div>
        <div class="zad-share-title">مشاركة هذه الصفحة</div>
        <div class="zad-share-grid">
          ${shareLinks.map(l => `
            <a href="${l.url}" target="_blank" rel="noopener" class="zad-share-item" onclick="window.ZadShare.close()">
              <span class="zsi-icon">${l.icon}</span>
              <span class="zsi-name">${l.name}</span>
            </a>
          `).join('')}
          <button class="zad-share-item" onclick="window.ZadShare.copyLink()">
            <span class="zsi-icon">🔗</span>
            <span class="zsi-name">نسخ الرابط</span>
          </button>
        </div>
        <button class="zad-share-cancel" onclick="window.ZadShare.close()">إلغاء</button>
      </div>`;
    document.body.appendChild(sheet);
    requestAnimationFrame(() => sheet.classList.add('open'));
    sheet.addEventListener('click', e => { if (e.target === sheet) this.close(); });
  },

  async copyLink() {
    const data = this.getPageShareData();
    try {
      await navigator.clipboard.writeText(data.url);
      if (typeof showToast === 'function') showToast('🔗 تم نسخ الرابط');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = data.url; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
      if (typeof showToast === 'function') showToast('🔗 تم نسخ الرابط');
    }
    this.close();
  },

  close() {
    const sheet = document.getElementById('zad-share-sheet');
    if (sheet) { sheet.classList.remove('open'); setTimeout(() => sheet.remove(), 280); }
  },

  /* ── حقن زر المشاركة في الـ topbar ───────────────────────────────────── */
  injectButton() {
    if (document.getElementById('zad-share-btn')) return;

    /* ابحث عن مكان مناسب: بجانب زر الإشعارات أو في الـ topbar */
    const topbar = document.querySelector('.topbar, .top-bar, header');
    const notifBtn = document.getElementById('notif-btn');

    const btn = document.createElement('button');
    btn.id = 'zad-share-btn';
    btn.className = 'zad-share-btn';
    btn.setAttribute('aria-label', 'مشاركة الصفحة');
    btn.innerHTML = '<span>📤</span>';
    btn.onclick = () => this.share();

    if (notifBtn && notifBtn.parentNode) {
      notifBtn.parentNode.insertBefore(btn, notifBtn);
    } else if (topbar) {
      topbar.appendChild(btn);
    } else {
      /* fallback: زر عائم */
      btn.classList.add('floating');
      document.body.appendChild(btn);
    }
  },

  injectCSS() {
    if (document.getElementById('zad-share-css')) return;
    const s = document.createElement('style');
    s.id = 'zad-share-css';
    s.textContent = `
      .zad-share-btn { background: none; border: none; cursor: pointer; font-size: 20px;
        width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center;
        justify-content: center; transition: background .2s; color: inherit; }
      .zad-share-btn:hover { background: rgba(0,0,0,.06); }
      .zad-share-btn.floating { position: fixed; bottom: 88px; right: 20px; z-index: 9400;
        background: var(--card,#fff); box-shadow: 0 4px 16px rgba(0,0,0,.15); }
      .zad-share-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5);
        z-index: 9600; display: flex; align-items: flex-end; justify-content: center;
        opacity: 0; transition: opacity .28s; }
      .zad-share-overlay.open { opacity: 1; }
      .zad-share-panel { background: var(--card,#fff); width: 100%; max-width: 480px;
        border-radius: 24px 24px 0 0; padding: 12px 20px 24px;
        transform: translateY(100%); transition: transform .28s cubic-bezier(.4,0,.2,1); }
      .zad-share-overlay.open .zad-share-panel { transform: translateY(0); }
      .zad-share-handle { width: 40px; height: 4px; background: var(--border,#ddd);
        border-radius: 2px; margin: 0 auto 16px; }
      .zad-share-title { font-size: 17px; font-weight: 800; text-align: center; margin-bottom: 20px; }
      .zad-share-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(72px, 1fr)); gap: 12px; margin-bottom: 16px; }
      .zad-share-item { display: flex; flex-direction: column; align-items: center; gap: 6px;
        padding: 12px 8px; border-radius: 14px; border: none; background: var(--sand,#faf9f6);
        cursor: pointer; text-decoration: none; color: var(--ink,#222); font-family: inherit;
        min-height: 72px; justify-content: center; transition: background .2s; }
      .zad-share-item:hover { background: var(--border,#eee); }
      .zsi-icon { font-size: 26px; }
      .zsi-name { font-size: 12px; font-weight: 700; }
      .zad-share-cancel { width: 100%; padding: 14px; border-radius: 14px; border: none;
        background: var(--sand,#f0f0ec); font-family: inherit; font-size: 15px; font-weight: 700;
        cursor: pointer; min-height: 44px; }
      @media (prefers-reduced-motion: reduce) {
        .zad-share-overlay, .zad-share-panel { transition: none !important; }
      }
    `;
    document.head.appendChild(s);
  },

  init() {
    this.injectCSS();
    this.injectButton();
  },
};

window.ZadShare = ZadShare;

document.addEventListener('DOMContentLoaded', () => {
  ZadShare.init();
  console.log('[ZadShare] ✅ زر النشر جاهز');
});
