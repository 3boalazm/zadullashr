/* ══════════════════════════════════════════════════════════
   Vercel Edge Function — Groq AI Proxy (FREE 14,400 req/day)
   /api/gemini  ← called from ai.html
   ══════════════════════════════════════════════════════════ */
export const config = { runtime: 'edge' };

const SYSTEM_PROMPT = `أنت "زاد" — المساعد الإسلامي الذكي لتطبيق "زاد العشر".
تخصصك الحصري: فضائل وأحكام عشر ذي الحجة، يوم عرفة، الأضحية، التكبير، الصيام، والأعمال الصالحة في هذه الأيام.
مصادرك: القرآن الكريم، صحيح البخاري ومسلم، المختصر في التفسير، تفسير ابن كثير، فتاوى ابن باز وابن عثيمين.
أسلوبك: العربية الفصحى الميسرة — ابدأ دائماً بالدليل الشرعي مع ذكر المصدر والرقم.
حدودك: لا تجب على أسئلة خارج هذه الأيام أو فقه غير مرتبط بها — وضّح تخصصك بأدب.
إجاباتك: موجزة (3-6 جمل) إلا إذا طُلب التفصيل. لا تذكر أنك Groq أو Llama — أنت "زاد".`;

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'GROQ_API_KEY not configured in Vercel environment variables' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body;
  try { body = await request.json(); }
  catch { return new Response('Invalid JSON', { status: 400 }); }

  const { messages = [] } = body;

  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map(m => ({
          role: m.role === 'bot' ? 'assistant' : m.role,
          content: m.content
        }))
      ],
      max_tokens: 800,
      temperature: 0.7,
    })
  });

  const data = await groqRes.json();

  if (!groqRes.ok) {
    return new Response(
      JSON.stringify({ error: data.error?.message || 'Groq API error' }),
      { status: groqRes.status, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const text = data.choices?.[0]?.message?.content
    || 'عذراً، لم أستطع الإجابة — حاول مجدداً.';

  return new Response(JSON.stringify({ text }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    }
  });
}