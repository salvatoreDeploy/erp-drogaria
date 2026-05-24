---
id: CHANGE-EST-001
task: TASK-EST-001
prioridade: P1
status: pending
modulo: estoque
pagina: EstoquePage
arquivos:
  - src/pages/EstoquePage.tsx
  - src/schemas/estoque.ts
spec: .spec/estoque.spec.md
depende-de: []
---

# CHANGE-EST-001 — Botão "Nova Entrada" no Estoque

## Contexto
Botão "Nova Entrada" na barra de ações do estoque não abre formulário — entradas manuais são impossíveis sem NF-e.

## O que implementar
- [ ] Estado `novaEntradaOpen: boolean`
- [ ] `ModalNovaEntrada`: produto (busca com debounce), quantidade, custo unitário, lote, validade, fornecedor, observação
- [ ] Validação: `NovaEntradaSchema.safeParse()` — qtd > 0, produto obrigatório, validade futura
- [ ] Confirmação → atualiza estado local de estoque (adiciona ao array) + geração de movimento
- [ ] Toast/feedback de sucesso

## Arquivos alvo

| Arquivo | O que muda |
|---|---|
| `src/pages/EstoquePage.tsx` | Adicionar `ModalNovaEntrada` + estado + handler `handleNovaEntrada` |
| `src/schemas/estoque.ts` | Criar se não existir; adicionar `NovaEntradaSchema` |

## TODOs de API
```
// TODO: integrar com API — POST /api/v1/estoque/entradas
// TODO: integrar com API — GET /api/v1/produtos/busca?q={termo}
```

## Referência CLAUDE.md
- Padrão campos inline: `rounded-[18px] border border-input-border bg-input-bg p-4`
- Validação Zod: `safeParse` nunca `parse`
- Campo busca produto: mesmo padrão de `CelulaBusca` (EntradaNfePage, N-01)

## Resultado
*(preencher após implementação)*
