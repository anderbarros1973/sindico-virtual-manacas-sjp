// script.js

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");

// Função para adicionar mensagens ao chat
function addMessage(message, sender) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("message", sender);

  // Se a mensagem for do bot, aplicar formatação especial para as fontes
  if (sender === "bot") {
    messageElement.innerHTML = formatSources(message);
  } else {
    messageElement.textContent = message;
  }

  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Função que formata os caracteres de citação 【x:y†source】
function formatSources(text) {
  // Substitui as citações pelo texto "Fonte: Regulamento do Condomínio"
  return text.replace(/【\d+:\d+†source】/g, "<span class='fonte'>(Fonte: Regulamento do Condomínio)</span>");
}

// Função para chamar o assistente
async function callAssistant(message) {
  try {
    const response = await fetch("/.netlify/functions/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    addMessage(data.reply, "bot");
  } catch (error) {
    console.error("Erro no envio:", error);
    addMessage("⚠️ Erro ao conectar com o servidor.", "bot");
  }
}

// Enviar mensagem
function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  addMessage(message, "user");
  userInput.value = "";
  callAssistant(message);
}

// Eventos
sendButton.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
