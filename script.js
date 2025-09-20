const chatContainer = document.getElementById("chat-container");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// Função para exibir mensagens
function addMessage(sender, text, isError = false) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message", sender);
  if (isError) msgDiv.classList.add("error");

  const avatar = document.createElement("img");
  avatar.classList.add("avatar");
  avatar.src = sender === "usuario" ? "public/usuario.png" : "public/sindico.png";

  const bubble = document.createElement("div");
  bubble.classList.add("bubble");
  bubble.innerText = text;

  if (sender === "usuario") {
    msgDiv.appendChild(bubble);
    msgDiv.appendChild(avatar);
  } else {
    msgDiv.appendChild(avatar);
    msgDiv.appendChild(bubble);
  }

  chatContainer.appendChild(msgDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Envia mensagem para API
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage("usuario", text);
  userInput.value = "";

  try {
    const response = await fetch("/.netlify/functions/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    const data = await response.json();

    if (data.reply) {
      addMessage("sindico", data.reply);
    } else {
      addMessage("sindico", "⚠️ Erro: resposta inválida.", true);
    }
  } catch (err) {
    addMessage("sindico", "⚠️ Erro ao conectar com o servidor.", true);
  }
}

// Eventos
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
