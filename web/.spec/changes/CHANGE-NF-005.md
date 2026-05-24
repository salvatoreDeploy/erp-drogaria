---
id: CHANGE-NF-005
task: TASK-NF-005
prioridade: P2
status: pending
modulo: fiscal
pagina: EntradaNfePage
arquivos:
  - src/pages/EntradaNfePage.tsx
spec: .spec/entrada-nfe.spec.md
depende-de: []
---

# CHANGE-NF-005 — Botão "Aplicar Arredondamento Fiscal" (NF-e)

## Contexto
Divergências de centavos em impostos causam erros na conferência — arredondamento SEFAZ (2 casas, comercial) resolve automaticamente.

## O que implementar
- [ ] Botão "Aplicar Arredondamento Fiscal" na Etapa 3 (conferência)
- [ ] Calcular diferença antes/depois para cada campo de imposto (ICMS, PIS, COFINS)
- [ ] Modal: tabela mostrando valor original → valor ajustado por campo
- [ ] Diferença total destacada (geralmente centavos)
- [ ] "Aplicar" → atualiza valores dos campos de imposto nos itens

## Arquivos alvo

| Arquivo | O que muda |
|---|---|
| `src/pages/EntradaNfePage.tsx` | Handler `handleArredondamentoFiscal` + modal comparativo |

## TODOs de API
```
// TODO: integrar com API — POST /api/v1/fiscal/nfe/{id}/arredondamento-fiscal
// (ou cálculo client-side com Math.round para valores simples)
```

## Referência CLAUDE.md
- Modal read-only com tabela comparativa (antes/depois)
- Confirmar → atualiza estado local dos itens

## Resultado
*(preencher após implementação)*
