---
id: CHANGE-PBM-002
task: TASK-PBM-002
prioridade: P2
status: pending
modulo: pbm
pagina: PbmPage
arquivos:
  - src/pages/PbmPage.tsx
spec: .spec/pbm.spec.md
depende-de: []
---

# CHANGE-PBM-002 — Pesquisa de Médico/CRM (Offline-First)

## Contexto
Campo CRM na Etapa 1 do PBM exige CRM completo e legível — receitas físicas com CRM ilegível travam o fluxo.

## O que implementar
- [ ] Ícone de busca ao lado do campo CRM → abre `ModalBuscaMedico`
- [ ] `ModalBuscaMedico`: input busca por CRM parcial, nome ou especialidade
- [ ] Busca primária na base local mock (médicos frequentes)
- [ ] Resultado não encontrado → botão "Buscar online (CFM)" com loading state
- [ ] Resultados CFM mock: nome, CRM, UF, especialidade, situação
- [ ] Seleção → preenche campo CRM automaticamente + fecha modal
- [ ] Checkbox "Salvar na base local para próximas buscas"
- [ ] LGPD: apenas dados profissionais públicos — sem CPF/endereço do médico

## Arquivos alvo

| Arquivo | O que muda |
|---|---|
| `src/pages/PbmPage.tsx` | `ModalBuscaMedico` + estado + integração com campo CRM da Etapa 1 |

## TODOs de API
```
// TODO: integrar com API — GET /api/v1/medicos/buscar?q={termo}
// TODO: integrar com API — GET /api/v1/medicos/cfm?q={termo}
// TODO: integrar com API — POST /api/v1/medicos/salvar-local
```

## Dependência crítica
Validar disponibilidade e SLA da API CFM antes de implementar consulta online.

## Referência CLAUDE.md
- Modal com busca e seleção: input + lista filtrada + `onSelect`
- Offline-first: busca local sempre primeiro, CFM apenas como fallback
- Decisão 2026-05-20 (§7)

## Resultado
*(preencher após implementação)*
