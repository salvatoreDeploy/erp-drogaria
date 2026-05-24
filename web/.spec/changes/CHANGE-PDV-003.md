---
id: CHANGE-PDV-003
task: TASK-PDV-003
prioridade: P2
status: pending
modulo: pdv
pagina: PdvPage
arquivos:
  - src/pages/PdvPage.tsx
spec: .spec/pdv.spec.md
depende-de: []
---

# CHANGE-PDV-003 — Botão "Pesquisar" no PDV

## Contexto
Botão Pesquisar presente na barra do PDV não executa nenhuma ação — operador não consegue buscar produto sem saber o EAN.

## O que implementar
- [ ] Estado `buscaOpen: boolean` e `termoBusca: string`
- [ ] Modal/overlay de busca: input autofocado com debounce 300ms
- [ ] Busca por EAN, nome do produto e princípio ativo
- [ ] Resultados: nome, apresentação, estoque atual, preço de venda
- [ ] Selecionar item → adiciona ao carrinho (chama `addToCart`)
- [ ] Suporte teclado: Enter confirma primeiro resultado, Esc fecha

## Arquivos alvo

| Arquivo | O que muda |
|---|---|
| `src/pages/PdvPage.tsx` | Adicionar `ModalBuscaProduto` + estado + handler `addToCart` |

## TODOs de API
```
// TODO: integrar com API — GET /api/v1/produtos/busca?q={termo}
```

## Referência CLAUDE.md
- Modal com busca e seleção: `input + lista filtrada + onSelect(item)`
- Debounce via `useEffect` com `clearTimeout`
- Overlay `<button>` para fechar

## Resultado
*(preencher após implementação)*
