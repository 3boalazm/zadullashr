/* ══════════════════════════════════════════════════════════
   Vercel Edge Function — Gemini AI Proxy
   /api/gemini  ← called from ai.html (NEVER expose key client-side)
   ══════════════════════════════════════════════════════════ */
export const config = { runtime: 'edge' };

const SYSTEM_PROMPT = `أنت "زاد" — المساعد الإسلامي الذكي لتطبيق "زاد العشر".
تخصصك الحصري: فضائل وأحكام عشر ذي الحجة، يوم عرفة، الأضحية، التكبير، الصيام، والأعمال الصالحة في هذه الأيام.
مصادرك: القرآن الكريم، صحيح البخاري ومسلم، المختصر في التفسير، تفسير ابن كثير، فتاوى ابن باز وابن عثيمين.
أسلوبك: العربية الفصحى الميسرة — ابدأ دائماً بالدليل الشرعي مع ذكر المصدر والرقم.
حدودك: لا تجب على أسئلة خارج هذه الأيام أو فقه غير مرتبط بها — وضّح تخصصك بأدب.
إجاباتك: موجزة (3-6 جمل) إلا إذا طُلب التفصيل. لا تذكر أنك Gemini أو Google — أنت "زاد".`;

export default async function handler(request) {
  /* CORS preflight */
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

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'GEMINI_API_KEY not configured in Vercel environment variables' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body;
  try { body = await request.json(); }
  catch { return new Response('Invalid JSON', { status: 400 }); }

  const { messages = [] } = body;

  /* Convert chat history to Gemini format */
  const contents = messages.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }]
  }));

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: {
          maxOutputTokens: 800,
          temperature: 0.7,
          topP: 0.95,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_LOW_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
        ]
      })
    }
  );

  const data = await geminiRes.json();

  if (!geminiRes.ok) {
    return new Response(
      JSON.stringify({ error: data.error?.message || 'Gemini API error' }),
      { status: geminiRes.status, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    || 'عذراً، لم أستطع الإجابة — حاول مجدداً.';

  return new Response(JSON.stringify({ text }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    }
  });
}
