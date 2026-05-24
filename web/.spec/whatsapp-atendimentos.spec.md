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
│  │ Lista unificada  │  │ Chat (central)             │  │ Painel de Ação   │   │
│  │ w=280px          │  │ flex-1                     │  │ w=360px          │   │
│  │ bg=#FFFFFF       │  │ bg=#F7FAF8                 │  │ bg=#FFFFFF       │   │
│  │ rounded-l-[20px] │  │                            │  │ rounded-r-[20px] │   │
│  │                  │  │ Header: avatar + nome +    │  │                  │   │
│  │ [Busca h=36]     │  │   badge estado + ações     │  │ ┌──────────────┐ │   │
│  │ [Todos|Em at.|   │  │                            │  │ │ ClienteHeader│ │   │
│  │  Aguard.|Resolv] │  │ Bubbles scroll             │  │ │ (fixo, sempre│ │   │
│  │                  │  │ received: branco           │  │ │  visível)    │ │   │
│  │ EM ATENDIMENTO   │  │ sent: #0E4D3B              │  │ └──────────────┘ │   │
│  │ [• Ana ⚠  10:42] │  │ sistema: pill #FAEEDA      │  │ Tabs: [Orçament]│   │
│  │ [• Carlos  10:38]│  │                            │  │       [Receita●]│   │
│  │                  │  │ InputBar:                  │  │       [Pedido  ]│   │
│  │ AGUARDANDO       │  │ 📎 + text + quick + ➤     │  │       [Histórico│   │
│  │ [• Maria  3 msgs]│  │                            │  │                  │   │
│  │ [• João        ] │  │                            │  │ Conteúdo da aba  │   │
│  │                  │  │                            │  │ (scrollável)     │   │
│  │ footer: 2·3·0    │  │                            │  │                  │   │
│  └──────────────────┘  └────────────────────────────┘  │ [CTAs dinâmicos] │   │
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

## Painel direito — Ação contextual (360px)

### ClienteHeader (fixo, sempre visível — fora das abas)
```
px-5 py-[18px] · border-b border-[#DCE7E1]
layout: vertical · gap-3 · alignItems: center

Avatar: 48x48 rounded-full (cor do cliente)
  Iniciais: 2 letras · fontSize 14 · fontWeight 700 · text-white

Nome:     fontSize 15 · fontWeight 700 · text-[#163B32]
Telefone: fontSize 12 · text-[#7A8883]

Badges: gap-1.5
  rounded-full · bg-[#E1F5EE] · text-[#085041] · px-[10px] py-1 · fontSize 10

Dados inline (grid 2 cols gap-x-4 gap-y-2):
  Label: fontSize 9 fontWeight 600 text-[#8A9892] uppercase
  Value: fontSize 12 fontWeight 500 text-[#173126]
  Pontos: fontWeight 700 text-[#2D9D6E]
```

### Tabs de ação
```
px-5 py-[14px] · border-b border-[#DCE7E1]
layout: horizontal · gap-1

Tab ativo:   rounded-full · bg-[#0E4D3B] · text-white · px-[14px] py-[7px] · fontSize 11 · fontWeight 600
Tab inativo: rounded-full · bg-[#F2F7F4] · text-[#8A9892] · px-[14px] py-[7px] · fontSize 11 · fontWeight 500
             stroke: border border-[#DCE7E1]

Badge ● na aba Receita quando alertas[] contém "Receita pendente":
  span inline: h-1.5 w-1.5 rounded-full bg-[#D97706] ml-1

Ordem: Orçamento · Receita · Pedido · Histórico
```

### Aba: Orçamento (NOVA)
```
Conteúdo: px-5 py-4 gap-4 layout vertical overflow-y-auto

Campo busca produto:
  rounded-[12px] border border-[#DCE7E1] bg-[#F2F7F4] h-9 px-3.5
  placeholder "Buscar produto..." fontSize 13

Resultados (lista):
  Item: rounded-[12px] border border-[#DCE7E1] bg-[#F7FAF8] px-4 py-3
        Nome: fontSize 13 fontWeight 600 text-[#173126]
        Lab/Apres: fontSize 11 text-[#8A9892]
        Preço: fontSize 14 fontWeight 700 text-[#173126]
        PBM se elegível: fontSize 10 text-[#0E4D3B] "Farmácia Popular: -40%"
        CTA [Enviar ▸]: rounded-[8px] bg-[#0E4D3B] text-white fontSize 11 px-3 py-1.5

Footer das abas Orçamento/Pedido:
  border-t border-[#DCE7E1] px-5 py-[14px] gap-2

  "Converter em pedido" (quando há itens no orçamento):
    rounded-[12px] bg-[#0E4D3B] text-white fontSize 13 fontWeight 600 py-3 w-full

  "Limpar orçamento":
    rounded-[10px] bg-white border border-[#DCE7E1] text-[#173126] fontSize 12 py-[10px]
```

### Aba: Receita
```
Conteúdo: px-5 py-4 gap-3 layout vertical overflow-y-auto

Cards ReadOnly:
  rounded-[16px] bg-[#F7FAF8] border border-[#DCE7E1] px-4 py-3 gap-0.5
  Label: fontSize 10 fontWeight 600 text-[#8A9892] uppercase
  Value: fontSize 12 fontWeight 500 text-[#173126]

Campos: Prescritor · CRM · Data prescrição · Validade · Protocolo

Status badge:
  "✓ Válida": bg-brand-75 text-success-600
  "⚠ Pendente": bg-[#FAEEDA] text-[#633806]
  "✗ Inválida": bg-danger-50 text-danger-700

Footer:
  "Validar receita": rounded-[12px] bg-[#0E4D3B] text-white (quando pendente)
  "Vincular ao pedido": rounded-[10px] border border-[#DCE7E1] (quando válida)
```

### Aba: Pedido
```
Conteúdo: px-5 py-4 gap-3 layout vertical overflow-y-auto

Item do pedido:
  rounded-[16px] bg-[#F7FAF8] border border-[#DCE7E1] px-4 py-3
  Nome + lab + apres (col esq)
  Preço unitário (col dir, fontWeight 700)

Divider: bg-[#DCE7E1] h-px

Total:
  rounded-[16px] bg-[#E1F5EE] border border-[#DCE7E1] px-4 py-3
  "Total" text-[#085041] fontWeight 700
  Valor  text-[#085041] fontSize 16 fontWeight 700

Pontos: text-center fontSize 11 text-[#8A9892]

Footer CTA:
  "Separar pedido e notificar cliente":
    rounded-[12px] bg-[#0E4D3B] text-white fontSize 13 fontWeight 600 py-3 w-full

  Row secundário gap-2:
    "Adicionar item": rounded-[10px] border border-[#DCE7E1] flex-1 py-[10px] fontSize 12
    "Cancelar":       rounded-[10px] border border-[#DCE7E1] flex-1 py-[10px] fontSize 12 text-danger-700
```

### Aba: Histórico
```
Conteúdo: px-5 py-4 gap-3 layout vertical overflow-y-auto

Cada compra passada:
  rounded-[8px] bg-[#F7FAF8] px-[10px] py-2
  layout: horizontal · justifyContent: space_between
  Col esq: Nome (fontSize 12 fontWeight 600 #173126) + Data (fontSize 10 #8A9892)
  Col dir: Valor (fontSize 11 fontWeight 600 #173126)

Título seção: fontSize 13 fontWeight 700 text-[#163B32]
```

---

## Modelo de dados unificado

```ts
type ConvStatus = 'aguardando' | 'em_atendimento' | 'resolvido'

type OrcamentoItem = {
  produto_id: string
  nome: string
  laboratorio: string
  apresentacao: string
  preco: number        // centavos
  pbm_desconto?: number // percentual
  qty: number
}

type Conversa = {
  id: string
  nome: string
  telefone: string
  preview: string
  hora: string
  unread: number
  avatarColor: string
  status: ConvStatus
  alertas?: string[]           // ['Receita pendente'] → dot laranja + badge ● na tab
  // Contexto farmacêutico — preenchido progressivamente:
  receita?: {
    prescritor: string; crm: string; data: string
    validade: string; protocolo: string
    status: 'pendente' | 'valida' | 'invalida'
  } | null
  orcamento?: OrcamentoItem[]  // itens do orçamento em construção
  pedido?: {
    itens: OrcamentoItem[]
    total: number
    pontos: number
  } | null
}
```

---

## Fluxo completo — exemplo de uso

```
1. Lista mostra "AGUARDANDO: Maria (3 msgs)"
2. Operador clica → painel direito mostra cliente + Orçamento vazio
   Chat header: badge "Aguardando" + botão "Iniciar atendimento"

3. Clica "Iniciar atendimento" → status 'em_atendimento'
   → Maria sobe para "EM ATENDIMENTO" na lista
   → Header chat: botões "Transferir" / "Encerrar"

4. Operador vai em tab [Orçamento]:
   → busca "dipirona 500"
   → clica "Enviar ▸" → mensagem de orçamento injetada no chat
   
5. Maria envia receita (PDF no chat)
   → badge ● aparece na tab Receita
   → Operador vai em tab [Receita], preenche dados, clica "Validar"
   → status "✓ Válida"

6. Clica "Vincular ao pedido" → tab [Pedido] popula automaticamente

7. Em tab [Pedido]: revisa, aplica PBM, clica "Separar pedido e notificar"
   → mensagem automática no chat: "Seu pedido foi separado! Retire em 20 min."
   → status → 'resolvido'
   → Maria move para "Resolvidos" (ou some da lista principal)
```

---

## Sub-componentes locais (WhatsAppPage.tsx)

```tsx
// Compartilhados entre todo o módulo WhatsApp (não exportados)
function AvatarCircle({ nome, color, size }: {...})   // existente
function BubbleMsg({ b }: { b: Bubble })               // existente

// NOVOS para AbaAtendimentos
function ChatPanelShared({ conversa, bubbles }: {...}) // chat reutilizável
function ClienteHeader({ conv }: {...})                // fixo no topo direito
function AbaOrcamento({ conv, onEnviar }: {...})       // busca + resultados
function AbaReceita({ conv }: {...})                   // campos readonly + validar
function AbaPedido({ conv, onSeparar }: {...})         // itens + CTA
function AbaHistorico({ conv }: {...})                 // compras passadas
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
- [x] Chat central com bubbles e inputbar
- [x] Botão "Iniciar atendimento" quando status='aguardando'
- [x] ClienteHeader fixo no topo do painel direito
- [x] 4 tabs: Orçamento / Receita / Pedido / Histórico
- [x] Badge ● na tab Receita quando alertas[] tem "Receita pendente"
- [x] Aba Orçamento: busca + "Enviar no chat" + "Converter em pedido"
- [x] Aba Receita: campos readonly + botão validar + status badge
- [x] Aba Pedido: resumo + total verde + "Separar e notificar"
- [x] Aba Histórico: compras passadas read-only
- [ ] Integração real EvolutionAPI (pendente backend)

## Refinamentos Pendentes

| Change | Prioridade | Descrição | Status |
|---|---|---|---|
| [CHANGE-WA-001](./changes/CHANGE-WA-001.md) | P2 | Corrigir Espaçamento dos Botões de Ação — botões da inputbar e painel direito com gap/padding incorretos | ⬜ pending |
| [CHANGE-WA-002](./changes/CHANGE-WA-002.md) | P2 | Scroll na Lista de Conversas — lista não scroll quando > viewport; `overflow-y-auto` + `min-h-0` faltando | ⬜ pending |
| [CHANGE-WA-003](./changes/CHANGE-WA-003.md) | P2 | Botão "Anexar Arquivo" — input `type="file"` oculto + clique programático + preview inline na bubble | ⬜ pending |
| [CHANGE-WA-004](./changes/CHANGE-WA-004.md) | P3 | Ações Rápidas no Chat — menu contextual com atalhos: "Enviar orçamento", "Solicitar receita", "Agendar retorno" | ⬜ pending |

### O que cada change adiciona a esta tela

**CHANGE-WA-001** é um fix de polish: corrige `gap` entre botões emoji/anexo/enviar na inputbar e alinha ícones do painel direito para padding consistente de `px-4`. Sem nova lógica — apenas classes Tailwind.

**CHANGE-WA-002** corrige o scroll da lista de conversas (painel esquerdo 280px): adiciona `min-h-0` na cadeia flex pai → filho e `overflow-y-auto` no container da lista. O bug aparece quando há mais de ~8 conversas e o painel não propaga altura corretamente.

**CHANGE-WA-003** adiciona a funcionalidade de anexo de arquivo: `<input type="file" className="hidden" ref={fileRef} />` acionado pelo botão 📎, gerando uma bubble do tipo `arquivo` com nome e tamanho. Usa o padrão `BubbleMsg` já existente (campo `b.arquivo`). Mock: adiciona mensagem localmente sem upload real.

**CHANGE-WA-004** adiciona menu de ações rápidas (3 bullets) que aparece ao clicar no botão ⚡ na inputbar: "Enviar orçamento atual", "Solicitar foto da receita", "Agendar retorno em X dias". Cada ação injeta uma mensagem modelo no chat e pode pré-preencher a aba correspondente no painel direito.
