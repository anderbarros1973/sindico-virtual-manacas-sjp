const chatContainer = document.getElementById("chat-container");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

function addMessage(sender, text, isError = false) {
  const msg = document.createElement("div");
  msg.className = `message ${sender}${isError ? " error" : ""}`;

  const avatar = document.createElement("img");
  avatar.className = "avatar";
  avatar.src = sender === "usuario" ? "usuario.png" : "sindico.png";
  avatar.alt = sender === "usuario" ? "Usuário" : "Síndico";

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  // Remover caracteres estranhos das respostas
  const cleanText = text.replace(/【.*?†source】/g, "").trim();
  bubble.textContent = cleanText;

  if (sender === "usuario") {
    msg.appendChild(bubble);
    msg.appendChild(avatar);
  } else {
    msg.appendChild(avatar);
    msg.appendChild(bubble);
  }

  chatContainer.appendChild(msg);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function callAssistant(message) {
  const res = await fetch("/.netlify/functions/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;
  addMessage("usuario", text);
  userInput.value = "";

  try {
    const data = await callAssistant(text);
    addMessage("sindico", data.reply ?? "Sem resposta do assistente.");
  } catch (err) {
    console.error(err);
    addMessage("sindico", "⚠️ Erro ao conectar com o servidor.", true);
  }
}

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});

// Mostrar mensagem de boas-vindas apenas uma vez
window.addEventListener("DOMContentLoaded", () => {
  const welcome = `Olá condômino!\n
Este atendimento é realizado por Inteligência Artificial, e está em "periodo de testes".\n
Apesar de buscar as informações nos arquivos oficiais do condomínio para gerar as respostas,
estou sujeito a cometer erros neste período.\n\n
Cordialmente,\n
Síndico Virtual\n
Condomínio Parque dos Manacás SJP`;

  addMessage("sindico", welcome);
});
