---
id: CHANGE-WA-002
task: TASK-WA-002
prioridade: P2
status: pending
modulo: whatsapp
pagina: WhatsAppPage
arquivos:
  - src/pages/WhatsAppPage.tsx
spec: .spec/whatsapp-atendimentos.spec.md
depende-de: []
---

# CHANGE-WA-002 — Scroll na Lista de Conversas (WhatsApp)

## Contexto
Lista de conversas no painel esquerdo não tem scroll — com mais de ~8 conversas, as demais ficam inacessíveis.

## O que implementar
- [ ] Adicionar `overflow-y-auto` no container da lista de conversas
- [ ] Garantir que o container tem `min-h-0` para que o flex pai propague altura
- [ ] Scroll position mantida ao voltar para a lista após abrir conversa
- [ ] Barra de scroll visível mas discreta (cor `#DCE7E1`)

## Arquivos alvo

| Arquivo | O que muda |
|---|---|
| `src/pages/WhatsAppPage.tsx` | `overflow-y-auto` + `min-h-0` no container da lista de conversas |

## TODOs de API
Nenhum — mudança puramente de layout.

## Referência CLAUDE.md
- **Regra:** `min-h-0` em cada nível flex que precisa propagar altura para `overflow-y-auto` funcionar
- Layout chat (§ Padrão D): `overflow-hidden` no container externo

## Resultado
*(preencher após implementação)*
