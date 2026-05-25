/**
 * ═══════════════════════════════════════════════════════════════
 * Sidebar Overlay Fix — إصلاح مشكلة الشاشة السوداء الشفافة
 * ═══════════════════════════════════════════════════════════════
 * 
 * هذا الملف يحتوي على الكود الصحيح لإدارة الـ Sidebar والـ Overlay
 * أضفه في نهاية ملف js/app.js أو في <script> بنهاية الصفحة
 */

(function() {
  'use strict';

  // الحصول على العناصر الأساسية
  const hamburger = document.getElementById('hamburger');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const sidebar = document.querySelector('.sidebar');
  const app = document.querySelector('.app');

  // التأكد من وجود العناصر
  if (!hamburger || !sidebarOverlay || !sidebar) {
    console.warn('Sidebar elements not found');
    return;
  }

  /**
   * فتح الـ Sidebar
   */
  function openSidebar() {
    sidebar.classList.add('active');
    sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // منع التمرير
  }

  /**
   * إغلاق الـ Sidebar
   */
  function closeSidebar() {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = ''; // استعادة التمرير
  }

  /**
   * تبديل حالة الـ Sidebar
   */
  function toggleSidebar() {
    if (sidebar.classList.contains('active')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }

  // ── Event Listeners ──

  // 1. الضغط على زر الهامبرجر
  hamburger.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleSidebar();
  });

  // 2. الضغط على الـ Overlay لإغلاق الـ Sidebar
  sidebarOverlay.addEventListener('click', function(e) {
    if (e.target === sidebarOverlay) {
      closeSidebar();
    }
  });

  // 3. الضغط على أي رابط في الـ Sidebar لإغلاقه
  document.querySelectorAll('.sidebar a, .sidebar button').forEach(element => {
    element.addEventListener('click', function() {
      // لا نغلق الـ Sidebar إذا كان الرابط يحتوي على onclick مخصص
      if (!this.getAttribute('onclick') || this.getAttribute('onclick').includes('toggleLang') || this.getAttribute('onclick').includes('installPWA')) {
        return;
      }
      closeSidebar();
    });
  });

  // 4. إغلاق الـ Sidebar عند الضغط على أي مكان في الصفحة الرئيسية
  const main = document.querySelector('.main');
  if (main) {
    main.addEventListener('click', function() {
      if (sidebar.classList.contains('active')) {
        closeSidebar();
      }
    });
  }

  // 5. إغلاق الـ Sidebar عند تغيير حجم النافذة (للانتقال من mobile إلى desktop)
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768 && sidebar.classList.contains('active')) {
      closeSidebar();
    }
  });

  // 6. إغلاق الـ Sidebar عند الضغط على مفتاح Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && sidebar.classList.contains('active')) {
      closeSidebar();
    }
  });

  // ── Initialization ──

  // تأكد من إغلاق الـ Sidebar والـ Overlay عند تحميل الصفحة
  document.addEventListener('DOMContentLoaded', function() {
    closeSidebar();
  });

  // تصدير الدوال للاستخدام العام
  window.openSidebar = openSidebar;
  window.closeSidebar = closeSidebar;
  window.toggleSidebar = toggleSidebar;

  // ── CSS Fallback ──
  // إذا لم يكن الـ CSS محمّلاً بشكل صحيح، أضف الأنماط هنا
  if (!sidebarOverlay.style.display) {
    const style = document.createElement('style');
    style.textContent = `
      .sidebar-overlay {
        position: fixed !important;
        inset: 0 !important;
        background: rgba(0, 0, 0, 0.6) !important;
        z-index: 999 !important;
        display: none !important;
        opacity: 0 !important;
        transition: opacity 0.3s ease !important;
        pointer-events: none !important;
      }

      .sidebar-overlay.active {
        display: flex !important;
        opacity: 1 !important;
        pointer-events: auto !important;
      }

      @media (max-width: 768px) {
        .sidebar {
          position: fixed !important;
          left: -100% !important;
          transition: left 0.3s ease !important;
          z-index: 1000 !important;
        }

        .sidebar.active {
          left: 0 !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

})();
