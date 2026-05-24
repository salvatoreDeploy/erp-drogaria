---
id: CHANGE-CAD-001
task: TASK-CAD-001
prioridade: P2
status: pending
modulo: cadastro-produtos
pagina: CadastroProdutosPage
arquivos:
  - src/pages/CadastroProdutosPage.tsx
spec: .spec/cadastro-produtos.spec.md
depende-de: []
---

# CHANGE-CAD-001 — Identificar e Implementar Botões sem Funcionalidade (Cadastro de Produtos)

## Contexto
Foi reportado que há botões sem handler no módulo de Cadastro de Produtos. Esta task exige inspeção antes da implementação.

## O que implementar

### Pré-requisito obrigatório: Inspecionar antes de editar

Ao executar este change, o agente deve:
1. Ler `src/pages/CadastroProdutosPage.tsx` completamente
2. Identificar todos os botões com: `onClick={() => {}}`, `onClick={undefined}`, sem `onClick`, ou handler incompleto
3. Documentar os achados no campo `## Sub-tasks identificadas` abaixo
4. Só então implementar os handlers faltantes

### Critérios gerais de aceite
- [ ] Todos os botões têm handler implementado
- [ ] Nenhum botão falha silenciosamente
- [ ] Sub-tasks documentadas após inspeção

## Sub-tasks identificadas
*(preencher após inspeção do agente)*

## Arquivos alvo

| Arquivo | O que muda |
|---|---|
| `src/pages/CadastroProdutosPage.tsx` | Handlers identificados na inspeção |

## TODOs de API
*(determinar após inspeção — marcar no formato padrão)*

## Referência CLAUDE.md
- Padrão handler async (§6) para todos os botões com I/O
- Padrão CRUD: `handleSalvar(data, id?)` — id presente → PUT, ausente → POST

## Resultado
*(preencher após implementação)*
