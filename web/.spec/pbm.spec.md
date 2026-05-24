---
modulo: pbm
rota: /pbm
pagina: PbmPage
status: ✅ Implementado (2026-05-10)
schema: src/schemas/pbm.ts
layout: wizard-3-etapas
referencia: EntradaNfePage.tsx (padrão wizard)
---

# PBM / Farmácia Popular — Spec

## Propósito
Wizard de 3 etapas para autorização de benefícios PBM e Farmácia Popular. Inclui fila de autorizações recentes, validação de CPF/CRM/convênio, inclusão de medicamentos e envio ao caixa. Perfis: `operador_caixa`, `farmaceutico`, `admin`.

## Layout — Wizard 3 etapas (duas colunas internas)

```
┌──────────────────────────────────────────────┐
│ Header: título + badge progresso + chip etapa │
│         + botão Voltar (step > 1)             │
├─────────────────────────┬────────────────────┤
│  Conteúdo da etapa      │  Fila lateral       │
│  (flex-1)               │  (w-72)             │
│                         │  "Fila de autorizações"
│  [Etapa 1]              │  N items recentes   │
│  5 Métricas             │                     │
│  CPF + CRM + Convênio   │                     │
│  [Consultar DATASUS]    │                     │
│                         │                     │
│  [Etapa 2]              │                     │
│  Lista medicamentos     │                     │
│  [+ Adicionar med.]     │                     │
│                         │                     │
│  [Etapa 3]              │                     │
│  Card de autorização    │                     │
│  [Finalizar → Caixa]    │                     │
└─────────────────────────┴────────────────────┘
```

## Schema
`src/schemas/pbm.ts` — `AtendimentoPbmSchema`, `PbmConsultaSchema`, `PbmMedItemSchema`, `MedSearchResultSchema`

## Mock Data

**5 métricas:**
```ts
const METRICS = [
  { label: 'Atendimentos hoje', value: '86',      bg: 'bg-white',    border: 'border-brand-100'   },
  { label: 'Aprovados',         value: '72%',     bg: 'bg-brand-25',  border: 'border-brand-100'   },
  { label: 'Pendentes de docs', value: '14',      bg: 'bg-warning-50', border: 'border-warning-100' },
  { label: 'Rejeições',         value: '8',       bg: 'bg-danger-50',  border: 'border-danger-100'  },
  { label: 'Desconto médio',    value: 'R$ 18,40',bg: 'bg-info-50',    border: 'border-info-100'    },
] as const
```

**Fila de autorizações:** 5 itens com status `aprovado`, `pendente`, `rejeitado`.
**Catálogo de medicamentos:** 6 itens buscáveis (Dipirona, Losartana, Atorvastatina, Metformina...).
**Histórico PBM:** 5 registros por CPF para `ModalHistoricoPbm`.

## Config Tables

```ts
const STEP_CFG: Record<PbmStep, { titulo, subtitulo, progresso, etapa, queueLabel }> = {
  1: { progresso: 'Fluxo guiado (1/3)', etapa: 'Etapa 1 · Autorização',   ... },
  2: { progresso: 'Fluxo guiado (2/3)', etapa: 'Etapa 2 · Medicamentos',  ... },
  3: { progresso: 'Fluxo guiado (3/3)', etapa: 'Etapa 3 · Finalização',   ... },
}

type AutorizacaoStatus = 'aguardando' | 'analisando' | 'autorizado' | 'negado'
type QueueItemStatus = 'aprovado' | 'pendente' | 'rejeitado'
```

## Estado

```ts
const [step, setStep] = useState<PbmStep>(1)
const [status, setStatus] = useState<AutorizacaoStatus>('aguardando')
const [cpf, setCpf] = useState('')
const [crm, setCrm] = useState('')
const [convenio, setConvenio] = useState('')
const [meds, setMeds] = useState<MedItem[]>([])
const [addMedOpen, setAddMedOpen] = useState(false)
const [historicoPbmOpen, setHistoricoPbmOpen] = useState(false)
const navigate = useNavigate()
```

## Etapa 1 — Autorização

**Status box multi-estado** (muda de cor por `AutorizacaoStatus`):
```ts
const STATUS_BOX_CFG = {
  aguardando: { badge: '● Aguardando', cardBg: 'bg-white',    cardBorder: 'border-brand-100',   btnCls: 'bg-brand-900', disabled: false },
  analisando: { badge: '⟳ Analisando', cardBg: 'bg-brand-25', cardBorder: 'border-brand-100',   btnCls: 'bg-brand-300 cursor-not-allowed', disabled: true },
  autorizado: { badge: '● Aprovado',   cardBg: 'bg-brand-25', cardBorder: 'border-brand-100',   btnCls: 'bg-brand-900', disabled: false },
  negado:     { badge: '✗ Negado',     cardBg: 'bg-danger-50', cardBorder: 'border-danger-100', btnCls: 'bg-brand-300 cursor-not-allowed', disabled: true },
}
```

**Demo switcher** (pills tiny) no header do status box.

Campos: CPF paciente + CRM médico + select convênio.
Botão "Ver histórico" → `ModalHistoricoPbm`.

```ts
// TODO: POST /api/v1/pbm/autorizar { cpf, crm, convenio } → { autorizado, protocolo }
```

## Etapa 2 — Medicamentos

Lista de medicamentos adicionados (`meds[]`). Botão "+ Adicionar medicamento" → `ModalAdicionarMed`.

**ModalAdicionarMed:**
- Input busca com debounce → filtra `CATALOGO_MED`
- Campos: qtd_total + qtd_diaria para cada medicamento selecionado
- "Adicionar" → `setMeds(prev => [...prev, newMed])`

## Etapa 3 — Finalização

Card de autorização com protocolo + desconto total.
Botão "Finalizar e enviar ao caixa":
```ts
navigate('/pdv?caixaAberto=true', { state: { pbm_autorizacao_id: protocolo, meds } })
```

## Modais

### ModalHistoricoPbm
Tabela read-only: Data | CPF | Convênio | Valor total | Status.
```ts
// TODO: GET /api/v1/pbm/historico/{cpf}
```

### ModalAdicionarMed
Busca + qty_total + qty_diaria.
```ts
// TODO: GET /api/v1/pbm/medicamentos?q={termo}&convenio={conv}
```

## API Endpoints

```ts
// TODO: GET /api/v1/pbm/metricas-dia
// TODO: POST /api/v1/pbm/autorizar { cpf, crm, convenio }
// TODO: GET /api/v1/pbm/medicamentos?q={termo}&convenio={conv}
// TODO: GET /api/v1/pbm/historico/{cpf}
// TODO: POST /api/v1/pbm/finalizar { autorizacao_id, meds[] } → protocolo + desconto_total
```

## Verificação

- [ ] Wizard avança somente após autorização (`status === 'autorizado'`)
- [ ] Demo switcher de status muda cor do card e texto corretamente
- [ ] `ModalHistoricoPbm` abre ao clicar "Ver histórico" no campo CPF
- [ ] Lista de meds atualiza ao adicionar via modal
- [ ] Botão "Finalizar" navega para PDV com `state.pbm_autorizacao_id`
- [ ] Fila lateral exibe status colorido por item (`aprovado/pendente/rejeitado`)
