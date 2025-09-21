const chatContainer = document.getElementById("chat-container");
const userInput     = document.getElementById("user-input");
const sendBtn       = document.getElementById("send-btn");

/* Util: texto -> seguro p/ HTML */
function escapeHTML(str){
  return str.replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}

/* Mini-render de Markdown: **negrito**, listas, parágrafos */
function renderMarkdown(md){
  const safe = escapeHTML(md);
  const lines = safe.split(/\r?\n/);

  let out = "";
  let inUL = false, inOL = false;

  const closeLists = () => {
    if (inUL) { out += "</ul>"; inUL = false; }
    if (inOL) { out += "</ol>"; inOL = false; }
  };

  for (let raw of lines){
    const line = raw.trim();

    let mNum = line.match(/^\d+[\.\)]\s+(.*)/);
    if (mNum){
      if (!inOL){ closeLists(); out += "<ol>"; inOL = true; }
      out += `<li>${mNum[1]}</li>`;
      continue;
    }

    let mBul = line.match(/^[-•\*]\s+(.*)/);
    if (mBul){
      if (!inUL){ closeLists(); out += "<ul>"; inUL = true; }
      out += `<li>${mBul[1]}</li>`;
      continue;
    }

    if (line === ""){
      closeLists();
      out += "<p></p>";
      continue;
    }

    closeLists();
    const withBold = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    out += `<p>${withBold}</p>`;
  }

  closeLists();
  return out;
}

/* Avatares (com fallback de iniciais) */
function avatarElement(kind){
  const img = document.createElement("img");
  img.className = "avatar";
  img.alt = (kind === "usuario") ? "Usuário" : "Síndico";
  img.src = (kind === "usuario") ? "usuario.png" : "sindico.png";
  img.onerror = () => {
    const fb = document.createElement("div");
    fb.className = "avatar-fallback-msg";
    fb.textContent = (kind === "usuario") ? "U" : "S";
    img.replaceWith(fb);
  };
  return img;
}

/* Adiciona mensagem no chat */
function addMessage(sender, text, isError=false){
  const row = document.createElement("div");
  row.className = `message ${sender}${isError ? " error" : ""}`;

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = renderMarkdown(text);

  if (sender === "usuario"){
    row.appendChild(bubble);
    row.appendChild(avatarElement(sender));
  } else {
    row.appendChild(avatarElement(sender));
    row.appendChild(bubble);
  }

  chatContainer.appendChild(row);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

/* Chama a função serverless (Netlify) */
async function callAssistant(message){
  const res = await fetch("/.netlify/functions/chat", {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify({ message })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/* Envio */
async function sendMessage(){
  const text = userInput.value.trim();
  if (!text) return;
  addMessage("usuario", text);
  userInput.value = "";

  try{
    const data = await callAssistant(text);
    addMessage("sindico", data.reply ?? "Sem resposta do assistente.");
  }catch(err){
    console.error(err);
    addMessage("sindico", "⚠️ Erro ao conectar com o servidor.", true);
  }
}

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keydown", (e)=>{
  if (e.key === "Enter"){ e.preventDefault(); sendMessage(); }
});

/* Boas-vindas em bloco destacado */
window.addEventListener("DOMContentLoaded", ()=>{
  const welcome = `Olá condômino!

Este atendimento é realizado por Inteligência Artificial, e está em "periodo de testes".

Apesar de buscar as informações nos arquivos oficiais do condomínio para gerar as respostas,
estou sujeito a cometer erros neste período.


Cordialmente,

Síndico Virtual
Condomínio Parque dos Manacás SJP`;
  const box = document.createElement("div");
  box.className = "welcome-message";
  box.textContent = welcome;
  chatContainer.appendChild(box);
});
