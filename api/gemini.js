/* ══════════════════════════════════════════════════════════
   Vercel Edge Function — Groq AI Proxy
   /api/gemini  ← called from ai.html
   Fixes: retry logic, rate limiting, better error handling
   ══════════════════════════════════════════════════════════ */
export const config = { runtime: 'edge' };

const SYSTEM_PROMPT = `أنت "زاد" — المساعد الإسلامي الذكي لتطبيق "زاد العشر".
تخصصك الحصري: فضائل وأحكام عشر ذي الحجة، يوم عرفة، الأضحية، التكبير، الصيام، والأعمال الصالحة في هذه الأيام.
مصادرك: القرآن الكريم، صحيح البخاري ومسلم، المختصر في التفسير، تفسير ابن كثير، فتاوى ابن باز وابن عثيمين.
أسلوبك: العربية الفصحى الميسرة — ابدأ دائماً بالدليل الشرعي مع ذكر المصدر والرقم.
حدودك: لا تجب على أسئلة خارج هذه الأيام أو فقه غير مرتبط بها — وضّح تخصصك بأدب.
إجاباتك: موجزة (3-6 جمل) إلا إذا طُلب التفصيل. لا تذكر أنك Groq أو Llama — أنت "زاد".`;

/* ── Simple in-memory rate limiter (per IP, per edge instance) ── */
const rateLimitMap = new Map();
const RATE_LIMIT   = 15;   /* max requests */
const RATE_WINDOW  = 60000; /* per 60 seconds */

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

/* ── Exponential backoff retry ── */
async function fetchWithRetry(url, options, retries = 2, delay = 500) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      /* Only retry on server errors (5xx) or rate limit (429) */
      if (res.status === 429 || res.status >= 500) {
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, delay * Math.pow(2, attempt)));
          continue;
        }
      }
      return res;
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, delay * Math.pow(2, attempt)));
    }
  }
}

/* ── CORS headers ── */
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(request) {
  /* Preflight */
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS });
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS });
  }

  /* ── Rate limiting by IP ── */
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
             || request.headers.get('x-real-ip')
             || 'unknown';

  if (isRateLimited(ip)) {
    return new Response(
      JSON.stringify({ error: 'طلبات كثيرة — انتظر لحظة ثم حاول مجدداً.' }),
      { status: 429, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }

  /* ── Parse body ── */
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'GROQ_API_KEY not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }

  let body;
  try { body = await request.json(); }
  catch { return new Response('Invalid JSON', { status: 400, headers: CORS }); }

  const { messages = [] } = body;

  /* ── Limit context window to last 20 messages to prevent token overload ── */
  const trimmedMessages = messages.slice(-20);

  /* ── Call Groq with retry ── */
  let groqRes;
  try {
    groqRes = await fetchWithRetry(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...trimmedMessages.map(m => ({
              role: m.role === 'bot' ? 'assistant' : m.role,
              content: m.content,
            })),
          ],
          max_tokens: 800,
          temperature: 0.7,
        }),
      }
    );
  } catch (networkErr) {
    return new Response(
      JSON.stringify({ error: 'تعذّر الاتصال بالخادم — حاول مرة أخرى.' }),
      { status: 503, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }

  const data = await groqRes.json();

  if (!groqRes.ok) {
    const isQuotaError = groqRes.status === 429;
    return new Response(
      JSON.stringify({
        error: isQuotaError
          ? 'تجاوزنا الحد اليومي للذكاء الاصطناعي — حاول لاحقاً.'
          : (data.error?.message || 'خطأ في خدمة الذكاء الاصطناعي.'),
      }),
      { status: groqRes.status, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }

  const text = data.choices?.[0]?.message?.content
               || 'عذراً، لم أستطع الإجابة — حاول مجدداً.';

  return new Response(
    JSON.stringify({ text }),
    { headers: { 'Content-Type': 'application/json', ...CORS } }
  );
}
