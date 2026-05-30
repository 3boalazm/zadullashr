/* ═══════════════════════════════════════════════════════════════════════════
   زاد — الفيز الخامس: طبقة الضبط الشرعي للذكاء الاصطناعي
   ─────────────────────────────────────────────────────────────────────────
   ملاحظة معمارية: الـ AI الحالي (gemini.js) مبني بالفعل على RAG عبر Tafsir MCP
   مع قاعدة استناد إلزامية ممتازة. هذه الطبقة تضيف ما ينقص فقط:

   1. الحد الفاصل بين «التدبر» (مسموح) و«التفسير/الفتوى» (يُحال لمصدر) — client-side
   2. كشف الكلمات المفتاحية الخطرة (حكم/حلال/حرام/فتوى) قبل الإرسال
   3. زر «هذه الإجابة غير مناسبة» للإبلاغ
   
   المبدأ المعماري: Sharia-safe AI — التدبر متاح، الفتوى تُحال للمتخصص.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── 1. الكلمات المفتاحية التي تستوجب التحويل لمصدر شرعي ──────────────────── */
const FATWA_KEYWORDS = [
  'حكم', 'حلال', 'حرام', 'يجوز', 'لا يجوز', 'فتوى', 'مذهب',
  'الراجح', 'القول الصحيح', 'مكروه', 'واجب أم', 'فرض أم',
  'طلاق', 'ميراث', 'زكاة مالي', 'هل علي', 'كفارة',
];

/* ── الكلمات التي تدل على التفسير اللغوي التخصصي ────────────────────────── */
const TAFSIR_DEEP_KEYWORDS = [
  'لماذا قدّم', 'الإعراب', 'الفرق اللغوي', 'دلالة الحرف',
  'القراءات', 'وجه الإعجاز', 'البلاغة في',
];

/* ── 2. فحص السؤال قبل الإرسال ──────────────────────────────────────────── */
function classifyQuestion(text) {
  const t = text.trim();

  /* أسئلة الفتوى والأحكام → تحويل */
  for (const kw of FATWA_KEYWORDS) {
    if (t.includes(kw)) {
      return {
        type: 'fatwa',
        allow: false,
        reason: 'حكم شرعي مستنبط',
        message: redirectMessage('fatwa'),
      };
    }
  }

  /* التفسير اللغوي العميق → تحويل لطيف */
  for (const kw of TAFSIR_DEEP_KEYWORDS) {
    if (t.includes(kw)) {
      return {
        type: 'tafsir_deep',
        allow: true, /* مسموح لكن مع تنبيه — لأن الـ MCP يجلب التفاسير الموثقة */
        reason: 'تفسير لغوي تخصصي',
        message: null,
      };
    }
  }

  /* تدبر / فهم إجمالي / هداية → مسموح بالكامل */
  return { type: 'tadabbur', allow: true, reason: 'تدبر وهداية', message: null };
}

/* ── 3. رسائل التحويل اللطيفة ────────────────────────────────────────────── */
function redirectMessage(type) {
  const messages = {
    fatwa: `هذا السؤال يتعلق بحكم شرعي مستنبط، وهو من اختصاص أهل العلم. 

أنا هنا للمساعدة في **تدبّر** الآيات والتأمل في معانيها العامة وهداياتها، أما الأحكام الفقهية والفتاوى فالأولى الرجوع فيها إلى:
• موقع الإسلام سؤال وجواب (islamqa.info)
• دار الإفتاء في بلدك
• عالم ثقة تثق في علمه

هل أساعدك في تدبّر آية أو فهم معناها الإجمالي بدلاً من ذلك؟`,
  };
  return messages[type] || messages.fatwa;
}

/* ── 4. اعتراض إرسال الرسالة (يلتف حول sendAIMessage الأصلية) ──────────── */
function installAIGuard() {
  /* انتظر حتى تُعرّف sendAIMessage في app.js */
  if (typeof window.sendAIMessage !== 'function') {
    setTimeout(installAIGuard, 200);
    return;
  }

  const _originalSend = window.sendAIMessage;

  window.sendAIMessage = async function(userMsg) {
    if (!userMsg || !userMsg.trim()) return;

    const verdict = classifyQuestion(userMsg);

    /* لو السؤال فتوى → اعرض رسالة التحويل بدل الإرسال للـ AI */
    if (!verdict.allow) {
      /* اعرض رسالة المستخدم */
      if (typeof appendMsg === 'function') {
        appendMsg('user', userMsg);
        appendMsg('bot', verdict.message);
      }
      const input = document.getElementById('chat-input');
      if (input) input.value = '';
      logGuardEvent(userMsg, verdict);
      return;
    }

    /* مسموح → أرسل للـ AI الأصلي (الذي فيه RAG عبر Tafsir MCP) */
    return _originalSend.call(this, userMsg);
  };

  console.log('[AIGuard] ✅ طبقة الضبط الشرعي مفعّلة');
}

/* ── 5. تسجيل أحداث الضبط (للتحسين) ──────────────────────────────────────── */
function logGuardEvent(question, verdict) {
  try {
    const log = JSON.parse(localStorage.getItem('zad_ai_guard_log') || '[]');
    log.unshift({ q: question.slice(0, 100), type: verdict.type, ts: Date.now() });
    localStorage.setItem('zad_ai_guard_log', JSON.stringify(log.slice(0, 50)));
  } catch (e) {}
}

/* ── 6. زر «الإبلاغ عن إجابة غير مناسبة» ─────────────────────────────────── */
function injectReportButton() {
  /* يُضاف بعد كل رد من البوت */
  if (!document.getElementById('chat-wrap')) return;

  const observer = new MutationObserver((mutations) => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType === 1 && node.classList?.contains('msg') && node.classList?.contains('bot')) {
          /* لا تضف الزر لرسائل الـ typing أو لو موجود */
          if (node.querySelector('.typing') || node.querySelector('.ai-report-btn')) return;
          addReportBtn(node);
        }
      });
    });
  });

  observer.observe(document.getElementById('chat-wrap'), { childList: true });
}

function addReportBtn(msgNode) {
  const btn = document.createElement('button');
  btn.className = 'ai-report-btn';
  btn.innerHTML = '⚐ الإبلاغ عن خطأ';
  btn.style.cssText = `
    background: none; border: none; color: var(--muted, #888);
    font-size: 11px; cursor: pointer; margin-top: 4px;
    padding: 2px 8px; opacity: 0.6; font-family: inherit;
  `;
  btn.onclick = () => {
    const text = msgNode.querySelector('.msg-bubble')?.textContent || '';
    reportAIAnswer(text);
    btn.innerHTML = '✓ شكراً للإبلاغ';
    btn.disabled = true;
  };
  msgNode.appendChild(btn);
}

function reportAIAnswer(answerText) {
  try {
    const reports = JSON.parse(localStorage.getItem('zad_ai_reports') || '[]');
    reports.unshift({ answer: answerText.slice(0, 200), ts: Date.now() });
    localStorage.setItem('zad_ai_reports', JSON.stringify(reports.slice(0, 30)));
  } catch (e) {}
  if (typeof showToast === 'function') {
    showToast('✓ شكراً — سيساعدنا بلاغك في تحسين المساعد');
  }
}
window.reportAIAnswer = reportAIAnswer;

/* ── 7. اختبار الضبط (20 سؤال) — للتطوير ────────────────────────────────── */
const GUARD_TEST_CASES = [
  /* مسموح (تدبر) */
  { q: 'ما المعنى الإجمالي لسورة الفجر؟', expect: 'tadabbur' },
  { q: 'كيف أتأثر بآية وليالٍ عشر؟', expect: 'tadabbur' },
  { q: 'ما الهداية من قصة إبراهيم؟', expect: 'tadabbur' },
  { q: 'ماذا تعني آية واذكروا الله؟', expect: 'tadabbur' },
  /* محوّل (فتوى) */
  { q: 'ما حكم صيام يوم عرفة لمن عليه قضاء؟', expect: 'fatwa' },
  { q: 'هل يجوز الجمع بين الأضحية والعقيقة؟', expect: 'fatwa' },
  { q: 'ما الراجح في حكم الادخار من الأضحية؟', expect: 'fatwa' },
  { q: 'كم كفارة من حلق رأسه في الإحرام؟', expect: 'fatwa' },
];

function runGuardTests() {
  console.log('═══ اختبار الضبط الشرعي ═══');
  let pass = 0;
  GUARD_TEST_CASES.forEach((tc, i) => {
    const result = classifyQuestion(tc.q);
    const ok = result.type === tc.expect;
    if (ok) pass++;
    console.log(`${ok ? '✅' : '❌'} [${i+1}] "${tc.q.slice(0,40)}..." → ${result.type} (متوقع: ${tc.expect})`);
  });
  console.log(`النتيجة: ${pass}/${GUARD_TEST_CASES.length}`);
  return pass === GUARD_TEST_CASES.length;
}
window.runGuardTests = runGuardTests;
window.classifyQuestion = classifyQuestion;

/* ── تشغيل ───────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('chat-input')) {
    installAIGuard();
    injectReportButton();
  }
});
