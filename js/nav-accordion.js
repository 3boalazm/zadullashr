/* ═══════════════════════════════════════════════════════════════════════════
   زاد — Nav Accordion (واحد مفتوح فقط)
   كل كاتيجوري مقفولة افتراضياً، تفتح بالضغط — وفتح واحدة يقفل الباقي تلقائياً
   الصفحة الحالية تفتح كاتيجوريها تلقائياً
   ═══════════════════════════════════════════════════════════════════════════ */
function initNavAccordion() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const seps = nav.querySelectorAll('.nav-sep');

  /* اجمع كل الأقسام مع روابطها */
  const sections = [];
  seps.forEach(sep => {
    sep.style.cursor = 'pointer';
    sep.style.userSelect = 'none';

    const links = [];
    let el = sep.nextElementSibling;
    while (el && !el.classList.contains('nav-sep')) {
      if (el.tagName === 'A') links.push(el);
      el = el.nextElementSibling;
    }

    const isActive = links.some(l => l.getAttribute('href') === currentPage);
    if (!sep.querySelector('.nav-arrow')) {
      sep.innerHTML += `<span class="nav-arrow" style="float:left;transition:transform .25s;display:inline-block">◂</span>`;
    }
    sections.push({ sep, links, isActive, open: isActive });
  });

  /* طبّق حالة قسم واحد */
  function applyState(section) {
    section.links.forEach(l => {
      l.style.display = section.open ? 'flex' : 'none';
      l.style.overflow = 'hidden';
    });
    const arrow = section.sep.querySelector('.nav-arrow');
    if (arrow) {
      arrow.style.transform = section.open ? 'rotate(0deg)' : '';
      arrow.textContent = section.open ? '▾' : '◂';
    }
  }

  /* اقفل كل الأقسام عدا المستهدف */
  function openOnly(target) {
    sections.forEach(s => {
      s.open = (s === target) ? !s.open : false;
      applyState(s);
    });
  }

  /* الحالة الأولية: افتح قسم الصفحة الحالية فقط */
  sections.forEach(s => applyState(s));

  sections.forEach(section => {
    section.sep.addEventListener('click', () => openOnly(section));
  });
}

document.addEventListener('DOMContentLoaded', initNavAccordion);
