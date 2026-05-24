---
modulo: financeiro
rota: /financeiro
pagina: FinanceiroPage
status: ✅ Implementado (2026-05-18)
schema: src/schemas/financeiro.ts
layout: duas-colunas
referencia: EstoquePage.tsx (duas colunas com painel direito)
---

# Financeiro — Spec

## Propósito
Visualização e baixa de contas a pagar geradas automaticamente pela entrada de NF-e. Perfis: `farmaceutico`, `admin`.

## Layout — Duas colunas

```
┌────────────────────────────────────┬───────────────┐
│ Header: título + filtros           │  Painel       │
├────────────────────────────────────┤  Direito      │
│ Tabela: Fornecedor | Valor |       │  (w-82.5)     │
│         Vencimento | Status | [↓]  │               │
│                                    │  Métricas 4x  │
│ ← scroll interno                   │  Botão baixa  │
└────────────────────────────────────┴───────────────┘
```

**Esquerda:** header com filtros (status + fornecedor + período) + tabela paginada
**Direita:** grid 4 métricas + card da conta selecionada + botão "Registrar baixa"

## Schema
`src/schemas/financeiro.ts`

**Tipos principais:**
- `ContaPagar` — id, nfe_entrada_id?, fornecedor_id, fornecedor_nome, descricao?, valor (centavos), vencimento, status, paga_em?, forma_pagamento?, observacao?
- `ContaPagarStatus` = `'aberta' | 'paga' | 'atrasada' | 'cancelada'`
- `FormasPagamento` = `'dinheiro' | 'pix' | 'boleto' | 'debito' | 'credito' | 'cheque'`
- `BaixaContaPagar` — data_pagamento, forma_pagamento, observacao?
- `ResumoFinanceiro` — a_vencer_hoje, em_atraso, proximos_30d, total_aberto, total_pago_mes

## Mock Data

**15 contas a pagar:**
- 6 aberta (vencimento futuro)
- 4 atrasada (vencimento passado)
- 4 paga
- 1 cancelada
- Fornecedores: Plasma Sul, Medley, EMS, Cristália, Profarma
- Valores: R$890 a R$12.480

## Config Tables

```ts
const STATUS_CFG = {
  aberta:    { label: '● Em aberto',  bg: 'bg-brand-75',   text: 'text-brand-750'   },
  atrasada:  { label: '✗ Atrasada',   bg: 'bg-danger-50',  text: 'text-danger-700'  },
  paga:      { label: '✓ Paga',       bg: 'bg-brand-75',   text: 'text-success-600' },
  cancelada: { label: '— Cancelada',  bg: 'bg-neutral-50', text: 'text-neutral-500' },
}
```

## Estado Principal

```ts
const [contas, setContas] = useState<ContaPagar[]>(CONTAS_MOCK)
const [selecionada, setSelecionada] = useState<ContaPagar | null>(null)
const [baixaOpen, setBaixaOpen] = useState(false)
const [filtroStatus, setFiltroStatus] = useState<'todos'|'aberta'|'atrasada'|'paga'>('todos')
const [busca, setBusca] = useState('')
```

## ModalBaixaContaPagar

Campos: data_pagamento (input date, default hoje) + forma_pagamento (select) + observacao (textarea)
Botões: Cancelar | "Confirmar pagamento" (brand)
`handleBaixa(data)` → `setContas(prev => prev.map(c => c.id === selecionada.id ? {...c, status: 'paga', paga_em: data.data, forma_pagamento: data.forma} : c))`

## Métricas (useMemo)

```ts
const stats = useMemo(() => ({
  a_vencer_hoje: contas.filter(c => c.status === 'aberta' && c.vencimento === hoje).length,
  em_atraso:     contas.filter(c => c.status === 'atrasada').length,
  proximos_30d:  contas.filter(c => c.status === 'aberta').length,
  total_aberto:  contas.filter(c => ['aberta','atrasada'].includes(c.status)).reduce((s, c) => s + c.valor, 0),
}), [contas])
```

## Colunas da Tabela

```
grid-cols-[minmax(0,2fr)_minmax(0,1fr)_100px_90px_48px]
Fornecedor | NF-e ref. | Valor | Vencimento | Status | [↗]
```

## API Endpoints

```ts
// TODO: GET /api/v1/financeiro/resumo
// TODO: GET /api/v1/financeiro/contas-pagar?status=&fornecedor_id=&page=
// TODO: POST /api/v1/financeiro/contas-pagar/{id}/baixar
```

## Verificação

- [ ] Quality gate passa
- [ ] Filtro de status filtra a tabela corretamente
- [ ] Clicar na linha seleciona a conta no painel direito
- [ ] Botão "Registrar baixa" abre modal apenas se conta aberta/atrasada
- [ ] Após baixa, status muda para "paga" e métricas recalculam

## Refinamentos Pendentes

| Change | Prioridade | Descrição | Status |
|---|---|---|---|
| [CHANGE-FIN-001](./changes/CHANGE-FIN-001.md) | P2 | Exportar Relatório Financeiro — botão "Exportar" na barra com filtros aplicados, formatos PDF/Excel | ⬜ pending |
| [CHANGE-FIN-002](./changes/CHANGE-FIN-002.md) | P2 | Histórico Mensal Financeiro — modal com visão consolidada por mês: total pago, total em aberto, gráfico de barras simples | ⬜ pending |

### O que cada change adiciona a esta tela

**CHANGE-FIN-001** adiciona botão "Exportar" na barra de filtros da `FinanceiroPage`: select PDF/Excel + async `handleExportar` com loading state. O export respeita os filtros ativos (status + fornecedor + período). Padrão idêntico ao `RelatoriosPage`. Mock `POST /api/v1/financeiro/exportar`.

**CHANGE-FIN-002** adiciona `ModalHistoricoMensal` (w-[680px]) acessado por link "Ver histórico mensal" no painel direito: tabela read-only com totais mês a mês (pago, em aberto, atrasado), saldo acumulado e indicador de tendência. Spec detalhado no próprio change file com mock dos últimos 6 meses.
