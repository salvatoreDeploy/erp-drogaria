---
modulo: fiscal
rota: /fiscal
pagina: FiscalPage
status: ✅ Implementado (2026-05-10)
schema: src/schemas/fiscal.ts
layout: coluna-unica
referencia: —
---

# Fiscal — Hub NF-e — Spec

## Propósito
Hub de emissão e controle de NF-e. Exibe métricas do dia, formulário de nova emissão com itens, histórico recente e ações rápidas (carta de correção, cancelamento). Perfis: `farmaceutico`, `admin`.

## Layout — Coluna única (hub)

```
┌────────────────────────────────────────────────────────┐
│ Header: "Fiscal NF-e" + chip SEFAZ (demo switcher)     │
│         + link → Entrada NF-e                          │
├────────────────────────────────────────────────────────┤
│ Grid 5 Métricas: Emitidas | Autorizadas | Contingência │
│                  Rejeições | Tempo médio               │
├──────────────────────────────────┬─────────────────────┤
│ Card Emissão (flex-1)            │ Card Ações (w-72)   │
│ Itens da nota (tabela)           │ Rápidas             │
│ Produto | CFOP | Lote | Valor    │ ─────────────────── │
│ [status badge contingência]      │ [Carta de correção] │
│ Total + [Emitir NF-e]            │ [Relatório fiscal]  │
│                                  │ ─────────────────── │
├──────────────────────────────────┤ Histórico recente   │
│ Histórico recente (tabela)       │ (3 NF-es)           │
│ NF-e | Status | [Cancelar]       │                     │
└──────────────────────────────────┴─────────────────────┘
```

## Schema
`src/schemas/fiscal.ts` — `CartaCorrecaoSchema`, `CancelarNfeSchema`, `NfeEmissaoSchema`, `NfeHistStatusSchema`

## Mock Data

**5 métricas:**
```ts
const METRIC_CFG = [
  { label: 'Notas emitidas hoje', value: '34',  bg: 'bg-white',    border: 'border-brand-100'   },
  { label: 'Autorizadas',         value: '31',  bg: 'bg-brand-25',  border: 'border-brand-100'   },
  { label: 'Em contingência',     value: '2',   bg: 'bg-warning-50', border: 'border-warning-100' },
  { label: 'Rejeições',           value: '3',   bg: 'bg-danger-50',  border: 'border-danger-100'  },
  { label: 'Tempo médio',         value: '42s', bg: 'bg-info-50',    border: 'border-info-100'    },
] as const
```

**3 itens de emissão:**
```ts
const ITENS_EMISSAO = [
  { id: 1, produto: 'Losartana 50mg', cfop: '6102', lote: 'L-1044', valor: 2490, status: 'normal'      },
  { id: 2, produto: 'Dipirona 500mg', cfop: '6102', lote: 'D-2291', valor: 840,  status: 'normal'      },
  { id: 3, produto: 'Morfina 10mg',   cfop: '—',    lote: 'C-8920', valor: 1120, status: 'contingencia'},
]
```

**3 NF-es no histórico:**
```ts
const HISTORICO = [
  { numero: 'NF-e 002184', status: 'autorizada'  },
  { numero: 'NF-e 002183', status: 'cancelada'   },
  { numero: 'NF-e 002182', status: 'contingencia'},
]
```

**Motivos de cancelamento:**
```ts
const MOTIVOS_CANCELAMENTO = ['Duplicidade', 'Erro de dados do destinatário', 'Erro de item/quantidade', 'Solicitação do cliente', 'Outro']
```

## Config Tables

```ts
const HIST_CFG: Record<NfeHistStatus, { label, cls }> = {
  autorizada:  { label: 'Autorizada',   cls: 'text-success-600' },
  cancelada:   { label: 'Cancelada',    cls: 'text-danger-700'  },
  contingencia:{ label: 'Contingência', cls: 'text-warning-700' },
}

const ITEM_CFG: Record<ItemEmissaoStatus, { row, detail, valor }> = {
  normal:      { row: 'bg-[#FBFCFB] border-brand-100', ... },
  contingencia:{ row: 'bg-warning-50 border-warning-100', ... },
}
```

## Estado

```ts
const [sefazOnline, setSefazOnline] = useState(true)
const [cartaOpen, setCartaOpen] = useState(false)
const [cancelarNfe, setCancelarNfe] = useState<string | null>(null)  // nfe_id
```

## Demo Switcher — SEFAZ

Pills mono no header (`text-[9px] uppercase`): `online` / `offline`.
Chip no header: verde quando online, warning quando offline.
Banner de contingência exibido quando `!sefazOnline`.

```tsx
// Chip online
<div className="border-brand-200 bg-brand-75">
  <span className="bg-success-600" /> SEFAZ online
</div>
// Chip offline
<div className="border-warning-100 bg-warning-50">
  <span className="bg-warning-600" /> SEFAZ offline — Contingência
</div>
```

## Modais

### ModalCartaCorrecao
Campos: select NF-e (do HISTORICO) + textarea (min 15 / max 1000 chars).
Botão "Enviar CC-e" habilitado apenas quando ambos válidos.
Contador de caracteres visível abaixo do textarea.
```ts
// Validação: CartaCorrecaoSchema.safeParse()
// TODO: POST /api/v1/fiscal/nfe/carta-correcao { nfe_id, correcao }
```

### ModalCancelarNfe
Banner `bg-danger-50` com aviso "Cancelamento válido em até 24h".
Campos: select motivo + checkbox confirmação.
Botão `bg-danger-600` habilitado apenas quando `motivo && confirmado`.
```ts
// Validação: CancelarNfeSchema.safeParse()
// TODO: POST /api/v1/fiscal/nfe/{id}/cancelar { motivo }
```

## API Endpoints

```ts
// TODO: GET /api/v1/fiscal/metricas-dia → { emitidas, autorizadas, contingencia, rejeicoes, tempo_medio_s }
// TODO: GET /api/v1/fiscal/nfe/historico-recente → NfeHist[]
// TODO: POST /api/v1/fiscal/nfe/emitir { itens, destinatario, ... }
// TODO: POST /api/v1/fiscal/nfe/carta-correcao { nfe_id, correcao }
// TODO: POST /api/v1/fiscal/nfe/{id}/cancelar { motivo }
```

## Verificação

- [ ] Demo switcher muda chip SEFAZ corretamente
- [ ] Grid 5 métricas com cores distintas por card
- [ ] Item `status: 'contingencia'` recebe row `bg-warning-50`
- [ ] ModalCartaCorrecao: botão desabilitado até textarea ter ≥ 15 chars
- [ ] ModalCancelarNfe: `z.literal(true)` valida checkbox obrigatório
- [ ] Botão "Cancelar" só aparece em linhas com `status: 'autorizada'`
- [ ] Link "Entrada de NF-e" navega para `/fiscal/entrada-nfe`
