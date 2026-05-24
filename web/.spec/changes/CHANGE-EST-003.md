---
id: CHANGE-EST-003
task: TASK-EST-003
prioridade: P1
status: pending
modulo: estoque
pagina: AjusteEstoquePage
arquivos:
  - src/pages/AjusteEstoquePage.tsx
  - src/schemas/estoque.ts
spec: .spec/ajuste-estoque.spec.md
depende-de: []
---

# CHANGE-EST-003 — Botão "Salvar Ajuste"

## Contexto
Botão "Salvar Ajuste" na tela de ajuste não tem handler de confirmação e persistência — ajustes são perdidos ao sair da tela.

## O que implementar
- [ ] Modal de confirmação com resumo dos ajustes (produtos, quantidades, diferenças)
- [ ] Select de motivo: lista predefinida + campo livre obrigatório
- [ ] `AjusteSchema.safeParse()` antes de confirmar
- [ ] Confirmação → gera movimento de ajuste por produto (positivo ou negativo)
- [ ] Atualiza saldo local no estado da página
- [ ] Log de auditoria: usuário, motivo, produtos ajustados (TODO API)
- [ ] Estado sucesso: card de protocolo com resumo

## Arquivos alvo

| Arquivo | O que muda |
|---|---|
| `src/pages/AjusteEstoquePage.tsx` | Handler `handleSalvarAjuste` + modal confirmação |
| `src/schemas/estoque.ts` | `AjusteSchema` com motivo obrigatório |

## TODOs de API
```
// TODO: integrar com API — POST /api/v1/estoque/ajuste
// TODO: integrar com API — POST /api/v1/estoque/ajuste/auditoria
```

## Referência CLAUDE.md
- Padrão handler async (§6)
- Modal de confirmação danger: banner warning + checkbox + botão `bg-brand-900`
- Componente multi-estado: `revisao → confirmando → sucesso`

## Resultado
*(preencher após implementação)*
