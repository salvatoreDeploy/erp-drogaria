---
modulo: pdv-historico-caixa
rota: /pdv/fechamento-caixa
pagina: FechamentoCaixaPage
status: ⬜ Pendente
schema: src/schemas/caixa.ts
layout: modal-dentro-de-pagina
referencia: FechamentoCaixaPage.tsx
change-refs: [CHANGE-PDV-002]
---

# PDV — Histórico de Caixa (Modal)

## Propósito
Modal acessado a partir da `FechamentoCaixaPage` que exibe o histórico de fechamentos anteriores com filtros por período e operador. Permite consultar detalhes de qualquer turno passado e exportar o relatório Z correspondente. Somente leitura — nenhum dado pode ser alterado.

## Layout — Modal (w-[820px])

```
┌────────────────────────────────────────────────────────────┐
│ Header: "Histórico de Caixa"  [Filtros]           [✕]      │
├──────────────────────┬─────────────────────────────────────┤
│  Filtros + Lista     │  Detalhe do Fechamento               │
│  (w-[320px])         │  (flex-1)                            │
│  ─────────────────── │  ─────────────────────────────────── │
│  [Data início] [Fim] │  ReadonlyField: Operador, Data/Hora  │
│  [Select: Operador]  │  ReadonlyField: Total turno, Sangrias│
│  ─────────────────── │  ReadonlyField: Total líquido        │
│  Lista de fechamentos│  ─────────────────────────────────── │
│  ─────────────────── │  Tabela formas de pagamento:         │
│  • 20/05 – Ana – OK  │  Forma | Esperado | Contado | Dif.   │
│  • 19/05 – João      │  ─────────────────────────────────── │
│  • 19/05 – Ana       │  Banner diferença (se houver)        │
│  • 18/05 – Carlos    │  ─────────────────────────────────── │
│  • 18/05 – Ana       │  [Exportar Relatório Z ↓ PDF]        │
└──────────────────────┴─────────────────────────────────────┘
```

## Schema
`src/schemas/caixa.ts` — adicionar `HistoricoCaixaFiltroSchema`, `FechamentoCaixaDetalhe`

```ts
export const HistoricoCaixaFiltroSchema = z.object({
  data_inicio: z.string().optional(),
  data_fim:    z.string().optional(),
  operador_id: z.string().optional(),
})

export const FechamentoCaixaDetalheSchema = z.object({
  id:              z.string().uuid(),
  operador:        z.string(),
  abertura:        z.string(),   // ISO datetime
  fechamento:      z.string(),   // ISO datetime
  total_turno:     z.number(),   // centavos
  sangrias:        z.number(),   // centavos
  total_liquido:   z.number(),   // centavos
  diferenca:       z.number(),   // centavos (positivo = sobra, negativo = falta)
  motivo_diferenca: z.string().optional(),
  formas:          z.array(z.object({
    forma:    z.string(),
    esperado: z.number(),
    contado:  z.number(),
  })),
})

export type FechamentoCaixaDetalhe = z.infer<typeof FechamentoCaixaDetalheSchema>
```

## Mock Data

```ts
const OPERADORES_MOCK = ['Ana Oliveira', 'João Silva', 'Carlos Matos', 'Maria Santos']

const HISTORICO_MOCK: FechamentoCaixaDetalhe[] = [
  {
    id: 'caixa-001',
    operador: 'Ana Oliveira',
    abertura:  '2026-05-20T08:00:00',
    fechamento:'2026-05-20T17:30:00',
    total_turno: 532000,  // R$ 5.320,00
    sangrias:     20000,  // R$ 200,00
    total_liquido:512000, // R$ 5.120,00
    diferenca:      -500, // -R$ 5,00
    motivo_diferenca: undefined,
    formas: [
      { forma: 'Dinheiro', esperado: 134000, contado: 133500 },
      { forma: 'Débito',   esperado: 120000, contado: 120000 },
      { forma: 'Crédito',  esperado: 156000, contado: 156000 },
      { forma: 'Pix',      esperado:  90000, contado:  90000 },
      { forma: 'PBM',      esperado:  32000, contado:  32000 },
    ],
  },
  {
    id: 'caixa-002',
    operador: 'João Silva',
    abertura:  '2026-05-19T14:00:00',
    fechamento:'2026-05-19T22:00:00',
    total_turno: 287500,
    sangrias:      5000,
    total_liquido: 282500,
    diferenca:         0,
    formas: [
      { forma: 'Dinheiro', esperado: 98000,  contado: 98000  },
      { forma: 'Débito',   esperado: 75000,  contado: 75000  },
      { forma: 'Pix',      esperado: 114500, contado: 114500 },
    ],
  },
  {
    id: 'caixa-003',
    operador: 'Ana Oliveira',
    abertura:  '2026-05-19T08:00:00',
    fechamento:'2026-05-19T14:00:00',
    total_turno: 198000,
    sangrias:         0,
    total_liquido: 198000,
    diferenca:      2000, // sobra R$ 20,00
    motivo_diferenca: 'Troco arredondado por cliente',
    formas: [
      { forma: 'Dinheiro', esperado: 45000, contado: 47000 },
      { forma: 'Pix',      esperado: 153000,contado: 153000},
    ],
  },
  {
    id: 'caixa-004',
    operador: 'Carlos Matos',
    abertura:  '2026-05-18T08:00:00',
    fechamento:'2026-05-18T17:00:00',
    total_turno: 412000,
    sangrias:     15000,
    total_liquido: 397000,
    diferenca:      -200, // -R$ 2,00
    formas: [
      { forma: 'Dinheiro', esperado: 88000, contado: 87800 },
      { forma: 'Débito',   esperado: 165000,contado: 165000},
      { forma: 'Crédito',  esperado: 105000,contado: 105000},
      { forma: 'Pix',      esperado:  54000,contado:  54000},
    ],
  },
  {
    id: 'caixa-005',
    operador: 'Maria Santos',
    abertura:  '2026-05-17T08:00:00',
    fechamento:'2026-05-17T17:00:00',
    total_turno: 345000,
    sangrias:         0,
    total_liquido: 345000,
    diferenca:         0,
    formas: [
      { forma: 'Dinheiro', esperado: 72000, contado: 72000 },
      { forma: 'Pix',      esperado: 273000,contado: 273000},
    ],
  },
]
```

## Config Tables

```ts
// Cor da diferença na lista e no detalhe
function getDiferencaCls(diferenca: number): string {
  if (diferenca === 0)  return 'text-success-600'
  if (diferenca > 0)    return 'text-brand-700'    // sobra
  return 'font-semibold text-danger-700'             // falta
}

// Badge de status na lista
function getDiferencaBadge(diferenca: number): { label: string; bg: string; text: string } {
  if (diferenca === 0)  return { label: '● OK',     bg: 'bg-brand-75',   text: 'text-success-600'  }
  if (Math.abs(diferenca) <= 5000) // até R$ 50
                        return { label: '⚠ Diferença', bg: 'bg-warning-50',text: 'text-warning-800' }
  return                       { label: '✗ Divergência',bg: 'bg-danger-50', text: 'text-danger-700'  }
}
```

## Estado

```ts
// Estado do modal na FechamentoCaixaPage
const [historicoOpen, setHistoricoOpen] = useState(false)

// Estado interno do modal
const [filtroInicio, setFiltroInicio] = useState('')
const [filtroFim,    setFiltroFim]    = useState('')
const [filtroOperador, setFiltroOperador] = useState('')
const [selecionado, setSelecionado] = useState<FechamentoCaixaDetalhe | null>(null)
const [exportando, setExportando] = useState(false)

// Derivados
const listaFiltrada = useMemo(() =>
  HISTORICO_MOCK.filter((h) => {
    if (filtroOperador && h.operador !== filtroOperador) return false
    if (filtroInicio && h.fechamento < filtroInicio) return false
    if (filtroFim    && h.fechamento > filtroFim + 'T23:59:59') return false
    return true
  }), [filtroOperador, filtroInicio, filtroFim]
)
```

## Estrutura do Modal (JSX)

```
ModalHistoricoCaixa
├── Overlay <button> (fecha modal)
├── Card 820px
│   ├── Header: título + [✕ fechar]
│   ├── Corpo (flex, min-h-0, flex-1)
│   │   ├── Coluna esquerda (320px shrink-0)
│   │   │   ├── Filtros: data início + data fim + select operador
│   │   │   └── Lista de fechamentos (overflow-y-auto)
│   │   │       └── Item: [badge diferença] Nome – Data/hora – Total
│   │   └── Coluna direita (flex-1)
│   │       ├── Estado vazio: "Selecione um fechamento"
│   │       └── Detalhe (quando selecionado ≠ null)
│   │           ├── ReadonlyField × 4 (operador, período, total, diferença)
│   │           ├── Tabela formas de pagamento
│   │           ├── Banner diferença (se |diferença| > 0)
│   │           └── [Exportar Relatório Z]
```

## Gatilho na FechamentoCaixaPage

```tsx
// Link/botão no rodapé da página ou no header
<button type="button" onClick={() => setHistoricoOpen(true)}
  className="flex items-center gap-1.5 text-[12px] font-medium text-brand-700 underline-offset-2 hover:underline">
  Ver histórico de caixa
</button>

{historicoOpen && (
  <ModalHistoricoCaixa onClose={() => setHistoricoOpen(false)} />
)}
```

## Exportar Relatório Z

```tsx
const handleExportarZ = async (id: string) => {
  setExportando(true)
  try {
    // TODO: integrar com API — GET /api/v1/pdv/caixa/{id}/relatorio-z → blob PDF
    await new Promise((r) => setTimeout(r, 900)) // mock
    // Download do arquivo gerado
  } finally {
    setExportando(false)
  }
}
```

## API Endpoints

```ts
// TODO: integrar com API — GET /api/v1/pdv/caixa/historico?data_inicio=&data_fim=&operador_id=&page=
// TODO: integrar com API — GET /api/v1/pdv/caixa/{id}/detalhe
// TODO: integrar com API — GET /api/v1/pdv/caixa/{id}/relatorio-z  → blob PDF
```

## Verificação

- [ ] Modal abre ao clicar "Ver histórico de caixa" na FechamentoCaixaPage
- [ ] Filtro por período filtra a lista corretamente
- [ ] Filtro por operador filtra a lista corretamente
- [ ] Clicar em item da lista seleciona e exibe detalhe na coluna direita
- [ ] Badge de diferença usa a cor correta (ok / alerta / divergência)
- [ ] Banner de diferença aparece no detalhe apenas quando `diferença !== 0`
- [ ] Botão "Exportar" fica `disabled` + spinner durante exportação
- [ ] Coluna direita exibe estado vazio quando nada selecionado
- [ ] Modal fecha corretamente pelo overlay e pelo botão [✕]
