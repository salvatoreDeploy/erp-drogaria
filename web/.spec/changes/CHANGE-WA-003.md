---
id: CHANGE-WA-003
task: TASK-WA-003
prioridade: P2
status: done
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
- [x] File picker: JPG/PNG/WEBP, PDF, DOCX — limite 16MB (restrição WhatsApp Business API)
- [x] Preview inline na inputbar antes de enviar: miniatura imagem ou ícone PDF + nome
- [x] Botão "Remover" no preview
- [x] Envio: arquivo + mensagem texto opcional (não obrigatório)
- [x] Estado de progresso: barra ou spinner durante upload
- [x] Tratamento de erro: arquivo muito grande, tipo não suportado, falha de envio
- [x] Bolha na conversa: `BubbleMsg` com `arquivo: { nome, tamanho }` (padrão já existe no CLAUDE.md)

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
`fileInputRef` (`useRef<HTMLInputElement>`) oculto com `sr-only`. Botão 📎 dispara `.click()` no ref. `handleSelecionarArquivo` valida tipo (JPG/PNG/WEBP/PDF/DOCX) e tamanho (16 MB) com erro inline. Preview mostra ícone 🖼️/📄 + nome truncado + tamanho KB + botão ✕. `handleAnexarArquivo` async simula progress bar 0→100% via `setInterval(150ms)`. Estado: `arquivoSelecionado: File | null` + `uploadProgress: number | null` + `erroArquivo: string | null`. Estado `bubblesExtra` adicionado para suportar bubbles dinâmicas no chat.
