/* ══════════════════════════════════════════════════════════════════════════
   Vercel Edge Function — Groq + Tafsir MCP Bridge
   /api/gemini  ← called from ai.html

   ما الجديد:
   • يربط خادم Tafsir MCP (mcp.tafsir.net/mcp) بنموذج Groq.
   • Groq لا يدعم MCP مباشرةً، لذا تعمل هذه الدالة كـ "جسر":
       1) تكتشف أدوات MCP عبر tools/list  (مع تخزين مؤقت)
       2) تمرّرها لـ Groq بصيغة function-calling
       3) عند طلب Groq لأداة → تنفّذها على خادم التفسير (tools/call)
       4) تُعيد النتيجة لـ Groq ليصوغ إجابة موثّقة من النص الأصلي
   • Fallback: لو تعذّر الوصول للـ MCP، يعمل المساعد بـ Groq وحده.
   ══════════════════════════════════════════════════════════════════════════ */
export const config = { runtime: 'edge' };

/* ── إعدادات عامة ───────────────────────────────────────────────────────── */
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL    = 'llama-3.3-70b-versatile';
const MCP_URL  = 'https://mcp.tafsir.net/mcp';
const MAX_TOOL_ROUNDS = 4;   /* أقصى عدد دورات نداء الأدوات في المحادثة الواحدة */

const SYSTEM_PROMPT = `أنت "زاد" — المساعد الإسلامي الذكي لتطبيق "زاد العشر".
تخصصك: فضائل وأحكام عشر ذي الحجة، يوم عرفة، الأضحية، التكبير، الصيام، والأعمال الصالحة في هذه الأيام.

【 قاعدة الاستناد الإلزامية — اقرأها بعناية 】
لديك أدوات متصلة بخادم "مركز تفسير" تتيح الوصول المباشر إلى:
• نص القرآن الكريم بالرسم العثماني (٦٢٣٦ آية).
• ستة تفاسير معتمدة: الطبري، ابن كثير، البغوي، السعدي، الميسَّر، المختصر.
• التحليل اللغوي (إعراب، صرف، جذور، قراءات) وأسباب النزول.

⛔ يُمنَع منعاً باتاً أن تذكر رقم آية أو سورة أو نص تفسير من ذاكرتك.
✅ كلما ورد ذكر آية أو لفظ قرآني أو حكم مستنبط منه، يجب أولاً أن:
   ١) تستدعي الأداة المناسبة للبحث عن النص وتحديد موضعه الصحيح (السورة ورقم الآية).
   ٢) تستدعي أداة التفسير لجلب كلام المفسّرين الموثّق.
   ٣) تبني إجابتك على ما أعادته الأدوات حصراً، وتذكر المصدر (اسم التفسير والموضع).

تنبيه: لا تخلط بين الآيات المتشابهة. مثال: لفظ "فذبحوها" قد يَرِد في سياق غير سياق الأضحية —
تحقّق من السورة والرقم عبر الأداة قبل أي تفسير، ولا تعتمد على التشابه الظاهري.

إن لم تُعِد الأدوات نتيجة، صرّح بذلك بأمانة: "لم أجد نتيجة موثّقة" — ولا تخمّن أو تفترِ على النص.

أسلوبك: العربية الفصحى الميسَّرة، إجابات موجزة (٣–٦ جمل) إلا إذا طُلب التفصيل.
ابدأ بالدليل ثم المصدر. لا تذكر أنك Groq أو Llama أو نموذجاً — أنت "زاد".`;

/* ── محدِّد المعدل (per-IP، per-instance) ───────────────────────────────── */
const rateLimitMap = new Map();
const RATE_LIMIT   = 15;
const RATE_WINDOW  = 60000;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, start: now };
  if (now - entry.start > RATE_WINDOW) {
    rateLimitMap.set(ip, { count: 1, start: now });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  rateLimitMap.set(ip, entry);
  return false;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/* ══════════════════════════════════════════════════════════════════════════
   طبقة نقل MCP — Streamable HTTP (JSON-RPC 2.0)
   ════════════════════════════════════════════════════════════════════════ */

let _rpcId = 0;
function nextId() { return ++_rpcId; }

/* يحلل ردّ MCP سواء كان JSON مباشراً أو تدفّق SSE (text/event-stream) */
async function parseMcpResponse(res) {
  const ct = res.headers.get('content-type') || '';
  const raw = await res.text();
  if (ct.includes('application/json')) {
    try { return JSON.parse(raw); }
    catch { throw new Error('MCP: ردّ JSON غير صالح'); }
  }
  /* SSE: نلتقط آخر سطر data: يحمل JSON صالحاً */
  let parsed = null;
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('data:')) continue;
    const payload = trimmed.slice(5).trim();
    if (!payload || payload === '[DONE]') continue;
    try { parsed = JSON.parse(payload); } catch { /* تجاهل الأسطر غير المكتملة */ }
  }
  if (!parsed) throw new Error('MCP: تعذّر تحليل ردّ SSE');
  return parsed;
}

/* ينفّذ نداء JSON-RPC واحداً على خادم MCP */
async function mcpRpc(method, params, sessionId) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/event-stream',
  };
  if (sessionId) headers['Mcp-Session-Id'] = sessionId;

  const res = await fetch(MCP_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ jsonrpc: '2.0', id: nextId(), method, params }),
  });

  const newSession = res.headers.get('Mcp-Session-Id') || sessionId || null;

  /* الإشعارات (notifications) لا تُرجِع جسماً */
  if (res.status === 202) return { sessionId: newSession, result: null };

  if (!res.ok) {
    throw new Error(`MCP ${method} رجع HTTP ${res.status}`);
  }
  const json = await parseMcpResponse(res);
  if (json.error) {
    throw new Error(`MCP ${method} خطأ: ${json.error.message || 'غير معروف'}`);
  }
  return { sessionId: newSession, result: json.result };
}

/* يفتح جلسة MCP: initialize ثم إشعار initialized، ويُعيد sessionId */
async function mcpOpenSession() {
  const init = await mcpRpc('initialize', {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: 'zad-al-ashr', version: '1.0.0' },
  }, null);

  const sessionId = init.sessionId;

  /* إشعار initialized (notification بلا id) */
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
    };
    if (sessionId) headers['Mcp-Session-Id'] = sessionId;
    await fetch(MCP_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }),
    });
  } catch { /* غير حرِج */ }

  return sessionId;
}

/* ── تخزين مؤقت لمخطط الأدوات (يبقى طوال عمر نسخة الـ Edge) ─────────────── */
let _toolsCache = null;       /* أدوات بصيغة OpenAI */
let _toolsCacheTime = 0;
const TOOLS_TTL = 30 * 60 * 1000;  /* 30 دقيقة */

/* يكتشف أدوات MCP ويحوّلها لصيغة Groq/OpenAI */
async function getOpenAiTools(sessionId) {
  if (_toolsCache && Date.now() - _toolsCacheTime < TOOLS_TTL) {
    return _toolsCache;
  }
  const { result } = await mcpRpc('tools/list', {}, sessionId);
  const mcpTools = result?.tools || [];
  const openai = mcpTools.map(t => ({
    type: 'function',
    function: {
      name: t.name,
      description: (t.description || '').slice(0, 1024),
      parameters: t.inputSchema || { type: 'object', properties: {} },
    },
  }));
  _toolsCache = openai;
  _toolsCacheTime = Date.now();
  return openai;
}

/* ينفّذ أداة MCP ويُعيد نصّها كسلسلة */
async function callMcpTool(name, args, sessionId) {
  const { result } = await mcpRpc('tools/call', { name, arguments: args || {} }, sessionId);
  const parts = result?.content || [];
  const text = parts
    .filter(p => p.type === 'text' && p.text)
    .map(p => p.text)
    .join('\n')
    .trim();
  if (result?.isError) {
    return `⚠️ خطأ من الأداة: ${text || 'غير معروف'}`;
  }
  return text || JSON.stringify(result || {});
}

/* ══════════════════════════════════════════════════════════════════════════
   استدعاء Groq مع إعادة المحاولة الأُسّية
   ════════════════════════════════════════════════════════════════════════ */
async function groqChat(payload, apiKey, retries = 2, delay = 500) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });
      if ((res.status === 429 || res.status >= 500) && attempt < retries) {
        await new Promise(r => setTimeout(r, delay * Math.pow(2, attempt)));
        continue;
      }
      return res;
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, delay * Math.pow(2, attempt)));
    }
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   المعالج الرئيسي
   ════════════════════════════════════════════════════════════════════════ */
export default async function handler(request) {
  if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

  /* ── فحص الصحة (Health Check) ─────────────────────────────────────────
     افتح في المتصفح:  https://YOUR-DOMAIN.vercel.app/api/gemini
     لو رجّع mcpConnected:true مع قائمة الأدوات → الربط شغّال ✅
     لو رجّع mcpConnected:false مع سبب الخطأ → الربط فاشل ❌            */
  if (request.method === 'GET') {
    const diag = { mcpConnected: false, mcpUrl: MCP_URL, toolsDiscovered: 0, tools: [], error: null };
    try {
      const sid = await mcpOpenSession();
      const tls = await getOpenAiTools(sid);
      diag.mcpConnected    = true;
      diag.sessionOpened   = !!sid;
      diag.toolsDiscovered = tls.length;
      diag.tools           = tls.map(t => t.function.name);
    } catch (err) {
      diag.error = err.message;
    }
    return json(diag);
  }

  if (request.method !== 'POST')
    return new Response('Method not allowed', { status: 405, headers: CORS });

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
             || request.headers.get('x-real-ip') || 'unknown';
  if (isRateLimited(ip)) {
    return json({ error: 'طلبات كثيرة — انتظر لحظة ثم حاول مجدداً.' }, 429);
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return json({ error: 'GROQ_API_KEY not configured' }, 500);

  let body;
  try { body = await request.json(); }
  catch { return new Response('Invalid JSON', { status: 400, headers: CORS }); }

  const { messages = [] } = body;
  const trimmed = messages.slice(-20);

  /* رسائل المحادثة بصيغة OpenAI */
  const convo = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...trimmed.map(m => ({
      role: m.role === 'bot' ? 'assistant' : m.role,
      content: m.content,
    })),
  ];

  /* ── محاولة فتح جلسة MCP واكتشاف الأدوات (مع fallback صامت) ─────────── */
  let sessionId = null;
  let tools = null;
  const meta = { mcpConnected: false, toolsDiscovered: 0, toolsUsed: [], mcpError: null };
  try {
    sessionId = await mcpOpenSession();
    tools = await getOpenAiTools(sessionId);
    meta.mcpConnected = true;
    meta.toolsDiscovered = tools.length;
  } catch (err) {
    console.warn('MCP غير متاح — المتابعة بـ Groq وحده:', err.message);
    meta.mcpError = err.message;
    tools = null;
  }

  /* ── حلقة نداء الأدوات ─────────────────────────────────────────────── */
  try {
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const payload = {
        model: MODEL,
        messages: convo,
        max_tokens: 900,
        temperature: 0.6,
      };
      if (tools && tools.length) {
        payload.tools = tools;
        payload.tool_choice = 'auto';
      }

      const res = await groqChat(payload, apiKey);
      const data = await res.json();

      if (!res.ok) {
        const quota = res.status === 429;
        return json({
          error: quota
            ? 'تجاوزنا الحد اليومي للذكاء الاصطناعي — حاول لاحقاً.'
            : (data.error?.message || 'خطأ في خدمة الذكاء الاصطناعي.'),
        }, res.status);
      }

      const choice = data.choices?.[0];
      const msg = choice?.message;
      const toolCalls = msg?.tool_calls;

      /* لا توجد نداءات أدوات → هذه هي الإجابة النهائية */
      if (!toolCalls || !toolCalls.length) {
        const text = msg?.content || 'عذراً، لم أستطع الإجابة — حاول مجدداً.';
        return json({ text, _meta: meta });
      }

      /* نضيف رسالة المساعد التي تحوي نداءات الأدوات */
      convo.push(msg);

      /* ننفّذ كل نداء أداة على خادم MCP ونُرجِع النتيجة */
      for (const tc of toolCalls) {
        let args = {};
        try { args = JSON.parse(tc.function.arguments || '{}'); } catch { /* تجاهل */ }
        meta.toolsUsed.push(tc.function.name);

        let toolResult;
        try {
          toolResult = sessionId
            ? await callMcpTool(tc.function.name, args, sessionId)
            : '⚠️ خادم التفسير غير متاح حالياً.';
        } catch (err) {
          toolResult = `⚠️ تعذّر تنفيذ الأداة (${tc.function.name}): ${err.message}`;
        }

        convo.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: toolResult.slice(0, 6000),  /* حدّ أمان للحجم */
        });
      }
      /* نكمل الدورة التالية ليصوغ النموذج الإجابة النهائية */
    }

    /* لو استُنفدت الدورات بلا إجابة نهائية */
    return json({ text: 'تعذّر إكمال الإجابة بعد عدة محاولات — حاول مجدداً بصياغة أوضح.' });

  } catch (err) {
    console.error('خطأ في الجسر:', err);
    return json({ error: 'تعذّر الاتصال بالخادم — حاول مرة أخرى.' }, 503);
  }
}

/* ── مساعد لإنشاء استجابة JSON مع رؤوس CORS ─────────────────────────────── */
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}
