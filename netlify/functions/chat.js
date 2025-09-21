// netlify/functions/chat.js

import fetch from "node-fetch";

export async function handler(event, context) {
  console.log("Function chat.handler called");

  if (event.httpMethod !== "POST") {
    console.error("Method not allowed:", event.httpMethod);
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (err) {
    console.error("Erro ao parsear body:", err);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON body" })
    };
  }

  const message = body.message ?? "";
  console.log("Mensagem recebida:", message);

  const assistantId = process.env.ASSISTANT_ID;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!assistantId) {
    console.error("Variável ASSISTANT_ID não definida");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Assistant ID not configured" })
    };
  }
  if (!apiKey) {
    console.error("Variável OPENAI_API_KEY não definida");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "OpenAI API Key not configured" })
    };
  }

  try {
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        assistant_id: assistantId,
        model: "gpt-4o-mini",       // ou o modelo que você definiu
        input: message
      })
    });

    const data = await res.json();
    console.log("Resposta da OpenAI:", data);

    if (!res.ok) {
      console.error("Resposta não OK:", data);
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: data })
      };
    }

    let reply = "Sem resposta do assistente.";
    if (data.output_text) {
      reply = data.output_text;
    } else if (data.output) {
      // se tiver array ou objeto
      reply = JSON.stringify(data.output);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };
  } catch (err) {
    console.error("Erro durante fetch para OpenAI:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
