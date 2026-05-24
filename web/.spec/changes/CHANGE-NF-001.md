---
id: CHANGE-NF-001
task: TASK-NF-001
prioridade: P1
status: pending
modulo: fiscal
pagina: EntradaNfePage
arquivos:
  - src/pages/EntradaNfePage.tsx
  - src/schemas/fiscal.ts
spec: .spec/entrada-nfe.spec.md
depende-de: [CHANGE-NF-003, CHANGE-NF-004, CHANGE-NF-005]
---

# CHANGE-NF-001 — Importar XML NF-e v4.00

## Contexto
Entrada de NF-e atualmente exige digitação manual de todos os campos — importação de XML elimina retrabalho e reduz erros.

## O que implementar
- [ ] Botão "Importar XML" no header da Etapa 1 → file picker `.xml`
- [ ] Validação básica de schema NF-e v4.00 (chave 44 dígitos, tags obrigatórias)
- [ ] Extração: emitente/CNPJ, destinatário, produtos (EAN/código), valores, impostos, chave de acesso
- [ ] Pré-preenchimento automático dos campos da Etapa 1 com dados extraídos
- [ ] Mapeamento de produtos por EAN → marca `no_catalog: true` quando não encontrado
- [ ] Alerta visual para produtos com variação de preço > 10% em relação ao último custo
- [ ] Estado: `importandoXML: boolean` durante parse

## Arquivos alvo

| Arquivo | O que muda |
|---|---|
| `src/pages/EntradaNfePage.tsx` | Botão + handler `handleImportarXML` + parse client-side |
| `src/schemas/fiscal.ts` | `NfeXmlImportSchema` para validação dos campos extraídos |

## TODOs de API
```
// TODO: integrar com API — POST /api/v1/fiscal/nfe/importar-xml
// (parse pode ser client-side com DOMParser para XML pequeno, ou backend para validação rigorosa)
```

## Referência CLAUDE.md
- Padrão importação (§6): validar antes de processar
- Células editáveis da Etapa 2 já implementadas (padrão `CelulaBusca`)
- `no_catalog: true` → ativa `CelulaBusca` por produto (fluxo N-01 já existe)

## Resultado
*(preencher após implementação)*
