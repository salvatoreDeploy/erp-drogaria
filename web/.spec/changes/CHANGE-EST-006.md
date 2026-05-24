---
id: CHANGE-EST-006
task: TASK-EST-006
prioridade: P2
status: pending
modulo: estoque
pagina: EstoquePage
arquivos:
  - src/pages/EstoquePage.tsx
spec: .spec/estoque.spec.md
depende-de: []
---

# CHANGE-EST-006 — Confirmar Transferência (Destino)

## Contexto
O modal de transferência (E-02) envia a solicitação mas o destino não tem fluxo de confirmação — transferências ficam pendentes para sempre.

## O que implementar
- [ ] Filtro/tab "Aguardando confirmação" na barra do estoque
- [ ] `ModalConfirmarTransferencia`: resumo origem → destino + produtos + quantidades
- [ ] Validação: status deve ser `aguardando_confirmacao`
- [ ] Confirmação → atualiza saldo local (crédito no destino)
- [ ] Gera documento de transferência (link PDF placeholder)
- [ ] Status da transferência: `aguardando_confirmacao → confirmada`

## Arquivos alvo

| Arquivo | O que muda |
|---|---|
| `src/pages/EstoquePage.tsx` | `ModalConfirmarTransferencia` + filtro "pendentes" + handler |

## TODOs de API
```
// TODO: integrar com API — POST /api/v1/estoque/transferencia/{id}/confirmar
// TODO: integrar com API — GET /api/v1/estoque/transferencias?status=aguardando_confirmacao
// TODO: integrar com API — GET /api/v1/estoque/transferencia/{id}/documento
```

## Referência CLAUDE.md
- Modal confirmação: banner info + resumo ReadonlyFields + botão confirmar
- Atômico no backend — frontend apenas reflete estado após confirmação

## Resultado
*(preencher após implementação)*
