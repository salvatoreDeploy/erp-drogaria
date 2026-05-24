---
id: CHANGE-PRE-001
task: TASK-PRE-001
prioridade: P2
status: pending
modulo: precificador
pagina: PrecificadorPage
arquivos:
  - src/pages/PrecificadorPage.tsx
  - src/schemas/precificador.ts
spec: .spec/precificador.spec.md
depende-de: []
---

# CHANGE-PRE-001 — Botão "Simular Cenário" (Precificador)

## Contexto
O precificador mostra margens atuais mas não permite simular cenários hipotéticos — gestor não consegue avaliar impacto de uma mudança de preço antes de aplicá-la.

## O que implementar
- [ ] Botão "Simular Cenário" no header → `ModalSimularCenario`
- [ ] Configuração: margem desejada (%), desconto máximo (%), escopo (categoria/fornecedor/lista)
- [ ] Tabela de simulação: produto, preço atual, preço sugerido, margem resultante
- [ ] Card de impacto: faturamento estimado atual vs. simulado (delta %)
- [ ] "Salvar como cenário" → armazena no estado local com nome
- [ ] Cenário NÃO altera preços reais — apenas visualização
- [ ] `SimulacaoCenarioSchema.safeParse()` antes de calcular

## Arquivos alvo

| Arquivo | O que muda |
|---|---|
| `src/pages/PrecificadorPage.tsx` | `ModalSimularCenario` + estado `cenarios: Cenario[]` |
| `src/schemas/precificador.ts` | `SimulacaoCenarioSchema`, `CenarioSalvo` |

## TODOs de API
```
// TODO: integrar com API — POST /api/v1/precificador/simular
// (ou cálculo client-side para cenários simples)
```

## Referência CLAUDE.md
- Lookup table para `status_margem` (já existe)
- Simulação é somente leitura — nenhum estado real é modificado

## Resultado
*(preencher após implementação)*
