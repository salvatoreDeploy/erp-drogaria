---
id: CHANGE-PDV-002
task: TASK-PDV-002
prioridade: P2
status: pending
modulo: pdv
pagina: FechamentoCaixaPage
arquivos:
  - src/pages/FechamentoCaixaPage.tsx
spec: .spec/pdv-fechamento.spec.md
depende-de: []
---

# CHANGE-PDV-002 — Histórico de Caixa: Modal/Drawer

## Contexto
Link/botão "Ver histórico de caixa" não abre nenhuma visualização — operador não consegue consultar fechamentos anteriores.

## O que implementar
- [ ] Estado `historicoOpen: boolean` na página
- [ ] `ModalHistoricoCaixa`: filtros período + operador + lista de fechamentos
- [ ] Lista: data/hora, operador, total bruto, diferença, status (badge colorido)
- [ ] Clique em item → painel de detalhamento inline no modal (vendas, pagamentos, sangrias)
- [ ] Botão "Exportar PDF" no detalhe do fechamento selecionado
- [ ] Paginação ou scroll virtual para listas longas

## Arquivos alvo

| Arquivo | O que muda |
|---|---|
| `src/pages/FechamentoCaixaPage.tsx` | Adicionar `ModalHistoricoCaixa` como função interna + estado + gatilho |

## TODOs de API
```
// TODO: integrar com API — GET /api/v1/pdv/caixa/historico?data_inicio=&data_fim=&operador_id=
// TODO: integrar com API — GET /api/v1/pdv/caixa/{id}/detalhe
// TODO: integrar com API — POST /api/v1/pdv/caixa/{id}/exportar-relatorio-z
```

## Referência CLAUDE.md
- Modal overlay `<button>` (padrão obrigatório)
- Tabela interna: header `bg-[#F5F8F6]` / rows `bg-[#FBFCFB]`
- Badge de status: lookup table `STATUS_CFG: Record<status, {label, bg, text}>`

## Resultado
*(preencher após implementação)*
