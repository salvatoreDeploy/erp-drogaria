---
id: CHANGE-WA-004
task: TASK-WA-004
prioridade: P3
status: done
modulo: whatsapp
pagina: WhatsAppPage
arquivos:
  - src/pages/WhatsAppPage.tsx
spec: .spec/whatsapp-atendimentos.spec.md
depende-de: []
---

# CHANGE-WA-004 — Ações Rápidas no Chat (WhatsApp)

## Contexto
Ícone ⚡ ou menu de ações na inputbar não tem conteúdo — atendentes não conseguem consultar produto ou enviar template sem sair do chat.

## O que implementar
- [x] Menu de ações rápidas: dropdown ou bottom-sheet com 3 ações iniciais
- [x] **Consultar Produto**: `ModalBuscaProdutoChat` → resultado formatado enviado como mensagem no chat
- [x] **Consultar Pedido**: input de número/CPF → status do pedido enviado como mensagem
- [x] **Enviar Template**: select de templates aprovados → substitui variáveis → envia
- [x] Interface `AcaoRapida { id, label, handler }` — extensível sem refatoração
- [x] Cada ação fecha o menu e executa o handler de forma assíncrona

## Arquivos alvo

| Arquivo | O que muda |
|---|---|
| `src/pages/WhatsAppPage.tsx` | `MenuAcoesRapidas` + `ModalBuscaProdutoChat` + handlers |

## TODOs de API
```
// TODO: integrar com API — GET /api/v1/produtos/busca?q={termo}
// TODO: integrar com API — GET /api/v1/vendas?cpf={cpf}&numero={numero}
// TODO: integrar com API — GET /api/v1/whatsapp/templates
```

## Referência CLAUDE.md
- Interface `AcaoRapida` documentada em §2.4 > W-RX-01
- Tokens de cor do chat: manter todos os `#DCE7E1`, `#0E4D3B` etc.

## Resultado
Botão ⚡ abre dropdown `MenuAcoesRapidas` com 3 entradas via `ACOES_RAPIDAS: AcaoRapida[]`. `useEffect` fecha o menu ao pressionar Esc. `ModalBuscaProdutoChat` usa debounce 300ms (`useEffect+setTimeout`) + busca ≥2 chars sobre `PRODUTOS_CATALOGO`; clique envia bubble formatada. `ModalConsultarPedido` com campo CPF/número, handler async `setTimeout(600ms)`, bubble de status. `ModalEnviarTemplate` com select de `TEMPLATES_WA`, extração automática de `{{variáveis}}` via regex, preview ao vivo com substituição, `disabled` quando nenhum template selecionado. Função `addBubble` compartilhada pelos 3 modais via prop `onEnviar`.
