export async function handler(event) {
  try {
    const body = JSON.parse(event.body);

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: body.message,
        // Se quiser fixar um assistente criado:
        // assistant_id: process.env.ASSISTANT_ID
      }),
    });

    const data = await response.json();
    const reply =
      data.output?.[0]?.content?.[0]?.text || "Não consegui gerar resposta.";

    return {
      statusCode: 200,
      body: JSON.stringify({ reply }),
    };
  } catch (error) {
    console.error("Erro na função:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ reply: "Erro no servidor." }),
    };
  }
}
