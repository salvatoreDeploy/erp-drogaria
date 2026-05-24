---
id: CHANGE-NF-003
task: TASK-NF-003
prioridade: P2
status: pending
modulo: fiscal
pagina: EntradaNfePage
arquivos:
  - src/pages/EntradaNfePage.tsx
spec: .spec/entrada-nfe.spec.md
depende-de: []
---

# CHANGE-NF-003 — Botão "Salvar Rascunho" (NF-e)

## Contexto
Sem salvar rascunho, uma NF em andamento é perdida ao sair da página ou recarregar — operador precisa reiniciar do zero.

## O que implementar
- [ ] Botão "Salvar Rascunho" no header de todas as etapas do wizard
- [ ] Handler async com loading state
- [ ] NF salva com status `RASCUNHO`
- [ ] Toast de confirmação: "Rascunho salvo — você pode retomar depois"
- [ ] Ao entrar na rota, verificar se existe rascunho → oferecer "Retomar rascunho" ou "Nova entrada"

## Arquivos alvo

| Arquivo | O que muda |
|---|---|
| `src/pages/EntradaNfePage.tsx` | Botão rascunho em cada etapa + handler + lógica de retomada |

## TODOs de API
```
// TODO: integrar com API — POST /api/v1/fiscal/nfe/rascunho
// TODO: integrar com API — GET /api/v1/fiscal/nfe/rascunho-ativo
// TODO: integrar com API — PUT /api/v1/fiscal/nfe/rascunho/{id}
```

## Referência CLAUDE.md
- Padrão handler async (§6)
- Estado: `verificandoRascunho → rascunhoEncontrado | semRascunho`

## Resultado
*(preencher após implementação)*
