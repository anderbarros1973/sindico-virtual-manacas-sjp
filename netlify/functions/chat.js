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
    // 1️⃣ Criar um thread
    const threadRes = await fetch("https://api.openai.com/v1/threads", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2"
      }
    });
    const thread = await threadRes.json();

    // 2️⃣ Adicionar mensagem do usuário
    await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2"
      },
      body: JSON.stringify({
        role: "user",
        content: [{ type: "text", text: message || "mensagem de boas-vindas" }]
      })
    });

    // 3️⃣ Criar um run no assistant
    const runRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2"
      },
      body: JSON.stringify({
        assistant_id: assistantId
      })
    });
    const run = await runRes.json();

    // 4️⃣ Esperar até o run terminar
    let runStatus = run;
    while (runStatus.status !== "completed" && runStatus.status !== "failed") {
      await new Promise((r) => setTimeout(r, 1500));
      const statusRes = await fetch(
        `https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "OpenAI-Beta": "assistants=v2"
          }
        }
      );
      runStatus = await statusRes.json();
    }

    if (runStatus.status === "failed") {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Run failed", details: runStatus })
      };
    }

    // 5️⃣ Buscar mensagens do thread
    const msgsRes = await fetch(
      `https://api.openai.com/v1/threads/${thread.id}/messages`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "OpenAI-Beta": "assistants=v2"
        }
      }
    );
    const msgs = await msgsRes.json();

    // Pegar a última mensagem do assistant
    const assistantMsg = msgs.data.find((m) => m.role === "assistant");
    const reply =
      assistantMsg?.content?.[0]?.text?.value || "Sem resposta do assistente.";

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
