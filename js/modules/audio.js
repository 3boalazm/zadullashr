/* ═══════════════════════════════════════════════════════════════════════════
   زاد — مدير الصوت المركزي (Central Audio Manager)
   ─────────────────────────────────────────────────────────────────────────
   حل المشاكل التي ذكرها التحليلان:
   • تشغيل صوتين معاً (overlapping audio)
   • توقف مفاجئ عند autoplay restrictions
   • memory leaks من مشغلات متعددة
   • عدم اتساق حالة التشغيل
   
   المبدأ: كل الصوت في التطبيق يمر من هنا — مشغّل واحد نشط في كل لحظة.
   ═══════════════════════════════════════════════════════════════════════════ */

const ZadAudio = {
  current: null,        /* العنصر <audio> النشط حالياً */
  currentId: null,      /* معرّف المقطع النشط */
  queue: [],            /* قائمة الانتظار */

  /* ── تشغيل مقطع (يوقف أي صوت آخر تلقائياً) ──────────────────────────── */
  play(audioEl, id) {
    if (!audioEl) return;

    /* أوقف الصوت السابق — لا تشغيل متداخل */
    if (this.current && this.current !== audioEl) {
      this.current.pause();
      this._updateButtonState(this.currentId, false);
    }

    this.current = audioEl;
    this.currentId = id;

    /* معالجة autoplay restrictions */
    const playPromise = audioEl.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => this._updateButtonState(id, true))
        .catch(err => {
          /* المتصفح منع التشغيل — اطلب تفاعل المستخدم */
          console.log('[Audio] autoplay blocked:', err.name);
          this._updateButtonState(id, false);
          if (typeof showToast === 'function') {
            showToast('▶️ اضغط مرة أخرى للتشغيل');
          }
        });
    }
  },

  /* ── إيقاف مؤقت ──────────────────────────────────────────────────────── */
  pause() {
    if (this.current) {
      this.current.pause();
      this._updateButtonState(this.currentId, false);
    }
  },

  /* ── تبديل (play/pause) ──────────────────────────────────────────────── */
  toggle(audioEl, id) {
    if (this.current === audioEl && !audioEl.paused) {
      this.pause();
    } else {
      this.play(audioEl, id);
    }
  },

  /* ── إيقاف كامل وتنظيف الذاكرة ───────────────────────────────────────── */
  stop() {
    if (this.current) {
      this.current.pause();
      this.current.currentTime = 0;
      this._updateButtonState(this.currentId, false);
      this.current = null;
      this.currentId = null;
    }
  },

  /* ── تحديث حالة زر التشغيل في الواجهة ────────────────────────────────── */
  _updateButtonState(id, playing) {
    document.querySelectorAll(`[data-audio-btn="${id}"]`).forEach(btn => {
      btn.textContent = playing ? '⏸️' : '▶️';
      btn.classList.toggle('playing', playing);
    });
  },

  /* ── تسجيل كل عناصر الصوت في الصفحة ──────────────────────────────────── */
  registerAll() {
    document.querySelectorAll('audio').forEach((audio, i) => {
      if (audio._zadManaged) return;
      audio._zadManaged = true;
      const id = audio.id || audio.dataset.audioId || `audio-${i}`;

      /* عند انتهاء المقطع → تنظيف */
      audio.addEventListener('ended', () => {
        this._updateButtonState(id, false);
        if (this.current === audio) { this.current = null; this.currentId = null; }
        /* تشغيل التالي في القائمة لو موجود */
        this._playNext();
      });

      /* منع التشغيل المتداخل عند play خارجي */
      audio.addEventListener('play', () => {
        if (this.current && this.current !== audio) {
          this.current.pause();
        }
        this.current = audio;
        this.currentId = id;
        this._updateButtonState(id, true);
      });

      audio.addEventListener('pause', () => {
        this._updateButtonState(id, false);
      });
    });
  },

  /* ── قائمة الانتظار ──────────────────────────────────────────────────── */
  _playNext() {
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      if (next.audio) this.play(next.audio, next.id);
    }
  },

  enqueue(audioEl, id) {
    this.queue.push({ audio: audioEl, id });
  },

  /* ── إيقاف الصوت عند مغادرة الصفحة (تنظيف الذاكرة) ──────────────────── */
  cleanup() {
    this.stop();
    this.queue = [];
  },
};

/* ── ربط أزرار التشغيل التي تستخدم data-audio-btn ───────────────────────── */
function wireAudioButtons() {
  document.querySelectorAll('[data-audio-target]').forEach(btn => {
    if (btn._zadAudioWired) return;
    btn._zadAudioWired = true;
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.audioTarget;
      const audio = document.getElementById(targetId);
      if (audio) ZadAudio.toggle(audio, targetId);
    });
  });
}

/* ── تنظيف عند مغادرة الصفحة ─────────────────────────────────────────────── */
window.addEventListener('pagehide', () => ZadAudio.cleanup());
document.addEventListener('visibilitychange', () => {
  /* أوقف الصوت عند إخفاء الصفحة (توفير البطارية) — اختياري */
  /* if (document.hidden) ZadAudio.pause(); */
});

/* ── تشغيل ───────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  ZadAudio.registerAll();
  wireAudioButtons();
  /* راقب إضافة عناصر صوت ديناميكية */
  const observer = new MutationObserver(() => {
    ZadAudio.registerAll();
    wireAudioButtons();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  console.log('[ZadAudio] ✅ مدير الصوت المركزي جاهز');
});

window.ZadAudio = ZadAudio;
