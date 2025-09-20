const chat = document.getElementById('chat');
const input = document.getElementById('input');
const send = document.getElementById('send');

function addMessage(sender, text) {
  const wrap = document.createElement('div');
  wrap.className = `msg ${sender}`;
  const avatar = document.createElement('img');
  avatar.className = 'avatar';
  avatar.src = sender === 'usuario' ? 'usuario.png' : 'sindico.png';
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;
  if (sender === 'usuario') {
    wrap.appendChild(bubble);
    wrap.appendChild(avatar);
  } else {
    wrap.appendChild(avatar);
    wrap.appendChild(bubble);
  }
  chat.appendChild(wrap);
  chat.scrollTop = chat.scrollHeight;
}

async function callAssistant(message) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  if (!res.ok) throw new Error('Falha na API');
  return await res.json();
}

send.addEventListener('click', async () => {
  const text = input.value.trim();
  if (!text) return;
  addMessage('usuario', text);
  input.value = '';

  try {
    const { reply } = await callAssistant(text);
    addMessage('sindico', reply || 'Sem resposta.');
  } catch (err) {
    addMessage('sindico', '⚠️ Erro ao conectar com o servidor.');
  }
});

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') send.click();
});
