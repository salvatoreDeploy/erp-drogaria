---
id: CHANGE-REC-001
task: TASK-REC-001
prioridade: P1
status: pending
modulo: receita
pagina: ReceitaPage
arquivos:
  - src/pages/ReceitaPage.tsx
  - src/schemas/receita.ts
spec: .spec/receita.spec.md
depende-de: []
---

# CHANGE-REC-001 — Botão "Importar Receita" (OCR)

## Contexto
O módulo de receita digital aceita apenas receitas já digitalizadas via sistema externo — farmácias precisam digitalizar receitas físicas em papel dentro do próprio ERP.

## O que implementar
- [ ] Botão "Importar Receita" no estado `idle` → file picker (JPG/PNG/PDF)
- [ ] Preview da imagem/PDF no painel esquerdo
- [ ] Estado `processando`: spinner OCR com mensagem "Extraindo dados..."
- [ ] Mock de OCR: `setTimeout(2000)` → retorna dados simulados (médico, CRM, medicamentos, posologia)
- [ ] Dados extraídos pré-preenchem campos da receita — usuário pode corrigir
- [ ] Suporte a QR Code de receita digital (RNDS): campo alternativo de leitura
- [ ] LGPD: banner info sobre armazenamento da receita + controle de acesso

## Arquivos alvo

| Arquivo | O que muda |
|---|---|
| `src/pages/ReceitaPage.tsx` | Botão + handler `handleImportarReceita` + estado `processandoOCR` |
| `src/schemas/receita.ts` | `ReceitaImportSchema` para dados extraídos do OCR |

## TODOs de API
```
// TODO: integrar com API — POST /api/v1/receita/importar-imagem (OCR)
// TODO: integrar com API — POST /api/v1/receita/importar-qrcode (RNDS)
```

## Referência CLAUDE.md
- Estado `processando` da ReceitaPage já existe — reutilizar estado existente
- Multi-estado: `idle → processando → validado/pendente/rejeitado`
- Padrão importação (§6): validar formato antes de processar

## Resultado
*(preencher após implementação)*
