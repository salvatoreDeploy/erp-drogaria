---
id: CHANGE-WA-003
task: TASK-WA-003
prioridade: P2
status: pending
modulo: whatsapp
pagina: WhatsAppPage
arquivos:
  - src/pages/WhatsAppPage.tsx
spec: .spec/whatsapp-atendimentos.spec.md
depende-de: []
---

# CHANGE-WA-003 — Botão "Anexar Arquivo" (WhatsApp)

## Contexto
Botão 📎 na inputbar do chat não tem handler — atendentes não conseguem enviar orçamentos em PDF, fotos de produtos ou documentos.

## O que implementar
- [ ] File picker: JPG/PNG/WEBP, PDF, DOCX — limite 16MB (restrição WhatsApp Business API)
- [ ] Preview inline na inputbar antes de enviar: miniatura imagem ou ícone PDF + nome
- [ ] Botão "Remover" no preview
- [ ] Envio: arquivo + mensagem texto opcional (não obrigatório)
- [ ] Estado de progresso: barra ou spinner durante upload
- [ ] Tratamento de erro: arquivo muito grande, tipo não suportado, falha de envio
- [ ] Bolha na conversa: `BubbleMsg` com `arquivo: { nome, tamanho }` (padrão já existe no CLAUDE.md)

## Arquivos alvo

| Arquivo | O que muda |
|---|---|
| `src/pages/WhatsAppPage.tsx` | Handler `handleAnexarArquivo` + estado `arquivoSelecionado` + preview na inputbar |

## TODOs de API
```
// TODO: integrar com API — POST /api/v1/whatsapp/upload-midia
// TODO: integrar com API — POST /api/v1/whatsapp/conversas/{id}/send (com media_id)
```

## Referência CLAUDE.md
- Componente `BubbleMsg` com `arquivo: { nome, tamanho }` — já documentado em §Chat bubbles
- Padrão importação (§6): feedback de progresso para arquivos grandes

## Resultado
*(preencher após implementação)*
