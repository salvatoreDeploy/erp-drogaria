# Skill: WhatsApp via EvolutionAPI

## Quando usar esta skill

Quando o usuário pedir para:
- Integrar as telas de WhatsApp Chat (Conversas / Atendimento) com backend real
- Implementar envio/recebimento de mensagens via EvolutionAPI
- Adicionar WebSocket para mensagens em tempo real
- Expandir o painel de Atendimento com novos dados de pedido/receita

---

## Contexto do módulo

O ERP tem um módulo WhatsApp em `src/pages/WhatsAppPage.tsx` com 4 abas:
- **Integração** (`AbaHub`): QR code, automações, log de interações
- **Conversas** (`AbaConversas`): 3 painéis — lista de conversas + chat + dados do cliente
- **Atendimento** (`AbaAtendimento`): 3 painéis — mini-lista por status + chat + painel de ops (4 abas)
- **Campanhas** (`AbaCampanhas`): métricas + tabela de campanhas + ações rápidas

**Specs:** `.spec/whatsapp-conversas.spec.md` e `.spec/whatsapp-atendimento.spec.md`

---

## EvolutionAPI — Conceitos essenciais

EvolutionAPI é um servidor auto-hospedado que conecta ao WhatsApp Business API via QR code (multi-device). O ERP age como cliente REST da EvolutionAPI.

### Instância
Cada conexão WhatsApp = uma "instance". O ERP usa uma instância por farmácia.

### Fluxo de mensagens

```
Cliente WhatsApp → EvolutionAPI → Webhook (POST /api/v1/whatsapp/webhook) → ERP Backend
ERP Backend → POST /api/v1/whatsapp/conversas/{id}/send → EvolutionAPI → Cliente WhatsApp
```

### Tipos de evento webhook (MESSAGES_UPSERT)

```ts
// Payload recebido pelo backend via webhook
interface EvolutionWebhookPayload {
  event: 'MESSAGES_UPSERT' | 'MESSAGES_UPDATE' | 'CONNECTION_UPDATE'
  instance: string            // nome da instância (farmácia)
  data: {
    key: {
      remoteJid: string       // ex: "5511987654321@s.whatsapp.net"
      fromMe: boolean
      id: string
    }
    message: {
      conversation?: string   // texto simples
      imageMessage?: { caption?: string; url: string }
      documentMessage?: { fileName: string; url: string; mimetype: string }
      audioMessage?: { url: string }
    }
    messageTimestamp: number
    pushName: string          // nome do contato (se disponível)
  }
}
```

---

## Padrão de integração frontend

### Substituir mock por API real (AbaConversas)

```tsx
// ANTES (mock estático):
const [conversas, setConversas] = useState<Conversa[]>(CONVERSAS)

// DEPOIS (integração real):
const [conversas, setConversas] = useState<Conversa[]>([])

useEffect(() => {
  // TODO: GET /api/v1/whatsapp/conversas
  fetch('/api/v1/whatsapp/conversas')
    .then((r) => r.json())
    .then(setConversas)
}, [])
```

### WebSocket para tempo real

```tsx
useEffect(() => {
  // TODO: WS /api/v1/whatsapp/ws
  const ws = new WebSocket('/api/v1/whatsapp/ws')
  ws.onmessage = (e) => {
    const { tipo, dados } = JSON.parse(e.data)
    if (tipo === 'nova_mensagem') {
      // Adicionar bubble ao chat da conversa correspondente
    }
    if (tipo === 'nova_conversa') {
      setConversas((prev) => [dados, ...prev])
    }
  }
  return () => ws.close()
}, [])
```

### Enviar mensagem (input bar)

```tsx
async function handleEnviar() {
  if (!mensagem.trim()) return
  // TODO: POST /api/v1/whatsapp/conversas/{convSelecionada.id}/send
  await fetch(`/api/v1/whatsapp/conversas/${convSelecionada.id}/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texto: mensagem }),
  })
  setMensagem('')
}
```

---

## Arquivos a modificar na integração real

| Arquivo | O que mudar |
|---|---|
| `src/pages/WhatsAppPage.tsx` | Substituir `useState(CONVERSAS)` por fetch; adicionar `useEffect` WebSocket |
| `src/schemas/whatsapp.ts` | Adicionar `ConversaSchema`, `BubbleSchema` Zod para validar responses |
| `backend/CLAUDE.md` | Marcar endpoints como implementados quando o backend estiver pronto |
| `.spec/whatsapp-conversas.spec.md` | Atualizar checklist de verificação |
| `.spec/whatsapp-atendimento.spec.md` | Atualizar checklist de verificação |

---

## Regras de estilo a preservar

Ver `.spec/whatsapp-conversas.spec.md` para tokens de cor completos. Os mais críticos:

- Container geral: `overflow-hidden rounded-[20px] border border-[#DCE7E1]`
- Bubble recebida: `rounded-[4px_16px_16px_16px] border border-[#E6ECE8] bg-white`
- Bubble enviada: `rounded-[16px_4px_16px_16px] bg-[#0E4D3B]`
- Bubble sistema: pill `bg-[#FAEEDA] text-[#633806]` centralizado
- Item ativo na lista: `bg-[#E8F5EF]`
- Chat background: `bg-[#F7FAF8]`

**Nunca alterar esses valores** ao integrar o backend — são extraídos diretamente do Pencil design.

---

## Quality gate após qualquer alteração

```bash
npx biome check --write ./src && npx tsc -b && npx vite build
```
