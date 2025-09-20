// Ao carregar a página, pede a primeira resposta do Assistente
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("/.netlify/functions/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "" }) // manda vazio
    });

    const data = await res.json();
    if (data.reply) {
      addMessage("sindico", data.reply);
    }
  } catch (err) {
    console.error("Erro ao buscar mensagem inicial:", err);
  }
});
