---
id: CHANGE-EST-007
task: TASK-EST-007
prioridade: P2
status: pending
modulo: estoque
pagina: EstoquePage
arquivos:
  - src/pages/EstoquePage.tsx
spec: .spec/estoque.spec.md
depende-de: []
---

# CHANGE-EST-007 — Botão "Conferir Agora" (Pós-Recebimento)

## Contexto
Após recebimento de NF-e, itens ficam com status `pendente_conferencia` mas não há fluxo de conferência física — estoque pode estar desatualizado.

## O que implementar
- [ ] Badge/alerta na barra: "N itens aguardando conferência" quando existirem
- [ ] Clique → filtra tabela para `status: pendente_conferencia`
- [ ] Por linha: campo "Quantidade conferida" + select "Divergência?" (Sim/Não)
- [ ] Botão "Salvar Conferência" em lote (todos os visíveis na tabela filtrada)
- [ ] Divergência registrada com motivo obrigatório
- [ ] Status dos itens: `pendente_conferencia → conferido | divergencia`

## Arquivos alvo

| Arquivo | O que muda |
|---|---|
| `src/pages/EstoquePage.tsx` | Filtro + células editáveis + handler `handleSalvarConferencia` |

## TODOs de API
```
// TODO: integrar com API — GET /api/v1/estoque?status=pendente_conferencia
// TODO: integrar com API — PATCH /api/v1/estoque/itens/conferencia (lote)
```

## Referência CLAUDE.md
- Células editáveis inline: `input type="number"` + `select` com classes padrão
- Padrão similar ao AjusteEstoquePage

## Resultado
*(preencher após implementação)*
