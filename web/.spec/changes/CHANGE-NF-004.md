---
id: CHANGE-NF-004
task: TASK-NF-004
prioridade: P2
status: pending
modulo: fiscal
pagina: EntradaNfePage
arquivos:
  - src/pages/EntradaNfePage.tsx
spec: .spec/entrada-nfe.spec.md
depende-de: []
---

# CHANGE-NF-004 — Botão "Marcar Todos como OK" (NF-e Etapa 2)

## Contexto
Na conferência de itens da NF, marcar cada item individualmente é lento para NFs com muitos produtos.

## O que implementar
- [ ] Botão "Marcar todos como OK" no header da tabela de itens (Etapa 2)
- [ ] Modal de confirmação: "Você aceita o mapeamento sugerido para todos os X itens reconhecidos?"
- [ ] Apenas itens com `no_catalog: false` (já mapeados) são incluídos — itens `no_catalog: true` permanecem pendentes
- [ ] Confirmação → todos os itens elegíveis recebem status `conferido`
- [ ] Badge contador de itens ainda pendentes (sem catálogo)

## Arquivos alvo

| Arquivo | O que muda |
|---|---|
| `src/pages/EntradaNfePage.tsx` | Handler `handleMarcarTodosOk` + modal confirmação + atualização do estado de itens |

## TODOs de API
```
// TODO: integrar com API — PATCH /api/v1/fiscal/nfe/{id}/itens/conferir-todos
```

## Referência CLAUDE.md
- Modal confirmação com banner info + botão confirmar
- Itens `no_catalog: true` continuam com `CelulaBusca` (fluxo N-01 existente)

## Resultado
*(preencher após implementação)*
