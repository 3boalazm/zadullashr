/* ═══════════════════════════════════════════════════════════════════════════
   زاد — utils/helpers.js
   ─────────────────────────────────────────────────────────────────────────
   أدوات مساعدة: وقت، تنسيق، حسابات إسلامية، DOM
   ═══════════════════════════════════════════════════════════════════════════ */

const ZadUtils = (() => {
  'use strict';

  /* ── Time ────────────────────────────────────────────────────────────── */
  const Time = {
    todayStr: () => new Date().toISOString().split('T')[0],

    formatTime(date, use24 = true) {
      if (!date) return '--:--';
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d)) return '--:--';
      if (use24) {
        return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: false });
      }
      return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true });
    },

    countdown(targetDate) {
      const now = Date.now();
      const diff = new Date(targetDate).getTime() - now;
      if (diff <= 0) return { done: true, h: 0, m: 0, s: 0 };
      const s = Math.floor(diff / 1000) % 60;
      const m = Math.floor(diff / 60000) % 60;
      const h = Math.floor(diff / 3600000);
      return { done: false, h, m, s, str: `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` };
    },

    isToday(dateStr) {
      return dateStr === Time.todayStr();
    },

    relativeTime(dateStr) {
      const d = new Date(dateStr);
      const diff = Date.now() - d.getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'الآن';
      if (mins < 60) return `منذ ${mins} دقيقة`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `منذ ${hrs} ساعة`;
      const days = Math.floor(hrs / 24);
      return `منذ ${days} يوم`;
    },

    islamicMonths: ['محرم','صفر','ربيع الأول','ربيع الآخر','جمادى الأولى','جمادى الآخرة',
                    'رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'],

    islamicDays: ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'],
  };

  /* ── DOM helpers ─────────────────────────────────────────────────────── */
  const DOM = {
    qs: (sel, root = document) => root.querySelector(sel),
    qsa: (sel, root = document) => [...root.querySelectorAll(sel)],
    show: el => el && (el.style.display = ''),
    hide: el => el && (el.style.display = 'none'),
    toggle: (el, force) => el && el.classList.toggle('hidden', force === undefined ? undefined : !force),
    setText: (sel, text) => { const el = document.getElementById(sel); if (el) el.textContent = text; },
    setHTML: (sel, html) => { const el = document.getElementById(sel); if (el) el.innerHTML = html; },
    on: (el, ev, fn) => el?.addEventListener(ev, fn),
    off: (el, ev, fn) => el?.removeEventListener(ev, fn),

    /* إنشاء عنصر سريع */
    make(tag, { cls, text, html, attrs = {}, style = {} } = {}) {
      const el = document.createElement(tag);
      if (cls)  el.className = cls;
      if (text) el.textContent = text;
      if (html) el.innerHTML = html;
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
      Object.entries(style).forEach(([k, v]) => (el.style[k] = v));
      return el;
    },
  };

  /* ── String helpers ──────────────────────────────────────────────────── */
  const Str = {
    truncate: (s, max = 60) => s.length > max ? s.slice(0, max) + '…' : s,
    arabicDigits: (n) => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]),
    removeHarakat: (s) => s.replace(/[\u064B-\u065F]/g, ''),
    normalizeArabic: (s) => s
      .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي'),
    escapeHTML: (s) => s.replace(/[&<>"']/g, c =>
      ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])),
  };

  /* ── Math / Number ───────────────────────────────────────────────────── */
  const Num = {
    clamp: (n, min, max) => Math.min(Math.max(n, min), max),
    pct: (part, total) => total ? Math.round((part / total) * 100) : 0,
    lerp: (a, b, t) => a + (b - a) * t,
    toArabic: (n) => Str.arabicDigits(n),
  };

  /* ── Async helpers ───────────────────────────────────────────────────── */
  const Async = {
    sleep: (ms) => new Promise(r => setTimeout(r, ms)),
    retry: async (fn, times = 3, delay = 500) => {
      for (let i = 0; i < times; i++) {
        try { return await fn(); }
        catch (e) { if (i === times - 1) throw e; await Async.sleep(delay); }
      }
    },
    withTimeout: (promise, ms = 5000) =>
      Promise.race([promise, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]),
  };

  /* ── Debounce / Throttle ─────────────────────────────────────────────── */
  function debounce(fn, ms = 300) {
    let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }
  function throttle(fn, ms = 100) {
    let last = 0;
    return (...args) => { const now = Date.now(); if (now - last >= ms) { last = now; fn(...args); } };
  }

  /* ── Islamic Utilities ───────────────────────────────────────────────── */
  const Islamic = {
    isDhulHijja() {
      const h = window.getHijriDate?.();
      return h?.month === 12;
    },
    isArafahDay() {
      const h = window.getHijriDate?.();
      return h?.month === 12 && h?.day === 9;
    },
    isFriday() {
      return new Date().getDay() === 5;
    },
    isRamadan() {
      const h = window.getHijriDate?.();
      return h?.month === 9;
    },
    isAshraTimes() {
      const h = window.getHijriDate?.();
      return h?.month === 12 && h?.day >= 1 && h?.day <= 10;
    },
    prayerEmoji(name) {
      return { فجر:'🌙', شروق:'☀️', ظهر:'🌤️', عصر:'⛅', مغرب:'🌅', عشاء:'🌙',
               Fajr:'🌙', Sunrise:'☀️', Dhuhr:'🌤️', Asr:'⛅', Maghrib:'🌅', Isha:'🌙' }[name] || '🕌';
    },
  };

  /* ── Share ───────────────────────────────────────────────────────────── */
  async function shareContent({ title, text, url = window.location.href }) {
    if (navigator.share) {
      try { await navigator.share({ title, text, url }); return true; } catch {}
    }
    /* fallback: copy */
    try {
      await navigator.clipboard.writeText(`${title}\n${text}\n${url}`);
      if (window.showToast) showToast('🔗 تم نسخ الرابط');
      return true;
    } catch {}
    return false;
  }

  /* ── Storage helpers ─────────────────────────────────────────────────── */
  const Storage = {
    get: (key, fallback = null) => {
      try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; } catch { return fallback; }
    },
    set: (key, value) => {
      try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
    },
    remove: (key) => { try { localStorage.removeItem(key); } catch {} },
  };

  return { Time, DOM, Str, Num, Async, debounce, throttle, Islamic, shareContent, Storage };
})();

window.ZadUtils = ZadUtils;

/* اختصارات عالمية للتوافق */
window.zadTime    = ZadUtils.Time;
window.zadDOM     = ZadUtils.DOM;
window.zadStr     = ZadUtils.Str;
window.zadStorage = ZadUtils.Storage;
