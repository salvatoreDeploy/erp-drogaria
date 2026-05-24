---
id: CHANGE-WA-002
task: TASK-WA-002
prioridade: P2
status: done
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
- [x] Adicionar `overflow-y-auto` no container da lista de conversas
- [x] Garantir que o container tem `min-h-0` para que o flex pai propague altura
- [x] Scroll position mantida ao voltar para a lista após abrir conversa
- [x] Barra de scroll visível mas discreta (cor `#DCE7E1`)

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
Adicionado `min-h-0` ao painel esquerdo (`w-[280px]`) para que a altura do flex-row pai se propague ao flex-col filho. O container da lista já possuía `overflow-y-auto flex-1`; com `min-h-0` no pai a lista agora scrolla corretamente quando há mais de ~8 conversas. Scrollbar discreta aplicada via `[&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#DCE7E1]`.
