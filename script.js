const chatContainer = document.getElementById("chat-container");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// Função para adicionar mensagens no chat
function addMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);

  const bubble = document.createElement("div");
  bubble.classList.add("bubble");
  bubble.textContent = text;

  msg.appendChild(bubble);
  chatContainer.appendChild(msg);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Enviar mensagem para a função serverless
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage("usuario", text);
  userInput.value = "";

  try {
    const res = await fetch("/.netlify/functions/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    const data = await res.json();
    if (data.reply) {
      addMessage("sindico", data.reply);
    } else {
      addMessage("sindico", "⚠️ Erro ao obter resposta.");
    }
  } catch (err) {
    console.error(err);
    addMessage("sindico", "⚠️ Erro de conexão.");
  }
}

// Botão enviar
sendBtn.addEventListener("click", sendMessage);

// Enter também envia
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});

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
