document.addEventListener("DOMContentLoaded", () => {
  const chatBox = document.getElementById("chat-box");
  const userInput = document.getElementById("user-input");
  const sendButton = document.getElementById("send-button");

  function addMessage(message, sender) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", sender);

    if (sender === "bot") {
      messageElement.innerHTML = formatSources(message);
    } else {
      messageElement.textContent = message;
    }

    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function formatSources(text) {
    // Remove caracteres estranhos [4:0†source]
    return text.replace(/【\d+:\d+†source】/g, "<span class='fonte'>(Fonte: Regulamento do Condomínio)</span>");
  }

  async function callAssistant(message) {
    try {
      const response = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      addMessage(data.reply, "bot");
    } catch (error) {
      console.error("Erro no envio:", error);
      addMessage("⚠️ Erro ao conectar com o servidor.", "bot");
    }
  }

  function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, "user");
    userInput.value = "";
    callAssistant(message);
  }

  sendButton.addEventListener("click", sendMessage);
  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });
});
