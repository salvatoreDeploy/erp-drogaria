---
modulo: whatsapp-conversas
rota: /whatsapp (aba "Conversas")
pagina: WhatsAppPage → AbaConversas
status: ✅ Implementado
schema: src/schemas/whatsapp.ts ✅
layout: tres-paineis
integracao: EvolutionAPI (REST + Webhook)
referencia: Pencil frame "WhatsApp Chat Conversa"
---

# WhatsApp Chat — Conversas Spec

## Propósito

Painel de atendimento de mensagens WhatsApp em tempo real via EvolutionAPI. O operador visualiza a fila de conversas abertas, seleciona uma conversa e responde diretamente no chat sem sair do ERP.

## Layout — Três painéis contíguos (sem gap, bordas unificadas)

```
┌──────────────────────────────────────────────────────────────────┐
│ rounded-[20px] border-[#DCE7E1] overflow-hidden                  │
│                                                                  │
│  ┌──────────────┐  ┌──────────────────────┐  ┌───────────────┐  │
│  │ ConvList     │  │ ChatPanel            │  │ CustomerPanel │  │
│  │ w=320px      │  │ flex-1               │  │ w=280px       │  │
│  │ bg=white     │  │ bg=#F7FAF8           │  │ bg=white      │  │
│  │              │  │                      │  │               │  │
│  │ Busca        │  │ Header: avatar+nome  │  │ Avatar 56px   │  │
│  │ + filtro     │  │ + Transferir|Atender │  │ Badges cliente│  │
│  │              │  │                      │  │               │  │
│  │ Lista convs  │  │ Bubbles (scroll)     │  │ Dados CPF     │  │
│  │ (button each)│  │ received/sent/system │  │ Convênio      │  │
│  │ active=      │  │                      │  │ Pontos        │  │
│  │ bg-[#E8F5EF] │  │ InputBar:            │  │               │  │
│  │              │  │ attach + text + send │  │ Actions:      │  │
│  │              │  │ bg=white             │  │ Consultar prod│  │
│  │ + Novo envio │  │                      │  │ Ver receitas  │  │
│  │   (botão)    │  │                      │  │ Histórico     │  │
│  └──────────────┘  └──────────────────────┘  └───────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

## Tokens de cor específicos desta tela

| Elemento | Valor |
|---|---|
| Container border | `#DCE7E1` |
| Chat background | `#F7FAF8` |
| Conv item ativa | `bg-[#E8F5EF]` |
| Separador linha | `#F0F4F2` |
| Text principal | `#173126` |
| Text secundário | `#8A9892` |
| Text preview | `#7A8883` |
| Badge cliente | `bg-[#E1F5EE] text-[#085041]` |
| Botão primário | `bg-[#0E4D3B]` (hover: `#0a3a2c`) |
| Bubble recebida | `bg-white border-[#E6ECE8]` |
| Bubble enviada | `bg-[#0E4D3B]` |
| Sistema (pill) | `bg-[#FAEEDA] text-[#633806]` |
| Anexo card | `bg-[#F2F7F4] border-[#DCE7E1]` |

## Componentes locais (em WhatsAppPage.tsx)

### `AvatarCircle`
```tsx
function AvatarCircle({ nome, color, size = 40 }: { nome: string; color: string; size?: number })
```
- Círculo colorido com iniciais (primeiras 2 palavras do nome)
- `fontSize`: size ≤ 32 → 11px; size ≤ 38 → 13px; size > 38 → 14px
- Usado em ConvList (40px), ChatHeader (40px), CustomerPanel (56px)

### `BubbleMsg`
```tsx
function BubbleMsg({ b }: { b: Bubble })
```
- `tipo === 'sistema'` → pill centralizado `bg-[#FAEEDA] text-[#633806]`
- `tipo === 'recebida'` → `rounded-[4px_16px_16px_16px] bg-white border-[#E6ECE8]`
- `tipo === 'enviada'` → `rounded-[16px_4px_16px_16px] bg-[#0E4D3B]`
- Suporta `arquivo` prop (card PDF inside): `bg-[#F2F7F4] border-[#DCE7E1]`
- Texto recebida: `text-[#173126]`; enviada: `text-white`
- Hora + tick lido: recebida `text-[#8A9892]`; enviada `text-[#B8D8CF]`

## Tipos de dado

```ts
type ConvStatus = 'aberto' | 'pendente' | 'resolvido'

type Conversa = {
  id: string; nome: string; telefone: string; preview: string
  hora: string; unread: number; avatarColor: string; status: ConvStatus
}

type Bubble = {
  id: string; tipo: 'recebida' | 'enviada' | 'sistema'
  texto: string; hora: string; lido?: boolean
  arquivo?: { nome: string; tamanho: string }
}
```

## EvolutionAPI — Endpoints (integração futura)

```ts
// TODO: GET  /api/v1/whatsapp/conversas          lista conversas abertas (polling ou WebSocket)
// TODO: GET  /api/v1/whatsapp/conversas/{id}/msgs histórico de mensagens paginado
// TODO: POST /api/v1/whatsapp/conversas/{id}/send { texto } → envia via EvolutionAPI
// TODO: POST /api/v1/whatsapp/conversas/{id}/attach { base64, mimetype } → envia arquivo
// TODO: POST /api/v1/whatsapp/conversas/{id}/close → encerra atendimento
// TODO: POST /api/v1/whatsapp/conversas/{id}/transfer { atendente_id } → transferência
// TODO: WS   /api/v1/whatsapp/ws  ← eventos: nova_mensagem, status_atualizado, nova_conversa
```

### Webhook EvolutionAPI → Backend

O backend deve expor um endpoint de webhook para receber eventos do EvolutionAPI:

```ts
// POST /api/v1/whatsapp/webhook (recebe de EvolutionAPI)
// Eventos: MESSAGES_UPSERT, MESSAGES_UPDATE, CONNECTION_UPDATE
```

## Verificação

- [x] Lista de conversas seleciona e mostra bubbles
- [x] Bubble recebida: `rounded-[4px_16px_16px_16px]` branca
- [x] Bubble enviada: `rounded-[16px_4px_16px_16px]` verde `#0E4D3B`
- [x] Bubble sistema: pill `#FAEEDA` centralizado
- [x] Bubble com anexo PDF mostra card interno
- [x] Input de nova mensagem + botão enviar
- [x] Painel cliente com badges e ações
- [ ] Integração real EvolutionAPI (pendente backend)
