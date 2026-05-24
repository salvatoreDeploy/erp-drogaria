---
name: impl-module
description: Implementa um módulo completo do ERP lendo sua spec em .spec/. Ponto de entrada para iniciar qualquer sessão de implementação.
arguments: [modulo]
argument-hint: "<nome-do-modulo (ex: sngpc, financeiro, whatsapp)>"
allowed-tools: Read, Write, Edit, Bash
---

Implemente o módulo `$modulo` do Farmacorp ERP do início ao fim.

## Pré-implementação

1. **Leia** `.spec/$modulo.spec.md` — especificação completa do módulo
2. **Leia** `CLAUDE.md` — padrões de layout, componentes e regras obrigatórias
3. **Verifique** se o schema existe em `src/schemas/$modulo.ts`
   - Se não: rode `/new-schema $modulo` antes de continuar
4. **Leia** a página de referência indicada na spec para copiar o padrão correto

## Implementação

5. **Crie** `src/pages/[NomePage].tsx` seguindo a spec e os padrões
6. **Atualize** `src/router.tsx` com a nova rota
7. **Rode** o quality gate: `/quality-gate`

## Pós-implementação

8. **Atualize** toda a documentação: `/update-docs $modulo`
9. **Confirme** que `CLAUDE.md`, `PLANNING.md` e `backend/CLAUDE.md` estão sincronizados

## Regras invioláveis

- Dados mock com `// TODO: MÉTODO /endpoint` em cada ponto de integração
- Nenhum `type` manual — apenas `z.infer<typeof Schema>`
- Overlay modal como `<button type="button">` — não `<div onClick>`
- `htmlFor` + `id` em todo campo editável (Biome enforça)
- Lookup tables para estilos baseados em estado — zero ifs inline no JSX
