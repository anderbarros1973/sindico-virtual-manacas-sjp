const messagesContainer = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");

// Função para adicionar mensagem no chat
function addMessage(text, sender) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("message", sender);

  // Usa innerText para evitar caracteres estranhos de formatação
  messageElement.innerText = text;

  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Enviar mensagem
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, "user");
  userInput.value = "";

  try {
    const response = await fetch("/.netlify/functions/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const data = await response.json();
    addMessage(data.reply, "bot");
  } catch (error) {
    addMessage("⚠️ Erro ao conectar com o servidor.", "bot");
    console.error("Erro no envio:", error);
  }
}

sendButton.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});
