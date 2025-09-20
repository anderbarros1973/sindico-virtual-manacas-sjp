// netlify/functions/chat.js
export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { message = "" } = JSON.parse(event.body || "{}");

    const apiKey = process.env.OPENAI_API_KEY;
    const assistantId = process.env.OPENAI_ASSISTANT_ID; // defina no Netlify

    if (!apiKey || !assistantId) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Variáveis OPENAI_API_KEY / OPENAI_ASSISTANT_ID não configuradas." })
      };
    }

    // Se vier vazio, pedimos ao assistente que responda com a saudação padrão
    const userInput = message || "Por favor, inicie a conversa com sua mensagem padrão de boas-vindas.";

    const resp = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        assistant_id: assistantId,
        input: userInput
      })
    });

    const data = await resp.json();

    // Tenta usar o campo resumido (quando disponível) ou faz fallback
    const reply =
      data.output_text ||
      data.output?.[0]?.content?.[0]?.text ||
      "Não consegui gerar resposta.";

    return { statusCode: 200, body: JSON.stringify({ reply }) };
  } catch (error) {
    console.error("Erro na função:", error);
    return { statusCode: 500, body: JSON.stringify({ error: "Erro no servidor." }) };
  }
}
