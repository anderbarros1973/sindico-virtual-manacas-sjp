# Síndico Virtual (Vercel + Assistants API)

Projeto estático com **função serverless** em `/api/chat` para conversar com o seu **Assistente da OpenAI** com segurança (chaves no ambiente).

## Estrutura
```
/api/chat.js      → Função serverless (Node) que chama a Assistants API
index.html        → UI do chat
style.css         → Estilos
script.js         → Lado do cliente (faz fetch para /api/chat)
manacas.png       → Logo
sindico.png       → Avatar do síndico
usuario.png       → Avatar do usuário
vercel.json       → Garante que /api é tratado como serverless
```

## Variáveis de Ambiente (Vercel → Settings → Environment Variables)
- `OPENAI_API_KEY` → sua chave secreta
- `ASSISTANT_ID` → id do seu Assistente

Depois de salvar, faça um **redeploy**.

## Deploy
1. Suba todos os arquivos para um repositório no GitHub.
2. Em **Vercel → Add New Project**, selecione o repositório.
3. Aceite as configurações padrão (Framework **Other**).

Pronto! A UI chama `/api/chat`, que usa suas variáveis seguras no server.
