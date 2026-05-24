---
id: CHANGE-EST-004
task: TASK-EST-004
prioridade: P2
status: pending
modulo: estoque
pagina: EstoquePage
arquivos:
  - src/pages/EstoquePage.tsx
spec: .spec/estoque.spec.md
depende-de: []
---

# CHANGE-EST-004 — Botão "Revisar Agora" (Alertas de Estoque Mínimo)

## Contexto
Botão "Revisar Agora" nos alertas de crítico/comprar não navega nem filtra — operador precisa localizar manualmente os produtos abaixo do mínimo.

## O que implementar
- [ ] Clique → aplica filtro automático `status: critico | comprar` na tabela
- [ ] Scroll suave até a tabela se não visível
- [ ] Colunas destacadas: saldo atual, estoque mínimo, diferença (colorida vermelho)
- [ ] Checkbox de seleção em cada linha filtrada
- [ ] Botão "Solicitar Reposição" habilitado quando ≥ 1 produto selecionado (gateway para CHANGE-EST-005)

## Arquivos alvo

| Arquivo | O que muda |
|---|---|
| `src/pages/EstoquePage.tsx` | Handler do botão "Revisar Agora" → `setFiltro('critico')` + scroll ref |

## TODOs de API
```
// TODO: integrar com API — GET /api/v1/estoque?status=critico,comprar
```

## Referência CLAUDE.md
- Toggle de filtro: `border-brand-700 bg-brand-75` quando ativo
- Sem novo modal — apenas filtro inline na tabela

## Resultado
*(preencher após implementação)*
