import fetch from "node-fetch";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    const { message } = JSON.parse(event.body);

    // Criar um thread para o usuário
    const threadRes = await fetch("https://api.openai.com/v1/threads", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    });

    const thread = await threadRes.json();

    // Adicionar a mensagem do usuário ao thread
    await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        role: "user",
        content: message
      })
    });

    // Executar o assistente no thread
    const runRes = await fetch(
      `https://api.openai.com/v1/threads/${thread.id}/runs`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          assistant_id: process.env.ASSISTANT_ID
        })
      }
    );

    const run = await runRes.json();

    // Polling até o assistente finalizar
    let runStatus = run.status;
    let finalResponse = null;

    while (runStatus !== "completed" && runStatus !== "failed") {
      await new Promise((r) => setTimeout(r, 1000));

      const checkRes = await fetch(
        `https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );
      const check = await checkRes.json();
      runStatus = check.status;
    }

    // Buscar as mensagens do thread
    const msgRes = await fetch(
      `https://api.openai.com/v1/threads/${thread.id}/messages`,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    const msgs = await msgRes.json();

    const assistantMsg = msgs.data
      .filter((m) => m.role === "assistant")
      .map((m) => m.content[0].text.value)
      .join("\n");

    return {
      statusCode: 200,
      body: JSON.stringify({ reply: assistantMsg })
    };
  } catch (err) {
    console.error("Erro no chat:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
