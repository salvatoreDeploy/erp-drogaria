---
modulo: estoque-inventario
rota: /estoque
pagina: EstoquePage
status: ⬜ Pendente
schema: src/schemas/estoque.ts
layout: wizard-2-etapas-inline
referencia: EstoquePage.tsx + AjusteEstoquePage.tsx
change-refs: [CHANGE-EST-002, CHANGE-EST-003]
---

# Estoque — Inventário (Wizard Inline)

## Propósito
Fluxo de inventário físico embutido na `EstoquePage` — sem nova rota. Permite ao operador configurar o escopo (geral ou por categoria) e o modo (cego ou com saldo visível), registrar contagens físicas por produto/lote e salvar os ajustes resultantes. Divergência > 5% exige aprovação de farmacêutico (RN-05).

## Layout — Wizard 2 etapas (substitui tabela principal)

### Etapa 1 — Configuração

```
┌─────────────────────────────────────────────────────┐
│ Header: "Inventário em andamento"  [badge Etapa 1/2] │
│         [Cancelar inventário]                        │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │ Escopo do inventário                         │    │
│  │  ○ Inventário geral (todos os produtos)      │    │
│  │  ○ Por categoria: [select categoria]         │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │ Modo de contagem                             │    │
│  │  ○ Cego (operador não vê saldo do sistema)   │    │
│  │  ○ Com saldo visível                         │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  [Banner info — modo cego]                           │
│  "No modo cego o operador não vê o saldo atual,      │
│   garantindo uma contagem imparcial."                │
│                                                      │
│                     [Iniciar contagem →]             │
└─────────────────────────────────────────────────────┘
```

### Etapa 2 — Contagem

```
┌─────────────────────────────────────────────────────────┐
│ Header: "Inventário em andamento"  [badge Etapa 2/2]     │
│         [← Voltar config]   [Salvar rascunho]            │
├─────────────────────────────────────────────────────────┤
│ Progresso: 8/12 itens contados  ███████░░░░             │
├─────────────────────────────────────────────────────────┤
│ Tabela de contagem:                                      │
│ Produto | Lote | Val. | [Saldo Sistema] | Qtd Contada   │
│                         (oculto se cego)                 │
│                                                          │
│ Cada linha: input numérico para Qtd Contada              │
│ Linhas contadas: checkmark verde                         │
├─────────────────────────────────────────────────────────┤
│ [Ver divergências (N)] — aparece quando há ≥1 contagem   │
│                                                          │
│               [Finalizar e ver ajustes →]                │
└─────────────────────────────────────────────────────────┘
```

### Etapa 2b — Divergências (painel deslizante ou modal)

```
┌──────────────────────────────────────────────────────────┐
│  Resumo de divergências  (N produtos)                     │
│  ─────────────────────────────────────────────────────── │
│  Produto | Saldo Sistema | Contado | Diferença | % Dif.   │
│  ─────────────────────────────────────────────────────── │
│  Morfina 10mg    | 12  | 10 | -2  | -16.7% ← critico     │
│  Dipirona 500mg  | 18  | 20 | +2  | +11.1% ← warning     │
│  ─────────────────────────────────────────────────────── │
│  [Banner danger se any |%| > 5%]                          │
│  "Divergência > 5% detectada. Aprovação de farmacêutico  │
│   obrigatória antes de salvar (RN-05)."                   │
│  ─────────────────────────────────────────────────────── │
│  Motivo do ajuste: [select] [campo livre]                 │
│  ─────────────────────────────────────────────────────── │
│       [Cancelar]          [Salvar ajuste]                 │
└──────────────────────────────────────────────────────────┘
```

## Schema
`src/schemas/estoque.ts` — adicionar:

```ts
export const EscopoInventarioSchema  = z.enum(['geral', 'por_categoria'])
export const ModoInventarioSchema    = z.enum(['cego', 'com_saldo'])
export const StatusInventarioSchema  = z.enum(['rascunho', 'em_andamento', 'aguardando_aprovacao', 'finalizado'])

export const ItemInventarioSchema = z.object({
  produto_id:    z.string(),
  produto_nome:  z.string(),
  lote:          z.string(),
  validade:      z.string(),
  qtd_sistema:   z.number().int().nonnegative(),
  qtd_contada:   z.number().int().nonnegative().nullable(),  // null = ainda não contado
  motivo:        z.string().optional(),
})

export const InventarioSchema = z.object({
  id:            z.string().uuid(),
  escopo:        EscopoInventarioSchema,
  categoria_id:  z.string().optional(),
  modo:          ModoInventarioSchema,
  status:        StatusInventarioSchema,
  iniciado_em:   z.string(),
  itens:         z.array(ItemInventarioSchema),
})

export const AjusteInventarioSchema = z.object({
  inventario_id: z.string().uuid(),
  motivo:        z.string().min(5, 'Motivo obrigatório (mínimo 5 caracteres)'),
  motivo_detalhe: z.string().optional(),
})

export type ItemInventario   = z.infer<typeof ItemInventarioSchema>
export type Inventario       = z.infer<typeof InventarioSchema>
export type AjusteInventario = z.infer<typeof AjusteInventarioSchema>
```

## Mock Data

```ts
const CATEGORIAS_MOCK = ['Analgésicos', 'Antibióticos', 'Antihipertensivos', 'Vitaminas', 'Material hospitalar']

const MOTIVOS_AJUSTE = [
  'Erro de contagem anterior',
  'Quebra / avaria',
  'Produto vencido retirado',
  'Roubo ou furto',
  'Divergência de lote',
  'Outro (especificar)',
]

// 12 itens para inventário mock — mistura de contados/não contados
const ITENS_INVENTARIO_MOCK: ItemInventario[] = [
  { produto_id: 'p001', produto_nome: 'Dipirona 500mg',    lote: 'L2024A', validade: '12/2026', qtd_sistema: 18, qtd_contada: null },
  { produto_id: 'p002', produto_nome: 'Losartana 50mg',    lote: 'L2024B', validade: '08/2026', qtd_sistema: 124,qtd_contada: null },
  { produto_id: 'p003', produto_nome: 'Morfina 10mg',      lote: 'L2023C', validade: '03/2025', qtd_sistema: 12, qtd_contada: null },
  { produto_id: 'p004', produto_nome: 'Amoxicilina 500mg', lote: 'L2024D', validade: '06/2026', qtd_sistema: 53, qtd_contada: null },
  { produto_id: 'p005', produto_nome: 'Omeprazol 20mg',    lote: 'L2024E', validade: '09/2026', qtd_sistema: 87, qtd_contada: null },
  { produto_id: 'p006', produto_nome: 'Atorvastatina 20mg',lote: 'L2024F', validade: '11/2026', qtd_sistema: 42, qtd_contada: null },
  { produto_id: 'p007', produto_nome: 'Metformina 850mg',  lote: 'L2024G', validade: '07/2026', qtd_sistema: 95, qtd_contada: null },
  { produto_id: 'p008', produto_nome: 'Vitamina D3 2000UI',lote: 'L2024H', validade: '02/2027', qtd_sistema: 200,qtd_contada: null },
  { produto_id: 'p009', produto_nome: 'Seringa 10ml',      lote: 'N/A',    validade: 'N/A',     qtd_sistema: 21, qtd_contada: null },
  { produto_id: 'p010', produto_nome: 'Ibuprofeno 600mg',  lote: 'L2024I', validade: '10/2026', qtd_sistema: 67, qtd_contada: null },
  { produto_id: 'p011', produto_nome: 'Captopril 25mg',    lote: 'L2024J', validade: '05/2026', qtd_sistema: 33, qtd_contada: null },
  { produto_id: 'p012', produto_nome: 'Fluoxetina 20mg',   lote: 'L2024K', validade: '04/2026', qtd_sistema: 28, qtd_contada: null },
]
```

## Config Tables

```ts
// Cor da célula de diferença
function getDifCls(pct: number): string {
  if (pct === 0)        return 'text-success-600'
  if (Math.abs(pct) <= 5)  return 'text-warning-700 font-semibold'
  return 'text-danger-700 font-bold'
}

// Cor da linha na tabela de divergências
function getDivRowBg(pct: number): string {
  if (Math.abs(pct) > 5)  return 'bg-danger-50'
  if (Math.abs(pct) > 0)  return 'bg-warning-50'
  return 'bg-[#FBFCFB]'
}

// Badge de status do inventário
const STATUS_INVENTARIO_CFG: Record<string, { label: string; bg: string; text: string }> = {
  rascunho:             { label: '● Rascunho',              bg: 'bg-neutral-50',  text: 'text-neutral-500'  },
  em_andamento:         { label: '● Em andamento',           bg: 'bg-brand-75',    text: 'text-brand-750'    },
  aguardando_aprovacao: { label: '⚠ Aguardando farmacêutico',bg: 'bg-warning-50',  text: 'text-warning-800'  },
  finalizado:           { label: '✓ Finalizado',             bg: 'bg-brand-25',    text: 'text-success-600'  },
}
```

## Estado

```ts
type InventarioStep = 'config' | 'contagem' | 'divergencias'

const [invStep, setInvStep]           = useState<InventarioStep | null>(null)  // null = inventário inativo
const [escopo, setEscopo]             = useState<'geral' | 'por_categoria'>('geral')
const [categoriaId, setCategoriaId]   = useState('')
const [modo, setModo]                 = useState<'cego' | 'com_saldo'>('cego')
const [itens, setItens]               = useState<ItemInventario[]>(ITENS_INVENTARIO_MOCK)
const [motivo, setMotivo]             = useState('')
const [motivoDetalhe, setMotivoDetalhe] = useState('')
const [salvandoAjuste, setSalvandoAjuste] = useState(false)

// Derivados
const totalItens     = itens.length
const contados       = itens.filter((i) => i.qtd_contada !== null)
const divergencias   = contados.filter((i) => i.qtd_contada !== i.qtd_sistema)
const temCritico     = divergencias.some((i) => {
  const pct = Math.abs((i.qtd_contada! - i.qtd_sistema) / Math.max(i.qtd_sistema, 1)) * 100
  return pct > 5
})

// Atualizar contagem de um item
function setQtdContada(produtoId: string, qty: number) {
  setItens((prev) => prev.map((i) => i.produto_id === produtoId ? { ...i, qtd_contada: qty } : i))
}
```

## Fluxo de Ativação

```tsx
// Na barra de ações da EstoquePage — botão "Iniciar Inventário"
// Visível apenas quando invStep === null
<button type="button" onClick={() => setInvStep('config')}
  className="flex h-8 items-center gap-1.5 rounded-xl border border-brand-200 bg-white px-3
             font-medium text-[12px] text-brand-700 hover:bg-brand-50">
  + Iniciar Inventário
</button>

// Quando invStep !== null: wizard substitui a tabela normal
{invStep === null && <TabelaEstoqueNormal />}
{invStep === 'config'      && <EtapaConfigInventario />}
{invStep === 'contagem'    && <EtapaContagemInventario />}
{invStep === 'divergencias'&& <EtapaDivergencias />}
```

## Regra RN-05

```ts
// Divergência > 5% → exige aprovação de farmacêutico
if (temCritico) {
  // Banner danger na etapa de divergências
  // Botão "Salvar ajuste" desabilitado COM tooltip explicativo
  // TODO: integrar com API — POST /api/v1/estoque/inventario/{id}/solicitar-aprovacao
}
```

## API Endpoints

```ts
// TODO: integrar com API — POST /api/v1/estoque/inventario/iniciar { escopo, categoria_id?, modo }
// TODO: integrar com API — PATCH /api/v1/estoque/inventario/{id}/item { produto_id, qtd_contada }
// TODO: integrar com API — POST /api/v1/estoque/inventario/{id}/rascunho
// TODO: integrar com API — POST /api/v1/estoque/inventario/{id}/finalizar { motivo, motivo_detalhe }
// TODO: integrar com API — POST /api/v1/estoque/inventario/{id}/solicitar-aprovacao (quando temCritico)
// TODO: integrar com API — GET /api/v1/estoque/inventario/ativo → inventario em andamento, se houver
```

## Verificação

- [ ] Botão "Iniciar Inventário" só aparece quando não há inventário em andamento
- [ ] Modo "Cego" oculta a coluna "Saldo Sistema" na tabela de contagem
- [ ] Progressbar reflete `contados.length / totalItens`
- [ ] Célula de qtd contada aceita apenas números inteiros ≥ 0
- [ ] Etapa de divergências só mostra itens com `qtd_contada !== qtd_sistema`
- [ ] Divergência > 5%: banner danger + botão "Salvar ajuste" desabilitado (RN-05)
- [ ] Motivo obrigatório (`min: 5 chars`) antes de habilitar "Salvar ajuste"
- [ ] "Cancelar inventário" retorna ao estado normal (invStep = null)
- [ ] Salvando ajuste: botão com spinner + `disabled` para evitar duplo clique
