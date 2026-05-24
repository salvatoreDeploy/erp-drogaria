---
id: CHANGE-EST-005
task: TASK-EST-005
prioridade: P2
status: pending
modulo: estoque
pagina: EstoquePage
arquivos:
  - src/pages/EstoquePage.tsx
  - src/schemas/estoque.ts
spec: .spec/estoque.spec.md
depende-de: [CHANGE-EST-004]
---

# CHANGE-EST-005 — Botão "Solicitar Reposição" (Lote)

## Contexto
O modal de reposição individual (E-01, já implementado) não permite reposição em lote. Operador precisa abrir modal para cada produto separadamente.

## O que implementar
- [ ] `ModalReposicaoLote`: lista de produtos selecionados (de CHANGE-EST-004) com qtd sugerida editável
- [ ] Fornecedor padrão pré-preenchido por produto (do cadastro)
- [ ] Edição de qtd e fornecedor por linha antes de enviar
- [ ] Opções: "Salvar rascunho" ou "Enviar para compras"
- [ ] Confirmação → remove produtos da lista de críticos (otimismo no estado local)
- [ ] Diferente do modal individual E-01: este é lote múltiplo

## Arquivos alvo

| Arquivo | O que muda |
|---|---|
| `src/pages/EstoquePage.tsx` | `ModalReposicaoLote` + estado `selectedItems: string[]` |
| `src/schemas/estoque.ts` | `ReposicaoLoteSchema` |

## TODOs de API
```
// TODO: integrar com API — POST /api/v1/estoque/reposicao/lote
// TODO: integrar com API — POST /api/v1/estoque/reposicao/rascunho
```

## Referência CLAUDE.md
- Modal com tabela editável inline (qtd por linha)
- `safeParse` antes de enviar

## Resultado
*(preencher após implementação)*
