---
modulo: whatsapp-atendimentos
rota: /whatsapp (aba "Atendimentos")
pagina: WhatsAppPage → AbaAtendimentos
status: ✅ Implementado
schema: src/schemas/whatsapp.ts ✅
layout: tres-paineis-unificado
integracao: EvolutionAPI (REST + Webhook)
substitui: whatsapp-conversas.spec.md + whatsapp-atendimento.spec.md
---

# WhatsApp — Atendimentos Unificado

## Contexto e decisão de design

Em farmácias de pequeno e médio porte, **a mesma pessoa que inicia a conversa também fecha o pedido**. Não há handoff entre "atendente de chat" e "farmacêutico de pedido" — são o mesmo operador.

Por isso, as abas separadas "Conversas" (consulta/orçamento) e "Atendimento" (fechar pedido) foram **unificadas em uma única aba "Atendimentos"**. O painel direito oferece progressivamente todas as funcionalidades: orçamento, receita, pedido e histórico — sem troca de aba, sem perda de contexto da conversa.

Referência de mercado: **Blip**, **Huggy**, **Intercom** — conversa única com painel contextual lateral.

---

## Máquina de estados da conversa

```
[aguardando] → (clica "Iniciar atendimento") → [em_atendimento] → (clica "Separar pedido") → [resolvido]

aguardando    = cliente enviou mensagem, ninguém pegou ainda
em_atendimento = operador abriu e está atendendo
resolvido     = pedido separado ou atendimento encerrado
```

**Regra:** uma conversa só existe em UM estado por vez. Nunca aparece em dois lugares simultaneamente.

---

## Layout — Três painéis contíguos (sem gap, bordas unificadas)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ rounded-[20px] border-[#DCE7E1] overflow-hidden — flex-1 min-h-0              │
│                                                                                │
│  ┌──────────────────┐  ┌────────────────────────────┐  ┌──────────────────┐   │
│  │ Lista unificada  │  │ Chat (central)             │  │ Painel cliente   │   │
│  │ w=280px          │  │ flex-1                     │  │ w=360px          │   │
│  │ bg=#FFFFFF       │  │ bg=#F7FAF8                 │  │ bg=#FFFFFF       │   │
│  │ rounded-l-[20px] │  │                            │  │ overflow-y-auto  │   │
│  │                  │  │ Header: avatar + nome +    │  │                  │   │
│  │ [Busca h=36]     │  │   badge estado + ações     │  │ ┌──────────────┐ │   │
│  │ [Todos|Em at.|   │  │                            │  │ │ custHeader   │ │   │
│  │  Aguard.|Resolv] │  │ Bubbles scroll             │  │ │ avatar 56px  │ │   │
│  │                  │  │ received: branco           │  │ │ nome + tel   │ │   │
│  │ fade overlay top │  │ sent: #0E4D3B              │  │ │ badges       │ │   │
│  │ EM ATENDIMENTO   │  │ sistema: pill #FAEEDA      │  │ ├──────────────┤ │   │
│  │ [• Ana ⚠  10:42] │  │                            │  │ │ custDetails  │ │   │
│  │ [• Carlos  10:38]│  │ InputBar:                  │  │ │ Informações  │ │   │
│  │                  │  │ 📎 + preview + text + ➤   │  │ ├──────────────┤ │   │
│  │ AGUARDANDO       │  │                            │  │ │ custActions  │ │   │
│  │ [• Maria  3 msgs]│  │                            │  │ │ Ações rápidas│ │   │
│  │ [• João        ] │  │                            │  │ ├──────────────┤ │   │
│  │                  │  │                            │  │ │ recentPurch. │ │   │
│  │ fade overlay btm │  │                            │  │ │ Compras rec. │ │   │
│  │ footer: 2·3·0    │  │                            │  │ └──────────────┘ │   │
│  └──────────────────┘  └────────────────────────────┘  └──────────────────┘   │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## Tokens de cor (extraídos do Pencil)

| Elemento | Valor |
|---|---|
| Container border | `#DCE7E1` |
| Chat background | `#F7FAF8` |
| Item ativo na lista | `bg-[#E8F5EF]` |
| Separador de item | `border-b border-[#DCE7E1]` |
| Separador de seção | `border-b border-[#F0F4F2]` |
| Text principal | `#173126` |
| Text secundário | `#8A9892` |
| Text preview | `#7A8883` |
| Badge alerta (receita) | `bg-[#FAEEDA] text-[#633806]` |
| Badge cliente ativo | `bg-[#E1F5EE] text-[#085041]` |
| Botão primário | `bg-[#0E4D3B]` hover `#0a3a2c` |
| Bubble recebida | `bg-white border-[#E6ECE8]` |
| Bubble enviada | `bg-[#0E4D3B]` |
| Sistema (pill) | `bg-[#FAEEDA] text-[#633806]` |
| OPS card bg | `bg-[#F7FAF8]` |
| OPS card border | `border-[#DCE7E1]` |
| Footer lista | `bg-[#F7FAF8]` |
| Pontos fidelidade | `text-[#2D9D6E]` |

---

## Painel esquerdo — Lista unificada (280px)

### Header
```
padding: [18px, 14px, 14px, 14px] / gap: 10px / layout: vertical

Título: "Atendimentos" · fontSize 16 · fontWeight 700 · fill #163B32

Busca: h-9 · rounded-[12px] · bg-[#F2F7F4] · border border-[#DCE7E1]
       placeholder "Buscar..." · fontSize 13 · text-[#8A9892]

Filtros: pills gap-1.5
  Ativo:   rounded-full bg-[#0E4D3B] text-white px-3 py-1.5 text-[10px] font-medium
  Inativo: rounded-full bg-[#F2F7F4] text-[#8A9892] px-3 py-1.5 text-[10px] font-medium
  Opções: Todos | Em atend. | Aguardando | Resolvidos
```

### Seções
```
Rótulo de seção: px-[14px] pt-[10px] pb-[6px]
  text-[9px] font-semibold text-[#8A9892] tracking-wider uppercase
  ex: "EM ATENDIMENTO" / "AGUARDANDO"
```

### Item de conversa
```
layout: horizontal · gap-[10px] · px-[14px] py-[10px]
border-b border-[#DCE7E1]

Ativo (em_atendimento selecionado): bg-[#E8F5EF]
Hover: bg-[#F7FAF8]

Avatar: 36x36 rounded-full (cor variada por usuário)
  Iniciais: 2 letras, fontSize 12, fontWeight 700, text-white

Coluna texto (flex-1, min-w-0):
  Nome: fontSize 12 fontWeight 600 text-[#173126] truncate
  Preview: fontSize 11 text-[#7A8883] truncate

Coluna direita:
  Hora/posição: fontSize 9 text-[#8A9892]
  Unread badge: rounded-full bg-[#0E4D3B] text-white min-w-4 h-4 text-[9px]
  Alerta dot (alertas[]): h-2 w-2 rounded-full bg-[#D97706]
```

### Footer
```
px-[14px] py-3 · border-t border-[#DCE7E1] · bg-[#F7FAF8]
Texto: "N em atend. · N aguardando" · fontSize 10 · text-[#7A8883] · fontWeight 500
```

---

## Painel central — Chat (flex-1)

### Header do chat
```
px-5 py-[14px] · border-b border-[#DCE7E1] · bg-white
layout: horizontal · justifyContent: space_between

Esquerda: Avatar 40px + nome (fontSize 14 fontWeight 600 #173126) + tel (fontSize 11 #8A9892)
Centro:   Badge de estado quando em_atendimento:
          "⚠ Receita pendente" → bg-[#FAEEDA] text-[#633806] rounded-full px-3 py-1 text-[10px]
Direita:  Botões de ação:
          "Iniciar atendimento" (aguardando) → bg-[#0E4D3B] text-white
          "Transferir" / "Encerrar" (em_atendimento) → border border-[#DCE7E1]
```

### Área de mensagens
```
flex-1 overflow-y-auto · p-5 · gap-3 · layout: vertical · bg-[#F7FAF8]

Bubble recebida:
  justify-start
  rounded-[4px_16px_16px_16px] · bg-white · border border-[#E6ECE8]
  px-[14px] py-[10px] · gap-1 · max-w-[80%]
  Texto: fontSize 13 leading-snug text-[#173126]
  Hora:  fontSize 10 text-right text-[#8A9892]

Bubble enviada:
  justify-end
  rounded-[16px_4px_16px_16px] · bg-[#0E4D3B]
  px-[14px] py-[10px] · gap-1 · max-w-[80%]
  Texto: fontSize 13 leading-snug text-white
  Hora:  fontSize 10 text-right text-[#B8D8CF]
  Lido:  " ✓✓"

Bubble sistema:
  justify-center
  pill: rounded-full · bg-[#FAEEDA] · text-[#633806] · px-3 py-1 · fontSize 10 · fontWeight 600

Bubble com anexo (PDF):
  card interno: rounded-[10px] bg-[#F2F7F4] border border-[#DCE7E1] px-3 py-2
  ícone 📄 + nome (fontSize 11 fontWeight 600 text-brand-700) + tamanho (fontSize 9 #8A9892)

Data label:
  justify-center
  pill: rounded-full bg-[#E6ECE8] px-3 py-1 fontSize 10 text-[#8A9892]
```

### Input bar
```
px-5 py-[14px] · border-t border-[#DCE7E1] · bg-white · gap-[10px]

Anexar: h-10 w-10 rounded-[10px] bg-[#F2F7F4] border border-[#DCE7E1]
Input:  h-10 flex-1 rounded-[14px] bg-[#F2F7F4] border border-[#DCE7E1] px-4
        fontSize 13 text-[#173126] placeholder text-[#8A9892]
        focus: border-[#0E4D3B]
Atalhos inline (quick actions gap-1.5):
  Produto: rounded-[8px] bg-[#F2F7F4] border border-[#DCE7E1] px-[10px] py-[6px] fontSize 11
  Receita: mesma classe (ícone emoji ou texto)
Enviar: h-10 w-10 rounded-[12px] bg-[#0E4D3B] text-[18px] hover:bg-[#0a3a2c]
```

---

## Painel direito — Cliente (360px) — Pencil `customerPanel` ID: `Wr46A`

Painel scrollável com 4 seções contíguas. Sem abas. Design canônico: Pencil `erp-drograria.pen` frame `Wr46A`.

### Seção 1 — custHeader
```
padding: pt-6 px-5 pb-[18px] · border-b border-[#DCE7E1]
layout: vertical · items-center · gap-[14px]

Avatar: 56×56 · rounded-full · bg: avatarColor do cliente
  Iniciais: 2 letras · fontSize 20 · fontWeight 700 · text-white

Nome:     fontSize 16 · fontWeight 700 · text-[#163B32]
Telefone: fontSize 12 · text-[#7A8883]

Badges (horizontal, gap-[6px], flex-wrap justify-center):
  rounded-full · bg-[#E1F5EE] · text-[#085041]
  px-[10px] py-1 · fontSize 10 · fontWeight 600
  "Fidelidade Ouro" + "Cliente ativo"
```

### Seção 2 — custDetails (Informações)
```
padding: px-5 py-[18px] · border-b border-[#DCE7E1]
layout: vertical · gap-[14px]

Título: fontSize 13 · fontWeight 700 · text-[#163B32] · "Informações"

4 info rows (layout vertical, gap-[2px] dentro de cada):
  Label: fontSize 10 · fontWeight 600 · text-[#8A9892]
  Value: fontSize 12 · fontWeight 500 · text-[#173126]

Exceção — Pontos fidelidade:
  Value: fontSize 12 · fontWeight 700 · text-[#2D9D6E]

Rows: CPF · E-mail · Última compra · Pontos fidelidade
TODO: GET /api/v1/cadastros/clientes/{cpf}
```

### Seção 3 — custActions (Ações rápidas)
```
padding: px-5 py-[18px] · border-b border-[#DCE7E1]
layout: vertical · gap-[10px]

Título: fontSize 13 · fontWeight 700 · text-[#163B32] · "Ações rápidas"

Botão primário "Consultar produto":
  w-full · rounded-[10px] · bg-[#0E4D3B] · text-white
  px-[14px] py-[10px] · fontSize 12 · fontWeight 600
  onClick → ModalBuscaProdutoChat

3 botões secundários (mesmas dimensões):
  w-full · rounded-[10px] · bg-white · border border-[#DCE7E1]
  px-[14px] py-[10px] · fontSize 12 · fontWeight 600 · text-[#173126]
  "Verificar receita" (stub) · "Enviar promoção" (→ ModalEnviarTemplate) · "Registrar venda" (stub)
```

### Seção 4 — recentPurchases (Compras recentes)
```
padding: px-5 py-[18px]
layout: vertical · gap-[10px]

Título: fontSize 13 · fontWeight 700 · text-[#163B32] · "Compras recentes"

3 linhas de compra:
  rounded-[8px] · bg-[#F7FAF8] · px-[10px] py-[8px]
  layout: horizontal · justify-between
  Col esq: produto (fontSize 12 #173126) + data (fontSize 10 #8A9892)
  Col dir: preço (fontSize 12 fontWeight 600 #173126)

TODO: GET /api/v1/whatsapp/conversas/{id}/compras-recentes
```

---

## Modelo de dados

```ts
type ConvStatus = 'aguardando' | 'em_atendimento' | 'resolvido'

type Conversa = {
  id: string
  nome: string
  telefone: string
  preview: string
  hora: string
  unread: number
  avatarColor: string
  status: ConvStatus
  alertas?: string[]   // ['Receita pendente'] → dot laranja na lista
}

type Bubble = {
  id: string
  tipo: 'recebida' | 'enviada' | 'sistema'
  texto: string
  hora: string
  lido?: boolean
  arquivo?: { nome: string; tamanho: string }
}
```

---

## Fluxo completo — exemplo de uso

```
1. Lista mostra "AGUARDANDO: Maria (3 msgs)" — fade overlay inferior visível
2. Operador clica → painel direito mostra:
   custHeader (MS avatar + nome + badges) + custDetails (CPF, e-mail, última compra, pontos)
   custActions (Consultar produto, Verificar receita, Enviar promoção, Registrar venda)
   recentPurchases (3 compras anteriores)
   Chat header: badge "Aguardando" + botão "Iniciar atendimento"

3. Clica "Iniciar atendimento" → status 'em_atendimento'
   → Maria sobe para "EM ATENDIMENTO" na lista
   → Header chat: botões "Transferir" / "Encerrar"

4. Operador clica "Consultar produto" no painel direito:
   → ModalBuscaProdutoChat abre → busca "dipirona 500" (debounce 300ms)
   → seleciona produto → bubble formatada injetada no chat

5. Maria envia receita (PDF no chat via 📎):
   → preview inline na inputbar → botão ➤ envia arquivo → bubble com anexo

6. Operador clica "Enviar promoção" → ModalEnviarTemplate:
   → seleciona template → substitui {{variáveis}} → preview ao vivo → envia

7. Atendimento encerrado → status → 'resolvido'
   → Maria move para "Resolvidos" na lista
```

---

## Sub-componentes locais (WhatsAppPage.tsx)

```tsx
// Utilitários compartilhados
function AvatarCircle({ nome, color, size }: {...})   // avatar com iniciais
function BubbleMsg({ b }: { b: Bubble })               // bubble recebida/enviada/sistema

// AbaAtendimentos
function ClienteHeader({ conv, onConsultarProduto, onEnviarPromocao }: {...})
  // 4 seções Pencil: custHeader + custDetails + custActions + recentPurchases

// Modais de ação rápida (acionados pelos botões de custActions)
function ModalBuscaProdutoChat({ onClose, onEnviar }: {...})
  // debounce 300ms, filtra PRODUTOS_CATALOGO ≥2 chars, injeta bubble no chat
function ModalConsultarPedido({ onClose, onEnviar }: {...})
  // input CPF/número, mock setTimeout 600ms, injeta bubble de status
function ModalEnviarTemplate({ onClose, onEnviar }: {...})
  // select TEMPLATES_WA, regex {{variavel}}, preview ao vivo, injeta bubble
```

---

## EvolutionAPI — Endpoints (integração futura)

```ts
// Conversa e chat
// TODO: GET  /api/v1/whatsapp/conversas              lista todas as conversas
// TODO: GET  /api/v1/whatsapp/conversas/{id}/msgs    mensagens paginadas
// TODO: POST /api/v1/whatsapp/conversas/{id}/send    { texto } envia mensagem
// TODO: POST /api/v1/whatsapp/conversas/{id}/attach  { base64, mimetype }
// TODO: POST /api/v1/whatsapp/conversas/{id}/iniciar → status em_atendimento
// TODO: POST /api/v1/whatsapp/conversas/{id}/encerrar → status resolvido
// TODO: POST /api/v1/whatsapp/conversas/{id}/transferir { atendente_id }

// Orçamento
// TODO: GET  /api/v1/produtos/buscar?q={termo}       busca produto (reusa endpoint existente)
// TODO: POST /api/v1/whatsapp/conversas/{id}/orcamento/enviar { itens[] }

// Receita
// TODO: POST /api/v1/whatsapp/conversas/{id}/receita/validar { dados }

// Pedido
// TODO: POST /api/v1/whatsapp/conversas/{id}/pedido/separar
//            → notifica cliente + cria pedido + atualiza status

// WebSocket (tempo real)
// TODO: WS   /api/v1/whatsapp/ws
//            eventos: nova_mensagem | nova_conversa | status_atualizado | receita_recebida
```

---

## Verificação de implementação

- [x] Lista unificada com seções "EM ATENDIMENTO" / "AGUARDANDO"
- [x] Estado único por conversa (sem Ana em dois lugares)
- [x] Filtros: Todos / Em atend. / Aguardando / Resolvidos
- [x] Footer com contador "N em atend. · N aguardando"
- [x] Scroll na lista com fade dinâmico (`requestAnimationFrame`, overlays `bg-gradient-to-b/t`)
- [x] Chat central com bubbles e inputbar
- [x] Botão "Iniciar atendimento" quando status='aguardando'
- [x] Inputbar: 📎 file picker (JPG/PNG/WEBP/PDF/DOCX ≤16MB) + preview + progress bar
- [x] Painel direito redesenhado com fidelidade ao Pencil `customerPanel` (Wr46A)
- [x] custHeader: avatar 56px, nome 16px bold, tel `#7A8883`, badges Fidelidade/Ativo
- [x] custDetails: 4 info rows (CPF, e-mail, última compra, pontos verde)
- [x] custActions: btn primário "Consultar produto" → `ModalBuscaProdutoChat` + 3 secundários
- [x] recentPurchases: 3 linhas `bg-[#F7FAF8] rounded-[8px]` produto + data / preço
- [x] `ModalBuscaProdutoChat`: debounce 300ms, filtra PRODUTOS_CATALOGO, injeta bubble
- [x] `ModalConsultarPedido`: input CPF/número, mock async 600ms, injeta bubble status
- [x] `ModalEnviarTemplate`: select + regex `{{var}}` + preview ao vivo + injeta bubble
- [x] AppLayout corrigido: `h-screen overflow-hidden` (scroll global eliminado)
- [ ] Integração real EvolutionAPI (pendente backend)
- [ ] custDetails e recentPurchases com dados reais do cliente (GET /api/v1/cadastros/clientes/{cpf})

## Refinamentos Aplicados (Fase 7 — CHANGE-WA-001 a WA-004)

| Change | Prioridade | Descrição | Status |
|---|---|---|---|
| [CHANGE-WA-001](./changes/CHANGE-WA-001.md) | P2 | Espaçamento dos botões de ação na inputbar | ✅ done |
| [CHANGE-WA-002](./changes/CHANGE-WA-002.md) | P2 | Scroll na lista de conversas + fade suave | ✅ done |
| [CHANGE-WA-003](./changes/CHANGE-WA-003.md) | P2 | Botão 📎 Anexar Arquivo — file picker + preview + progress bar | ✅ done |
| [CHANGE-WA-004](./changes/CHANGE-WA-004.md) | P3 | Modais de ação rápida (ModalBuscaProdutoChat · ModalConsultarPedido · ModalEnviarTemplate) | ✅ done |
| Pencil fidelity | P2 | Redesign painel direito: `customerPanel` Pencil `Wr46A` — 4 seções scrolláveis, sem abas | ✅ done |
