export async function handler(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const token = process.env.VITE_AI_TOKEN;
  if (!token) return { statusCode: 500, body: 'AI token not configured' };

  const { userMsg, issInfo, newsSnippet } = JSON.parse(event.body);

  const res = await fetch('https://router.huggingface.co/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'Qwen/Qwen3-0.6B:featherless-ai',
      messages: [
        { role: 'system', content: `You are a dashboard assistant. Use ONLY the provided ISS and News data. If asked anything else, reply: 'I only have access to current dashboard data.'\n\nISS: ${issInfo}\nNews:\n${newsSnippet}` },
        { role: 'user', content: userMsg }
      ]
    }),
  });

  const data = await res.text();
  return {
    statusCode: res.status,
    headers: { 'Content-Type': 'application/json' },
    body: data,
  };
}
