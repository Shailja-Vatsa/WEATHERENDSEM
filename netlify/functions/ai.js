export async function handler(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const token = process.env.VITE_AI_TOKEN;
  if (!token) return { statusCode: 500, body: 'AI token not configured' };

  const res = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: event.body,
  });

  const data = await res.text();
  return {
    statusCode: res.status,
    headers: { 'Content-Type': 'application/json' },
    body: data,
  };
}
