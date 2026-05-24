---
id: CHANGE-FIN-001
task: TASK-FIN-001
prioridade: P2
status: pending
modulo: financeiro
pagina: FinanceiroPage
arquivos:
  - src/pages/FinanceiroPage.tsx
spec: .spec/financeiro.spec.md
depende-de: [CHANGE-FIN-002]
---

# CHANGE-FIN-001 — Exportar Relatório Financeiro

## Contexto
Sem exportação, gestores precisam copiar os dados do financeiro manualmente para controle externo.

## O que implementar
- [ ] Botão "Exportar" no header do módulo → `ModalExportarFinanceiro`
- [ ] Opções: formato (Excel/PDF), período (data início/fim), tipo (receitas/despesas/todos)
- [ ] Filtros: categoria, forma de pagamento
- [ ] Export inclui totalizadores por categoria no rodapé
- [ ] Loading state durante geração + download automático ao concluir
- [ ] Log de auditoria (usuário, data, filtros aplicados)
- [ ] Integrado ao CHANGE-FIN-002: "Exportar mês" disponível no histórico mensal

## Arquivos alvo

| Arquivo | O que muda |
|---|---|
| `src/pages/FinanceiroPage.tsx` | `ModalExportarFinanceiro` + estado `exportandoOpen` + handler async |

## TODOs de API
```
// TODO: integrar com API — POST /api/v1/financeiro/exportar
// TODO: integrar com API — POST /api/v1/financeiro/exportar/auditoria
```

## Referência CLAUDE.md
- Padrão exportação via backend (§6)
- Mock async `setTimeout(900)` como em RelatoriosPage

## Resultado
*(preencher após implementação)*
