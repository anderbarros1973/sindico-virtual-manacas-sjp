// Ao carregar, dispara a primeira chamada (boas-vindas do Assistente)
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("/.netlify/functions/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "__init__" }),
    });

    const data = await res.json();
    if (data.reply) {
      addMessage("sindico", data.reply);
    }
  } catch (err) {
    console.error("Erro ao buscar mensagem inicial:", err);
  }
});
