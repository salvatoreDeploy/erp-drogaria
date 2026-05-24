---
id: CHANGE-PDV-001
task: TASK-PDV-001
prioridade: P1
status: pending
modulo: pdv
pagina: FechamentoCaixaPage
arquivos:
  - src/pages/FechamentoCaixaPage.tsx
  - src/schemas/pdv.ts
spec: .spec/pdv-fechamento.spec.md
depende-de: []
---

# CHANGE-PDV-001 — Fechar Caixa: Fluxo Completo

## Contexto
O botão "Fechar Caixa" existe na UI mas não possui handler nem lógica de negócio — o caixa nunca é efetivamente fechado.

## O que implementar
- [ ] Handler `handleFecharCaixa` com padrão async/loading/error (CLAUDE.md §6)
- [ ] Modal de resumo: total vendas, formas de pagamento, sangrias do turno
- [ ] Campo "Valor em espécie contado" + cálculo de diferença em tempo real
- [ ] Diferença > R$ 50: campo motivo obrigatório (RN-09)
- [ ] Confirmação → status `FECHADO`, bloquear novas vendas
- [ ] Card de sucesso com link para download do Relatório Z
- [ ] Evento em log de auditoria (usuário, timestamp, diferença)
- [ ] Botão desabilitado com spinner durante processamento

## Arquivos alvo

| Arquivo | O que muda |
|---|---|
| `src/pages/FechamentoCaixaPage.tsx` | Handler + modal de fechamento + estado `isLoading` |
| `src/schemas/pdv.ts` | Adicionar `FechamentoCaixaSchema` com `valor_contado` e `motivo_diferenca` |

## TODOs de API
```
// TODO: integrar com API — POST /api/v1/pdv/caixa/{id}/fechar
// TODO: integrar com API — GET /api/v1/pdv/caixa/{id}/resumo-turno
```

## Referência CLAUDE.md
- Padrão handler async (§6 — Padrão de handler de botão)
- Modal overlay `<button>` (§ Modal de seleção)
- Campo com diferença → lookup table para cor: verde (ok) / vermelho (> R$ 50)

## Resultado
*(preencher após implementação)*
