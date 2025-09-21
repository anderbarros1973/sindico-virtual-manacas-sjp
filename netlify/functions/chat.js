// netlify/functions/chat.js

import fetch from "node-fetch";

export async function handler(event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON body" })
    };
  }

  const message = body.message ?? "";

  const assistantId = process.env.ASSISTANT_ID;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!assistantId || !apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Environment variables missing" })
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
        model: "gpt-4o-mini",
        reasoning: { effort: "medium" },
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text: message || "mensagem de boas-vindas" }
            ]
          }
        ],
        metadata: { assistant_id: assistantId }
      })
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Erro na resposta:", data);
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: data })
      };
    }

    // Extrai texto de saída
    let reply = "Sem resposta do assistente.";
    if (data.output_text) {
      reply = data.output_text;
    } else if (data.output && Array.isArray(data.output)) {
      // pega a primeira parte de texto, se existir
      const textPart = data.output.find(
        (o) => o.content && o.content[0]?.type === "output_text"
      );
      if (textPart) {
        reply = textPart.content[0].text;
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };
  } catch (err) {
    console.error("Erro fetch:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
