import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const body = JSON.parse(event.body);
    const userMessage = body.message;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Você é o Síndico Virtual do condomínio Parque dos Manacás SJP. Responda sempre de forma formal, clara e objetiva, conforme as regras do condomínio." },
        { role: "user", content: userMessage }
      ]
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ reply: response.choices[0].message.content })
    };
  } catch (err) {
    console.error("Erro na função serverless:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Erro interno do servidor" }) };
  }
}
