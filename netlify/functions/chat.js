import fetch from "node-fetch";

export async function handler(event) {
  // Só aceita POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    const { message } = JSON.parse(event.body);

    // Faz a chamada ao OpenAI usando /responses
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        assistant_id: process.env.ASSISTANT_ID,
        input: message || "mensagem_inicial"
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(JSON.stringify(data));
    }

    // Extrai texto (compatível com diferentes formatos de resposta da OpenAI)
    let reply = "Sem resposta do assistente.";
    if (data.output_text) {
      reply = data.output_text;
    } else if (data.output && Array.isArray(data.output)) {
      reply = data.output.map(o => o.content?.map(c => c.text?.value).join(" ")).join("\n");
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };
  } catch (err) {
    console.error("Erro no chat:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
