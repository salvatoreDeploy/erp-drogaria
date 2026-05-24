---
name: update-docs
description: Checklist de atualização de documentação após implementar um módulo do ERP. Execute sempre ao concluir uma tela nova.
arguments: [modulo]
argument-hint: "<nome-do-modulo (ex: sngpc, financeiro)>"
allowed-tools: Read, Edit
---

Atualize toda a documentação do projeto após implementar `$modulo`:

## 1. CLAUDE.md (raiz)

- [ ] Tabela **"Rotas existentes"**: adicionar linha com rota, página e observação
- [ ] Tabela **"Telas a criar"**: mudar status ⬜ → ✅ e coluna Schema para ✅

## 2. PLANNING.md

- [ ] Seção do módulo: mudar `⬜ Pendente` → `✅ Implementado`
- [ ] Adicionar lista "Implementado:" com:
  - Layout e padrão de tela usados
  - Modais criados
  - Mock data (quantos registros)
  - TODOs de API marcados
- [ ] Fase correspondente: marcar como concluída se todos os módulos estiverem ✅

## 3. backend/CLAUDE.md

- [ ] Linha "Telas implementadas": adicionar `[NomePage] ✅`

## 4. .spec/$modulo.spec.md

- [ ] Marcar itens implementados com ✅
- [ ] Adicionar observações sobre decisões tomadas

## 5. Verificação final

- [ ] Todos os pontos de integração têm `// TODO: MÉTODO /endpoint`?
- [ ] Novos padrões de componente não documentados em CLAUDE.md?
- [ ] Quality gate passou? (se não, rode `/quality-gate`)
