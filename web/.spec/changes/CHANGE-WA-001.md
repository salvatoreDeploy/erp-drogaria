---
id: CHANGE-WA-001
task: TASK-WA-001
prioridade: P2
status: done
modulo: whatsapp
pagina: WhatsAppPage
arquivos:
  - src/pages/WhatsAppPage.tsx
spec: .spec/whatsapp-atendimentos.spec.md
depende-de: []
---

# CHANGE-WA-001 — Corrigir Espaçamento dos Botões de Ação (WhatsApp)

## Contexto
Botões de ação no painel direito da aba Atendimentos têm espaçamento inconsistente — UX degradada durante atendimento ao cliente.

## O que implementar
- [x] Inspecionar painel direito (360px): identificar onde gap/padding está irregular
- [x] Aplicar `gap-2` uniforme entre botões de ação primários
- [x] Botões de ação secundários (menor destaque): `gap-1.5`
- [x] Verificar alinhamento vertical de ícone + label em cada botão
- [x] Garantir que botões não sobrepõem em viewport padrão (1280px)

## Arquivos alvo

| Arquivo | O que muda |
|---|---|
| `src/pages/WhatsAppPage.tsx` | Ajuste de `gap`, `padding`, `flex-wrap` no painel direito |

## TODOs de API
Nenhum — mudança puramente visual.

## Referência CLAUDE.md
- Tokens de cor do chat: não alterar `#DCE7E1`, `#0E4D3B` etc.
- Painel direito **sempre 360px** — não alterar largura

## Resultado
*(preencher após implementação)*
