---
modulo: whatsapp-atendimento
rota: /whatsapp (aba "Atendimento")
pagina: WhatsAppPage → AbaAtendimento
status: ✅ Implementado
schema: src/schemas/whatsapp.ts ✅
layout: tres-paineis-atendimento
integracao: EvolutionAPI (REST + Webhook)
referencia: Pencil frame "WhatsApp Chat - Atendimento"
---

# WhatsApp Chat — Atendimento Spec

## Propósito

Painel operacional de atendimento farmacêutico via WhatsApp. Diferente do painel "Conversas" (chat livre), o painel "Atendimento" mostra conversas **em andamento e na fila** com contexto farmacêutico — receita digital, produto selecionado, dados do cliente e resumo do pedido — no painel direito.

## Layout — Três painéis contíguos (sem gap, bordas unificadas)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ rounded-[20px] border-[#DCE7E1] overflow-hidden                          │
│                                                                          │
│  ┌─────────────┐  ┌────────────────────────┐  ┌──────────────────────┐  │
│  │ MiniList    │  │ ChatPanel              │  │ OpsPanel             │  │
│  │ w=220px     │  │ flex-1                 │  │ w=360px              │  │
│  │ bg=white    │  │ bg=#F7FAF8             │  │ bg=white             │  │
│  │             │  │                        │  │                      │  │
│  │ "EM ATEND." │  │ Header: avatar + nome  │  │ Tabs (pills):        │  │
│  │ (uppercase) │  │ + badge warning receita│  │ Receita|Produto      │  │
│  │             │  │                        │  │ Cliente|Pedido       │  │
│  │ 3 itens     │  │ Bubbles com receita    │  │ active=bg-[#0E4D3B]  │  │
│  │ ativo=      │  │ e arquivo PDF          │  │                      │  │
│  │ bg-[#E8F5EF]│  │                        │  │ Content condicional  │  │
│  │             │  │                        │  │ (campos ReadOnly)    │  │
│  │ "NA FILA"   │  │ InputBar               │  │                      │  │
│  │ (uppercase) │  │                        │  │ Actions:             │  │
│  │             │  │                        │  │ "Separar pedido..."  │  │
│  │ 4 posições  │  │                        │  │ bg-[#0E4D3B] full    │  │
│  │ (#) na fila │  │                        │  │ + Adicionar|Cancelar │  │
│  └─────────────┘  └────────────────────────┘  └──────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

## Diferenças chave vs. Conversas

| | AbaConversas | AbaAtendimento |
|---|---|---|
| Lista esquerda | 320px, itens completos | 220px, itens compactos |
| Avatares lista | 40px + preview + badges status | 32px + badge alerta (dot laranja) |
| Seções lista | Única lista | "EM ATENDIMENTO" / "NA FILA" (9px uppercase) |
| Painel direito | Dados do cliente (w=280) | Painel de operações com 4 abas (w=360) |
| Header chat | Apenas nome + ações | Nome + badge warning `⚠ Receita pendente` |
| Chat data | CHAT_MARIA (dipirona) | CHAT_ANA_ATEND (receita digital + PDF) |

## Painel de Operações — 4 abas

### Aba: Receita
Campos `ReadOnly` em cards `rounded-[14px] border-[#E6ECE8] bg-[#F7FAF8]`:
- Prescritor, CRM, Data prescrição, Validade, Protocolo

### Aba: Produto
Campos `ReadOnly`:
- Medicamento, Laboratório, Apresentação, Estoque, Validade lote, Preço

### Aba: Cliente
Campos `ReadOnly`:
- Nome, Telefone, CPF, Convênio, Pontos fidelidade, Último pedido

### Aba: Pedido
- Card com item + preço unitário
- Card total em `bg-[#E1F5EE] text-[#085041]` (verde suave)
- Texto de pontos: `text-[#8A9892]` centralizado

## Alertas visuais

| Elemento | Visual |
|---|---|
| Dot alerta na lista | `h-2 w-2 bg-[#D97706]` (laranja) |
| Badge receita pendente (header) | `bg-[#FAEEDA] text-[#633806]` pill |
| Sistema msg no chat | `bg-[#FAEEDA] text-[#633806]` pill centralizado |

## Tipo `AtendimentoItem`

```ts
type AtendimentoItem = {
  id: string; nome: string; preview: string; hora: string
  avatarColor: string; emAtendimento: boolean
  posicao?: number      // posição na fila (1, 2, 3...)
  alertas?: string[]    // ex: ['Receita pendente'] — acende dot laranja
}
```

## EvolutionAPI — Endpoints (integração futura)

```ts
// TODO: GET  /api/v1/whatsapp/atendimentos           lista atendimentos em andamento e fila
// TODO: POST /api/v1/whatsapp/atendimentos/{id}/separar-pedido
//            → notifica cliente via WhatsApp + cria pedido no sistema
// TODO: POST /api/v1/whatsapp/atendimentos/{id}/adicionar-item { produto_id, qty }
// TODO: POST /api/v1/whatsapp/atendimentos/{id}/cancelar
// TODO: GET  /api/v1/whatsapp/atendimentos/{id}/receita  → dados da receita digital vinculada
// TODO: GET  /api/v1/whatsapp/atendimentos/{id}/produto  → produto sugerido pelo chat
// TODO: WS   /api/v1/whatsapp/ws ← eventos: novo_atendimento, status_alterado
```

## Verificação

- [x] MiniList com seções "EM ATENDIMENTO" e "NA FILA"
- [x] Itens em atendimento: dot laranja quando `alertas` presente
- [x] Itens na fila: posição numérica em círculo
- [x] Chat mostra CHAT_ANA_ATEND com bubble receita (arquivo PDF) e msg sistema
- [x] Header chat com badge warning "⚠ Receita pendente"
- [x] OpsPanel com 4 tabs: Receita / Produto / Cliente / Pedido
- [x] Tab ativa: `bg-[#0E4D3B] text-white`; inativa: `text-[#7A8883]`
- [x] Aba Pedido: card total verde `bg-[#E1F5EE]` + pontos
- [x] Botão primário: "Separar pedido e notificar cliente" full width `bg-[#0E4D3B]`
- [x] Botões secundários: "Adicionar item" + "Cancelar" em linha
- [ ] Integração real EvolutionAPI (pendente backend)
