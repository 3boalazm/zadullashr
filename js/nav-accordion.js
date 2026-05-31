/* ═══════════════════════════════════════════════════════════════════════════
   زاد — Nav Accordion
   كل كاتيجوري في القائمة مقفولة افتراضياً، تفتح بالضغط على اسمها
   الصفحة الحالية تفتح كاتيجوريها تلقائياً
   ═══════════════════════════════════════════════════════════════════════════ */
function initNavAccordion() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const seps = nav.querySelectorAll('.nav-sep');

  seps.forEach(sep => {
    sep.style.cursor = 'pointer';
    sep.style.userSelect = 'none';

    /* اجمع الروابط التابعة لهذه الكاتيجوري */
    const links = [];
    let el = sep.nextElementSibling;
    while (el && !el.classList.contains('nav-sep')) {
      if (el.tagName === 'A') links.push(el);
      el = el.nextElementSibling;
    }

    /* هل الصفحة الحالية في هذه الكاتيجوري؟ */
    const isActive = links.some(l => l.getAttribute('href') === currentPage);

    /* حالة الفتح/الإغلاق */
    let open = isActive;

    /* أضف أيقونة السهم */
    sep.innerHTML += `<span class="nav-arrow" style="float:left;transition:transform .25s;display:inline-block">${open ? '▾' : '◂'}</span>`;

    const applyState = () => {
      links.forEach(l => {
        l.style.display = open ? 'flex' : 'none';
        l.style.overflow = 'hidden';
      });
      const arrow = sep.querySelector('.nav-arrow');
      if (arrow) arrow.style.transform = open ? 'rotate(0deg)' : '';
      if (arrow) arrow.textContent = open ? '▾' : '◂';
    };

    applyState();

    sep.addEventListener('click', () => {
      open = !open;
      applyState();
    });
  });
}

document.addEventListener('DOMContentLoaded', initNavAccordion);
