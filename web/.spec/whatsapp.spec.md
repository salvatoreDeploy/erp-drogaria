---
modulo: whatsapp
rota: /whatsapp
pagina: WhatsAppPage
status: ✅ Implementado
schema: src/schemas/whatsapp.ts ✅
layout: duas-colunas
referencia: PbmPage.tsx (fila de atendimento no painel direito)
---

# WhatsApp / CRM — Spec

## Propósito
Envio de mensagens e campanhas via WhatsApp Business para clientes da farmácia: confirmação de pedido, lembrete de receita vencendo, campanhas de fidelidade.

## Layout — Duas colunas

```
┌─────────────────────────────────┬───────────────┐
│ Fila de mensagens recentes      │  Templates    │
│ (por cliente, status badge)     │  + Campanha   │
│                                 │               │
│ Filtros: canal + status         │  Métricas:    │
│ Busca por nome/telefone         │  enviadas,    │
│                                 │  entregues,   │
│ Lista: avatar + nome + preview  │  falhas       │
│ mensagem + hora + status chip   │               │
└─────────────────────────────────┴───────────────┘
```

## Schema (criar em src/schemas/whatsapp.ts)

```ts
export const MensagemStatusSchema = z.enum(['enviada', 'entregue', 'lida', 'falhou'])
export const CategoriaCampanhaSchema = z.enum(['pedido', 'receita', 'fidelidade', 'campanha'])

export const TemplateWhatsAppSchema = z.object({
  id: z.string().uuid(),
  nome: z.string(),
  categoria: CategoriaCampanhaSchema,
  mensagem: z.string(),
  variaveis: z.array(z.string()),
})

export const MensagemWhatsAppSchema = z.object({
  id: z.string().uuid(),
  cliente_nome: z.string(),
  cliente_telefone: z.string(),
  template_id: z.string().uuid().optional(),
  mensagem_preview: z.string(),
  canal: z.enum(['whatsapp', 'sms']),
  status: MensagemStatusSchema,
  enviada_em: z.string().datetime(),
})
```

## Mock Data

**20 mensagens:** mix de confirmação de pedido, receita vencendo, fidelidade — variados status
**6 templates:** "Pedido confirmado", "Receita vencendo", "Aniversário", "Campanha saúde", etc.

## Config Tables

```ts
const STATUS_CFG = {
  enviada:   { label: '→ Enviada',   bg: 'bg-neutral-50',  text: 'text-neutral-500' },
  entregue:  { label: '✓ Entregue',  bg: 'bg-brand-75',    text: 'text-brand-750'   },
  lida:      { label: '✓✓ Lida',     bg: 'bg-brand-75',    text: 'text-success-600' },
  falhou:    { label: '✗ Falhou',    bg: 'bg-danger-50',   text: 'text-danger-700'  },
}
```

## Fluxo Principal

1. Lista de mensagens recentes com filtro por status e busca
2. Clicar em "Novo envio" → `ModalEnviarMensagem`: select cliente + select template + preview
3. "Nova campanha" → `ModalNovaCampanha`: segmentação (convenio / aniversário / todos) + template + agendar

## API Endpoints

```ts
// TODO: GET /api/v1/whatsapp/fila?minutos=60
// TODO: POST /api/v1/whatsapp/enviar
// TODO: GET /api/v1/whatsapp/templates
// TODO: POST /api/v1/whatsapp/campanha
```

## Verificação

- [ ] Quality gate passa
- [ ] Lista de mensagens filtra por status
- [ ] Modal de envio abre com select de template
- [ ] Preview da mensagem atualiza conforme template selecionado
