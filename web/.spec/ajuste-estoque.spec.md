---
modulo: ajuste-estoque
rota: /estoque/ajuste
pagina: AjusteEstoquePage
status: ✅ Implementado (2026-05-10)
schema: src/schemas/estoque.ts
layout: coluna-unica
referencia: —
---

# Ajuste de Estoque (Inventário) — Spec

## Propósito
Inventário físico: farmacêutico conta os produtos e informa a quantidade real. Sistema calcula divergência e exige motivo para diferenças. Divergência > 5% entra em "revisão".

## Layout — Coluna única

```
┌──────────────────────────────────────────────────────┐
│ Header: título + data inventário + filtros + [Salvar] │
├──────────────────────────────────────────────────────┤
│ Stats ao vivo: contados / com divergência /          │
│                aprovados / pendentes / R$ ajustado   │
├──────────────────────────────────────────────────────┤
│ Tabela inventário (overflow-y-auto flex-1):          │
│ Produto | Lote | Validade | Qtd Sistema | Qtd Cont.  │
│ Diferença | Motivo | Status                          │
│ (células Qtd Contada e Motivo editáveis inline)      │
├──────────────────────────────────────────────────────┤
│ Rodapé: checklist de validação + botão Confirmar     │
└──────────────────────────────────────────────────────┘
```

## Schema
`src/schemas/estoque.ts` — `AjusteBaseItemSchema`, `AjusteStatus`

## Mock Data

```ts
const BASE_ITEMS = [
  { id: 1, produto: 'Losartana 50mg',    lote: 'L-1044', validade: '62 dias', qtdSistema: 124, preco: 2.80,  categoria: 'Cardiovascular' },
  { id: 2, produto: 'Dipirona 500mg',    lote: 'D-2291', validade: '18 dias', qtdSistema: 18,  preco: 4.20,  categoria: 'Analgésico'    },
  { id: 3, produto: 'Amoxicilina 500mg', lote: 'A-5561', validade: '34 dias', qtdSistema: 53,  preco: 12.40, categoria: 'Antibiótico'   },
  { id: 4, produto: 'Morfina 10mg',      lote: 'C-8920', validade: '9 dias',  qtdSistema: 21,  preco: 65.00, categoria: 'Controlado'    },
  { id: 5, produto: 'Seringa 10ml',      lote: 'P-7812', validade: 'N/A',     qtdSistema: 21,  preco: 1.90,  categoria: 'Material'      },
]

const CATEGORIAS = ['Cardiovascular', 'Analgésico', 'Antibiótico', 'Controlado', 'Material']
const MOTIVO_OPTIONS = ['produto_vencido', 'avaria', 'furto', 'erro_entrada', 'devolucao', 'transferencia']

// Estado inicial espelha design (linha 1 e 5 ok; 2 pendente; 3 aprovado; 4 revisão)
const INITIAL_EDITS: Record<number, { qtdContada: string; motivo: string }> = {
  1: { qtdContada: '124', motivo: '' },
  2: { qtdContada: '16',  motivo: '' },
  3: { qtdContada: '23',  motivo: 'produto_vencido' },
  4: { qtdContada: '6',   motivo: 'avaria' },
  5: { qtdContada: '21',  motivo: '' },
}
```

## Config Tables

```ts
const STATUS_CFG: Record<AjusteStatus, { label, bg, text }> = {
  ok:       { label: '● OK',       bg: 'bg-brand-75',  text: 'text-brand-750'   },
  pendente: { label: '● Pendente', bg: 'bg-warning-50', text: 'text-warning-800' },
  aprovado: { label: '● Aprovado', bg: 'bg-brand-75',  text: 'text-brand-750'   },
  revisao:  { label: '✗ Revisão',  bg: 'bg-danger-50',  text: 'text-danger-700'  },
}

const ROW_BG: Record<AjusteStatus, string> = {
  ok:       'bg-[#FBFCFB]',
  aprovado: 'bg-[#FBFCFB]',
  pendente: 'bg-warning-50',
  revisao:  'bg-danger-50',
}
```

## Estado

```ts
const [edits, setEdits] = useState<Edits>(INITIAL_EDITS)
const [dataInventario, setDataInventario] = useState(new Date().toISOString().split('T')[0])
const [soComDivergencia, setSoComDivergencia] = useState(false)
const [categoria, setCategoria] = useState('')
const [inventarioIniciado, setInventarioIniciado] = useState(true)
```

## Métricas (useMemo)

```ts
const stats = useMemo(() => ({
  contados:       rows.length,
  comDivergencia: rows.filter(r => r.diff !== 0).length,
  aprovados:      rows.filter(r => r.status === 'aprovado').length,
  pendentes:      rows.filter(r => r.status === 'pendente' || r.status === 'revisao').length,
  valorAjustado:  rows.reduce((sum, r) => sum + Math.abs(r.diff) * r.preco, 0),
}), [rows])
```

## Lógica de Status

```ts
function calcStatus(qtdSistema, qtdContada, motivo): AjusteStatus {
  const diff = qtdContada - qtdSistema
  if (diff === 0) return 'ok'
  if (!motivo) return 'pendente'
  if (motivo === 'produto_vencido') return 'aprovado'
  return Math.abs(diff / qtdSistema) > 0.05 ? 'revisao' : 'aprovado'
}
```

Divergência > 5% (exceto `produto_vencido`) → `revisao` (requer aprovação farmacêutico).

## Colunas da Tabela

```
grid-cols-[minmax(0,1fr)_80px_80px_90px_110px_80px_minmax(160px,auto)_120px]
Produto | Lote | Validade | Qtd Sistema | Qtd Contada* | Diferença | Motivo* | Status
* campos editáveis inline
```

## API Endpoints

```ts
// TODO: GET /api/v1/estoque?inventario=true → itens com qtd_sistema
// TODO: POST /api/v1/estoque/inventario { data, itens[] } → protocolo ajuste
```

## Verificação

- [ ] `useMemo` recalcula stats ao editar qualquer célula
- [ ] Toggle "Só divergências" filtra linhas com `diff !== 0`
- [ ] Filtro por categoria funciona isoladamente e combinado com toggle
- [ ] `temRevisao` bloqueia botão "Confirmar ajuste" enquanto houver linhas revisao
- [ ] Motivo "produto_vencido" → status `aprovado` mesmo com divergência grande
- [ ] Diferença colorida: positivo verde, negativo vermelho, zero neutro
