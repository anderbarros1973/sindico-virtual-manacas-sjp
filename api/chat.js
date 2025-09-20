// Vercel Serverless Function - Node.js
// Usa a Assistants API com ASSISTANT_ID e OPENAI_API_KEY do ambiente
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = req.body || {};
    const message = (body && body.message) || '';

    if (!message) {
      return res.status(400).json({ error: 'Mensagem ausente' });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const ASSISTANT_ID = process.env.ASSISTANT_ID;

    if (!OPENAI_API_KEY || !ASSISTANT_ID) {
      return res.status(500).json({ error: 'Variáveis de ambiente ausentes' });
    }

    // 1) Cria thread
    const tRes = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      }
    });
    const thread = await tRes.json();

    // 2) Adiciona mensagem do usuário
    await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({ role: 'user', content: message })
    });

    // 3) Roda o assistente
    const runRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({ assistant_id: ASSISTANT_ID })
    });
    const run = await runRes.json();

    // 4) Poll até completar (timeout ~30s)
    let reply = 'Sem resposta.';
    for (let i = 0; i < 30; i++) {
      const statusRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`, {
        headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` }
      });
      const status = await statusRes.json();

      if (status.status === 'completed') {
        const msgsRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
          headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` }
        });
        const msgs = await msgsRes.json();
        const assistantMsg = (msgs.data || []).find(m => m.role === 'assistant');
        reply = assistantMsg?.content?.[0]?.text?.value || reply;
        break;
      }
      if (status.status === 'failed' || status.status === 'expired' || status.status === 'cancelled') {
        reply = 'Falha ao gerar a resposta.';
        break;
      }
      await new Promise(r => setTimeout(r, 1000));
    }

    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno', details: String(err) });
  }
};
