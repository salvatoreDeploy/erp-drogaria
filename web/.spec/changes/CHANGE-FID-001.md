---
id: CHANGE-FID-001
task: TASK-FID-001
prioridade: P3
status: pending
modulo: fidelizacao
pagina: FidelizacaoPage
arquivos:
  - src/pages/FidelizacaoPage.tsx
spec: .spec/fidelizacao.spec.md
depende-de: []
---

# CHANGE-FID-001 — Exportar Base de Clientes (Fidelização)

## Contexto
Campanhas de marketing externas (e-mail, SMS) precisam de uma lista de clientes — sem exportação, essa lista precisa ser copiada manualmente.

## O que implementar
- [ ] Botão "Exportar Base" no header do módulo → `ModalExportarBaseFidelizacao`
- [ ] Opções: formato (Excel/CSV), filtros (data cadastro, faixa de pontos, ativo/inativo)
- [ ] Campos exportados: nome, telefone, e-mail, pontos, data último acesso
- [ ] **LGPD:** CPF **nunca** exportado para uso externo — apenas uso interno
- [ ] Confirmação de finalidade obrigatória antes de exportar (select: Marketing / Análise / Outro)
- [ ] Log de auditoria: usuário, data, finalidade declarada

## Arquivos alvo

| Arquivo | O que muda |
|---|---|
| `src/pages/FidelizacaoPage.tsx` | `ModalExportarBaseFidelizacao` + estado + handler async |

## TODOs de API
```
// TODO: integrar com API — POST /api/v1/fidelizacao/exportar-base
// TODO: integrar com API — POST /api/v1/fidelizacao/exportar-base/auditoria
```

## Referência CLAUDE.md
- Padrão exportação via backend (§6)
- LGPD: confirmação de finalidade + CPF nunca em exportações externas

## Resultado
*(preencher após implementação)*
