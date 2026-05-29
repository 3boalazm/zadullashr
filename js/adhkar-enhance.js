/* ═══════════════════════════════════════════════════════════════════════════
   زاد — تحسينات الأذكار
   ─────────────────────────────────────────────────────────────────────────
   نقطة ذكرها التحليل: «categories filtering + favorites» للأذكار
   طبقة فوق initAdhkarPage الموجودة في app.js
   ═══════════════════════════════════════════════════════════════════════════ */

const ADHKAR_FAVORITES_KEY = 'zad_adhkar_favorites';

function getAdhkarFavorites() {
  try { return JSON.parse(localStorage.getItem(ADHKAR_FAVORITES_KEY) || '[]'); }
  catch { return []; }
}

function toggleAdhkarFavorite(id) {
  let favs = getAdhkarFavorites();
  if (favs.includes(id)) {
    favs = favs.filter(f => f !== id);
  } else {
    favs.push(id);
  }
  localStorage.setItem(ADHKAR_FAVORITES_KEY, JSON.stringify(favs));
  /* حدّث القلب في الواجهة */
  const heart = document.querySelector(`[data-fav-id="${id}"]`);
  if (heart) heart.textContent = favs.includes(id) ? '❤️' : '🤍';
  if (typeof showToast === 'function') {
    showToast(favs.includes(id) ? '❤️ أُضيف للمفضلة' : 'أُزيل من المفضلة');
  }
}
window.toggleAdhkarFavorite = toggleAdhkarFavorite;

/* ── شريط الفلترة (يُحقن فوق حاوية الأذكار) ──────────────────────────────── */
function injectAdhkarFilter() {
  const container = document.getElementById('adhkar-container');
  if (!container || document.getElementById('adhkar-filter-bar')) return;

  const bar = document.createElement('div');
  bar.id = 'adhkar-filter-bar';
  bar.className = 'adhkar-filter-bar';
  bar.innerHTML = `
    <button class="adhkar-filter-chip active" data-filter="all" onclick="filterAdhkar('all')">الكل</button>
    <button class="adhkar-filter-chip" data-filter="favorites" onclick="filterAdhkar('favorites')">❤️ المفضلة</button>
    <button class="adhkar-filter-chip" data-filter="morning" onclick="filterAdhkar('morning')">🌅 الصباح</button>
    <button class="adhkar-filter-chip" data-filter="evening" onclick="filterAdhkar('evening')">🌙 المساء</button>
    <button class="adhkar-filter-chip" data-filter="arafah" onclick="filterAdhkar('arafah')">⭐ عرفة</button>
  `;
  container.parentNode.insertBefore(bar, container);
}

function filterAdhkar(filter) {
  /* حدّث الـ chips */
  document.querySelectorAll('.adhkar-filter-chip').forEach(c => {
    c.classList.toggle('active', c.dataset.filter === filter);
  });

  const favorites = getAdhkarFavorites();

  /* أظهر/أخفِ الأقسام والبطاقات */
  document.querySelectorAll('.adhkar-section').forEach(section => {
    const sectionTitle = section.querySelector('.adhkar-sec-title')?.textContent || '';
    let sectionVisible = false;

    section.querySelectorAll('.adhkar-card').forEach(card => {
      const id = card.id.replace('adhk-', '');
      let show = true;

      if (filter === 'favorites') {
        show = favorites.includes(id);
      } else if (filter === 'morning') {
        show = sectionTitle.includes('الصباح');
      } else if (filter === 'evening') {
        show = sectionTitle.includes('المساء');
      } else if (filter === 'arafah') {
        show = sectionTitle.includes('عرفة');
      }

      card.style.display = show ? '' : 'none';
      if (show) sectionVisible = true;
    });

    section.style.display = sectionVisible ? '' : 'none';
  });
}
window.filterAdhkar = filterAdhkar;

/* ── إضافة زر القلب لكل بطاقة ذكر ────────────────────────────────────────── */
function injectFavoriteButtons() {
  const favorites = getAdhkarFavorites();
  document.querySelectorAll('.adhkar-card').forEach(card => {
    if (card.querySelector('[data-fav-id]')) return; /* موجود */
    const id = card.id.replace('adhk-', '');
    const meta = card.querySelector('.adhkar-meta');
    if (!meta) return;
    const heart = document.createElement('button');
    heart.className = 'adhkar-fav-btn';
    heart.setAttribute('data-fav-id', id);
    heart.textContent = favorites.includes(id) ? '❤️' : '🤍';
    heart.setAttribute('aria-label', 'إضافة للمفضلة');
    heart.onclick = (e) => { e.stopPropagation(); toggleAdhkarFavorite(id); };
    meta.appendChild(heart);
  });
}

const ADHKAR_FILTER_CSS = `
.adhkar-filter-bar { display: flex; gap: 8px; overflow-x: auto; padding: 12px 0; margin-bottom: 8px; -webkit-overflow-scrolling: touch; }
.adhkar-filter-chip { flex-shrink: 0; padding: 8px 16px; border-radius: 20px; border: 1.5px solid var(--border, #ddd);
  background: var(--sand, #faf9f6); font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: all .2s; }
.adhkar-filter-chip.active { background: var(--zad-green-900, #0e3b2e); color: #fff; border-color: var(--zad-green-900, #0e3b2e); }
.adhkar-fav-btn { background: none; border: none; font-size: 18px; cursor: pointer; padding: 4px; margin-right: auto; }
`;

function injectAdhkarFilterCSS() {
  if (document.getElementById('adhkar-filter-css')) return;
  const s = document.createElement('style');
  s.id = 'adhkar-filter-css'; s.textContent = ADHKAR_FILTER_CSS;
  document.head.appendChild(s);
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('adhkar-container')) {
    injectAdhkarFilterCSS();
    /* انتظر حتى يبني app.js الأذكار أولاً */
    setTimeout(() => {
      injectAdhkarFilter();
      injectFavoriteButtons();
    }, 500);
    console.log('[AdhkarEnhance] ✅ فلترة ومفضلة الأذكار جاهزة');
  }
});
