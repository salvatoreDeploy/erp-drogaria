---
id: CHANGE-EST-002
task: TASK-EST-002
prioridade: P1
status: pending
modulo: estoque
pagina: EstoquePage
arquivos:
  - src/pages/EstoquePage.tsx
  - src/schemas/estoque.ts
spec: .spec/estoque.spec.md
depende-de: [CHANGE-EST-003]
---

# CHANGE-EST-002 — Inventário: Fluxo Guiado

## Contexto
Botão "Iniciar Inventário" não existe ou não tem handler — farmácia não consegue fazer contagem física sem sair do sistema.

## O que implementar
- [ ] Wizard 2 etapas: Configuração → Contagem
- [ ] Etapa 1: escopo (geral / por categoria) + modo (cego = sem saldo visível / com saldo)
- [ ] Etapa 2: lista de produtos do escopo com input de quantidade física por linha
- [ ] Em modo "cego": coluna de saldo sistema oculta durante contagem
- [ ] Calcular divergência (sistema vs. contado) ao finalizar etapa 2
- [ ] Divergência > 5%: badge warning + flag `exige_farmaceutico: true` (RN-05)
- [ ] Botão "Salvar Ajuste" ativo apenas com divergências (delega para CHANGE-EST-003)
- [ ] Status do inventário: `rascunho → em_andamento → finalizado`

## Arquivos alvo

| Arquivo | O que muda |
|---|---|
| `src/pages/EstoquePage.tsx` | Wizard de inventário como estado + componentes de etapa internos |
| `src/schemas/estoque.ts` | `InventarioSchema`, `ItemInventarioSchema` |

## TODOs de API
```
// TODO: integrar com API — POST /api/v1/estoque/inventario/iniciar
// TODO: integrar com API — PATCH /api/v1/estoque/inventario/{id}/item
// TODO: integrar com API — POST /api/v1/estoque/inventario/{id}/finalizar
```

## Referência CLAUDE.md
- Wizard N etapas: `STEP_CFG`, `goNext/goBack`, renderização condicional
- Célula editável inline: `input type="number"` com classes padrão
- RN-05: divergência > 5% → badge warning + bloquear sem aprovação do farmacêutico

## Resultado
*(preencher após implementação)*
