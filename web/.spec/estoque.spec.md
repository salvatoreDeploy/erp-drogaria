---
modulo: estoque
rota: /estoque
pagina: EstoquePage
status: ✅ Implementado (2026-05-10)
schema: src/schemas/estoque.ts
layout: duas-colunas
referencia: —
---

# Estoque — Spec

## Propósito
Visualização do estoque atual com filtros por status, busca por produto e painel de reposição sugerida. Perfis: todos.

## Layout — Duas colunas

```
┌────────────────────────────────────┬───────────────┐
│ Header: título + filtros + busca   │               │
├────────────────────────────────────┤  Painel       │
│ Tabela de produtos:                │  Direito      │
│ Produto | Estoque | Validade |     │  (w-82.5)     │
│ Lote | SNGPC | Status | [Ações]    │               │
│                                    │  Reposição    │
│ ← scroll interno (overflow-y-auto) │  sugerida     │
│                                    │  (3 items)    │
└────────────────────────────────────┴───────────────┘
```

## Schema
`src/schemas/estoque.ts` — `EstoqueItem`, `EstoqueStatus`, `SngpcStatus`, `ModalReposicaoSchema`, `ModalTransferenciaSchema`

## Mock Data

**5 produtos:**
```ts
const ITEMS = [
  { produto: 'Losartana 50mg',   estoque: 124, minimo: 80,  status: 'saudavel', sngpc: 'OK'      },
  { produto: 'Dipirona 500mg',   estoque: 18,  minimo: 40,  status: 'alerta',   sngpc: 'OK'      },
  { produto: 'Morfina 10mg',     estoque: 7,   minimo: 12,  status: 'critico',  sngpc: 'Pendente'},
  { produto: 'Seringa 10ml',     estoque: 21,  minimo: 60,  status: 'comprar',  sngpc: 'N/A'     },
  { produto: 'Amoxicilina 500mg',estoque: 53,  minimo: 30,  status: 'saudavel', sngpc: 'OK'      },
]
```

**3 itens de reposição:**
```ts
const REORDER_ITEMS = [
  { produto: 'Losartana 50mg',   descricao: 'Estoque mínimo atingido',    pct: 20, variant: 'normal'  },
  { produto: 'Seringa 10ml',     descricao: 'Pedido sugerido: 120 un.',    pct: 35, variant: 'normal'  },
  { produto: 'Dipirona 500mg',   descricao: 'Vence em 18 dias',           pct: 45, variant: 'warning' },
]
```

**Fornecedores (modal reposição):** Cristália, EMS, Eurofarma, Hypermarcas, Aché
**Filiais (modal transferência):** Filial Centro, Filial Norte, Filial Sul, Matriz

## Config Tables

```ts
const STATUS_CONFIG: Record<EstoqueStatus, { rowBg, label, cls }> = {
  saudavel: { rowBg: 'bg-[#FBFCFB]', label: 'Saudável', cls: 'text-success-600'        },
  alerta:   { rowBg: 'bg-warning-50', label: 'Alerta',   cls: 'font-bold text-warning-700' },
  critico:  { rowBg: 'bg-danger-50',  label: 'Crítico',  cls: 'font-bold text-danger-700'  },
  comprar:  { rowBg: 'bg-[#FBFCFB]', label: 'Comprar',  cls: 'font-bold text-brand-700'   },
}
```

## Estado

```ts
type FilterTab = 'todos' | 'criticos' | 'controlados'

const [filtro, setFiltro] = useState<FilterTab>('todos')
const [busca, setBusca] = useState('')
const [sortByValidade, setSortByValidade] = useState(false)
const [reposicaoItem, setReposicaoItem] = useState<EstoqueItem | null>(null)
const [transferenciaItem, setTransferenciaItem] = useState<EstoqueItem | null>(null)
```

## Colunas da Tabela

```
grid-cols-[minmax(0,2fr)_80px_100px_90px_70px_100px_96px]
Produto | Estoque | Validade | Lote | SNGPC | Status | [Ações]
```

Coluna Ações (96px): botão "Repor" para `critico`/`comprar` + botão "Transferir" para todos.

## Fluxo de Filtros

```ts
const FILTER_TABS = [
  { id: 'todos',       label: 'Todos'        },
  { id: 'criticos',   label: 'Críticos'      },
  { id: 'controlados', label: 'Controlados'  },
]
// Toggle validade: sortByValidade → ordena por validade_dias asc
```

## Modais

### ModalReposicao
Campos: select fornecedor + quantidade (pré-preenchida `max(0, minimo - estoque)`) + observação.
`canSubmit = fornecedor !== '' && quantidade > 0`
```ts
// TODO: POST /api/v1/estoque/reposicao/solicitar { produto_id, fornecedor, quantidade, observacao }
```

### ModalTransferencia
Campos: select filial + quantidade (max: estoque atual) + select motivo.
```ts
const MOTIVOS_TRANSFERENCIA = ['Rebalanceamento de estoque', 'Ajuste de inventário', 'Solicitação emergencial', 'Outro motivo']
// TODO: POST /api/v1/estoque/transferencia { produto_id, filial_destino, quantidade, motivo }
```

## Painel Direito — Reposição Sugerida

Cards de progress bar por produto. Variant `warning` → barra `bg-warning-600` sobre `bg-warning-100`.
Link "Ajuste de estoque" → `/estoque/ajuste`.

## API Endpoints

```ts
// TODO: GET /api/v1/estoque?filter=todos&search= → EstoqueItem[]
// TODO: GET /api/v1/estoque/repor → reorder list
// TODO: POST /api/v1/estoque/reposicao/solicitar
// TODO: POST /api/v1/estoque/transferencia
```

## Verificação

- [ ] Filtro "Críticos" mostra apenas status `critico`
- [ ] Filtro "Controlados" mostra apenas `controlado: true`
- [ ] Toggle "Por validade ↑" ordena por `validade_dias` crescente
- [ ] Botão "Repor" só aparece para status `critico` ou `comprar`
- [ ] Quantidade sugerida no modal = `Math.max(0, minimo - estoque)`
- [ ] Progress bar variant warning usa cores warning

## Refinamentos Pendentes

| Change | Prioridade | Descrição | Status |
|---|---|---|---|
| [CHANGE-EST-001](./changes/CHANGE-EST-001.md) | P1 | Botão "Nova Entrada" no Estoque — CTA que navega para `/estoque/ajuste` ou abre mini-wizard inline | ⬜ pending |
| [CHANGE-EST-004](./changes/CHANGE-EST-004.md) | P2 | Botão "Revisar Agora" — Alertas de estoque mínimo atingido no painel direito com ação direta | ⬜ pending |
| [CHANGE-EST-005](./changes/CHANGE-EST-005.md) | P2 | Solicitar Reposição em Lote — seleção múltipla na tabela e envio batch para fornecedor | ⬜ pending |
| [CHANGE-EST-006](./changes/CHANGE-EST-006.md) | P2 | Confirmar Transferência no Destino — tela/modal de confirmação de recebimento na filial destino | ⬜ pending |
| [CHANGE-EST-007](./changes/CHANGE-EST-007.md) | P2 | Botão "Conferir Agora" (Pós-Recebimento) — após NF-e entrada, link direto para conferência de lote | ⬜ pending |
| [CHANGE-EST-008](./changes/CHANGE-EST-008.md) | P3 | Exportar Relatório de Estoque — botão na barra de ações, formatos PDF/Excel, filtros aplicados | ⬜ pending |
| [CHANGE-EST-009](./changes/CHANGE-EST-009.md) | P3 | Importar CSV de Estoque — modal 2 etapas: upload/preview → confirmar (padrão ModalImportCSV) | ⬜ pending |

### O que cada change adiciona a esta tela

**CHANGE-EST-001** adiciona o botão "Nova Entrada" na barra de ações da `EstoquePage`, conectando ao ajuste manual em `/estoque/ajuste` ou abrindo um wizard inline para lançamento rápido de entrada por NF-e.

**CHANGE-EST-004** melhora o painel direito de reposição sugerida: cada card recebe um botão "Revisar Agora" que aciona o `ModalReposicao` já existente com o produto pré-selecionado, eliminando a necessidade de localizar o item na tabela.

**CHANGE-EST-005** estende o `ModalReposicao` para seleção múltipla: checkbox em cada linha `critico`/`comprar`, botão "Solicitar N itens" na barra, mock `POST /api/v1/estoque/reposicao/solicitar-lote`.

**CHANGE-EST-006** e **CHANGE-EST-007** complementam o ciclo de transferência e recebimento: EST-006 adiciona confirmação do lado destinatário; EST-007 adiciona o atalho pós-conferência de NF-e de entrada.

**CHANGE-EST-008** adiciona botão "Exportar" na barra de ações com select PDF/Excel e respeito aos filtros ativos (status + busca + categoria). Padrão async `handleExportar` com loading state.

**CHANGE-EST-009** adiciona `ModalImportCSV` (mesmo padrão de `CadastroProdutosPage`): drag & drop → preview 5 primeiros + erros de validação → confirmar importação em lote.

### Inventário (sub-fluxo próprio)

O fluxo de inventário físico tem spec e changes próprios:
- Spec: `.spec/estoque-inventario.spec.md`
- Changes: [CHANGE-EST-002](./changes/CHANGE-EST-002.md) (wizard inline) + [CHANGE-EST-003](./changes/CHANGE-EST-003.md) (lógica de divergências/RN-05)
