---
id: CHANGE-NF-002
task: TASK-NF-002
prioridade: P1
status: pending
modulo: fiscal
pagina: EntradaNfePage
arquivos:
  - src/pages/EntradaNfePage.tsx
spec: .spec/entrada-nfe.spec.md
depende-de: [CHANGE-NF-001]
---

# CHANGE-NF-002 — Botão "Finalizar Entrada" (NF-e)

## Contexto
Botão "Finalizar Entrada" na Etapa 3 do wizard não executa ação real — NF fica em estado de conferência indefinidamente.

## O que implementar
- [ ] Handler `handleFinalizarEntrada` com padrão async/loading
- [ ] Disponível apenas quando NF está em `conferencia` ou `rascunho`
- [ ] Modal de confirmação com resumo: fornecedor, total, qtd de itens, vencimento
- [ ] Confirmação → NF recebe status `FINALIZADA` (somente leitura)
- [ ] Efeitos colaterais mockados: atualização de estoque + geração de conta a pagar
- [ ] Card sucesso: protocolo + link para conta a pagar gerada
- [ ] Opção opcional: "Gerar etiquetas de produtos" (link placeholder)

## Arquivos alvo

| Arquivo | O que muda |
|---|---|
| `src/pages/EntradaNfePage.tsx` | `handleFinalizarEntrada` + modal confirmação + estado `status` da NF |

## TODOs de API
```
// TODO: integrar com API — POST /api/v1/fiscal/nfe/{id}/finalizar
// TODO: integrar com API — POST /api/v1/financeiro/contas-pagar (gerado automaticamente)
// TODO: integrar com API — POST /api/v1/estoque/entrada-nfe/{id}/aplicar
```

## Referência CLAUDE.md
- Componente multi-estado: `conferencia → finalizando → finalizada`
- Card sucesso com protocolo (padrão SngpcPage)

## Resultado
*(preencher após implementação)*
