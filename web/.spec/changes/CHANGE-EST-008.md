---
id: CHANGE-EST-008
task: TASK-EST-008
prioridade: P3
status: pending
modulo: estoque
pagina: EstoquePage
arquivos:
  - src/pages/EstoquePage.tsx
spec: .spec/estoque.spec.md
depende-de: []
---

# CHANGE-EST-008 — Exportar Relatório de Estoque

## Contexto
Sem exportação de estoque, gestores precisam copiar dados manualmente para Excel — processo sujeito a erros.

## O que implementar
- [ ] `ModalExportarEstoque`: formato (Excel/PDF) + filtros (categoria, fornecedor, status, validade)
- [ ] Botão "Exportar" com estado loading durante geração
- [ ] Mock async `setTimeout(1200)` → link de download placeholder
- [ ] Log de auditoria da exportação (usuário, filtros, data)

## Arquivos alvo

| Arquivo | O que muda |
|---|---|
| `src/pages/EstoquePage.tsx` | `ModalExportarEstoque` + estado `exportandoOpen` |

## TODOs de API
```
// TODO: integrar com API — POST /api/v1/estoque/exportar
// TODO: integrar com API — POST /api/v1/estoque/exportar/auditoria
```

## Referência CLAUDE.md
- Padrão exportação via backend (§6 — Padrão de exportação de dados)
- Estado loading: `isLoading` + spinner + `disabled`

## Resultado
*(preencher após implementação)*
