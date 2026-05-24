---
id: CHANGE-EST-009
task: TASK-EST-009
prioridade: P3
status: pending
modulo: estoque
pagina: EstoquePage
arquivos:
  - src/pages/EstoquePage.tsx
spec: .spec/estoque.spec.md
depende-de: []
---

# CHANGE-EST-009 — Importar CSV de Estoque

## Contexto
Sem importação CSV, farmácias que migram de planilhas precisam cadastrar cada produto/lote manualmente.

## O que implementar
- [ ] `ModalImportarCSVEstoque`: 2 etapas — upload → preview + erros → confirmar
- [ ] Etapa 1: drag & drop ou file picker `.csv` + link "Baixar template"
- [ ] Validação de cabeçalho esperado antes de processar
- [ ] Etapa 2: preview primeiras 5 linhas + lista de erros linha a linha
- [ ] Etapa 2: botão "Confirmar importação" habilitado apenas sem erros críticos
- [ ] Rollback automático em caso de falha parcial (TODO backend)

## Arquivos alvo

| Arquivo | O que muda |
|---|---|
| `src/pages/EstoquePage.tsx` | `ModalImportarCSVEstoque` — reutilizar padrão de `ModalImportCSV` de CadastroProdutosPage |

## TODOs de API
```
// TODO: integrar com API — POST /api/v1/estoque/importar-csv
// TODO: integrar com API — GET /api/v1/estoque/template-csv
```

## Referência CLAUDE.md
- Reutilizar exatamente o padrão de `ModalImportCSV` já implementado em `CadastroProdutosPage`
- Padrão importação (§6): validar antes de processar, relatório de erros, rollback

## Resultado
*(preencher após implementação)*
