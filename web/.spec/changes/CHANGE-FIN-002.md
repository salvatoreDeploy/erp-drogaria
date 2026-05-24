---
id: CHANGE-FIN-002
task: TASK-FIN-002
prioridade: P2
status: pending
modulo: financeiro
pagina: FinanceiroPage
arquivos:
  - src/pages/FinanceiroPage.tsx
  - src/schemas/financeiro.ts
spec: .spec/financeiro.spec.md
depende-de: []
---

# CHANGE-FIN-002 — Histórico Mensal Financeiro

## Contexto
A tela financeira mostra apenas o mês atual — gestores não conseguem consultar meses anteriores sem relatórios externos.

## O que implementar
- [ ] Navegação: `← Abril 2026 | Maio 2026 | →` no header (mês futuro desabilitado)
- [ ] Cards de resumo por mês: Receitas · Despesas · Saldo · A Receber
- [ ] Gráfico simples: barras de receitas vs. despesas por semana (mock data)
- [ ] Tabela de lançamentos do mês selecionado com filtros
- [ ] Meses anteriores → somente leitura (sem botão "Baixar" ou "Nova conta")
- [ ] Mês atual → comportamento normal (botões habilitados)
- [ ] Estado `mesSelecionado: { mes: number; ano: number }`

## Arquivos alvo

| Arquivo | O que muda |
|---|---|
| `src/pages/FinanceiroPage.tsx` | `NavegadorMes` + lógica somente-leitura + filtragem por mês |
| `src/schemas/financeiro.ts` | `HistoricoMensalSchema` |

## TODOs de API
```
// TODO: integrar com API — GET /api/v1/financeiro/historico-mensal?mes=5&ano=2026
// TODO: integrar com API — GET /api/v1/financeiro/grafico-semanal?mes=5&ano=2026
```

## Referência CLAUDE.md
- Regra: meses anteriores somente leitura (§2.4 > FIN-RX-01)
- Progress bars para visualização de receita vs. despesa

## Resultado
*(preencher após implementação)*
