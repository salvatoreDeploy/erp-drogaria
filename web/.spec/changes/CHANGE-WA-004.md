---
id: CHANGE-WA-004
task: TASK-WA-004
prioridade: P3
status: pending
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
- [ ] Menu de ações rápidas: dropdown ou bottom-sheet com 3 ações iniciais
- [ ] **Consultar Produto**: `ModalBuscaProdutoChat` → resultado formatado enviado como mensagem no chat
- [ ] **Consultar Pedido**: input de número/CPF → status do pedido enviado como mensagem
- [ ] **Enviar Template**: select de templates aprovados → substitui variáveis → envia
- [ ] Interface `AcaoRapida { id, label, handler }` — extensível sem refatoração
- [ ] Cada ação fecha o menu e executa o handler de forma assíncrona

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
*(preencher após implementação)*
